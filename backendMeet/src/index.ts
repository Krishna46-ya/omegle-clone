import WebSocket, { WebSocketServer } from 'ws';
import { userManager } from './managers/userManager.js';

const wss = new WebSocketServer({ port: 8080 })

const UserManager = new userManager()

wss.on("connection",(ws)=>{
    UserManager.addUsers("random",ws);
    console.log("user connected")
    ws.on("close",()=>{
        UserManager.removeUser(ws);
        console.log("user disconnected")
    })
})

    
