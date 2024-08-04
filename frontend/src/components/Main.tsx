import { ModeToggle } from "./mode-toggle";
import { Room } from "./Room";

export const Main = () => {
    return (
        <>
            <div className="flex flex-col h-screen">
                <div className="h-[5%]">
                    <ModeToggle />
                </div>
                <div className="h-[95%]">
                    <Room />
                </div>
            </div>
        </>
    );
};