import { useState } from "react";
import { socket } from "../socket";

export function MyForm() {
    const [value, setValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function onSubmit(event) {
        console.log("onSubmit", value);
        
        event.preventDefault();
        setIsLoading(true);

        socket.timeout(5000).emit("send-message", value, () => {
            console.log("message received");
            setIsLoading(false);
        });
    }

    return (
        <form onSubmit={onSubmit}>
            <input onChange={(e) => setValue(e.target.value)} />

            <button type="submit" disabled={isLoading}>
                Submit
            </button>
        </form>
    );
}

