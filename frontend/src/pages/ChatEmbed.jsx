import { useState, useRef, useEffect } from "react"
import { sendMessage, submitChatFeedback } from "../services/api"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function ChatEmbed() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I'm the Taifa Care Knowledge Assistant. Ask me about using Taifa Care HMIS."
    }
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionToken, setSessionToken] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleFeedback(index, messageId, helpful) {
    setMessages(prev =>
      prev.map((message, i) =>
        i === index
          ? { ...message, feedbackGiven: helpful }
          : message
      )
    )

    try {
      await submitChatFeedback(messageId, helpful)
    } catch {
    }
  }

  async function handleSend() {
    const question = input.trim()

    if (!question || loading) return

    setInput("")

    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: question
      }
    ])

    setLoading(true)

    try {
      const response = await sendMessage(
        question,
        sessionToken
      )

      setSessionToken(response.data.session_token)

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: response.data.answer,
          sources: response.data.articles_found || [],
          messageId: response.data.message_id,
          feedbackGiven: null
        }
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't connect to the Knowledge Base. Please try again."
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="h-screen bg-white flex flex-col">

      <header className="bg-violet-700 text-white px-4 py-3 shrink-0">

        <div className="flex items-center gap-3">

          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
            TC
          </div>

          <div>
            <h1 className="text-sm font-semibold">
              Taifa Care Knowledge Assistant
            </h1>

            <p className="text-[11px] text-violet-100 mt-0.5">
              HMIS knowledge-base support
            </p>
          </div>

        </div>

      </header>


      <section className="flex-1 overflow-y-auto p-4 space-y-3">

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >

            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                message.role === "user"
                  ? "bg-violet-600 text-white rounded-br-md"
                  : "bg-slate-100 text-slate-800 rounded-bl-md"
              }`}
            >

              {message.role === "user" ? (
                message.content
              ) : (
                <>
                  <div className="prose prose-sm max-w-none
                                  prose-p:my-1
                                  prose-ul:my-1
                                  prose-li:my-0
                                  prose-table:text-xs">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>

                  {message.sources?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200 space-y-1.5">

                      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                        Sources
                      </p>

                      {message.sources.map(source => (
                        <a
                          key={source.slug}
                          href={`/article/${source.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs text-violet-700 hover:text-violet-800 hover:underline"
                        >
                          📄 {source.title}
                        </a>
                      ))}

                    </div>
                  )}

                  {message.messageId && (
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center gap-2">

                      <span className="text-[10px] text-slate-400">
                        Helpful?
                      </span>

                      <button
                        onClick={() =>
                          handleFeedback(
                            index,
                            message.messageId,
                            true
                          )
                        }
                        className={`text-sm ${
                          message.feedbackGiven === true
                            ? "opacity-100"
                            : "opacity-40 hover:opacity-80"
                        }`}
                        aria-label="Helpful response"
                      >
                        👍
                      </button>

                      <button
                        onClick={() =>
                          handleFeedback(
                            index,
                            message.messageId,
                            false
                          )
                        }
                        className={`text-sm ${
                          message.feedbackGiven === false
                            ? "opacity-100"
                            : "opacity-40 hover:opacity-80"
                        }`}
                        aria-label="Unhelpful response"
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
            <div className="bg-slate-100 text-slate-500 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm">
              Searching the knowledge base…
            </div>
          </div>
        )}

        <div ref={bottomRef} />

      </section>


      <footer className="border-t border-slate-200 p-3 bg-white shrink-0">

        <div className="flex gap-2">

          <input
            type="text"
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter") {
                handleSend()
              }
            }}
            placeholder="Ask about Taifa Care..."
            className="flex-1 min-w-0 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
          />

          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition"
          >
            Send
          </button>

        </div>

        <p className="text-[10px] text-slate-400 mt-2">
          Answers are based on published Knowledge Base content.
        </p>

      </footer>

    </main>
  )
}
