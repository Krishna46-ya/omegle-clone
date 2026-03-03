import type { socketMessage } from "../types/message";
import { useEffect, useRef, useState } from "react";
import { UserInterface } from "./UserInterface";

export function Room() {

    useEffect(() => {

        const ws = new WebSocket("ws://localhost:8080");
        wsRef.current = ws
        let tracksReadyResolve: () => void;
        const trackReady = new Promise<void>(res => {
            tracksReadyResolve = res;
        })

        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
        }).then((stream) => {
            setStream(stream)
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

                await trackReady
                if (!pcRef.current) {
                    createCallSession()
                }
                const pc = pcRef.current!

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
                await trackReady
                if (!pcRef.current) {
                    createCallSession();
                }

                const pc = pcRef.current!
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
                const pc = pcRef.current!
                await pc.setRemoteDescription(data.data.answer);

            } else if (data.type === "ice") {
                if (!pcRef.current) return
                const pc = pcRef.current
                await pc.addIceCandidate(data.data.ice)


            } else if (data.type === "skipped") {
                pcRef.current?.close()
                pcRef.current = null
                setRemoteStream(new MediaStream())
                roomIdRef.current = null
                
            }
        }

        return () => {
            stream?.getTracks().forEach(track => track.stop());
            if (pcRef.current) {
                const pc = pcRef.current
                pc.getSenders().forEach(sender => pc.removeTrack(sender));

                pc.onicecandidate = null;
                pc.ontrack = null;
                pc.close();
            }

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

        pcRef.current?.close()
        pcRef.current = null
        setRemoteStream(new MediaStream())
        roomIdRef.current = null

        wsRef.current.send(JSON.stringify({
            type: "skip",
            data: {
                roomId: roomIdRef.current
            }
        }))
    }

    function createCallSession() {
        const pc = new RTCPeerConnection();
        pcRef.current = pc

        stream?.getTracks().forEach((track) => {
            pc.addTrack(track, stream)
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
            console.log("Inside IceCandidate")
            if (!roomIdRef.current || !wsRef.current) return;
            if (event.candidate) {
                wsRef.current.send(JSON.stringify({
                    type: "iceCandidate",
                    data: {
                        roomId: roomIdRef.current,
                        ice: event.candidate
                    }
                }))
            }
            console.log(roomIdRef.current)
        }

    }

    const [remoteStream, setRemoteStream] = useState<MediaStream>(new MediaStream())
    const [status, setStatus] = useState("")
    const [stream, setStream] = useState<MediaStream | null>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const roomIdRef = useRef<null | string>(null)
    const pcRef = useRef<RTCPeerConnection | null>(null);

    return (<>
        status :{status}
        <UserInterface skipPartner={skipPartner} remoteStream={remoteStream} stream={stream}></UserInterface>
    </>)
}