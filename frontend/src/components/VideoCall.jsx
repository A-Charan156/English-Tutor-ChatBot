import { useRef, useEffect, useState } from "react";
import { useChat } from "../hooks/useChat";

export const VideoCall = () => {
  const videoRef = useRef();
  const [stream, setStream] = useState(null);
  const { message } = useChat();

  useEffect(() => {
    // Get user's webcam stream
    const enableVideo = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    enableVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="video-call-container">
      {/* Avatar takes main screen */}
      <div className="avatar-container">
        {/* This is handled by Three.js canvas */}
      </div>
      
      {/* User's video in corner */}
      {stream && (
        <div className="user-video-container">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="user-video"
          />
          <div className="video-overlay">
            <span>You</span>
          </div>
        </div>
      )}

      {/* Transcript Display */}
      {message && (
        <div className="transcript-container">
          <div className="transcript-header">
            <h3>Conversation Transcript</h3>
          </div>
          <div className="transcript-content">
            <p><strong>Avatar:</strong> {message.text}</p>
          </div>
        </div>
      )}
    </div>
  );
};