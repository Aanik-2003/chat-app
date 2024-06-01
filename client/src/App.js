import React, { useState } from 'react';
import './App.css';
import io from "socket.io-client";
import Chats from './Chats';

const socket = io.connect("http://localhost:3001");

function App() {
    const [username, setUsername] = useState("");
    const [room, setRoom] = useState("JavaScript");
    const [showChat, setShowChat] = useState(false);

    const joinRoom = (e) => {
        e.preventDefault();
        if (username !== "" && room !== "") {
            // Emit "join_room" event when joining the room
            socket.emit("join_room", { username, room });
            setShowChat(true);
        }
    };

    return (
        <div className="App">
            {!showChat && (
                <div>
                    <div className=""
                        style={{ height: "300px", width: "300px", borderRadius: "3px", backgroundColor: "black", margin: "auto", marginTop: "10px" }}>
                        <h1 className="text-white text-3xl flex justify-center"
                            style={{ color: "white", fontSize: "3xl", display: "flex", justifyContent: "center", margin: "auto" }}
                        >
                            Chat App
                        </h1>
                        <main className="join-main" style={{ padding: "30px 40px", background: "gray" }}>
                            <form onSubmit={joinRoom}>
                                <div className="form-control" style={{ marginBottom: "20px" }}>
                                    <label htmlFor="username" style={{ display: "block", color: "white" }}>Username</label>
                                    <input type="text" name="username" id="username" placeholder="Enter Username..." required style={{ fontSize: "16px", padding: "5px", height: "40px", width: "100%", borderRadius: "3px" }}
                                        onChange={(event) => {
                                            setUsername(event.target.value);
                                        }}
                                    />
                                </div>
                                <div className="form-control" style={{ marginBottom: "20px" }}>
                                    <label htmlFor="room" style={{ display: "block", color: "white" }}>Room</label>
                                    <select name="room" id="room" style={{ fontSize: "16px", padding: "5px", height: "40px", width: "100%", borderRadius: "3px" }}
                                        onChange={(event) => {
                                            setRoom(event.target.value);
                                        }}
                                    >
                                        <option value="JavaScript">JavaScript</option>
                                        <option value="Python">Python</option>
                                        <option value="PHP">PHP</option>
                                        <option value="C#">C#</option>
                                        <option value="Ruby">Ruby</option>
                                        <option value="Java">Java</option>
                                    </select>
                                </div>
                                <button className="btn" type="submit"
                                    style={{ marginTop: "20px", width: "100%", backgroundColor: "black", color: "white", borderRadius: "3px" }}
                                >
                                    Join Chat
                                </button>
                            </form>
                        </main>
                    </div>
                </div>
            )}
            {showChat && <Chats socket={socket} username={username} room={room} setShowChat={setShowChat}/>}
        </div>
    );
}

export default App;
