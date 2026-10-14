import { Activity, AlertTriangle, RotateCcw, Zap } from "lucide-react";
import { updateProvider, usePipeline } from "../pipeline/runtime";

const stateStyle: Record<string, string> = {
  closed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  half_open: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  open: "bg-rose-500/15 text-rose-300 border-rose-500/40",
};

const statusStyle: Record<string, string> = {
  queued: "text-slate-400",
  running: "text-sky-300",
  retry_wait: "text-amber-300",
  succeeded: "text-emerald-300",
  dead: "text-rose-300",
};

/**
 * Fault-injection console for the generation pipeline. Turn on failures, rate limits, hangs
 * or a full outage, upload a manuscript, and watch retries, the circuit breaker and the
 * dead-letter list respond.
 */
export function ReliabilityLab() {
  const { queue, provider, metrics, jobs, state } = usePipeline();
  const s = provider.settings;
  const dead = jobs.filter((j) => j.status === "dead");
  const recent = [...jobs].reverse().slice(0, 25);

  const stat = (label: string, value: string | number) => (
    <div className="bg-slate-800/60 rounded-lg p-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-lg font-semibold text-white tabular-nums">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><Activity className="w-5 h-5" /> Reliability Lab</h2>
          <p className="text-sm text-slate-400">Inject faults into the simulated speech provider, then upload a manuscript and watch the pipeline respond.</p>
        </div>
        <span className={`px-3 py-1 rounded-full border text-sm font-medium ${stateStyle[state]}`}>Circuit: {state.replace("_", "-")}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2"><Zap className="w-4 h-4" /> Fault injection</h3>
          <label className="block text-sm text-slate-300">
            Random 500 errors: {Math.round(s.failureRate * 100)}%
            <input type="range" min={0} max={1} step={0.05} value={s.failureRate}
              onChange={(e) => updateProvider({ failureRate: Number(e.target.value) })} className="w-full" />
          </label>
          <label className="block text-sm text-slate-300">
            Latency per call: {s.latencyMs} ms
            <input type="range" min={50} max={3000} step={50} value={s.latencyMs}
              onChange={(e) => updateProvider({ latencyMs: Number(e.target.value) })} className="w-full" />
          </label>
          <label className="block text-sm text-slate-300">
            Rate limit (429) every Nth call: {s.rateLimitEvery || "off"}
            <input type="range" min={0} max={10} step={1} value={s.rateLimitEvery}
              onChange={(e) => updateProvider({ rateLimitEvery: Number(e.target.value) })} className="w-full" />
          </label>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={s.outage} onChange={(e) => updateProvider({ outage: e.target.checked })} /> Full outage (503)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={s.hangMs > 0} onChange={(e) => updateProvider({ hangMs: e.target.checked ? 15000 : 0 })} /> Hang calls (trigger timeouts)
            </label>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">Pipeline metrics</h3>
          <div className="grid grid-cols-3 gap-3">
            {stat("Succeeded", metrics.succeeded)}
            {stat("Retries", metrics.retries)}
            {stat("Dead-lettered", metrics.deadLettered)}
            {stat("In flight", metrics.inFlight)}
            {stat("Queued", metrics.queued)}
            {stat("Short-circuited", metrics.shortCircuited)}
            {stat("Attempts", metrics.attempts)}
            {stat("p50 latency", metrics.p50Ms === null ? "–" : `${metrics.p50Ms} ms`)}
            {stat("p95 latency", metrics.p95Ms === null ? "–" : `${metrics.p95Ms} ms`)}
          </div>
        </div>
      </div>

      {dead.length > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-rose-200 flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4" /> Dead-letter list ({dead.length})</h3>
          <ul className="space-y-2">
            {dead.map((j) => (
              <li key={j.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-200">{j.input.title} <span className="text-slate-500">· {j.attempts} attempts · {j.lastError}</span></span>
                <button onClick={() => queue.requeue(j.id)} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-200 hover:bg-slate-700">
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">Recent jobs</h3>
        {recent.length === 0 ? (
          <p className="text-sm text-slate-500">No jobs yet. Upload a manuscript from the Player view.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-slate-400"><th className="py-1 pr-4">Chapter</th><th className="pr-4">Status</th><th className="pr-4">Attempts</th><th>Last error</th></tr></thead>
            <tbody>
              {recent.map((j) => (
                <tr key={j.id} className="border-t border-slate-800">
                  <td className="py-1.5 pr-4 text-slate-200">{j.input.title}</td>
                  <td className={`pr-4 ${statusStyle[j.status]}`}>{j.status.replace("_", " ")}</td>
                  <td className="pr-4 text-slate-300 tabular-nums">{j.attempts}</td>
                  <td className="text-slate-500">{j.lastError ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
