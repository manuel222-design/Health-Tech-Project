import { useState, useEffect } from "react"
import {
  getAnalytics,
  getSearchTrend,
  getUnansweredQuestions,
} from "../services/api"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

export default function AdminAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [unanswered, setUnanswered] = useState([])
  const [trend, setTrend] = useState([])

  useEffect(() => {
    getAnalytics()
      .then(res => setData(res.data))
      .catch(error =>
        console.error(
          "ANALYTICS LOAD ERROR:",
          error
        )
      )
      .finally(() => setLoading(false))

    getUnansweredQuestions()
      .then(res =>
        setUnanswered(res.data?.results || [])
      )
      .catch(error =>
        console.error(
          "UNANSWERED QUESTIONS ERROR:",
          error
        )
      )

    getSearchTrend()
      .then(res => setTrend(res.data || []))
      .catch(error =>
        console.error(
          "SEARCH TREND LOAD ERROR:",
          error
        )
      )
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-slate-500">
            Loading analytics...
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 8v5" />
            <path d="M12 16h.01" />
          </svg>
        </div>

        <h2 className="font-semibold text-slate-800 mb-1">
          Unable to load analytics
        </h2>

        <p className="text-sm text-slate-500">
          Please try again when the analytics service is available.
        </p>
      </div>
    )
  }

  const totals = data.totals || {}

  const topViewed =
    data.top_viewed || []

  const lowRated =
    data.low_rated || []

  const topSearches =
    data.top_searches || []

  const zeroResultSearches =
    data.zero_result_searches || []

  const staleArticles =
    data.stale_articles || []


  return (
    <div className="space-y-7 pb-10">

      <section>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">

          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-violet-500" />

              <span className="text-[10px] uppercase tracking-wider font-semibold text-violet-700">
                System Insights
              </span>
            </div>

            <h2 className="text-2xl font-bold text-slate-800">
              Analytics
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Article performance, search behaviour, content quality and chatbot gaps.
            </p>
          </div>

        </div>
      </section>


      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <MetricCard
          label="Published Articles"
          value={totals.published_articles ?? 0}
          description="Knowledge resources currently published"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M5 4h14v16H5z" />
              <path d="M8 8h8" />
              <path d="M8 12h8" />
              <path d="M8 16h5" />
            </svg>
          }
          iconClass="bg-violet-50 text-violet-700"
        />

        <MetricCard
          label="Total Users"
          value={totals.users ?? 0}
          description="Registered system users"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <circle cx="12" cy="8" r="3" />
              <path d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
            </svg>
          }
          iconClass="bg-blue-50 text-blue-700"
        />

        <MetricCard
          label="Total Searches"
          value={totals.searches ?? 0}
          description="Recorded knowledge-base searches"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
          }
          iconClass="bg-violet-50 text-violet-700"
        />

      </section>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <AnalyticsCard
          title="Search Activity"
          description="Knowledge-base searches recorded over the last 30 days"
          className="lg:col-span-2"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M4 19V5" />
              <path d="M4 19h16" />
              <path d="m7 15 4-4 3 2 5-6" />
            </svg>
          }
          iconClass="bg-violet-50 text-violet-700"
        >
          {trend.length === 0 ? (
            <EmptyState message="No search activity has been recorded yet." />
          ) : (
            <div className="space-y-3">

              <div className="h-56 w-full">

                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={trend}
                    margin={{
                      top: 8,
                      right: 8,
                      left: -18,
                      bottom: 4
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      tickFormatter={(value) =>
                        new Date(
                          `${value}T00:00:00`
                        ).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric"
                          }
                        )
                      }
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      formatter={(value) => [
                        value,
                        value === 1 ? "search" : "searches"
                      ]}
                      labelFormatter={(label) =>
                        new Date(
                          `${label}T00:00:00`
                        ).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          }
                        )
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="searches"
                      stroke="#7C3AED"
                      strokeWidth={2.5}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>

              </div>



            </div>
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Top Viewed Articles"
          description="Most frequently accessed knowledge resources"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M3.5 12s3.2-6 8.5-6 8.5 6 8.5 6-3.2 6-8.5 6-8.5-6-8.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          }
          iconClass="bg-violet-50 text-violet-700"
        >
          {topViewed.length === 0 ? (
            <EmptyState message="No article views have been recorded yet." />
          ) : (
            <div className="space-y-1">
              {topViewed.map((article, index) => (
                <div
                  key={`${article.title}-${index}`}
                  className="flex items-center gap-3 py-2.5 border-b last:border-b-0 border-slate-100"
                >
                  <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="text-sm text-slate-700 truncate flex-1">
                    {article.title}
                  </span>

                  <span className="text-sm text-violet-600 font-semibold shrink-0">
                    {article.views} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>


        <AnalyticsCard
          title="Low Rated Articles"
          description="Content receiving an average rating of 3 stars or below"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="m12 4 2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.4-4.6 2.4.9-5.2-3.8-3.7 5.2-.8L12 4Z" />
            </svg>
          }
          iconClass="bg-amber-50 text-amber-700"
        >
          {lowRated.length === 0 ? (
            <EmptyState message="No low-rated articles at this time." />
          ) : (
            <div className="space-y-1">
              {lowRated.map((article, index) => (
                <div
                  key={`${article.title}-${index}`}
                  className="flex items-center gap-3 py-2.5 border-b last:border-b-0 border-slate-100"
                >
                  <span className="flex-1 text-sm text-slate-700 truncate">
                    {article.title}
                  </span>

                  <span className="text-sm text-amber-600 font-semibold shrink-0">
                    ⭐ {article.avg_rating}
                  </span>

                  <span className="text-xs text-slate-400 shrink-0">
                    ({article.rating_count})
                  </span>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>


        <AnalyticsCard
          title="Top Search Queries"
          description="What users are looking for most often"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
          }
          iconClass="bg-blue-50 text-blue-700"
        >
          {topSearches.length === 0 ? (
            <EmptyState message="No searches have been recorded yet." />
          ) : (
            <div className="space-y-1">
              {topSearches.map((search, index) => (
                <div
                  key={`${search.query}-${index}`}
                  className="flex items-center gap-3 py-2.5 border-b last:border-b-0 border-slate-100"
                >
                  <span className="text-sm text-slate-700 flex-1 truncate">
                    "{search.query}"
                  </span>

                  <span className="text-xs font-semibold text-slate-500 shrink-0">
                    {search.count}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>


        <AnalyticsCard
          title="Zero-Result Searches"
          description="Searches that currently reveal potential content gaps"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 4.5 4.5" />
              <path d="M8.5 8.5 12.5 12.5" />
              <path d="m12.5 8.5-4 4" />
            </svg>
          }
          iconClass="bg-red-50 text-red-600"
        >
          {zeroResultSearches.length === 0 ? (
            <EmptyState message="No zero-result searches have been recorded." />
          ) : (
            <div className="space-y-1">
              {zeroResultSearches.map((search, index) => (
                <div
                  key={`${search.query}-${index}`}
                  className="flex items-center gap-3 py-2.5 border-b last:border-b-0 border-slate-100"
                >
                  <span className="text-sm text-slate-700 flex-1 truncate">
                    "{search.query}"
                  </span>

                  <span className="text-xs font-semibold text-red-500 shrink-0">
                    {search.count}×
                  </span>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>


        <AnalyticsCard
          title="Content Needing Re-certification"
          description="Not reviewed or updated in over 180 days"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4" />
              <path d="M16 3v4" />
              <path d="M4 9h16" />
              <path d="M8 13h3" />
              <path d="M8 16h5" />
            </svg>
          }
          iconClass="bg-orange-50 text-orange-700"
        >
          {staleArticles.length === 0 ? (
            <EmptyState message="All published articles are within their 180-day review period." />
          ) : (
            <div className="space-y-1">
              {staleArticles.map((article, index) => (
                <div
                  key={`${article.title}-${index}`}
                  className="flex items-center gap-3 py-2.5 border-b last:border-b-0 border-slate-100"
                >
                  <span className="text-sm text-slate-700 truncate flex-1">
                    {article.title}
                  </span>

                  <span className="text-xs text-orange-600 font-medium shrink-0">
                    {article.last_reviewed_at
                      ? `Reviewed ${new Date(
                          article.last_reviewed_at
                        ).toLocaleDateString()}`
                      : "Review date unavailable"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>


        <AnalyticsCard
          title="Chatbot Knowledge Gaps"
          description="Questions for which approved KB content was not available"
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M5 5h14v10H8l-3 3V5Z" />
              <path d="M9 9h6" />
              <path d="M9 12h4" />
            </svg>
          }
          iconClass="bg-purple-50 text-purple-700"
        >
          {unanswered.length === 0 ? (
            <EmptyState message="No current knowledge gaps have been identified." />
          ) : (
            <div className="space-y-3">
              {unanswered.map((item, index) => (
                <div
                  key={`${item.question}-${index}`}
                  className="py-2.5 border-b last:border-b-0 border-slate-100"
                >
                  <p className="text-sm text-slate-700 leading-relaxed">
                    "{item.question}"
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-purple-600 font-medium">
                      Asked {item.count || 1}{" "}
                      {item.count === 1 ? "time" : "times"}
                    </span>

                    {item.latest_at && (
                      <span className="text-[11px] text-slate-400">
                        Last asked{" "}
                        {new Date(
                          item.latest_at
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnalyticsCard>

      </div>

    </div>
  )
}


function MetricCard({
  label,
  value,
  description,
  icon,
  iconClass,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            {label}
          </p>

          <p className="text-3xl font-bold text-violet-600 mt-2">
            {value}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {description}
          </p>
        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  )
}


function AnalyticsCard({
  title,
  description,
  icon,
  iconClass,
  children,
  className = "",
}) {
  return (
    <section
      className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden ${className}`}
    >

      <div className="px-5 py-4 border-b border-slate-100">

        <div className="flex items-start gap-3">

          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconClass}`}
          >
            {icon}
          </div>

          <div>
            <h3 className="font-semibold text-slate-800">
              {title}
            </h3>

            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>

        </div>

      </div>

      <div className="px-5 py-3">
        {children}
      </div>

    </section>
  )
}


function EmptyState({ message }) {
  return (
    <div className="py-7 text-center">

      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <circle cx="12" cy="12" r="8.5" />
          <path d="M8.5 12h7" />
        </svg>

      </div>

      <p className="text-xs text-slate-400">
        {message}
      </p>

    </div>
  )
}
