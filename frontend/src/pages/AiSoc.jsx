import {
  useState,
} from "react";

import axios from "axios";

import {
  Bot,
  Search,
  Send,
  ShieldAlert,
} from "lucide-react";

import {
  useSoc,
} from "../context/SocContext";


function AiSoc() {
  const {
    apiUrl,
    latest,
  } = useSoc();

  const [input, setInput] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    investigation,
    setInvestigation,
  ] = useState(null);


  const send = async (event) => {
    event.preventDefault();

    const text =
      input.trim();

    if (!text || loading)
      return;


    setMessages(
      previous => [
        ...previous,
        {
          role: "user",
          content: text,
        },
      ]
    );

    setInput("");
    setLoading(true);


    try {

      const response =
        await axios.post(
          `${apiUrl}/ai/chat`,
          {
            message: text,
          }
        );


      setMessages(
        previous => [
          ...previous,
          {
            role: "assistant",

            content:
              response.data.reply,

            sources:
              response.data.sources,
          },
        ]
      );

    } finally {
      setLoading(false);
    }
  };


  const investigate =
    async () => {

      setLoading(true);

      try {

        const response =
          await axios.get(
            `${apiUrl}/ai/investigate/latest`
          );

        setInvestigation(
          response.data
        );

      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="page-shell">

      <div className="page-header">

        <div>
          <span className="page-eyebrow">
            GENERATIVE SECURITY ANALYSIS
          </span>

          <h1>AI SOC</h1>

          <p>
            Local RAG + Ollama analyst workspace.
          </p>
        </div>


        <button
          className="primary-button"
          onClick={investigate}
        >
          <Search size={17} />

          Investigate Latest
        </button>

      </div>


      <div className="ai-workspace">

        <div className="panel ai-chat-large">

          <div className="panel-title">

            <div>
              <p>MITNICK AI</p>

              <h3>
                SOC Copilot
              </h3>
            </div>

            <Bot size={20} />

          </div>


          <div className="ai-messages">

            {messages.length === 0 && (

              <div className="ai-welcome">

                <Bot size={35} />

                <h3>
                  MITNICK AI SOC
                </h3>

                <p>
                  Ask about alerts,
                  port scans,
                  brute-force activity,
                  telemetry or incident
                  response.
                </p>

              </div>

            )}


            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={
                    `ai-message ${
                      message.role
                    }`
                  }
                >

                  <strong>
                    {message.role
                      === "assistant"
                      ? "MITNICK"
                      : "ANALYST"}
                  </strong>

                  <p>
                    {message.content}
                  </p>


                  {message.sources
                    ?.map(
                      (
                        source,
                        sourceIndex
                      ) => (

                        <span
                          className="source-chip"
                          key={
                            sourceIndex
                          }
                        >
                          {source.source}
                        </span>

                      )
                    )}

                </div>

              )
            )}


            {loading && (
              <div className="ai-loading">
                Ollama analyzing...
              </div>
            )}

          </div>


          <form
            className="ai-input"
            onSubmit={send}
          >

            <input
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              placeholder="Ask MITNICK AI..."
            />

            <button>
              <Send size={18} />
            </button>

          </form>

        </div>


        <div className="panel">

          <div className="panel-title">

            <div>
              <p>
                INVESTIGATION
              </p>

              <h3>
                Latest Incident
              </h3>
            </div>

            <ShieldAlert size={20} />

          </div>


          {investigation ? (
            <>

              <Info
                name="Incident"
                value={
                  investigation.incident
                }
              />

              <Info
                name="Risk"
                value={
                  investigation.risk
                  ||
                  investigation.severity
                }
              />

              <Info
                name="Confidence"
                value={
                  `${investigation.confidence}%`
                }
              />


              <h4>
                Summary
              </h4>

              <p className="muted">
                {
                  investigation.summary
                }
              </p>


              <h4>
                AI Analysis
              </h4>

              <p className="muted">
                {
                  investigation.reasoning
                }
              </p>

            </>
          ) : (
            <>

              <Info
                name="Latest"
                value={
                  latest?.attack
                  ||
                  "No incident"
                }
              />

              <p className="muted">
                Select Investigate Latest
                to run the RAG + Ollama
                investigation engine.
              </p>

            </>
          )}

        </div>

      </div>

    </div>
  );
}


function Info({
  name,
  value,
}) {
  return (
    <div className="info-row">
      <span>{name}</span>
      <strong>{value}</strong>
    </div>
  );
}


export default AiSoc;
