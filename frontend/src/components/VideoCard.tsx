import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { log } from "console";

export const VideoCard = ({
    videoRef,
    className,
    autoPlay = true,
}) => {    
    return (
        <>
            <video autoPlay={autoPlay} ref={videoRef} />
            {/* <Skeleton className={cn(`rounded-xl`, className)} /> */}
        </>
    );
};