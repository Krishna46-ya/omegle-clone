
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