import { useState } from "react"
import { useNavigate } from "react-router-dom"
import logo from "../assets/image.png"

export function Home() {
    const [name, setName] = useState("")
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[#f5f2ed] flex flex-col">

            {/* Navbar */}
            <div className="bg-white h-14 flex items-center px-6 shadow-sm">
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Omegle" className="h-8" />
                </div>
            </div>

            {/* Center card */}
            <div className="flex flex-1 items-center justify-center">
                <div className="w-105 bg-white rounded-md shadow-md p-6">

                    <h1 className="text-xl font-semibold text-neutral-800 mb-2">
                        Talk to strangers
                    </h1>

                    <p className="text-sm text-neutral-600 mb-5">
                        Enter your name to start a video chat
                    </p>

                    <input
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-neutral-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />

                    <button
                        disabled={!name.trim()}
                        onClick={() => navigate(`/room?name=${name}`)}
                        className="w-full py-3 bg-sky-400 hover:bg-sky-500 disabled:bg-neutral-300 text-white font-semibold rounded transition"
                    >
                        Start Chat
                    </button>
                </div>
            </div>
        </div>
    )
}