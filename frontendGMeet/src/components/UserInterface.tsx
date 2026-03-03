import { useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import logo from "../assets/image.png"

export function UserInterface({
    stream,
    remoteStream,
    skipPartner
}: {
    stream: MediaStream | null
    remoteStream: MediaStream
    skipPartner: () => void
}) {

    const localRef = useRef<HTMLVideoElement | null>(null)
    const remoteRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        if (localRef.current && stream) {
            localRef.current.srcObject = stream
        }
    }, [stream])

    useEffect(() => {
        if (remoteRef.current) {
            remoteRef.current.srcObject = remoteStream
        }
    }, [remoteStream])

    const [searchParams] = useSearchParams()
    const name = searchParams.get("name")

    return (
        <div className="min-h-screen bg-[#f5f2ed] flex flex-col">

            {/* Navbar */}
            <div className="bg-white h-14 flex items-center justify-between px-6 shadow-sm">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Omegle" className="h-8" />
                </div>

                <div className="flex gap-2 text-lg text-slate-800 font-bold">
                    {name}
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 p-6 gap-6">

                {/* Videos */}
                <div className="flex flex-1 gap-6">

                    {/* Local video */}
                    <div className="flex-1 bg-neutral-700 rounded-md overflow-hidden">
                        <video
                            ref={localRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Remote video */}
                    <div className="flex-1 bg-neutral-600 rounded-md overflow-hidden flex items-center justify-center text-white">
                        <video
                            ref={remoteRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Right info panel */}
                <div className="w-80 bg-white rounded-md shadow-sm p-4 hidden lg:block text-sm text-neutral-700">
                    <p className="mb-3">
                        Ready to chat with new friends worldwide?
                        Start matching for an enjoyable and fun communication experience!
                    </p>

                    <button
                        onClick={skipPartner}
                        className="w-full bg-sky-400 hover:bg-sky-500 active:bg-sky-600 text-white py-2 rounded font-semibold"
                    >
                        Skip
                    </button>

                    {name && (
                        <p className="mt-4 text-xs text-neutral-500">
                            You are chatting as <b>{name}</b>
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom big button */}
            <div className="px-6 pb-6">
                <button
                    onClick={skipPartner}
                    className="w-full h-14 text-lg font-semibold bg-sky-400 hover:bg-sky-500 text-white rounded active:bg-sky-600"
                >
                    Start Match / Skip
                </button>
            </div>
        </div>
    )
}