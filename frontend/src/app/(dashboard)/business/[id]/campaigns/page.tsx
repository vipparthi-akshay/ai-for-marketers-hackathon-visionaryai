"use client";

import { useState, useMemo } from "react";
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
import { useCampaignList, useDeleteCampaign } from "@/lib/hooks";
import {
  Rocket, Search, Trash2, Eye, X, RefreshCw, Filter, Clock,
  LayoutGrid, List, Target, DollarSign, Calendar, BarChart3,
  CheckCircle2, ArrowUpRight, TrendingUp, Users, Megaphone,
  Copy, FileText, FileCode, FileType, Download,
} from "lucide-react";
import { copyToClipboard } from "@/lib/export";

const objectives = [
  { id: "awareness", label: "Brand Awareness", icon: Megaphone, color: "text-blue-500" },
  { id: "leads", label: "Lead Generation", icon: Target, color: "text-emerald-500" },
  { id: "sales", label: "Sales", icon: DollarSign, color: "text-amber-500" },
  { id: "retention", label: "Retention", icon: Users, color: "text-emerald-500" },
];

const statusColors: Record<string, "default" | "success" | "warning" | "info"> = {
  draft: "warning",
  active: "success",
  paused: "info",
  completed: "default",
  archived: "default",
};

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

export default function CampaignsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { addToast } = useUIStore();
  const deleteCampaign = useDeleteCampaign();
  const { data: campaigns, isLoading: listLoading } = useCampaignList(businessId);

  const [objective, setObjective] = useState("awareness");
  const [budget, setBudget] = useState("1000");
  const [duration, setDuration] = useState("30");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [detailItem, setDetailItem] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredCampaigns = useMemo(() => {
    const items = Array.isArray(campaigns) ? campaigns : [];
    return items.filter((item: any) => {
      const matchesSearch = !searchQuery ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.objective?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchQuery, filterStatus]);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const data = await api.campaigns.generate({
        business_id: businessId,
        objective,
        budget: parseFloat(budget),
        duration: parseInt(duration),
        platforms: ["instagram", "facebook", "linkedin"],
      });
      setResult(data);
      addToast("Campaign strategy generated!", "success");
    } catch (err) {
      console.error(err);
      addToast("Generation failed. Please try again.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await deleteCampaign.mutateAsync(id);
      addToast("Campaign deleted", "success");
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    addToast("Copied to clipboard!", "success");
  };

  const totalCount = Array.isArray(campaigns) ? campaigns.length : 0;

  return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Campaign Builder" description="AI-powered campaign strategy and planning" />

        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate"><Rocket className="h-4 w-4 mr-1.5" />Generate</TabsTrigger>
            <TabsTrigger value="library">
              <LayoutGrid className="h-4 w-4 mr-1.5" />Library
              {totalCount > 0 && <Badge variant="info" size="sm" className="ml-1.5">{totalCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>Campaign Objective</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {objectives.map((obj) => {
                        const Icon = obj.icon;
                        return (
                          <button
                            key={obj.id}
                            onClick={() => setObjective(obj.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                              objective === obj.id
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "hover:bg-muted border border-transparent"
                            }`}
                          >
                            <Icon className={`h-4 w-4 ${objective === obj.id ? obj.color : ""}`} />
                            {obj.label}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Budget ($)</CardTitle></CardHeader>
                  <CardContent>
                    <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <p className="text-xs text-muted-foreground mt-1">AI will optimize allocation across platforms</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Duration (days)</CardTitle></CardHeader>
                  <CardContent>
                    <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </CardContent>
                </Card>

                <Button onClick={handleGenerate} disabled={generating} loading={generating} className="w-full" size="lg">
                  {generating ? "Building Strategy..." : "Generate Campaign"}
                </Button>
              </div>

              <div className="lg:col-span-2">
                {generating && (
                  <LoadingProgress steps={["Analyzing market conditions", "Designing campaign strategy", "Creating content calendar", "Setting KPIs & milestones"]} />
                )}

                {!generating && !result && (
                  <Card className="h-full">
                    <CardContent className="flex items-center justify-center py-20">
                      <EmptyState icon="🚀" title="Ready to launch" description="Configure your campaign and click generate" />
                    </CardContent>
                  </Card>
                )}

                {!generating && result && (
                  <div className="space-y-4">
                    {result.name && (
                      <Card><CardContent className="space-y-2">
                        <h3 className="font-semibold text-lg">{result.name}</h3>
                        {result.ai_strategy?.strategy && <p className="text-sm text-muted-foreground">{result.ai_strategy.strategy}</p>}
                        <div className="flex gap-2 pt-1">
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(result.ai_strategy?.strategy || result.name)} icon={<Copy className="h-3.5 w-3.5" />}>Copy</Button>
                        </div>
                      </CardContent></Card>
                    )}

                    {result.kpis && Object.keys(result.kpis).length > 0 && (
                      <Card><CardHeader><CardTitle>Key Performance Indicators</CardTitle></CardHeader><CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(result.kpis).map(([key, value]: [string, any]) => (
                            <div key={key} className="p-3 rounded-lg bg-muted/50">
                              <div className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</div>
                              <div className="text-lg font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent></Card>
                    )}

                    {result.content_calendar?.length > 0 && (
                      <Card><CardHeader><CardTitle>Content Calendar</CardTitle></CardHeader><CardContent>
                        <div className="space-y-2">
                          {result.content_calendar.slice(0, 12).map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 text-sm">
                              <span className="text-muted-foreground w-24 shrink-0">{item.date}</span>
                              <Badge variant="info" size="sm">{item.platform}</Badge>
                              <span className="truncate">{item.topic || item.content_type}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent></Card>
                    )}

                    {result.tasks?.length > 0 && (
                      <Card><CardHeader><CardTitle>Tasks</CardTitle></CardHeader><CardContent>
                        <div className="space-y-2">
                          {result.tasks.map((task: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                task.priority === "high" ? "bg-red-500" :
                                task.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
                              }`} />
                              <div className="min-w-0">
                                <div className="text-sm font-medium">{task.title}</div>
                                {task.description && <div className="text-xs text-muted-foreground">{task.description}</div>}
                              </div>
                              <Badge variant={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "success"} size="sm" className="shrink-0">
                                {task.priority}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent></Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="library">
            <div className="space-y-4">
              <Card><CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search campaigns..."
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all" />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <Button variant={showFilters ? "secondary" : "outline"} size="md" onClick={() => setShowFilters(!showFilters)} icon={<Filter className="h-4 w-4" />}>Filters</Button>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><LayoutGrid className="h-4 w-4" /></button>
                    <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><List className="h-4 w-4" /></button>
                  </div>
                </div>
                {showFilters && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Status:</span>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-2 py-1 rounded-md border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring">
                        <option value="all">All</option>
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    {filterStatus !== "all" && (
                      <button onClick={() => setFilterStatus("all")} className="text-xs text-primary hover:underline">Clear</button>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">{filteredCampaigns.length} result{filteredCampaigns.length !== 1 ? "s" : ""}</span>
                  </div>
                )}
              </CardContent></Card>

              {listLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}><CardContent className="space-y-3 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-5 bg-muted rounded w-2/3" />
                      <div className="h-16 bg-muted rounded" />
                    </CardContent></Card>
                  ))}
                </div>
              )}

              {!listLoading && filteredCampaigns.length === 0 && (
                <Card><CardContent className="flex items-center justify-center py-16">
                  <EmptyState
                    icon={totalCount === 0 ? "🚀" : "🔍"}
                    title={totalCount === 0 ? "No campaigns yet" : "No matches"}
                    description={totalCount === 0 ? "Generate your first campaign strategy" : "Try adjusting your search"}
                    action={{
                      label: totalCount === 0 ? "Create Campaign" : "Clear Filters",
                      onClick: totalCount === 0
                        ? () => (document.querySelector('[value="generate"]') as HTMLElement)?.click()
                        : () => { setSearchQuery(""); setFilterStatus("all"); },
                    }}
                  />
                </CardContent></Card>
              )}

              {!listLoading && filteredCampaigns.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCampaigns.map((item: any) => (
                    <Card key={item.id} hoverable onClick={() => { setDetailItem(item); setShowDetail(true); }}>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant={statusColors[item.status] || "default"} size="sm">{item.status || "draft"}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(item.created_at)}</span>
                        </div>
                        <h4 className="font-semibold text-foreground line-clamp-1">{item.name || "Untitled Campaign"}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.objective || "No objective set"}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-xs text-muted-foreground capitalize">{item.objective}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} icon={<Trash2 className="h-3.5 w-3.5" />} className="text-destructive hover:text-destructive" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!listLoading && filteredCampaigns.length > 0 && viewMode === "list" && (
                <Card><div className="divide-y divide-border">
                  {filteredCampaigns.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => { setDetailItem(item); setShowDetail(true); }}>
                      <Rocket className="h-5 w-5 shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground truncate">{item.name || "Untitled"}</h4>
                          <Badge variant={statusColors[item.status] || "default"} size="sm">{item.status || "draft"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.objective} &middot; {formatDate(item.created_at)}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} icon={<Trash2 className="h-3.5 w-3.5" />} className="text-destructive hover:text-destructive" />
                    </div>
                  ))}
                </div></Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {showDetail && detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowDetail(false)} />
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div>
                  <h3 className="font-semibold text-foreground">{detailItem.name || "Campaign"}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{detailItem.objective} &middot; {formatDate(detailItem.created_at)}</p>
                </div>
                <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Badge variant={statusColors[detailItem.status] || "default"} size="sm">{detailItem.status || "draft"}</Badge>
                </div>
                {detailItem.description && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Description</h4>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{detailItem.description}</p>
                    </div>
                  </div>
                )}
                {detailItem.kpis && Object.keys(detailItem.kpis).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">KPIs</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(detailItem.kpis).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 rounded-lg bg-muted/50">
                          <div className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, " ")}</div>
                          <div className="text-sm font-medium text-foreground">{typeof value === "number" ? value.toLocaleString() : String(value)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(detailItem.id)} icon={<Trash2 className="h-3.5 w-3.5" />} className="text-destructive hover:text-destructive">Delete</Button>
                <Button variant="outline" size="sm" onClick={() => { setDetailItem(null); setShowDetail(false); (document.querySelector('[value="generate"]') as HTMLElement)?.click(); }} icon={<RefreshCw className="h-3.5 w-3.5" />}>Regenerate</Button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
