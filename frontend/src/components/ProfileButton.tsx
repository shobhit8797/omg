import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "./mode-toggle";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export const ProfileButton: React.FC = () => {
    const { setTheme } = useTheme();

    return (
        <>
            <ModeToggle></ModeToggle>
            <Popover>
                <PopoverTrigger asChild>
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </PopoverTrigger>
                <PopoverContent>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <div className="grid grid-cols-2 items-center gap-4">
                                <Label htmlFor="toggle-theme">
                                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">
                                        Toggle theme
                                    </span>
                                </Label>
                                <Switch
                                    id="toggle-theme"
                                    onCheckedChange={(checked) => {
                                        setTheme(checked ? "dark" : "light");
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}