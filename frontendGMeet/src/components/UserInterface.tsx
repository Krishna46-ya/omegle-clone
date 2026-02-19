import { useEffect, useRef } from "react"

export function UserInterface({ stream }: { stream: MediaStream | null }) {
    const vidRef = useRef<null | HTMLVideoElement>(null)
    useEffect(() => {
        if (!vidRef.current) return;
        if (!stream) return;

        vidRef.current.srcObject = stream
    }, [stream])
    return (<>

        <video ref={vidRef} autoPlay playsInline muted></video>
    </>)
}