import React from 'react'
import toast from 'react-hot-toast';
import { IoChatbubbles } from "react-icons/io5";

const JoinCreateChat = () => {

    const [details, setDetails] = React.useState({
        roomId: "",
        userName:""
    });

    function handleFormImputChnge(event) {
        setDetails ({...details,
            [event.target.name]: event.target.value,

        });
    }

    function validateForm() {
        if (details.userName === "" || details.roomId === "") {
            toast.error("invalid input")
            return false;
        }
        return true;
    }

    function joinChat(){
        if (validateForm()) {
            //join chat logic here
            console.log(details)
        }

    }

    function createChat(){
        if (validateForm()) {
            //create chat logic here
            console.log(details)
            //call api to create room on backend
        }

    }

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
                    <input onChange={handleFormImputChnge} value={details.userName} type="text" id="name" name='userName' className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-50' placeholder='Enter your name' />
                </div>

                {/*room id div */}
                <div>
                    <label htmlFor="name" className='block font-medium mb-2'>Room ID / New Room ID</label>
                    <input onChange={handleFormImputChnge} value={details.roomId} type="text" id="name" name='roomId' className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-300 rounded-4xl focus:outline-none focus:ring-2 focus:ring-amber-50' placeholder='Enter your Room ID' />
                </div>

                {/*button div */}
                <div className='flex justify-center gap-4 mt-4'>
                    <button onClick={joinChat} className='w-full bg-amber-500 text-white py-2 rounded-4xl hover:bg-amber-600 transition duration-200'>Join Room</button>
                    <button onClick={createChat} className='w-full bg-gray-700 text-white py-2 rounded-4xl hover:bg-gray-800 transition duration-200'>Create Room</button>
                    </div>

            </div>
        </div>
    )
}

export default JoinCreateChat