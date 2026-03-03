import type WebSocket from "ws";
import { roomManager } from "./roomManagers.js";
import type { message } from "../types/message.js";

export interface user {
    name: string,
    socket: WebSocket
}


export class userManager {
    private users: user[];
    private roomManager: roomManager

    constructor() {
        this.users = [];
        this.roomManager = new roomManager();
    }

    addUsers(name: string, socket: WebSocket) {
        this.users.push({
            name,
            socket
        })

        socket.send(JSON.stringify({ type: "lobby" }))
        this.clearQueue()
        this.initHandler(socket)


    }

    removeUser(socketId: WebSocket) {
        this.users = this.users.filter(user => user.socket !== socketId)
        const partner = this.roomManager.removeRoom(socketId)
        if (partner) {
            this.users.push(partner)
            this.clearQueue()
        }
    }

    clearQueue() {
        if (this.users.length <= 1) {
            return;
        }
        const user1 = this.users.pop();
        const user2 = this.users.pop();
        if (!user1 || !user2) return;

        const room = this.roomManager.createRoom(user1, user2);

        this.clearQueue();
    }

    initHandler(socket: WebSocket) {
        socket.on("message", (data) => {
            const message: message = JSON.parse(data.toString());
            console.log("data from user :")

            if (message.type === "offer") {
                this.roomManager.onOffer({ name: "random", socket }, message)
            }
            if (message.type === "answer") {
                this.roomManager.onAnswer({ name: "random", socket }, message)
            }
            if (message.type === "iceCandidate") {
                this.roomManager.onIceCandidate({ name: "random", socket }, message)
            }
            if (message.type === "skip") {
                const partner = this.roomManager.skipRoom(socket, message.data.roomId)
                this.users.push({ name: "random", socket })
                if (partner) {
                    this.users.unshift(partner)
                }
                this.clearQueue()
            }
        })
    }
}