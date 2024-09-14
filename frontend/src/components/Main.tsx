import { MyForm } from "@/components/MyForm";
import { socket } from "@/socket";
import { useEffect, useState } from "react";

export default function Main() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [fooEvents, setFooEvents] = useState([]);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        function onFooEvent(value) {
            setFooEvents((previous) => [...previous, value]);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("foo", onFooEvent);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("foo", onFooEvent);
        };
    }, []);

    return (
        <div className="App">
            <MyForm />
        </div>
    );
}
