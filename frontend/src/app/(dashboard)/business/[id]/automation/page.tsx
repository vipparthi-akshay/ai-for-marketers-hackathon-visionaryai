"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useUIStore } from "@/stores/uiStore";
import { LoadingProgress } from "@/components/shared/LoadingProgress";
import {
  Mail, Target, Smartphone, ShoppingCart, Hand, RefreshCw,
  Plus, Trash2, Play, Pause, GripVertical, Zap, Clock, GitBranch,
  ArrowDown, Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const workflowTypes: { id: string; label: string; icon: LucideIcon; desc: string }[] = [
  { id: "email_sequence", label: "Email Sequence", icon: Mail, desc: "Automated email series for leads and customers" },
  { id: "lead_nurture", label: "Lead Nurture", icon: Target, desc: "Nurture leads from awareness to conversion" },
  { id: "social_scheduling", label: "Social Scheduling", icon: Smartphone, desc: "Auto-schedule social media posts" },
  { id: "cart_abandonment", label: "Cart Abandonment", icon: ShoppingCart, desc: "Recover abandoned shopping carts" },
  { id: "welcome_series", label: "Welcome Series", icon: Hand, desc: "Onboard new subscribers" },
  { id: "re_engagement", label: "Re-engagement", icon: RefreshCw, desc: "Win back inactive customers" },
];

const nodeTypes = [
  { type: "trigger", label: "Trigger", icon: Zap, color: "bg-emerald-500" },
  { type: "delay", label: "Delay", icon: Clock, color: "bg-amber-500" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "bg-blue-500" },
  { type: "action", label: "Action", icon: Mail, color: "bg-primary" },
];

interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  config: Record<string, any>;
}

interface VisualWorkflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  is_active: boolean;
  execution_count: number;
  workflow_type: string;
}

export default function AutomationPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [selectedType, setSelectedType] = useState("email_sequence");
  const [workflows, setWorkflows] = useState<VisualWorkflow[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderNodes, setBuilderNodes] = useState<WorkflowNode[]>([
    { id: "1", type: "trigger", label: "Form Submit", config: { source: "website_form" } },
  ]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const { addToast } = useUIStore();

  useEffect(() => {
    loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
      const [wfData, tmplData] = await Promise.all([
        api.automation.workflows(businessId).catch(() => []),
        api.automation.templates().catch(() => []),
      ]);
      setWorkflows(wfData || []);
      setTemplates(tmplData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  };

  const addNode = (type: string) => {
    const nodeType = nodeTypes.find((n) => n.type === type);
    const newNode: WorkflowNode = {
      id: Math.random().toString(36).slice(2),
      type,
      label: nodeType?.label || type,
      config: {},
    };
    setBuilderNodes((prev) => [...prev, newNode]);
  };

  const removeNode = (id: string) => {
    setBuilderNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  const handleCreateWorkflow = async () => {
    setLoading(true);
    try {
      const wfType = workflowTypes.find((w) => w.id === selectedType);
      const data = await api.automation.create({
        business_id: businessId,
        name: wfType?.label || "New Workflow",
        workflow_type: selectedType,
        description: wfType?.desc || "",
        nodes: builderNodes,
      });
      setWorkflows((prev) => [{ ...data, nodes: builderNodes } as any, ...prev]);
      addToast("Workflow created successfully!", "success");
      setShowBuilder(false);
      setBuilderNodes([{ id: "1", type: "trigger", label: "Form Submit", config: { source: "website_form" } }]);
    } catch (err) {
      addToast("Failed to create workflow", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWorkflow = async (wf: VisualWorkflow) => {
    try {
      const updated = wf.is_active
        ? await api.automation.deactivate(wf.id)
        : await api.automation.activate(wf.id);
      setWorkflows((prev) =>
        prev.map((w) => (w.id === wf.id ? { ...updated, nodes: w.nodes } : w))
      );
      addToast(wf.is_active ? "Workflow deactivated" : "Workflow activated", "success");
    } catch (err) {
      addToast("Failed to toggle workflow", "error");
    }
  };

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Marketing Automation</h2>
            <p className="text-muted-foreground">Visual workflow builder for marketing automation</p>
          </div>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showBuilder ? "Close Builder" : "Build Workflow"}
          </button>
        </div>

        {showBuilder && (
          <div className="rounded-lg border border-primary/30 bg-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Visual Workflow Builder</h3>
              <div className="flex gap-2">
                {nodeTypes.map((nt) => {
                  const Icon = nt.icon;
                  return (
                    <button
                      key={nt.type}
                      onClick={() => addNode(nt.type)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium transition-colors"
                    >
                      <Plus className="h-3 w-3" /> {nt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-[300px] bg-muted/30 rounded-lg p-6 flex flex-col items-center">
              {builderNodes.map((node, i) => {
                const nt = nodeTypes.find((n) => n.type === node.type);
                const Icon = nt?.icon || Settings;
                return (
                  <div key={node.id} className="flex flex-col items-center">
                    {i > 0 && (
                      <div className="flex flex-col items-center py-1">
                        <div className="w-0.5 h-4 bg-border" />
                        <ArrowDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                    )}
                    <div
                      onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg border-2 bg-card cursor-pointer transition-all ${
                        selectedNode === node.id ? "border-primary shadow-md" : "border-border hover:border-border"
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <div className={`w-8 h-8 rounded-lg ${nt?.color || "bg-gray-500"} flex items-center justify-center`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{node.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">{node.type}</div>
                      </div>
                      {builderNodes.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-col items-center py-1">
                <div className="w-0.5 h-4 bg-border" />
                <ArrowDown className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                End of Workflow
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateWorkflow}
                disabled={loading}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Workflow"}
              </button>
              <button
                onClick={() => setShowBuilder(false)}
                className="px-6 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-semibold mb-3">Workflow Type</h3>
              <div className="space-y-2">
                {workflowTypes.map((wt) => {
                  const Icon = wt.icon;
                  return (
                    <button
                      key={wt.id}
                      onClick={() => setSelectedType(wt.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                        selectedType === wt.id
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{wt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-semibold mb-3">Workflows ({workflows.length})</h3>
              {initialLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : workflows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No workflows yet. Click &quot;Build Workflow&quot; to create one.
                </p>
              ) : (
                <div className="space-y-3">
                  {workflows.map((wf) => (
                    <div
                      key={wf.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-all"
                    >
                      <div>
                        <div className="font-medium text-sm">{wf.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {wf.workflow_type?.replace(/_/g, " ") || "Custom workflow"}
                          {wf.execution_count > 0 && ` - ${wf.execution_count} runs`}
                          {wf.nodes && ` - ${wf.nodes.length} steps`}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          wf.is_active ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        }`}>
                          {wf.is_active ? "Active" : "Draft"}
                        </span>
                        <button
                          onClick={() => handleToggleWorkflow(wf)}
                          className="text-xs text-primary hover:underline"
                        >
                          {wf.is_active ? "Pause" : "Activate"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}
