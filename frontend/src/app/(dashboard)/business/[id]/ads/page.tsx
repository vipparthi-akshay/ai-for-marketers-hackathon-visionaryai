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
import { useAdsList, useDeleteContent } from "@/lib/hooks";
import { copyToClipboard } from "@/lib/export";
import {
  Megaphone, Copy, Trash2, Eye, X, Search, Filter, Clock,
  LayoutGrid, List, CheckCircle2, BarChart3, DollarSign, Target,
  FileText,
} from "lucide-react";

const platforms = [
  { id: "google", label: "Google Ads", icon: "🔍", desc: "Search & Display" },
  { id: "meta", label: "Meta Ads", icon: "📱", desc: "Facebook & Instagram" },
  { id: "linkedin", label: "LinkedIn Ads", icon: "💼", desc: "B2B targeting" },
];

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

export default function AdsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { addToast } = useUIStore();
  const deleteContent = useDeleteContent();
  const { data: adsList, isLoading: listLoading } = useAdsList(businessId);

  const [platform, setPlatform] = useState("google");
  const [budget, setBudget] = useState("1000");
  const [objective, setObjective] = useState("conversions");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [detailItem, setDetailItem] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredAds = useMemo(() => {
    const items = Array.isArray(adsList) ? adsList : [];
    return items.filter((item: any) =>
      !searchQuery ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.platform?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [adsList, searchQuery]);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const data = await api.ads.generate({ business_id: businessId, platform, objective, budget: parseFloat(budget) });
      setResult(data);
      addToast("Ad variations generated!", "success");
    } catch (err) {
      addToast("Generation failed", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    addToast("Copied to clipboard!", "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad?")) return;
    try {
      await deleteContent.mutateAsync(id);
      addToast("Ad deleted", "success");
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  const totalCount = Array.isArray(adsList) ? adsList.length : 0;

  return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Ads Optimization" description="Generate and optimize ad campaigns with AI" />

        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate"><Megaphone className="h-4 w-4 mr-1.5" />Generate</TabsTrigger>
            <TabsTrigger value="library">
              <LayoutGrid className="h-4 w-4 mr-1.5" />Library
              {totalCount > 0 && <Badge variant="info" size="sm" className="ml-1.5">{totalCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader><CardTitle>Platform</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {platforms.map((p) => (
                        <button key={p.id} onClick={() => setPlatform(p.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all ${
                            platform === p.id ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted border border-transparent"
                          }`}>
                          <span className="text-lg">{p.icon}</span>
                          <div><div className="font-medium">{p.label}</div><div className="text-xs text-muted-foreground">{p.desc}</div></div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Objective</CardTitle></CardHeader>
                  <CardContent>
                    <select value={objective} onChange={(e) => setObjective(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="conversions">Conversions</option>
                      <option value="traffic">Traffic</option>
                      <option value="awareness">Awareness</option>
                      <option value="leads">Lead Generation</option>
                      <option value="app_installs">App Installs</option>
                      <option value="engagement">Engagement</option>
                    </select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Budget ($)</CardTitle></CardHeader>
                  <CardContent>
                    <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    <p className="text-xs text-muted-foreground mt-1">AI optimizes budget allocation</p>
                  </CardContent>
                </Card>

                <Button onClick={handleGenerate} disabled={generating} loading={generating} className="w-full" size="lg">
                  {generating ? "Generating..." : "Generate Ads"}
                </Button>
              </div>

              <div className="lg:col-span-2">
                {generating && (
                  <LoadingProgress steps={[`Researching ${platform} best practices`, "Generating headlines", "Writing descriptions", "Optimizing for CTR", "Predicting performance"]} />
                )}

                {!generating && !result && (
                  <Card className="h-full"><CardContent className="flex items-center justify-center py-20">
                    <EmptyState icon="📢" title="Ready to create ads" description="Configure platform, objective, and budget then generate" />
                  </CardContent></Card>
                )}

                {!generating && result && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Generated Variations</h3>
                      <Badge variant="info" size="md">{result.ads?.length || 0} ads</Badge>
                    </div>
                    {result.ads?.map((ad: any, i: number) => (
                      <Card key={i}>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="default" size="md">Variation {ad.variation || String.fromCharCode(65 + i)}</Badge>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {ad.predicted_ctr && <span>CTR: <strong className="text-foreground">{ad.predicted_ctr}%</strong></span>}
                              {ad.predicted_cpc && <span>CPC: <strong className="text-foreground">₹{ad.predicted_cpc}</strong></span>}
                            </div>
                          </div>
                          <h4 className="font-semibold">{ad.headline}</h4>
                          <p className="text-sm text-muted-foreground">{ad.description}</p>
                          <div className="flex items-center gap-2 pt-2 border-t border-border">
                            {ad.call_to_action && <Badge variant="success" size="sm">{ad.call_to_action}</Badge>}
                            <Button variant="ghost" size="sm" onClick={() => handleCopy(`${ad.headline}\n\n${ad.description}\n\nCTA: ${ad.call_to_action || ""}`)} icon={<Copy className="h-3.5 w-3.5" />}>Copy</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {result.keywords?.length > 0 && (
                      <Card><CardHeader><CardTitle>Suggested Keywords</CardTitle></CardHeader><CardContent>
                        <div className="flex flex-wrap gap-2">
                          {result.keywords.map((kw: string, i: number) => (
                            <Badge key={i} variant="default" size="md">{kw}</Badge>
                          ))}
                        </div>
                      </CardContent></Card>
                    )}

                    {result.ab_test_recommendations?.length > 0 && (
                      <Card><CardHeader><CardTitle>A/B Test Recommendations</CardTitle></CardHeader><CardContent>
                        <div className="space-y-2">
                          {result.ab_test_recommendations.map((rec: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 p-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span className="text-sm">{rec}</span>
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
                      placeholder="Search ads..."
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all" />
                  </div>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><LayoutGrid className="h-4 w-4" /></button>
                    <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><List className="h-4 w-4" /></button>
                  </div>
                </div>
              </CardContent></Card>

              {!listLoading && filteredAds.length === 0 && (
                <Card><CardContent className="flex items-center justify-center py-16">
                  <EmptyState icon="📢" title={totalCount === 0 ? "No ads yet" : "No matches"} description={totalCount === 0 ? "Generate your first ad campaign" : "Try a different search"} />
                </CardContent></Card>
              )}

              {!listLoading && filteredAds.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAds.map((item: any) => (
                    <Card key={item.id} hoverable onClick={() => { setDetailItem(item); setShowDetail(true); }}>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="info" size="sm">{item.platform || "general"}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(item.created_at)}</span>
                        </div>
                        <h4 className="font-semibold text-foreground line-clamp-1">{item.title || "Ad Campaign"}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                        <div className="flex items-center justify-end pt-2 border-t border-border">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} icon={<Trash2 className="h-3.5 w-3.5" />} className="text-destructive hover:text-destructive" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!listLoading && filteredAds.length > 0 && viewMode === "list" && (
                <Card><div className="divide-y divide-border">
                  {filteredAds.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => { setDetailItem(item); setShowDetail(true); }}>
                      <Megaphone className="h-5 w-5 shrink-0 text-primary" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{item.title || "Ad"}</h4>
                        <p className="text-xs text-muted-foreground">{item.platform} &middot; {formatDate(item.created_at)}</p>
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
                  <h3 className="font-semibold text-foreground">{detailItem.title || "Ad"}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{detailItem.platform} &middot; {formatDate(detailItem.created_at)}</p>
                </div>
                <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{detailItem.content}</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(detailItem.content)} icon={<Copy className="h-3.5 w-3.5" />}>Copy</Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(detailItem.id)} icon={<Trash2 className="h-3.5 w-3.5" />} className="text-destructive hover:text-destructive">Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
