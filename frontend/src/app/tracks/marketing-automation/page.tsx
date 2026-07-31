"use client";

import { useEffect, useState } from "react";
import TrackPage from "@/components/TrackPage";
import { Plus, Trash2, Play, Zap, Bell, Mail, UserPlus, MessageSquare } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow";

type Step = { id: number; type: string; detail: string };

type Workflow = {
  id: number;
  name: string;
  trigger: string;
  steps: Step[];
};

type LogEntry = { text: string; status: "ok" | "waiting" | "done"; delay: number };

const TRIGGERS = [
  "New lead captured",
  "Form submitted",
  "Email opened",
  "Product purchased",
  "Cart abandoned",
];

const ACTIONS = [
  { type: "Send email", icon: Mail },
  { type: "Add to segment", icon: UserPlus },
  { type: "Notify on Slack", icon: Bell },
  { type: "Send SMS", icon: MessageSquare },
];

export default function MarketingAutomation() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState(TRIGGERS[0]);
  const [steps, setSteps] = useState<Step[]>([{ id: 1, type: "Send email", detail: "Send welcome email" }]);
  const [running, setRunning] = useState<number | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("hackathon_workflows");
      if (raw) setWorkflows(JSON.parse(raw));
    } catch {
      setWorkflows([]);
    }
  }, []);

  const persist = (next: Workflow[]) => {
    setWorkflows(next);
    localStorage.setItem("hackathon_workflows", JSON.stringify(next));
  };

  const addStep = () =>
    setSteps((prev) => [...prev, { id: Date.now(), type: ACTIONS[0].type, detail: "" }]);

  const updateStep = (id: number, patch: Partial<Step>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const removeStep = (id: number) => setSteps((prev) => prev.filter((s) => s.id !== id));

  const save = () => {
    if (!name.trim() || steps.length === 0) return;
    const wf: Workflow = { id: Date.now(), name: name.trim(), trigger, steps };
    persist([wf, ...workflows]);
    setName("");
    setSteps([{ id: Date.now(), type: ACTIONS[0].type, detail: "" }]);
  };

  const run = async (wf: Workflow) => {
    if (running !== null) return;
    setRunning(wf.id);
    setLogs([]);

    const pushLog = (entry: Omit<LogEntry, "delay">, delay: number) => {
      setLogs((prev) => [...prev, { ...entry, delay }]);
    };

    pushLog({ text: `Trigger fired: "${wf.trigger}"`, status: "ok" }, 0);

    for (let i = 0; i < wf.steps.length; i++) {
      const step = wf.steps[i];
      pushLog({ text: `Waiting for contact...`, status: "waiting" }, i);
      await new Promise((r) => setTimeout(r, 500));
      setLogs((prev) => prev.map((l, idx) => (idx === prev.length - 1 ? { ...l, status: "done" } : l)));
      pushLog(
        { text: `Step ${i + 1} — ${step.type}${step.detail ? ` (${step.detail})` : ""} executed`, status: "ok" },
        i
      );
      await new Promise((r) => setTimeout(r, 400));
    }

    pushLog({ text: `Workflow "${wf.name}" completed successfully.`, status: "done" }, wf.steps.length);
    setRunning(null);
  };

  const remove = (id: number) => persist(workflows.filter((w) => w.id !== id));

  return (
    <TrackPage
      badge="Track 3"
      title="Marketing Automation"
      description="Design trigger-based automation workflows and simulate them end-to-end — then save them for reuse."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <h3 className="font-semibold">Build a Workflow</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Workflow Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome series for new leads" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Trigger</label>
            <select value={trigger} onChange={(e) => setTrigger(e.target.value)} className={inputClass}>
              {TRIGGERS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">Actions</label>
              <button
                onClick={addStep}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Step
              </button>
            </div>
            <div className="space-y-3">
              {steps.map((s, i) => {
                const Icon = ACTIONS.find((a) => a.type === s.type)?.icon ?? Zap;
                return (
                  <div key={s.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-primary">
                          {i + 1}
                        </span>
                        <select
                          value={s.type}
                          onChange={(e) => updateStep(s.id, { type: e.target.value })}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
                        >
                          {ACTIONS.map((a) => (
                            <option key={a.type}>{a.type}</option>
                          ))}
                        </select>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <button
                        onClick={() => removeStep(s.id)}
                        className="text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <input
                      value={s.detail}
                      onChange={(e) => updateStep(s.id, { detail: e.target.value })}
                      placeholder="e.g. Send welcome email template"
                      className={inputClass}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={save}
            disabled={!name.trim() || steps.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap className="h-4 w-4" /> Save Workflow
          </button>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-semibold mb-4">Saved Workflows</h3>
            {workflows.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-6 text-center">
                No workflows yet. Build one and hit save.
              </div>
            ) : (
              <div className="space-y-3">
                {workflows.map((wf) => (
                  <div key={wf.id} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="font-medium text-sm">{wf.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => run(wf)}
                          disabled={running !== null}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                        >
                          <Play className="h-3 w-3" />
                          {running === wf.id ? "Running..." : "Run"}
                        </button>
                        <button onClick={() => remove(wf.id)} className="text-muted-foreground hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Trigger: <span className="text-foreground">{wf.trigger}</span> · {wf.steps.length} steps
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {logs.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Execution Log</h3>
              <div className="space-y-1.5 font-mono text-xs">
                {logs.map((log, i) => (
                  <div key={i} className={`flex items-center gap-2 ${log.status === "waiting" ? "text-muted-foreground" : "text-foreground"}`}>
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        log.status === "waiting" ? "bg-amber-400" : log.status === "done" ? "bg-emerald-400" : "bg-primary"
                      }`}
                    />
                    {log.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </TrackPage>
  );
}
