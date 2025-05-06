import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { IoChatbubbles } from "react-icons/io5";
import { createRoomApi, joinChatApi } from '../services/RoomService';
import { useNavigate } from 'react-router';
import useChatContext from '../context/ChatContext';

const JoinCreateChat = () => {
  const [details, setDetails] = useState({
    roomId: "",
    userName: "",
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  // Effecto para verificar si ya hay una sesión activa en el localStorage
  useEffect(() => {
    const savedRoomId = localStorage.getItem('roomId');
    const savedCurrentUser = localStorage.getItem('currentUser');

    if (savedRoomId && savedCurrentUser) {
      navigate("/chat"); // Si ya está logueado, redirigir al chat
    }
  }, [navigate]);

  // Manejar cambios en los campos de formulario
  const handleFormInputChange = (event) => {
    setDetails({
      ...details,
      [event.target.name]: event.target.value,
    });
  };

  // Validación de formulario
  const validateForm = () => {
    if (details.userName === "" || details.roomId === "") {
      toast.error("Invalid input");
      return false;
    }
    return true;
  };

  // Unirse a un chat existente
  const joinChat = async () => {
    if (validateForm()) {
      try {
        const room = await joinChatApi(details.roomId);
        toast.success("Joined Room");
        setCurrentUser(details.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        toast.error(error.response?.data || "Error joining room");
      }
    }
  };

  // Crear una nueva sala de chat
  const createRoom = async () => {
    if (validateForm()) {
      try {
        const response = await createRoomApi(details.roomId);
        toast.success("Room Created Successfully");
        setCurrentUser(details.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        toast.error(error.response?.data || "Room creation failed");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-9 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
        {/* Icono y título */}
        <div className="flex justify-center items-center">
          <IoChatbubbles className="text-9xl" />
        </div>
        <h1 className="text-2xl font-semibold text-center">Join Room / Create Room</h1>

        {/* Formulario de entrada */}
        <div>
          <label htmlFor="userName" className="block font-medium mb-2">Your Name</label>
          <input
            onChange={handleFormInputChange}
            value={details.userName}
            type="text"
            id="userName"
            name="userName"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-50"
            placeholder="Enter your name"/>
        </div>

        <div>
          <label htmlFor="roomId" className="block font-medium mb-2">Room ID / New Room ID</label>
          <input
            onChange={handleFormInputChange}
            value={details.roomId}
            type="text"
            id="roomId"
            name="roomId"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-50"
            placeholder="Enter your Room ID"/>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center gap-4 mt-4">
          <button
            onClick={joinChat}
            className="w-full bg-amber-500 text-white py-2 rounded-4xl hover:bg-amber-600 transition duration-200">
            Join Room
          </button>
          <button
            onClick={createRoom}
            className="w-full bg-gray-700 text-white py-2 rounded-4xl hover:bg-gray-800 transition duration-200">
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
