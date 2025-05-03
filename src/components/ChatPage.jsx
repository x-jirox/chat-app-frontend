import React, { useRef, useState } from 'react'
import { MdLogout, MdAttachFile, MdSend } from 'react-icons/md'
import { FaUserCircle } from "react-icons/fa";
import { RiChatSmile2Fill } from "react-icons/ri";

const ChatPage = () => {

    const [messages, setMessages] = useState([
        { sender: "John Doe", content: "Hello, how are you?" },
        { sender: "Jane Doe", content: "I'm fine, thank you!" },
        { sender: "John Doe", content: "What about you?" },
        { sender: "Jane Doe", content: "I'm doing great!" },
        { sender: "John Doe", content: "That's awesome!" },
        { sender: "Jane Doe", content: "Yes, it is!" },
        { sender: "John Doe", content: "Let's go for a walk." },
        { sender: "Jane Doe", content: "Sure, sounds good!" },

    ]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);
    const [roomId, setRoomId] = useState("");
    const [currentUser] = useState("Jane Doe");

    return (
        <div>

            {/* this is a header */}
            <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl z-50 px-6 py-3 flex items-center justify-between">

                {/* Sala */}
                <div className="flex items-center gap-2 text-white">
                    <RiChatSmile2Fill className="text-amber-400" size={22} />
                    <h1 className="text-lg font-semibold">
                        Room: <span className="text-gray-300 font-normal">Family Room</span>
                    </h1>
                </div>

                {/* Usuario */}
                <div className="hidden sm:flex items-center gap-2 text-white">
                    <FaUserCircle className="text-blue-400" size={20} />
                    <h1 className="text-lg font-semibold">
                        User: <span className="text-gray-300 font-normal">John Doe</span>
                    </h1>
                </div>

                {/* Botón salir */}
                <div>
                    <button
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition-all duration-200 shadow hover:shadow-lg"
                        title="Leave Room"><MdLogout size={18} /><span className="text-sm font-medium">Leave</span>
                    </button>
                </div>
            </header>


            {/* this is a chat container */}
            <main
                ref={chatBoxRef}
                className="absolute top-24 bottom-24 left-0 right-0 overflow-y-scroll px-4 w-full max-w-4xl mx-auto space-y-3 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', }}>

                {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}>

                        <div className={`relative max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-2xl shadow-md text-white 
                                ${message.sender === currentUser ? 'bg-amber-500' : 'bg-blue-500'}`}>

                            <div className="flex gap-2 items-start">
                                <FaUserCircle className="h-6 w-6 opacity-80" />
                                <div>
                                    <p className="text-xs font-semibold">{message.sender}</p>
                                    <p className="text-sm">{message.content}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>



            {/* input message container */}
            <div className="fixed bottom-6 w-full px-4">
                <div className="max-w-2xl mx-auto bg-gray-800 dark:bg-gray-900 rounded-full flex items-center shadow-lg px-4 py-2 gap-3">

                    {/* Campo de texto */}
                    <input
                        type="text"
                        placeholder="Write a message..."
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none px-2" />

                    {/* Botones a la derecha */}
                    <div className="flex items-center gap-2">
                        <button
                            className="text-gray-300 hover:text-amber-400 transition-colors"
                            title="Attach file"><MdAttachFile size={22} /></button>

                        <button
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full transition-colors"
                            title="Send message"><MdSend size={20} /></button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ChatPage