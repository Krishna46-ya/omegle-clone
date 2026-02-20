import { useEffect, useRef } from "react"

export function UserInterface({ stream, remoteStream }: { stream: MediaStream | null, remoteStream: MediaStream }) {
    const vidRef = useRef<null | HTMLVideoElement>(null)
    const strangerVidRef = useRef<HTMLVideoElement>(null)
    useEffect(() => {
        if (!vidRef.current) return;
        if (!stream) return;

        vidRef.current.srcObject = stream
    }, [stream])

    useEffect(() => {
        if (!strangerVidRef.current) return;
        strangerVidRef.current.srcObject = remoteStream
        strangerVidRef.current.play().catch(() => { });

    }, [remoteStream])

    return (<>

        <video ref={vidRef} autoPlay playsInline muted></video>
        <video ref={strangerVidRef} autoPlay playsInline></video>
    </>)
}