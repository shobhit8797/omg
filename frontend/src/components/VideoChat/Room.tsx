import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";
import { VideoCard } from "../VideoCard";
import { log } from "console";

const URL = "http://localhost:8000";

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack,
}: {
    name: string;
    localAudioTrack: MediaStreamTrack | null;
    localVideoTrack: MediaStreamTrack | null;
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [socket, setSocket] = useState<null | Socket>(null);
    const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [receivingPc, setReceivingPc] = useState<null | RTCPeerConnection>(
        null
    );
    const [remoteVideoTrack, setRemoteVideoTrack] =
        useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] =
        useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] =
        useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>();
    const localVideoRef = useRef<HTMLVideoElement>();

    useEffect(() => {
        const socket = io(URL);

        socket.on("send-offer", async ({ roomId }) => {
            console.log("recieved send-offer recieved for", socket.id);
            const pc = new RTCPeerConnection();

            setSendingPc(pc);
            if (localVideoTrack) {
                pc.addTrack(localVideoTrack);
            }
            if (localAudioTrack) {
                pc.addTrack(localAudioTrack);
            }

            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally, ");
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        roomId,
                    });
                }
            };

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                pc.setLocalDescription(sdp);
                console.log("sending offer for socket id", socket.id);

                socket.emit("offer", {
                    sdp,
                    roomId,
                });
            };
        });

        socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
            console.log("received offer for socket id", socket.id);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp);
            const sdp = await pc.createAnswer();
            //@ts-ignore
            pc.setLocalDescription(sdp);
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
            console.log("set remote media stream");

            setRemoteMediaStream(stream);
            // trickle ice
            setReceivingPc(pc);
            window.pcr = pc;
            pc.ontrack = (e) => {
                alert("ontrack");
                // console.error("inside ontrack");
                // const {track, type} = e;
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
                // remoteVideoRef.current.play();
            };

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("omn ice candidate on receiving seide");
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId,
                    });
                }
            };

            console.log("sending answer for socket.id", socket.id);

            socket.emit("answer", {
                roomId,
                sdp: sdp,
            });
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track;
                const track2 = pc.getTransceivers()[1].receiver.track;
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2);
                    setRemoteVideoTrack(track1);
                } else {
                    setRemoteAudioTrack(track1);
                    setRemoteVideoTrack(track2);
                }
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1);
                //@ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2);
                //@ts-ignore
                // remoteVideoRef.current.play();
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // } else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current.srcObject.addTrack(track)
                // }
                // //@ts-ignore
            }, 5000);
        });

        socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
            console.log("answer received for socket id", socket.id);
            setSendingPc((pc) => {
                console.log("setting remote description", remoteSdp);

                pc?.setRemoteDescription(remoteSdp);
                return pc;
            });
            console.log("loop closed");
        });

        socket.on("add-ice-candidate", ({ candidate, type }) => {
            console.log("add ice candidate from remote");
            console.log({ candidate, type });
            if (type == "sender") {
                setReceivingPc((pc) => {
                    if (!pc) {
                        console.error("receicng pc nout found");
                    } else {
                        console.error(pc.ontrack);
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            } else {
                setSendingPc((pc) => {
                    if (!pc) {
                        console.error("sending pc nout found");
                    } else {
                        // console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate);
                    return pc;
                });
            }
        });

        setSocket(socket);
    }, [name]);

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([
                    localVideoTrack,
                ]);
                // localVideoRef.current.play();
            }
        }
    }, [localVideoRef]);

    return (
        <>
            <ResizablePanelGroup
                direction="horizontal"
                className="w-full rounded-lg border"
            >
                <ResizablePanel defaultSize={50}>
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={50}>
                            <VideoCard
                                videoRef={remoteVideoRef}
                                className="h-full"
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50}>
                            <VideoCard
                                videoRef={localVideoRef}
                                className="h-full"
                            />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50}>
                    <div className="flex h-full items-center justify-center p-6">
                        <span className="font-semibold">Chat Screen</span>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* {lobby ? "Waiting to connect you to someone" : null}
            <VideoCard
                localVideoRef={remoteVideoRef}
                width={400}
                height={400}
            /> */}
        </>
    );
};
