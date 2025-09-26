import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";

export const VoiceInput = () => {
  const { chat, loading } = useChat();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setTranscript("Listening...");
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            setTranscript(event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
            setTranscript(interimTranscript);
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setTranscript("Error: " + event.error);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (transcript && transcript !== "Listening..." && !transcript.includes("Error")) {
          // Send the transcript to chat
          chat(transcript);
          setTranscript("");
        }
      };
    }
  }, [chat, transcript]);

  const startListening = () => {
    if (recognitionRef.current && !isListening && !loading) {
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    return (
      <div className="text-red-500 text-sm">
        Voice input not supported in your browser. Please use Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="voice-input-container">
      <div className="flex items-center gap-2">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={loading}
          className={`p-3 rounded-full ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'
          } text-white transition-colors ${loading ? 'opacity-50' : ''}`}
          title={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className={`text-sm ${isListening ? 'text-green-600' : 'text-gray-600'}`}>
            {isListening ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1 h-3 bg-green-500 animate-pulse"></div>
                  <div className="w-1 h-4 bg-green-500 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-1 h-3 bg-green-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                </div>
                {transcript || "Speak now..."}
              </div>
            ) : (
              "Click microphone to speak"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};