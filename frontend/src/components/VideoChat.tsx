import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { WEBSOCKET_URL } from "../config";

const socket = io(WEBSOCKET_URL);

const VideoChat: React.FC = () => {
  const [room, setRoom] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  useEffect(() => {
    socket.on("user-connected", handleUserConnected);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("receive-offer", handleReceiveOffer);
    socket.on("receive-answer", handleReceiveAnswer);
    socket.on("receive-ice-candidate", handleReceiveIceCandidate);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("receive-offer", handleReceiveOffer);
      socket.off("receive-answer", handleReceiveAnswer);
      socket.off("receive-ice-candidate", handleReceiveIceCandidate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserConnected = (userId: string) => {
    console.log("User connected:", userId);
  };

  const handleUserDisconnected = (userId: string) => {
    console.log("User disconnected:", userId);
  };

  const handleReceiveOffer = async ({
    offer,
  }: {
    sender: string;
    offer: RTCSessionDescriptionInit;
  }) => {
    if (pcRef.current) {
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      socket.emit("send-answer", { room, answer });
      processPendingCandidates();
    }
  };

  const handleReceiveAnswer = async ({
    answer,
  }: {
    sender: string;
    answer: RTCSessionDescriptionInit;
  }) => {
    if (pcRef.current && pcRef.current.signalingState === "have-local-offer") {
      await pcRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
      processPendingCandidates();
    }
  };

  const handleReceiveIceCandidate = async ({
    candidate,
  }: {
    sender: string;
    candidate: RTCIceCandidateInit;
  }) => {
    if (pcRef.current) {
      if (pcRef.current.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        pendingCandidates.current.push(candidate);
      }
    }
  };

  const processPendingCandidates = async () => {
    if (pcRef.current) {
      while (pendingCandidates.current.length) {
        const candidate = pendingCandidates.current.shift();
        if (candidate) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }
    }
  };

  const joinRoom = () => {
    if (room) {
      socket.emit("join", room);
      setJoined(true);
      startVideoChat();
    }
  };

  const leaveRoom = () => {
    if (room) {
      socket.emit("leave", room);
      setJoined(false);
      stopVideoChat();
    }
  };

  const startVideoChat = async () => {
    pcRef.current = new RTCPeerConnection();
    pcRef.current.onicecandidate = handleIceCandidate;
    pcRef.current.ontrack = handleTrack;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      if (pcRef.current) {
        pcRef.current.addTrack(track, stream);
      }
    });

    if (pcRef.current) {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socket.emit("send-offer", { room, offer });
    }
  };

  const stopVideoChat = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      (localVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      (remoteVideoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const handleIceCandidate = (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      socket.emit("send-ice-candidate", { room, candidate: event.candidate });
    }
  };

  const handleTrack = (event: RTCTrackEvent) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = event.streams[0];
    }
  };

  return (
    <div>
      {!joined ? (
        <div>
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room ID"
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <button onClick={leaveRoom}>Leave Room</button>
      )}
      <div>
        <video ref={localVideoRef} autoPlay muted></video>
        <video ref={remoteVideoRef} autoPlay></video>
      </div>
    </div>
  );
};

export default VideoChat;
