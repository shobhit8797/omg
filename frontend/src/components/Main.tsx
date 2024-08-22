import { socket } from "@/socket";
import { useState, useEffect } from "react";

export const Main = () => {
    const [isConnected, setIsConnected] = useState(socket.connected);

    useEffect(() => {
        socket.on("connect", () => setIsConnected(true));
        socket.on("disconnect", () => setIsConnected(false));

        // Clean up the event listeners on component unmount
        return () => {
            socket.off("connect");
            socket.off("disconnect");
        };
    }, []);

    return (
        <>
            <div className="flex">
                Connection Status: {isConnected ? "Connected" : "Disconnected"}
            </div>
        </>
    );
};
