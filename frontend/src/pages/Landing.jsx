export default function Landing({
  onLogin,
  onRegister,
  onOpenAssistant,
  onOpenKnowledge,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-900 text-white">

        {/* Ambient background */}
        <div className="absolute -top-40 -right-24 w-[520px] h-[520px] rounded-full bg-violet-300/15 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 w-[480px] h-[480px] rounded-full bg-blue-300/10 blur-3xl" />

        <div className="absolute right-[7%] top-20 select-none pointer-events-none text-[18rem] font-black leading-none text-white/[0.025] tracking-[-0.08em]">
          TC
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">

          {/* NAVIGATION */}
          <nav className="py-6 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-indigo-950/20">
                <span className="font-bold text-sm text-indigo-700">
                  TC
                </span>
              </div>

              <div>
                <div className="font-semibold text-[15px] text-white">
                  Taifa Care
                </div>

                <div className="text-[10px] uppercase tracking-[0.14em] text-indigo-100/70">
                  Knowledge Centre
                </div>
              </div>

            </div>


            <button
              type="button"
              onClick={onLogin}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/15 transition"
            >
              Sign in
            </button>

          </nav>


          {/* HERO MESSAGE */}
          <div className="max-w-3xl mx-auto text-center pt-10 sm:pt-14">

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] uppercase tracking-[0.15em] font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-200" />
              Healthcare Knowledge Centre
            </div>


            <h1 className="mt-6 text-[2.35rem] sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight leading-[1.08]">
              Find what you need.
            </h1>


            <p className="mt-5 max-w-2xl mx-auto text-[15px] sm:text-base text-indigo-50/90 leading-7">
              Clinical guidance, HMIS workflows and practical answers in one place.
            </p>


            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">

              <button
                type="button"
                onClick={onRegister}
                className="w-full sm:w-auto rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 transition shadow-md"
              >
                Get started
                <span className="ml-2">→</span>
              </button>


              <button
                type="button"
                onClick={onOpenAssistant}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-medium text-white hover:bg-white/15 transition"
              >
                <span className="text-violet-200">
                  ✦
                </span>

                Ask the AI Assistant
              </button>

            </div>

          </div>


          {/* KNOWLEDGE SEARCH STAGE */}
          <div className="relative max-w-5xl mx-auto mt-12 sm:mt-14 pb-10">

            {/* Floating chip - left */}
            <div className="hidden md:flex absolute left-0 top-14 translate-x-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-3.5 py-2.5 shadow-lg">
              <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                ▤
              </span>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-indigo-100/60">
                  Knowledge
                </p>

                <p className="text-xs font-medium text-white">
                  Clinical Guides
                </p>
              </div>
            </div>


            {/* Floating chip - right */}
            <div className="hidden md:flex absolute right-0 top-20 items-center gap-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-md px-3.5 py-2.5 shadow-lg">
              <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm text-violet-200">
                ✦
              </span>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-indigo-100/60">
                  Assistance
                </p>

                <p className="text-xs font-medium text-white">
                  Guided Answers
                </p>
              </div>
            </div>


            {/* Main search panel */}
            <div className="relative mx-auto max-w-3xl">

              <div className="absolute -inset-5 rounded-[2rem] bg-white/10 blur-3xl" />

              <div className="relative rounded-[1.75rem] border border-white/20 bg-white/10 backdrop-blur-xl p-2 shadow-2xl">

                <div className="rounded-[1.35rem] bg-white overflow-hidden">

                  {/* Search area */}
                  <div className="p-5 sm:p-7">

                    <div className="flex items-center justify-between mb-4">

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] font-semibold text-violet-600">
                          Search Knowledge
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Start with a workflow, topic or question
                        </p>
                      </div>

                      <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Knowledge ready
                      </span>

                    </div>


                    <button
  type="button"
  onClick={onOpenKnowledge}
  className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 flex items-center gap-3 shadow-sm hover:border-violet-200 hover:bg-violet-50/40 transition cursor-pointer"
  aria-label="Browse the Knowledge Base"
>

                      <span className="text-slate-400 text-xl">
                        ⌕
                      </span>

                      <span className="text-sm text-slate-400">
                        Search healthcare knowledge...
                      </span>

                      <span className="ml-auto hidden sm:inline-flex rounded-md bg-white border border-slate-200 px-2 py-1 text-[10px] text-slate-400">
                        Search
                      </span>

                    </button>


                    {/* Search suggestions */}
                    <div className="flex flex-wrap gap-2 mt-4">

                      <Suggestion text="Patient Registration" onClick={onOpenKnowledge} />
                      <Suggestion text="Triage & Vitals" onClick={onOpenKnowledge} />
                      <Suggestion text="Clinical Workflows" onClick={onOpenKnowledge} />
                      <Suggestion text="Troubleshooting" onClick={onOpenKnowledge} />

                    </div>

                  </div>


                  {/* Product capability strip */}
                  <div className="border-t border-slate-100 bg-slate-50/80 px-5 sm:px-7 py-4">

                    <div className="grid grid-cols-3 divide-x divide-slate-200">

                      <PreviewMetric
                        label="Knowledge"
                        value="Guides"
                      />

                      <PreviewMetric
                        label="Workflows"
                        value="HMIS"
                      />

                      <PreviewMetric
                        label="Assistant"
                        value="AI"
                      />

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* Small bottom caption */}
            <div className="mt-5 text-center text-xs text-indigo-100/60">
              Search, learn and work with confidence.
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CORE CAPABILITIES
      ====================================================== */}
      <section className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">

          <div className="max-w-2xl">

            <p className="text-[10px] uppercase tracking-[0.16em] text-violet-600 font-semibold">
              Core capabilities
            </p>

            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              One centre. Three ways to work.
            </h2>

          </div>


          <div className="grid md:grid-cols-3 gap-4 mt-8">

            <Capability
              number="01"
              title="Knowledge Base"
              text="Search guides, procedures and reference material."
            />

            <Capability
              number="02"
              title="HMIS Workflows"
              text="Find practical guidance for everyday operations."
            />

            <Capability
              number="03"
              title="AI Assistance"
              text="Ask questions and discover relevant knowledge."
              onClick={onOpenAssistant}
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="bg-slate-50">

        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">

          <div className="rounded-3xl bg-violet-800 px-7 py-10 sm:px-10 text-center shadow-xl shadow-violet-900/10">

            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Ready to use Taifa Care?
            </h2>

            <p className="mt-3 text-sm text-violet-100 max-w-lg mx-auto">
              Create an account for your role-specific workspace and tools.
            </p>

            <button
              type="button"
              onClick={onRegister}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-violet-800 hover:bg-violet-50 transition"
            >
              Create an account
              <span className="ml-2">→</span>
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="bg-slate-950 text-slate-500">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">

          <div className="flex items-center gap-2">

            <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
              TC
            </div>

            <span>
              © {new Date().getFullYear()} Taifa Care
            </span>

          </div>

          <span>
            Healthcare Knowledge Centre
          </span>

        </div>

      </footer>

    </div>
  )
}


function Suggestion({ text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center rounded-lg bg-white border border-slate-200 px-3 py-2 text-[11px] font-medium text-slate-500 hover:border-violet-200 hover:text-violet-700 hover:bg-violet-50 transition"
    >
      {text}
    </button>
  )
}

function PreviewMetric({
  label,
  value,
}) {
  return (
    <div className="text-center px-3">
      <p className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
        {label}
      </p>

      <p className="text-sm font-semibold text-slate-700 mt-1">
        {value}
      </p>
    </div>
  )
}


function Capability({
  number,
  title,
  text,
  onClick,
}) {
  const clickable = Boolean(onClick)

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`text-left rounded-2xl border border-slate-200 bg-white p-6 transition ${
        clickable
          ? "hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md cursor-pointer"
          : "cursor-default"
      }`}
    >

      <div className="flex items-center justify-between">

        <span className="text-[10px] uppercase tracking-[0.16em] font-semibold text-violet-600">
          {number}
        </span>

        <span className="w-8 h-8 rounded-lg bg-violet-50 text-violet-700 flex items-center justify-center text-sm">
          {number === "03" ? "✦" : "▤"}
        </span>

      </div>


      <h3 className="mt-6 text-base font-semibold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>

      {clickable && (
        <span className="inline-flex mt-4 text-sm font-medium text-violet-700">
          Ask Assistant →
        </span>
      )}

    </button>
  )
}
