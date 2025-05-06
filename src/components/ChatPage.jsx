import React, { useEffect, useRef, useState } from 'react';
import { MdLogout, MdAttachFile, MdSend } from 'react-icons/md';
import { FaUserCircle } from "react-icons/fa";
import { RiChatSmile2Fill } from "react-icons/ri";
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import { baseURL } from '../config/AxiosHelper';
import toast from 'react-hot-toast';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getMessages } from '../services/RoomService';
import { timeAgo } from '../config/helper';

const ChatPage = () => {
    // Contexto global del chat (roomId, usuario, estado de conexión, setters...)
    const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();
    const navigate = useNavigate();

    // Estados locales
    const [messages, setMessages] = useState([]);           // Lista de mensajes del chat
    const [input, setInput] = useState("");                 // Texto del input de mensaje
    const [typingUsers, setTypingUsers] = useState({});     // Usuarios que están escribiendo
    const typingTimeouts = useRef(new Map());               // Map para manejar timeouts por usuario
    const [stompClient, setStompClient] = useState(null);   // Cliente STOMP

    const chatBoxRef = useRef(null);                        // Ref para hacer scroll automático

    // ───────────────────────────────────────────────────────────────
    // 1. Recuperar sesión (roomId + usuario) de localStorage al montar
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        const savedRoomId = localStorage.getItem('roomId');
        const savedCurrentUser = localStorage.getItem('currentUser');

        if (savedRoomId && savedCurrentUser) {
            setRoomId(savedRoomId);
            setCurrentUser(savedCurrentUser);
            setConnected(true);
        } else {
            navigate("/");  // Redirige a login si no hay sesión
        }
    }, []);

    // ───────────────────────────────────────────────────────────────
    // 2. Sincronizar localStorage cuando cambia el estado de conexión
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (connected) {
            localStorage.setItem('roomId', roomId);
            localStorage.setItem('currentUser', currentUser);
        } else {
            localStorage.removeItem('roomId');
            localStorage.removeItem('currentUser');
        }
    }, [connected, roomId, currentUser]);

    // ───────────────────────────────────────────────────────────────
    // 3. Cargar historial de mensajes al conectar
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessages(roomId);
                setMessages(messages);
            } catch (error) {
                console.error("Error al cargar mensajes:", error);
            }
        }

        if (connected) {
            loadMessages();
        }
    }, [connected, roomId]);

    // ───────────────────────────────────────────────────────────────
    // 4. Conexión WebSocket + suscripciones a mensajes y typing
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!connected) return;

        const socket = new SockJS(`${baseURL}/chat`);
        const client = Stomp.over(socket);

        client.connect({}, () => {
            setStompClient(client);
            toast.success("Conectado al servidor de chat");

            // ── 4.a Suscripción a nuevos mensajes
            client.subscribe(`/topic/room/${roomId}`, (msg) => {
                const newMessage = JSON.parse(msg.body);
                setMessages((prev) => [...prev, newMessage]);
            });

            // ── 4.b Suscripción a eventos "typing"
            client.subscribe(`/topic/room/${roomId}/typing`, (msg) => {
                const typingUser = msg.body;

                // No mostrar nuestro propio estado
                if (typingUser === currentUser) return;

                // Marcar como escribiendo
                setTypingUsers((prev) => ({ ...prev, [typingUser]: true }));

                // Si ya había un timeout para este usuario, lo limpiamos
                if (typingTimeouts.current.has(typingUser)) {
                    clearTimeout(typingTimeouts.current.get(typingUser));
                }

                // Crear nuevo timeout de 5s para borrar el indicador
                const timeoutId = setTimeout(() => {
                    setTypingUsers((prev) => {
                        const copy = { ...prev };
                        delete copy[typingUser];
                        return copy;
                    });
                    typingTimeouts.current.delete(typingUser);
                }, 1000);

                typingTimeouts.current.set(typingUser, timeoutId);
            });
        });

        // Cleanup al desmontar / desconectar
        return () => {
            if (client) client.disconnect();
        };
    }, [connected, roomId, currentUser]);

    // ───────────────────────────────────────────────────────────────
    // 5. Scroll automático al llegar mensajes nuevos
    // ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!chatBoxRef.current) return;
        chatBoxRef.current.scroll({
            top: chatBoxRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [messages]);

    // ───────────────────────────────────────────────────────────────
    // 6. Función para enviar un mensaje
    // ───────────────────────────────────────────────────────────────
    const sendMessage = () => {
        if (stompClient && connected && input.trim()) {
            const message = {
                sender: currentUser,
                content: input,
                roomId,
            };
            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
            setInput("");
        }
    };

    // ───────────────────────────────────────────────────────────────
    // 7. Manejar logout: desconectar y limpiar estado/localStorage
    // ───────────────────────────────────────────────────────────────
    const handleLogout = () => {
        if (stompClient) stompClient.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        toast.success("Has salido de la sala");
        navigate("/");
    };

    // ───────────────────────────────────────────────────────────────
    // 8. Manejar cambios en el input: enviar evento "typing" al servidor
    //    ¡Ahora sin trim(), para que sea inmediato en cada tecla!
    // ───────────────────────────────────────────────────────────────
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInput(value);

        if (stompClient) {
            stompClient.send(`/app/typing/${roomId}`, {}, currentUser);
        }
    };



    return (
        <div>
            {/* ======= Header ======= */}
            <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl z-50 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <RiChatSmile2Fill className="text-amber-400" size={22} />
                    <h1 className="text-lg font-semibold">
                        Room: <span className="text-gray-300 font-normal">{roomId}</span>
                    </h1>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-white">
                    <FaUserCircle className="text-blue-400" size={20} />
                    <h1 className="text-lg font-semibold">
                        User: <span className="text-gray-300 font-normal">{currentUser}</span>
                    </h1>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all duration-200 shadow hover:shadow-lg"
                    title="Leave Room">
                    <MdLogout size={18} />
                    <span className="text-sm font-medium">Leave Room</span>
                </button>
            </header>

            {/* ======= Chat container ======= */}
            <main
                ref={chatBoxRef}
                className="absolute top-24 bottom-24 left-0 right-0 overflow-y-scroll px-4 w-full max-w-4xl mx-auto space-y-3 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                {/* Mensajes */}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === currentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-2xl shadow-md text-white ${msg.sender === currentUser ? 'bg-amber-500' : 'bg-blue-500'}`}>
                            <div className="flex gap-2 items-start">
                                <FaUserCircle className="h-6 w-6 opacity-80" />
                                <div>
                                    <p className="text-xs text-gray-300">{timeAgo(msg.timeStamp)}</p>
                                    <p className="text-xs font-semibold">{msg.sender}</p>
                                    <p className="text-sm">{msg.content}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Indicador de escribiendo */}
                <div className="flex flex-col items-start px-4">
                    {Object.keys(typingUsers).map((user) =>
                        user !== currentUser && (
                            <div
                                key={user}
                                className="text-sm text-gray-300 italic animate-pulse px-3 py-1 bg-gray-700 rounded-full shadow max-w-fit mt-1">
                                {user} está escribiendo...
                            </div>
                        )
                    )}
                </div>
            </main>

            {/* ======= Input de mensajes ======= */}
            <div className="fixed bottom-6 w-full px-4">
                <div className="max-w-2xl mx-auto bg-gray-800 dark:bg-gray-900 rounded-full flex items-center shadow-lg px-4 py-2 gap-3">
                    <input
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        type="text"
                        placeholder="Write a message..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"
                    />
                    <button className="text-gray-300 hover:text-amber-400 transition-colors" title="Attach file">
                        <MdAttachFile size={22} />
                    </button>
                    <button
                        onClick={sendMessage}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"
                        title="Send message">
                        <MdSend size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
