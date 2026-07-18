import { useState, useRef, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import axios from "axios"

const API_BASE = window.HEALTHTECH_API_BASE || "http://localhost:8000/api/v1"

async function sendMessage(message) {
  const res = await axios.post(`${API_BASE}/chat`, { message })
  return res.data
}

export default function Widget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I'm your HMIS assistant. Ask me anything about using Taifa Care HMIS."
    }
  ])
  const [input, setInput]     = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const data = await sendMessage(userMessage)
      setMessages(prev => [...prev, { role: "assistant", content: data.answer }])
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I couldn't connect to the server. Please try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      {open && (
        <div className="fixed bottom-24 right-6 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden z-[999999]" style={{height: "480px"}}>

          <div className="bg-teal-600 text-white px-4 py-3 flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">HMIS Assistant</p>
              <p className="text-xs text-teal-100">Powered by knowledge base</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white hover:text-teal-200 text-xl leading-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-teal-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none overflow-x-auto"
                }`}>
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="prose prose-sm prose-teal max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition z-[999999]"
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        )}
      </button>
    </div>
  )
}