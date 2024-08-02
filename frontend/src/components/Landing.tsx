import { useState } from "react"
import { Link } from "react-router-dom";

export const Landing = () => {
    const [name, setName] = useState("");
    // const history = useHistor

    return <div> 
        <input type="text" onChange={(e)=> {
            setName(e.target.value);
        }} value={name} />

        <Link to={`/room/?name=${name}`}> Join </Link>
    </div>
}