
export type message = {
    type: "offer",
    data: {
        roomId : string,
        offer : string
    }
} | {
    type : "answer",
    data : {
        roomId : string,
        answer : string
    }
} | {
    type : "iceCandidate",
    data : {
        roomId :string
        ice :string
    }
}

export type socketMessage = {
    type: "send-offer",
    data: {
        roomId: string,
        role: "sender"
    }
} | {
    type: "wait-answer",
    data: {
        roomId: string,
        role: "receiver"
    }
} | {
    type: "send-answer",
    data: {
        offer: RTCSessionDescriptionInit,
        roomId: string
    }
} | {
    type: "take-answer",
    data: {
        roomId: string,
        answer: RTCSessionDescriptionInit
    }
} | {
    type: "ice",
    data: {
        roomId: string,
        ice: RTCIceCandidateInit
    }
}