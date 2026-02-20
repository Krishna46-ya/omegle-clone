import { useSearchParams } from "react-router-dom"
import type { socketMessage } from "../types/message";
import { useEffect, useState } from "react";
import { UserInterface } from "./UserInterface";

export function Room() {

    useEffect(() => {

        const ws = new WebSocket("ws://localhost:8080");
        const pc = new RTCPeerConnection();
        let tracksReadyResolve: () => void;
        const trackReady = new Promise<void>(res => {
            tracksReadyResolve = res;
        })


        pc.ontrack = (event) => {
            setRemoteStream(prev => {
                if (prev.getTracks().some(t => t.id === event.track.id)) {
                    return prev;
                }

                const newStream = new MediaStream(prev.getTracks())
                newStream.addTrack(event.track)
                return newStream;
            })
        }

        let roomId: null | string = null;
        pc.onicecandidate = (event) => {
            if (!roomId) return;
            if (event.candidate) {
                ws.send(JSON.stringify({
                    type: "ice",
                    data: {
                        roomId: roomId,
                        ice: event.candidate
                    }
                }))
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
            tracksReadyResolve();
        }).catch((err) => {
            console.log("error" + err)
        })

        ws.onmessage = async (event) => {
            const data: socketMessage = JSON.parse(event.data)
            if (data?.data?.roomId) {
                roomId = data.data.roomId;
            }


            if (data.type === "send-offer") {
                setStatus(data.data.role)
                await trackReady
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
                await trackReady
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

        return () => {
            stream?.getTracks().forEach(track => track.stop());

            pc.getSenders().forEach(sender => pc.removeTrack(sender));

            pc.onicecandidate = null;
            pc.ontrack = null;
            pc.close();

            ws.onmessage = null;
            ws.onopen = null;
            ws.onerror = null;

            if (ws.readyState === ws.CONNECTING || ws.readyState === ws.OPEN) {
                ws.close();
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