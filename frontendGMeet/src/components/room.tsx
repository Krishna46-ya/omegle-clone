import { useSearchParams } from "react-router-dom"
import type { socketMessage } from "../types/message";
import { useEffect, useRef, useState } from "react";
import { UserInterface } from "./UserInterface";

export function Room() {

    useEffect(() => {

        const ws = new WebSocket("ws://localhost:8080");
        const pc = new RTCPeerConnection();

        ws.onopen = () => {
            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach(track => {
                    setRemoteStream(prev => {
                        const newStream = new MediaStream(prev.getTracks());
                        newStream.addTrack(track);
                        return newStream
                    })
                })

            }
        }

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        }).then((stream) => {
            setStream(stream)
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            })
        }).catch((err) => {
            console.log("error" + err)
        })

        ws.onmessage = async (event) => {
            const data: socketMessage = JSON.parse(event.data)
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    ws.send(JSON.stringify({
                        type: "ice",
                        data: {
                            roomId: data.data.roomId,
                            ice: event.candidate
                        }
                    }))
                }
            }

            if (data.type === "send-offer") {
                setStatus(data.data.role)
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer)
                ws.send(JSON.stringify({
                    type: "offer",
                    data: {
                        roomId: data.data.roomId,
                        offer
                    }
                }))

            } else if (data.type === "wait-answer") {
                setStatus(data.data.role)


            } else if (data.type === "send-answer") {
                await pc.setRemoteDescription(data.data.offer)
                const answer = await pc.createAnswer()
                await pc.setLocalDescription(answer)
                ws.send(JSON.stringify({
                    type: "answer",
                    data: {
                        roomId: data.data.roomId,
                        answer
                    }
                }))
            } else if (data.type === "take-answer") {
                await pc.setRemoteDescription(data.data.answer);

            } else if (data.type === "ice") {
                await pc.addIceCandidate(data.data.ice)
            }
        }

    }, [])
    const [remoteStream, setRemoteStream] = useState<MediaStream>(new MediaStream())
    const [status, setStatus] = useState("")
    const [searchparam] = useSearchParams()
    const [stream, setStream] = useState<MediaStream | null>(null)
    const name = searchparam.get("name")

    return (<>
        {name}:{status}
        <UserInterface stream={stream} remoteStream={remoteStream}></UserInterface>
    </>)
}