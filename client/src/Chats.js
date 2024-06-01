import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function Chats({ socket, username, room, setShowChat }) {
    const [currentMessage, setCurrentMessage] = useState("");
    const [messageList, setMessageList] = useState([]);
    const [roomUsers, setRoomUsers] = useState([]);
    const chatMessagesRef = useRef(null);

    const sendMessage = async (e) => {
        e.preventDefault();

        if (currentMessage.trim() !== "") {
            const messageData = {
                room: room,
                username: username,
                message: currentMessage,
                time: new Date().toLocaleTimeString(), // Use localized time on the client-side
            };
            await socket.emit("send_message", messageData);
            // Clear the input field
            setCurrentMessage("");
            // Focus on the input field
            document.getElementById("msg").focus();
        }
    };

    useEffect(() => {
        socket.on('roomUsers', ({ users }) => {
            setRoomUsers(users);
        });

        return () => {
            socket.off('roomUsers');
        };
    }, [socket]);

    const leaveRoom = () => {
        socket.emit("leave_room", { username, room });
        setShowChat(false);
    };

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            setMessageList((list) => [...list, data]);
        };

        const handleUserJoined = (data) => {
            setRoomUsers((users) => [...users, data.username]);
            setMessageList((list) => [...list, data]);
        };

        const handleUserLeft = (data) => {
            setRoomUsers((users) => users.filter(user => user.username !== data.username));
            setMessageList((list) => [...list, data]);
        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("user_joined", handleUserJoined);
        socket.on("user_left", handleUserLeft);

        // Cleanup function to remove the event listeners
        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("user_joined", handleUserJoined);
            socket.off("user_left", handleUserLeft);
        };
    }, [socket]);

    // Scroll to bottom when messageList updates
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messageList]);

    return (
        <div className="chat-container">
            <header className="chat-header">
                <h1><i className="fas fa-smile"></i> Chat App</h1>
                <a id="leave-btn" className="btn" onClick={leaveRoom}>Leave Room</a>
            </header>
            <main className="chat-main">
                <div className="chat-sidebar">
                    <h3><i className="fas fa-comments"></i> Room Name:</h3>
                    <h2 id="room-name">{room}</h2>
                    <h3><i className="fas fa-users"></i> Users</h3>
                    <ul>
                        {roomUsers.map((user, index) => (
                            <li key={index}>{user.username}</li>
                        ))}
                    </ul>
                </div>
                <div className="chat-messages" ref={chatMessagesRef}>
                    {messageList.map((messageContent, index) => (
                        <div key={index}>
                            <strong>{messageContent.username}: </strong>{messageContent.message} - {messageContent.time}
                        </div>
                    ))}
                </div>
            </main>
            <div className="chat-form-container">
                <form id="chat-form" onSubmit={sendMessage}>
                    <input id="msg" type="text" placeholder="Enter Message..." required autoComplete="off" value={currentMessage}
                        onChange={(event) => {
                            setCurrentMessage(event.target.value);
                        }} />
                    <button className="btn" type="submit">
                        <i className="fas fa-paper-plane"></i> Send
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Chats;
