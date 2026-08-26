export default function ErrorPage({
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or may have been moved.",
  onHome,
  onBack,
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="text-7xl font-extrabold text-violet-100 mb-4">
          404
        </div>

        <div className="w-16 h-16 mx-auto mb-5 bg-violet-50 rounded-2xl flex items-center justify-center">
          <span className="text-2xl text-violet-600">!</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {title}
        </h1>

        <p className="text-slate-500 mb-7">
          {message}
        </p>

        <div className="flex justify-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg border border-gray-200 text-slate-700 hover:bg-gray-50 transition"
            >
              Go Back
            </button>
          )}

          {onHome && (
            <button
              onClick={onHome}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
            >
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
