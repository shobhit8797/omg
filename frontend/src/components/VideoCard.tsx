import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const VideoCard = ({
    localVideoRef,
    className,
    autoPlay = true,
}) => {
    return (
        <>
            {/* <video
                    autoPlay={autoPlay}
                    width={width}
                    height={height}
                    ref={localVideoRef}
                /> */}
            <Skeleton className={cn(`rounded-xl`, className)} />
        </>
    );
};