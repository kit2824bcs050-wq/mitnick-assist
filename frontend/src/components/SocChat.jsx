import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  Bot,
  Send,
  X,
  Sparkles,
} from "lucide-react";

import "./SocChat.css";


const API = "http://127.0.0.1:8000";


function SocChat() {
  const [open, setOpen] = useState(false);

  const [input, setInput] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [messages, setMessages] =
    useState([
      {
        role: "assistant",
        content:
          "MITNICK AI SOC online. Ask me about alerts, telemetry, incidents, or defensive response.",
        sources: [],
      },
    ]);

  const bottomRef = useRef(null);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);


  const sendMessage = async (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: message,
        sources: [],
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/ai/chat`,
        {
          message,
        }
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: response.data.reply,
          sources:
            response.data.sources || [],
          engine:
            response.data.engine,
        },
      ]);

    } catch (error) {
      console.error(
        "MITNICK chatbot error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Unable to contact the MITNICK AI engine.",
          sources: [],
        },
      ]);

    } finally {
      setLoading(false);
    }
  };


  if (!open) {
    return (
      <button
        className="soc-chat-launcher"
        onClick={() => setOpen(true)}
      >
        <Sparkles size={19} />

        MITNICK AI
      </button>
    );
  }


  return (
    <div className="soc-chat">

      <div className="soc-chat-header">

        <div className="soc-chat-title">

          <div className="soc-chat-logo">
            <Bot size={20} />
          </div>

          <div>
            <strong>
              MITNICK AI SOC
            </strong>

            <span>
              RAG + Ollama
            </span>
          </div>

        </div>

        <button
          className="soc-chat-close"
          onClick={() => setOpen(false)}
        >
          <X size={18} />
        </button>

      </div>


      <div className="soc-chat-status">
        <span className="soc-chat-dot" />

        Local AI engine
      </div>


      <div className="soc-chat-messages">

        {messages.map(
          (message, index) => (
            <div
              key={index}
              className={
                `soc-message ${message.role}`
              }
            >

              <div className="soc-message-role">
                {message.role === "assistant"
                  ? "MITNICK"
                  : "ANALYST"}
              </div>

              <div className="soc-message-content">
                {message.content}
              </div>

              {message.sources?.length > 0 && (

                <div className="soc-message-sources">

                  {message.sources.map(
                    (source, sourceIndex) => (

                      <span key={sourceIndex}>
                        {source.source}
                      </span>

                    )
                  )}

                </div>

              )}

            </div>
          )
        )}


        {loading && (
          <div className="soc-message assistant">

            <div className="soc-message-role">
              MITNICK
            </div>

            <div className="soc-thinking">

              <span />
              <span />
              <span />

              Analyzing incident context...

            </div>

          </div>
        )}

        <div ref={bottomRef} />

      </div>


      <form
        className="soc-chat-input"
        onSubmit={sendMessage}
      >

        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder="Ask MITNICK AI..."
          disabled={loading}
        />

        <button
          type="submit"
          disabled={
            loading ||
            !input.trim()
          }
        >
          <Send size={18} />
        </button>

      </form>

    </div>
  );
}


export default SocChat;
