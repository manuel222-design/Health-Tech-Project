export default function Landing({ onLogin, onRegister }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-teal-700 text-white">

        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
              <span className="font-bold text-lg">TC</span>
            </div>

            <div>
              <div className="font-bold text-base">Taifa Care</div>
              <div className="text-xs text-slate-400">
                HMIS Knowledge System
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            Secure Healthcare Information
          </div>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-20 lg:pt-16 lg:pb-28">

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-400/20 bg-teal-400/10 text-teal-300 text-xs font-semibold mb-6">
                <span>♡</span>
                HEALTHCARE INFORMATION MANAGEMENT
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                Smarter healthcare.
                <span className="block text-teal-400">
                  Better information.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base sm:text-lg text-slate-300 leading-relaxed">
                Taifa Care brings healthcare knowledge, digital workflows,
                intelligent assistance and secure access together in one
                centralized platform.
              </p>

              {/* Main actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                <button
                  onClick={onRegister}
                  className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold transition shadow-lg shadow-teal-500/20"
                >
                  Get Started →
                </button>

                <button
                  onClick={onLogin}
                  className="px-6 py-3.5 border border-slate-600 hover:border-teal-400 text-white rounded-xl font-semibold transition"
                >
                  Sign in to Taifa Care
                </button>

              </div>

            </div>

            {/* Right hero visual */}
            <div className="relative">

              <div className="absolute -inset-6 bg-teal-200/30 blur-3xl rounded-full" />

              <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl p-7 sm:p-9">

                <div className="flex items-center justify-between mb-10">

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-teal-600 font-bold">
                      Taifa Care
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      Healthcare Information System
                    </p>
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 text-xl">
                    +
                  </div>

                </div>


                <div>

                  <p className="text-sm font-semibold text-teal-600 mb-3">
                    Connected healthcare information
                  </p>

                  <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                    Everything connected.
                    <span className="block text-teal-600">
                      One trusted place.
                    </span>
                  </h3>

                  <p className="text-sm text-slate-500 leading-relaxed mt-5 max-w-md">
                    Bring healthcare knowledge, digital workflows and
                    intelligent assistance together through one secure
                    platform.
                  </p>

                </div>


                <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <span className="text-xs text-slate-500">
                    Built for modern healthcare teams
                  </span>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* FEATURES */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">

          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-widest text-teal-600 font-bold">
              Powerful features
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Everything your team needs
            </h2>

            <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
              Explore Taifa Care's healthcare information and management capabilities.
              Select a feature to sign in and continue.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <Feature
              icon="🏥"
              title="HMIS Workflows"
              text="Access and manage healthcare workflows and operational processes."
              onClick={onLogin}
            />

            <Feature
              icon="📚"
              title="Knowledge Base"
              text="Find trusted healthcare guides, procedures and reference materials."
              onClick={onLogin}
            />

            <Feature
              icon="🤖"
              title="AI Assistance"
              text="Get intelligent support to help you navigate healthcare information."
              onClick={onLogin}
            />

            <Feature
              icon="🔐"
              title="Secure Access"
              text="Role-based access protects information and provides appropriate tools."
              onClick={onLogin}
            />

          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section className="bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">

          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-teal-600 font-bold">
              Getting started
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              A simple journey to better information
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5 mt-10">

            <Step
              number="01"
              title="Create an account"
              text="Register and access Taifa Care according to your role and permissions."
              onClick={onRegister}
            />

            <Step
              number="02"
              title="Explore resources"
              text="Discover knowledge, workflows and tools available to your account."
              onClick={onLogin}
            />

            <Step
              number="03"
              title="Work smarter"
              text="Use centralized information and AI assistance to improve your daily work."
              onClick={onLogin}
            />

          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="bg-teal-900">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 text-center">

          <div className="inline-flex w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/20 items-center justify-center text-teal-300 text-xl mb-5">
            ♡
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to access Taifa Care?
          </h2>

          <p className="mt-3 text-teal-100 max-w-xl mx-auto text-sm">
            Join healthcare professionals using centralized knowledge,
            digital workflows and intelligent assistance.
          </p>

          <button
            onClick={onRegister}
            className="mt-7 px-7 py-3.5 bg-white text-teal-800 rounded-xl font-bold hover:bg-teal-50 transition"
          >
            Create Your Account →
          </button>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-500">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-7 flex flex-col sm:flex-row justify-between gap-3 text-xs">

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center text-xs font-bold text-slate-950">
              TC
            </div>
            <span>
              © {new Date().getFullYear()} Taifa Care · HMIS Knowledge System
            </span>
          </div>

          <span>
            Healthcare Management & Knowledge System
          </span>

        </div>
      </footer>

    </div>
  )
}



function HeroStat({ number, label }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/10 px-3 py-4">
      <p className="text-lg font-bold text-white">
        {number}
      </p>
      <p className="text-[10px] text-slate-400 mt-1">
        {label}
      </p>
    </div>
  )
}

function TrustItem({ icon, title, text }) {
  return (
    <div>
      <div className="text-teal-300 text-lg mb-1">{icon}</div>
      <p className="text-xs font-semibold text-white">{title}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{text}</p>
    </div>
  )
}


function PreviewNav({ text, active }) {
  return (
    <div className={`px-2 py-2 rounded-md ${
      active
        ? "bg-teal-600 text-white"
        : "text-slate-500"
    }`}>
      {text}
    </div>
  )
}


function PreviewStat({ number, label }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2">
      <p className="text-sm font-bold text-slate-800">{number}</p>
      <p className="text-[8px] text-slate-400">{label}</p>
    </div>
  )
}


function PreviewArticle({ text }) {
  return (
    <div className="flex items-center gap-2 py-2 border-t border-slate-100">
      <div className="w-5 h-5 rounded bg-teal-50 text-teal-600 flex items-center justify-center text-[8px]">
        ▤
      </div>
      <span className="text-[9px] text-slate-600">{text}</span>
    </div>
  )
}


function Feature({ icon, title, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-400 hover:shadow-lg hover:-translate-y-1 transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-xl mb-5 group-hover:bg-teal-100 transition">
        {icon}
      </div>

      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {text}
      </p>

      <div className="mt-5 text-xs font-bold text-teal-600">
        Sign in to explore →
      </div>
    </button>
  )
}


function Step({ number, title, text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-slate-200 rounded-2xl p-6 hover:border-teal-400 hover:shadow-md transition group"
    >
      <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold mb-5">
        {number}
      </div>

      <h3 className="font-bold text-slate-900">
        {title}
      </h3>

      <p className="text-sm text-slate-500 mt-2 leading-relaxed">
        {text}
      </p>

      <div className="mt-4 text-xs font-bold text-teal-600">
        Continue →
      </div>
    </button>
  )
}
