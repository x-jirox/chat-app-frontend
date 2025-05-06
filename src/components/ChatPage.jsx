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
    const { roomId, currentUser, connected, setConnected, setRoomId, setCurrentUser } = useChatContext();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);

    // Verificar si ya hay sesión activa en localStorage al cargar la página
    useEffect(() => {
        const savedRoomId = localStorage.getItem('roomId');
        const savedCurrentUser = localStorage.getItem('currentUser');

        if (savedRoomId && savedCurrentUser) {
            setRoomId(savedRoomId);
            setCurrentUser(savedCurrentUser);
            setConnected(true);
        } else {
            navigate("/");
        }
    }, []);  // Solo se ejecuta una vez al montar el componente

    // Guardar los datos en localStorage cuando se conecta
    useEffect(() => {
        if (connected) {
            localStorage.setItem('roomId', roomId);
            localStorage.setItem('currentUser', currentUser);
        } else {
            localStorage.removeItem('roomId');
            localStorage.removeItem('currentUser');
        }
    }, [connected, roomId, currentUser]);

    // Cargar mensajes cuando esté conectado
    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessages(roomId);
                setMessages(messages);
            } catch (error) {
                console.error(error);
            }
        }

        if (connected) {
            loadMessages();
        }
    }, [connected, roomId]);

    // Conectar con WebSocket cuando se conecta al chat
    useEffect(() => {
        const connectWebSocket = () => {
            const socket = new SockJS(`${baseURL}/chat`);
            const client = Stomp.over(socket);
            client.connect({}, () => {
                setStompClient(client);
                toast.success("Connected to chat server");
                client.subscribe(`/topic/room/${roomId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                });
            });
        };

        if (connected) {
            connectWebSocket();
        }

        return () => {
            if (stompClient) stompClient.disconnect();
        };
    }, [roomId, connected]);

    //scroll down 
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({
                top: chatBoxRef.current.scrollHeight,
                behavior: 'smooth'
            })
        }
    }, [messages]);

    // Función para enviar un mensaje
    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            const message = {
                sender: currentUser,
                content: input,
                roomId: roomId,
            };

            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
            setInput("");
        }
    };

    // Función para manejar el logout
    const handleLogout = () => {
        stompClient.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        localStorage.removeItem('roomId');
        localStorage.removeItem('currentUser');
        toast.success("Exit room");
        navigate("/");
    };

    return (
        <div>
            {/* Header */}
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
                <div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all duration-200 shadow hover:shadow-lg"
                        title="Leave Room">
                        <MdLogout size={18} />
                        <span className="text-sm font-medium">Leave Room</span>
                    </button>
                </div>
            </header>

            {/* Chat container */}
            <main
                ref={chatBoxRef}
                className="absolute top-24 bottom-24 left-0 right-0 overflow-y-scroll px-4 w-full max-w-4xl mx-auto space-y-3 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-2xl shadow-md text-white ${message.sender === currentUser ? 'bg-amber-500' : 'bg-blue-500'}`}>
                            <div className="flex gap-2 items-start">
                                <FaUserCircle className="h-6 w-6 opacity-80" />
                                <div>
                                    <p className="text-xs text-gray-300">{timeAgo(message.timeStamp)}</p>
                                    <p className="text-xs font-semibold">{message.sender}</p>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>

            {/* Message input */}
            <div className="fixed bottom-6 w-full px-4">
                <div className="max-w-2xl mx-auto bg-gray-800 dark:bg-gray-900 rounded-full flex items-center shadow-lg px-4 py-2 gap-3">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        type="text"
                        placeholder="Write a message..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-2"/>
                    <div className="flex items-center gap-2">
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
        </div>
    );
};

export default ChatPage;
