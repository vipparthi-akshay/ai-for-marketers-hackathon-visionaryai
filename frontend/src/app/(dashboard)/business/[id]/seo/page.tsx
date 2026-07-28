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
import { useSEOReports, useDeleteSEOReport } from "@/lib/hooks";
import {
  Search, Globe, Lightbulb, Trash2, Eye, X, Filter, Clock,
  LayoutGrid, List, BarChart3, AlertTriangle, CheckCircle2,
  TrendingUp, FileText, ExternalLink,
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

export default function SEOPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { addToast } = useUIStore();
  const deleteReport = useDeleteSEOReport();
  const { data: reports, isLoading: listLoading } = useSEOReports(businessId);

  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [crawlData, setCrawlData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [detailItem, setDetailItem] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredReports = useMemo(() => {
    const items = Array.isArray(reports) ? reports : [];
    return items.filter((item: any) =>
      !searchQuery ||
      item.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.score).includes(searchQuery)
    );
  }, [reports, searchQuery]);

  const handleLiveCrawl = async () => {
    setAnalyzing(true);
    setCrawlData(null);
    setResult(null);
    try {
      const targetUrl = url || "https://example.com";
      const [crawl, analysis] = await Promise.allSettled([
        api.seo.crawl({ url: targetUrl, business_id: businessId }),
        api.seo.analyze({ business_id: businessId, url: url || undefined }),
      ]);
      if (crawl.status === "fulfilled") setCrawlData(crawl.value);
      if (analysis.status === "fulfilled") {
        setResult(analysis.value);
        addToast("SEO audit completed!", "success");
      }
    } catch (err) {
      addToast("Analysis failed", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this report?")) return;
    try {
      await deleteReport.mutateAsync(id);
      addToast("Report deleted", "success");
    } catch {
      addToast("Failed to delete", "error");
    }
  };

  const totalCount = Array.isArray(reports) ? reports.length : 0;

  return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="SEO Engine" description="AI-powered SEO analysis with live website crawling" />

        <Tabs defaultValue="analyze">
          <TabsList>
            <TabsTrigger value="analyze"><Search className="h-4 w-4 mr-1.5" />Analyze</TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-1.5" />Reports
              {totalCount > 0 && <Badge variant="info" size="sm" className="ml-1.5">{totalCount}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze">
            <div className="space-y-4">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">Live Website Crawl & Audit</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Enter your website URL for real-time crawl analysis including meta tags, headings, page speed, and SEO scoring.</p>
                  <div className="flex gap-3">
                    <input value={url} onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="https://your-website.com" />
                    <Button onClick={handleLiveCrawl} disabled={analyzing} loading={analyzing} icon={<Search className="h-4 w-4" />}>
                      {analyzing ? "Analyzing..." : "Run Audit"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {analyzing && (
                <LoadingProgress steps={["Crawling website", "Analyzing meta tags", "Checking structure", "Evaluating content", "Generating report"]} />
              )}

              {!analyzing && crawlData && (
                <Card>
                  <CardHeader><CardTitle>Crawl Results</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {[
                        { label: "Status", value: crawlData.status_code || 200 },
                        { label: "Load Time", value: `${crawlData.load_time_ms || "N/A"}ms` },
                        { label: "Words", value: crawlData.word_count || "N/A" },
                        { label: "Links", value: crawlData.links_count || "N/A" },
                      ].map((stat) => (
                        <div key={stat.label} className="p-3 rounded-lg bg-muted/50 text-center">
                          <div className="text-lg font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                    {crawlData.meta_tags && (
                      <div className="space-y-1.5">
                        <h4 className="text-sm font-medium mb-2">Meta Tags</h4>
                        {Object.entries(crawlData.meta_tags).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
                            <span className="font-mono text-primary shrink-0">{key}:</span>
                            <span className="text-muted-foreground truncate">{typeof value === "string" ? value : JSON.stringify(value)}</span>
                            {key === "title" && (
                              <Badge variant={(value as string)?.length <= 60 ? "success" : "warning"} size="sm" className="shrink-0">
                                {(value as string)?.length <= 60 ? "Good" : "Long"}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!analyzing && result && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card><CardContent className="text-center py-6">
                      <div className="text-4xl font-bold text-primary">{result.score || result.seo_score || 0}</div>
                      <div className="text-sm text-muted-foreground">SEO Score</div>
                    </CardContent></Card>
                    <Card><CardContent className="text-center py-6">
                      <div className="text-4xl font-bold">{result.keywords?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Keywords</div>
                    </CardContent></Card>
                    <Card><CardContent className="text-center py-6">
                      <div className="text-4xl font-bold">{result.issues?.length || 0}</div>
                      <div className="text-sm text-muted-foreground">Issues</div>
                    </CardContent></Card>
                  </div>

                  {result.keywords?.length > 0 && (
                    <Card><CardHeader><CardTitle>Keywords</CardTitle></CardHeader><CardContent>
                      <div className="space-y-2">
                        {result.keywords.map((kw: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <span className="text-sm font-medium">{kw.keyword}</span>
                            <div className="flex items-center gap-3">
                              <Badge variant={kw.difficulty > 70 ? "error" : kw.difficulty > 40 ? "warning" : "success"} size="sm">
                                Difficulty: {kw.difficulty}/100
                              </Badge>
                              <span className="text-xs text-muted-foreground">Vol: {kw.volume?.toLocaleString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent></Card>
                  )}

                  {result.issues?.length > 0 && (
                    <Card><CardHeader><CardTitle>Issues</CardTitle></CardHeader><CardContent>
                      <div className="space-y-2">
                        {result.issues.map((issue: any, i: number) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={issue.severity === "high" ? "error" : issue.severity === "medium" ? "warning" : "success"} size="sm">{issue.severity}</Badge>
                              <span className="text-sm font-medium">{issue.category}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{issue.description}</p>
                            {issue.fix && <p className="text-xs text-primary mt-1">Fix: {issue.fix}</p>}
                          </div>
                        ))}
                      </div>
                    </CardContent></Card>
                  )}

                  {result.recommendations?.length > 0 && (
                    <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent>
                      <div className="space-y-2">
                        {result.recommendations.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-2">
                            <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent></Card>
                  )}
                </div>
              )}

              {!analyzing && !result && !crawlData && (
                <Card><CardContent className="flex items-center justify-center py-16">
                  <EmptyState icon="🔍" title="Start an SEO audit" description="Enter your website URL above to get AI-powered SEO insights" />
                </CardContent></Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-4">
              <Card><CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reports..."
                      className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all" />
                  </div>
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button onClick={() => setViewMode("grid")} className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><LayoutGrid className="h-4 w-4" /></button>
                    <button onClick={() => setViewMode("list")} className={`p-2 transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}><List className="h-4 w-4" /></button>
                  </div>
                </div>
              </CardContent></Card>

              {listLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}><CardContent className="space-y-3 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3" /><div className="h-5 bg-muted rounded w-2/3" /><div className="h-16 bg-muted rounded" />
                    </CardContent></Card>
                  ))}
                </div>
              )}

              {!listLoading && filteredReports.length === 0 && (
                <Card><CardContent className="flex items-center justify-center py-16">
                  <EmptyState icon="📋" title="No reports yet" description="Run your first SEO audit to see reports here" />
                </CardContent></Card>
              )}

              {!listLoading && filteredReports.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReports.map((item: any) => (
                    <Card key={item.id} hoverable onClick={() => { setDetailItem(item); setShowDetail(true); }}>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-3xl font-bold text-primary">{item.score || item.seo_score || 0}</div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(item.created_at)}</span>
                        </div>
                        <h4 className="font-semibold text-foreground truncate">{item.url || "Full SEO Audit"}</h4>
                        <div className="flex items-center gap-2 pt-2 border-t border-border">
                          <Badge variant={(item.score || 0) >= 70 ? "success" : (item.score || 0) >= 40 ? "warning" : "error"} size="sm">
                            {(item.score || 0) >= 70 ? "Good" : (item.score || 0) >= 40 ? "Needs Work" : "Poor"}
                          </Badge>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} icon={<Trash2 className="h-3.5 w-3.5" />} className="text-destructive hover:text-destructive ml-auto" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {!listLoading && filteredReports.length > 0 && viewMode === "list" && (
                <Card><div className="divide-y divide-border">
                  {filteredReports.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => { setDetailItem(item); setShowDetail(true); }}>
                      <div className="text-2xl font-bold text-primary">{item.score || 0}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{item.url || "Full Audit"}</h4>
                        <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                      </div>
                      <Badge variant={(item.score || 0) >= 70 ? "success" : (item.score || 0) >= 40 ? "warning" : "error"} size="sm">
                        {(item.score || 0) >= 70 ? "Good" : "Needs Work"}
                      </Badge>
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
                  <h3 className="font-semibold text-foreground">{detailItem.url || "SEO Report"}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Score: {detailItem.score || 0}/100 &middot; {formatDate(detailItem.created_at)}</p>
                </div>
                <button onClick={() => setShowDetail(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold text-primary">{detailItem.score || 0}</div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold">{detailItem.keywords?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Keywords</div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-2xl font-bold">{detailItem.issues?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Issues</div>
                  </div>
                </div>
                {detailItem.keywords?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Top Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {detailItem.keywords.slice(0, 10).map((kw: any, i: number) => (
                        <Badge key={i} variant="default" size="sm">{kw.keyword}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {detailItem.recommendations?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                    <div className="space-y-1.5">
                      {detailItem.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm"><Lightbulb className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /><span>{rec}</span></div>
                      ))}
                    </div>
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
