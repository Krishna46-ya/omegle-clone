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
        const video = strangerVidRef.current
        if (!video) return;

        video.srcObject = remoteStream;

        video.play().catch(() => { });
    }, [remoteStream])

    return (<>

        <video className="w-100 bg-black" ref={vidRef} autoPlay playsInline muted></video>
        <video className="w-100 bg-black" ref={strangerVidRef} autoPlay playsInline muted></video>
    </>)
}