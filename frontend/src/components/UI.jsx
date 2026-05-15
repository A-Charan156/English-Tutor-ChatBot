import { useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { VoiceInput } from "./VoiceInput"; // Create this file

export const UI = ({ hidden, ...props }) => {
  const input = useRef();
  const { chat, loading, message } = useChat();
  const [inputMode, setInputMode] = useState("text"); // "text" or "voice"

  const sendMessage = () => {
    const text = input.current.value;
    if (!loading && text.trim()) {
      chat(text);
      input.current.value = "";
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
        {/* Input section at bottom */}
        <div className="fixed bottom-4 left-0 right-0 pointer-events-auto max-w-screen-sm w-full mx-auto">
          {/* Input Mode Toggle */}
          <div className="flex gap-2 mb-2 justify-center">
            <button
              onClick={() => setInputMode("text")}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
                inputMode === "text" 
                  ? "bg-white text-blue-600" 
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              📝 Text
            </button>
            <button
              onClick={() => setInputMode("voice")}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium ${
                inputMode === "voice" 
                  ? "bg-white text-green-600" 
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              🎤 Voice
            </button>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            {inputMode === "text" ? (
              <div className="flex items-center gap-2">
                <input
                  className="w-full placeholder:text-gray-600 p-3 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500"
                  placeholder="Type your English question..."
                  ref={input}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
                <button
                  disabled={loading || message}
                  onClick={sendMessage}
                  className={`bg-blue-600 hover:bg-blue-700 text-white p-3 px-6 font-semibold rounded-md whitespace-nowrap ${
                    loading || message ? "cursor-not-allowed opacity-30" : ""
                  }`}
                >
                  {loading ? "💭" : "Send"}
                </button>
              </div>
            ) : (
              <VoiceInput />
            )}
          </div>
        </div>
      </div>
    </>
  );
};