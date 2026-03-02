import { useEffect, useRef } from "react"

export function UserInterface({ stream, remoteStream, skipPartner }: { stream: MediaStream | null, remoteStream: MediaStream, skipPartner: () => void }) {

    const vidRef = useRef<null | HTMLVideoElement>(null)
    const remoteVidRef = useRef<null | HTMLVideoElement>(null)
    useEffect(() => {
        if (!vidRef.current) return;
        if (!stream) return;

        vidRef.current.srcObject = stream
    }, [stream])

    useEffect(() => {
        if (!remoteVidRef.current) return
        remoteVidRef.current.srcObject = remoteStream
    }, [remoteStream])

    return (<>
        <div className="h-screen">
            <div className="flex justify-around">
                <video className="w-100 bg-black" ref={vidRef} autoPlay playsInline muted></video>
                <video ref={remoteVidRef} muted playsInline autoPlay className="w-100 bg-black"></video>
            </div>
            <button onClick={skipPartner} className="p-1 px-5 font-semibold text-lg bg-slate-900 shadow-lg  text-white rounded-md hover:bg-black transition-all duration-300 active:scale-98 active:translate-y-0.5">
                Skip
            </button>
        </div>
    </>)
}