"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";

const workflowTypes = [
  { id: "email_sequence", label: "Email Sequence", icon: "📧", desc: "Automated email series for leads and customers" },
  { id: "lead_nurture", label: "Lead Nurture", icon: "🎯", desc: "Nurture leads from awareness to conversion" },
  { id: "social_scheduling", label: "Social Scheduling", icon: "📱", desc: "Auto-schedule social media posts" },
  { id: "cart_abandonment", label: "Cart Abandonment", icon: "🛒", desc: "Recover abandoned shopping carts" },
  { id: "welcome_series", label: "Welcome Series", icon: "👋", desc: "Onboard new subscribers" },
  { id: "re_engagement", label: "Re-engagement", icon: "🔄", desc: "Win back inactive customers" },
];

export default function AutomationPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [selectedType, setSelectedType] = useState("email_sequence");
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateWorkflow = async () => {
    setLoading(true);
    try {
      const data = await api.request<any>("/api/v1/automation/workflows", {
        method: "POST",
        body: {
          business_id: businessId,
          name: workflowTypes.find((w) => w.id === selectedType)?.label || "New Workflow",
          workflow_type: selectedType,
          description: workflowTypes.find((w) => w.id === selectedType)?.desc || "",
        },
      });
      setWorkflows((prev) => [data, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await api.automation.templates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout businessId={businessId}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold">Marketing Automation</h2>
          <p className="text-muted-foreground">Create automated workflows for your marketing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h3 className="font-semibold mb-3">Workflow Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {workflowTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={handleCreateWorkflow}
              disabled={loading}
              className="mt-4 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Workflow"}
            </button>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Active Workflows</h3>
            {workflows.length === 0 ? (
              <div className="rounded-xl border border-border/50 bg-card p-8 text-center">
                <div className="text-3xl mb-2">⚙️</div>
                <p className="text-sm text-muted-foreground">No workflows yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workflows.map((wf) => (
                  <div key={wf.id} className="rounded-xl border border-border/50 bg-card p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{wf.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        wf.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"
                      }`}>
                        {wf.is_active ? "Active" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{wf.workflow_type.replace(/_/g, " ")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
