import { useState } from "react"
import { useNavigate } from "react-router-dom";

export function Home() {
    const [name ,setName] = useState("");
    const navigate = useNavigate();
    return (<>
        <div className="bg-black/30 flex justify-center items-center h-screen">
            hi there
            <input placeholder="name" onChange={(e)=>{setName(e.target.value)}}></input>
            {name}
            <button onClick={()=>{navigate(`/room?name=${name}`)}}>join</button>
        </div>
    </>)


}
