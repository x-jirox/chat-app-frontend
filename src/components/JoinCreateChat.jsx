import React from 'react'
import { IoChatbubbles } from "react-icons/io5";

const JoinCreateChat = () => {
    return (
        <div className='min-h-screen flex items-center justify-center '>
            <div className='p-9 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow'>
                <div className="flex justify-center items-center">
                <IoChatbubbles className='text-9xl'/>
                </div>
                <h1 className='text-2xl font-semibold text-center'>Join Room / Create Room</h1>
                
                {/*name div */}
                <div>
                    <label htmlFor="name" className='block font-medium mb-2'>Your Name</label>
                    <input type="text" id="name" className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-50' placeholder='Enter your name' />
                </div>

                {/*room id div */}
                <div>
                    <label htmlFor="name" className='block font-medium mb-2'>Room ID / New Room ID</label>
                    <input type="text" id="name" className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-50' placeholder='Enter your Room ID' />
                </div>

                {/*button div */}
                <div className='flex justify-center gap-4 mt-4'>
                    <button className='w-full bg-amber-500 text-white py-2 rounded-4xl hover:bg-amber-600 transition duration-200'>Join Room</button>
                    <button className='w-full bg-gray-700 text-white py-2 rounded-4xl hover:bg-gray-800 transition duration-200'>Create Room</button>
                    </div>

            </div>
        </div>
    )
}

export default JoinCreateChat