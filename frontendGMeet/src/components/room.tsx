import { useSearchParams } from "react-router-dom"
import type { message } from "../types/message";
import { useEffect, useState } from "react";
import { UserInterface } from "./UserInterface";

export function Room() {

    useEffect(() => {

        const ws = new WebSocket("ws://localhost:8080");
        const pc = new RTCPeerConnection();

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        }).then((stream) => {
            setStream(stream)
        }).catch((err)=>{
            console.log("error"+err)
        })

        ws.onmessage = (event) => {
            const data: message = JSON.parse(event.data)

            if (data.type === "offer") {
                pc.createOffer();

            }
        }

    }, [])

    const [searchparam] = useSearchParams()
    const [stream, setStream] = useState<MediaStream | null>(null)
    const name = searchparam.get("name")

    return (<>
        {name}
        <UserInterface stream={stream}></UserInterface>
    </>)
}