import type { message } from "../types/message.js";
import type { user } from "./userManager.js";

let GLOBAL_ROOM_ID = 1;

interface Room {
    user1: user,
    user2: user
}
export class roomManager {
    private rooms: Map<string, Room>;
    constructor() {
        this.rooms = new Map<string, Room>
    }

    createRoom(user1: user, user2: user) {
        const roomId = this.generate().toString();
        this.rooms.set(roomId, { user1, user2 })

        user1.socket.send(JSON.stringify({
            type: "send-offer",
            data: {
                roomId,
                role: "sender"
            }
        }))

        user2.socket.send(JSON.stringify({
            type: "wait-answer",
            data: {
                roomId,
                role: "receiver"
            }
        }))

    }

    onOffer(user1: user, messageData: message) {

        const room = this.rooms.get(messageData.data.roomId)
        if (!room || messageData.type !== "offer") {
            console.log("inside the if check")
            return;
        }

        console.log("inside onoffer all checks passed")

        room.user2.socket.send(JSON.stringify({
            type: "send-answer",
            data: {
                offer: messageData.data.offer,
                roomId: messageData.data.roomId
            }
        }))
    }

    onAnswer(user2: user, messageData: message) {
        const room = this.rooms.get(messageData.data.roomId)
        if (messageData.type !== "answer" || !room) {
            return;
        }
        room.user1.socket.send(JSON.stringify({
            type: "take-answer",
            data: {
                roomId: messageData.data.roomId,
                answer: messageData.data.answer
            }
        }))
    }

    onIceCandidate(user: user, message: message) {
        const room = this.rooms.get(message.data.roomId)
        if (!room || message.type !== 'iceCandidate') {
            return;
        }
        if (room.user1 === user) {
            room.user2.socket.send(JSON.stringify({
                type: "ice",
                data: {
                    roomId: message.data.roomId,
                    ice: message.data.ice
                }
            }))
        } else {
            room.user1.socket.send(JSON.stringify({
                type: "ice",
                data: {
                    roomId: message.data.roomId,
                    ice: message.data.ice
                }
            }))
        }
    }

    generate() {
        return GLOBAL_ROOM_ID++;
    }
}