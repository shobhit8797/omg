import { socket } from "@/socket";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function Main() {
    return (
        <div className="App justify-center flex content-center items-center">
            <Button asChild>
                <Link to="/lobby">Join Room </Link>
            </Button>
            {/* <MyForm /> */}
        </div>
    );
}
