const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("../client/src/users");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    // User joining room message
    socket.on("join_room", (data) => {
        const user = userJoin(socket.id, data.username, data.room);

        socket.join(user.room);
        console.log(`user with name: ${data.username} joined room: ${data.room}`);

        // Broadcast to the specific room
        socket.to(user.room).emit("user_joined", {
            username: user.username,
            message: 'has joined the room',
            time: new Date().toLocaleTimeString()
        });

        //send users and room info
        io.to(user.room).emit("roomUsers", {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    socket.on("send_message", (data) => {
        const user = getCurrentUser(socket.id);
        if (user) {
            // Broadcast to the specific room
            io.to(user.room).emit("receive_message", data);
        }
    });

    // Runs when user disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id);
        if (user) {
            // Broadcast to the specific room
            io.to(user.room).emit("user_left", {
                username: user.username,
                message: `${user.username} has left the room.`,
                time: new Date().toLocaleTimeString()
            });
            //send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
            console.log(`${user.username} disconnected`);
        }
    });

    // Handle leaving room
    socket.on("leave_room", (data) => {
        const user = userLeave(socket.id);
        if (user) {
            // Broadcast to the specific room
            io.to(user.room).emit("user_left", {
                username: user.username,
                message: `${user.username} has left the room.`,
                time: new Date().toLocaleTimeString()
            });
            //send users and room info
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room)
            });
            console.log(`${user.username} left the room`);
        }
    });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});
