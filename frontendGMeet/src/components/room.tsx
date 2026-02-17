import { useSearchParams } from "react-router-dom"
import type { message } from "../types/message";

export function Room() {
    const [searchparam] = useSearchParams()
    const name = searchparam.get("name")

    const ws = new WebSocket("ws://localhost:8080");
    const pc = new RTCPeerConnection();
    

    ws.onmessage = (event) => {
        const data: message = JSON.parse(event.data)

        if(data.type=== "offer"){

        }
    }


    return (<>
        {name}
    </>)
}