import type { socketMessage } from "../types/message";
import { useEffect, useRef, useState } from "react";
import { UserInterface } from "./UserInterface";

export function Room() {

    useEffect(() => {

        const ws = new WebSocket("ws://localhost:8080");
        wsRef.current = ws
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

        pc.onicecandidate = (event) => {
            console.log(44);
            if (!roomIdRef.current) return;
            if (event.candidate) {
                ws.send(JSON.stringify({
                    type: "iceCandidate",
                    data: {
                        roomId: roomIdRef.current,
                        ice: event.candidate
                    }
                }))
            }
            console.log(roomIdRef.current)
        }

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
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
                roomIdRef.current = data.data.roomId;
            }
            console.log(data)


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

            wsRef.current = null;
            roomIdRef.current = null;
        }

    }, [])

    const skipPartner = () => {
        if (!wsRef.current || !roomIdRef.current) return;
        wsRef.current.send(JSON.stringify({
            type: "skip",
            data: {
                roomId: roomIdRef.current
            }
        }))
    }

    const [remoteStream, setRemoteStream] = useState<MediaStream>(new MediaStream())
    const [status, setStatus] = useState("")
    const [stream, setStream] = useState<MediaStream | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const roomIdRef = useRef<null | string>(null)

    return (<>
        status :{status}
        <UserInterface skipPartner={skipPartner} remoteStream={remoteStream} stream={stream}></UserInterface>
    </>)
}