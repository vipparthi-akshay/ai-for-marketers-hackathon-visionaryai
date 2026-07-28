"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingProgress } from "@/components/shared/LoadingProgress";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useUIStore } from "@/stores/uiStore";
import { api } from "@/lib/api";
import { usePersonas, useDeleteContent } from "@/lib/hooks";
import {
  Users, Search, Trash2, Eye, X, Filter, Clock,
  LayoutGrid, List, Heart, Target, DollarSign, Globe,
  TrendingUp, AlertTriangle, CheckCircle2,
} from "lucide-react";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 1) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PersonasPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { addToast } = useUIStore();
  const deleteContent = useDeleteContent();
  const { data: personasList, isLoading: listLoading } = usePersonas(businessId);

  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailItem, setDetailItem] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredPersonas = useMemo(() => {
    const items = Array.isArray(personasList) ? personasList : [];
    return items.filter((item: any) =>
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [personasList, searchQuery]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const data = await api.personas.generate({ business_id: businessId });
      addToast("Personas generated!", "success");
    } catch (err) {
      addToast("Generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this persona?")) return;
    try {
      await deleteContent.mutateAsync(id);
      addToast("Persona deleted", "success");
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  const totalCount = Array.isArray(personasList) ? personasList.length : 0;
  const avatarColors = ["bg-emerald-500", "bg-pink-500", "bg-blue-500", "bg-teal-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500", "bg-lime-500"];

  return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <PageHeader title="Customer Personas" description="AI-generated audience personas for targeted marketing" />
          <Button onClick={handleGenerate} disabled={generating} loading={generating} icon={<Users className="h-4 w-4" />}>
            {generating ? "Generating..." : "Generate Personas"}
          </Button>
        </div>

        {generating && (
          <LoadingProgress steps={["Analyzing business data", "Identifying audience segments", "Building personas", "Adding psychographics"]} />
        )}

        {!generating && (
          <>
            {totalCount > 0 && (
              <Card><CardContent className="py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search personas by name or job title..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all" />
                </div>
              </CardContent></Card>
            )}

            {!listLoading && filteredPersonas.length === 0 && (
              <Card><CardContent className="flex items-center justify-center py-16">
                <EmptyState icon="👥" title={totalCount === 0 ? "No personas yet" : "No matches"} description={totalCount === 0 ? "Generate personas to understand your audience" : "Try a different search"} />
              </CardContent></Card>
            )}

            {!listLoading && filteredPersonas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPersonas.map((persona: any, i: number) => (
                  <Card key={persona.id || i} hoverable onClick={() => { setDetailItem(persona); setShowDetail(true); }}>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg`}>
                          {persona.name?.[0] || "?"}
                        </div>
                        <div>
                          <h3 className="font-semibold">{persona.name}</h3>
                          <p className="text-xs text-muted-foreground">{persona.job_title}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {persona.age_range && (
                          <div className="p-2 rounded-lg bg-muted/50">
                            <div className="text-muted-foreground">Age</div>
                            <div className="font-medium">{persona.age_range}</div>
                          </div>
                        )}
                        {persona.income_range && (
                          <div className="p-2 rounded-lg bg-muted/50">
                            <div className="text-muted-foreground">Income</div>
                            <div className="font-medium">{persona.income_range}</div>
                          </div>
                        )}
                      </div>

                      {persona.pain_points?.length > 0 && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Pain Points</div>
                          <div className="space-y-1">
                            {persona.pain_points.slice(0, 3).map((p: string, j: number) => (
                              <div key={j} className="text-xs flex items-start gap-1.5">
                                <span className="text-destructive mt-0.5">-</span>
                                <span className="line-clamp-1">{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {persona.preferred_channels?.length > 0 && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Globe className="h-3 w-3" />Channels</div>
                          <div className="flex flex-wrap gap-1.5">
                            {persona.preferred_channels.map((ch: string, j: number) => (
                              <Badge key={j} variant="default" size="sm">{ch}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {showDetail && detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDetail(false)} />
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">{detailItem.name?.[0]}</div>
                  <div>
                    <h3 className="font-semibold text-foreground">{detailItem.name}</h3>
                    <p className="text-xs text-muted-foreground">{detailItem.job_title}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {detailItem.age_range && <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">Age</div><div className="font-medium">{detailItem.age_range}</div></div>}
                  {detailItem.income_range && <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">Income</div><div className="font-medium">{detailItem.income_range}</div></div>}
                  {detailItem.location && <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">Location</div><div className="font-medium">{detailItem.location}</div></div>}
                  {detailItem.education && <div className="p-3 rounded-lg bg-muted/50"><div className="text-xs text-muted-foreground">Education</div><div className="font-medium">{detailItem.education}</div></div>}
                </div>

                {detailItem.goals?.length > 0 && (
                  <div><h4 className="text-sm font-medium mb-2 flex items-center gap-1.5"><Target className="h-3.5 w-3.5 text-primary" />Goals</h4>
                    <div className="space-y-1.5">{detailItem.goals.map((g: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /><span>{g}</span></div>
                    ))}</div>
                  </div>
                )}

                {detailItem.pain_points?.length > 0 && (
                  <div><h4 className="text-sm font-medium mb-2 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" />Pain Points</h4>
                    <div className="space-y-1.5">{detailItem.pain_points.map((p: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-sm"><span className="text-destructive mt-0.5">-</span><span>{p}</span></div>
                    ))}</div>
                  </div>
                )}

                {detailItem.preferred_channels?.length > 0 && (
                  <div><h4 className="text-sm font-medium mb-2 flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-primary" />Preferred Channels</h4>
                    <div className="flex flex-wrap gap-1.5">{detailItem.preferred_channels.map((ch: string, i: number) => (
                      <Badge key={i} variant="default" size="md">{ch}</Badge>
                    ))}</div>
                  </div>
                )}

                {detailItem.marketing_messaging && (
                  <div><h4 className="text-sm font-medium mb-2">Recommended Messaging</h4>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border"><p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{detailItem.marketing_messaging}</p></div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(detailItem.id)} icon={<Trash2 className="h-3.5 w-3.5" />} className="text-destructive hover:text-destructive">Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
