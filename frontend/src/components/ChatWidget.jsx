import { useState, useRef, useEffect } from "react"
import { sendMessage, submitChatFeedback } from "../services/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function ChatWidget({ onOpenArticle }) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I'm your Taifa Care AI assistant. Ask me anything about using Taifa Care HMIS."
    }
  ])
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionToken, setSessionToken] = useState(null)
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])
  
  useEffect(() => {
  window.openTaifaCareAssistant = () => {
    setOpen(true)
  }

  return () => {
    delete window.openTaifaCareAssistant
  }
}, [])
  async function handleFeedback(index, messageId, helpful) {
    setMessages(prev => prev.map((m, i) =>
      i === index ? { ...m, feedbackGiven: helpful } : m
    ))
    try {
      await submitChatFeedback(messageId, helpful)
    } catch {
    }
  }

  function handleExportTranscript() {
    const transcript = messages
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n\n")

    const header = `Taifa Care HMIS — Chat Transcript\nExported: ${new Date().toLocaleString()}\n${"=".repeat(40)}\n\n`
    const fullText = header + transcript

    navigator.clipboard.writeText(fullText).then(() => {
      alert("Transcript copied to clipboard. Paste it into an email or support ticket.")
    }).catch(() => {
      const blob = new Blob([fullText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "chat-transcript.txt"
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput("")

    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const res = await sendMessage(userMessage, sessionToken)
      setSessionToken(res.data.session_token)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: res.data.answer,
        sources: res.data.articles_found || [],
        messageId: res.data.message_id,
        feedbackGiven: null
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't connect to the server. Please try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 w-full h-full sm:w-96 sm:h-[480px] bg-white sm:rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-[999999]">

          <div className="bg-teal-600 text-white px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div>
                <p className="font-semibold text-sm">Taifa Care AI Assistant</p>
<p className="text-xs text-teal-100">
  Your HMIS knowledge-base assistant
</p>
              </div>
              <button
                onClick={handleExportTranscript}
                title="Copy conversation transcript for support"
                className="text-white hover:text-teal-200 ml-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-teal-200 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
              <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none overflow-x-auto"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <>
                      <div className="prose prose-sm prose-teal max-w-none
                                       prose-p:my-1 prose-ul:my-1 prose-li:my-0
                                       prose-table:text-xs prose-th:px-2 prose-th:py-1
                                       prose-td:px-2 prose-td:py-1">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-1.5">
                          {msg.sources.map((src, idx) => (
                            <a
                              key={idx}
                              href={`/article/${src.slug}`}
                              className="text-xs bg-white text-teal-700 border border-teal-200 rounded-full px-2 py-0.5 hover:bg-teal-50 transition"
                            >
                              📄 {src.title}
                            </a>
                          ))}
                        </div>
                      )}

                      {msg.messageId && (
                        <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2">
                          <span className="text-xs text-gray-400">Helpful?</span>
                          <button
                            onClick={() => handleFeedback(i, msg.messageId, true)}
                            className={`text-sm transition ${msg.feedbackGiven === true ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleFeedback(i, msg.messageId, false)}
                            className={`text-sm transition ${msg.feedbackGiven === false ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                          >
                            👎
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
       ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-xl text-sm rounded-bl-none">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Ask about HMIS..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close Taifa Care AI Assistant" : "Open Taifa Care AI Assistant"}
        title={open ? "Close AI Assistant" : "Ask Taifa Care AI Assistant"}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center transition z-50"
      >
        {open ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M6 6l12 12" />
            <path d="M18 6L6 18" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
          >
            <path d="M4 5h16v11H8l-4 4V5Z" />
            <path d="M8 9h8" />
            <path d="M8 12h5" />
          </svg>
        )}
      </button>
    </>
  )
}