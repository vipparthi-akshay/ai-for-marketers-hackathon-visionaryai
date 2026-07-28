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
import { useContentList, useDeleteContent } from "@/lib/hooks";
import { exportContent, copyToClipboard } from "@/lib/export";
import {
  FileText,
  FileCode,
  FileType,
  Copy,
  Sparkles,
  Pen,
  Camera,
  Briefcase,
  Users,
  MessageSquare,
  Mail,
  Tag,
  Megaphone,
  Video,
  Globe,
  Check,
  Search,
  Trash2,
  Eye,
  X,
  RefreshCw,
  Filter,
  Clock,
  LayoutGrid,
  List,
  ChevronDown,
  ArrowLeft,
  Download,
  Hash,
  Target,
  BarChart3,
} from "lucide-react";

const contentTypes = [
  { id: "blog", label: "Blog Article", icon: Pen, color: "text-indigo-500" },
  { id: "instagram_post", label: "Instagram Post", icon: Camera, color: "text-pink-500" },
  { id: "linkedin_post", label: "LinkedIn Post", icon: Briefcase, color: "text-blue-500" },
  { id: "facebook_post", label: "Facebook Post", icon: Users, color: "text-blue-400" },
  { id: "twitter_thread", label: "Twitter/X Thread", icon: MessageSquare, color: "text-sky-500" },
  { id: "email", label: "Email Campaign", icon: Mail, color: "text-amber-500" },
  { id: "product_description", label: "Product Description", icon: Tag, color: "text-violet-500" },
  { id: "ad_copy", label: "Ad Copy", icon: Megaphone, color: "text-red-500" },
  { id: "video_script", label: "Video Script", icon: Video, color: "text-emerald-500" },
  { id: "landing_page", label: "Landing Page", icon: Globe, color: "text-indigo-400" },
];

const tones = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "friendly", label: "Friendly" },
  { id: "bold", label: "Bold" },
  { id: "witty", label: "Witty" },
  { id: "luxury", label: "Luxury" },
];

const statusColors: Record<string, "default" | "success" | "warning" | "info"> = {
  draft: "warning",
  published: "success",
  archived: "default",
};

function getTypeIcon(typeId: string) {
  const found = contentTypes.find((t) => t.id === typeId);
  return found?.icon || FileText;
}

function getTypeColor(typeId: string) {
  const found = contentTypes.find((t) => t.id === typeId);
  return found?.color || "text-muted-foreground";
}

function getTypeLabel(typeId: string) {
  return contentTypes.find((t) => t.id === typeId)?.label || typeId;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ContentPage() {
  const params = useParams();
  const businessId = params.id as string;
  const { addToast } = useUIStore();
  const deleteContent = useDeleteContent();

  // Generate state
  const [selectedType, setSelectedType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null);

  // Library state
  const { data: contentList, isLoading: listLoading } = useContentList(businessId);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Detail modal state
  const [detailItem, setDetailItem] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Filtered content list
  const filteredContent = useMemo(() => {
    const items = Array.isArray(contentList) ? contentList : [];
    return items.filter((item: any) => {
      const matchesSearch =
        !searchQuery ||
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.asset_type?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || item.asset_type === filterType;
      const matchesStatus = filterStatus === "all" || item.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [contentList, searchQuery, filterType, filterStatus]);

  // Handlers
  const handleGenerate = async () => {
    if (!topic.trim()) {
      addToast("Please enter a topic for your content", "error");
      return;
    }
    setGenerating(true);
    setResult(null);
    setSelectedVariation(null);
    try {
      const data = await api.content.generate({
        business_id: businessId,
        asset_type: selectedType,
        platform: selectedType.includes("instagram")
          ? "instagram"
          : selectedType.includes("linkedin")
          ? "linkedin"
          : selectedType.includes("facebook")
          ? "facebook"
          : selectedType.includes("twitter")
          ? "twitter"
          : "general",
        tone,
        topic,
      });
      setResult(data);
      addToast("Content generated successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Generation failed. Please try again.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string) => {
    await copyToClipboard(text);
    addToast("Copied to clipboard!", "success");
  };

  const handleExport = (content: string, title: string, format: "text" | "markdown" | "html") => {
    exportContent(content, title, format);
    addToast(`Exported as ${format.toUpperCase()}`, "success");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) return;
    try {
      await deleteContent.mutateAsync(id);
      addToast("Content deleted successfully", "success");
    } catch {
      addToast("Failed to delete content", "error");
    }
  };

  const handleViewDetail = (item: any) => {
    setDetailItem(item);
    setShowDetail(true);
  };

  const handleRegenerate = (item: any) => {
    setSelectedType(item.asset_type || "blog");
    setTopic(item.title || "");
    setShowDetail(false);
    const tabTrigger = document.querySelector('[value="generate"]') as HTMLElement;
    tabTrigger?.click();
  };

  const selectedTypeLabel = contentTypes.find((t) => t.id === selectedType)?.label || "content";
  const totalCount = Array.isArray(contentList) ? contentList.length : 0;

  return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Content Engine"
          description="Generate marketing content with AI and manage your content library"
        />

        <Tabs defaultValue="generate">
          <TabsList>
            <TabsTrigger value="generate">
              <Sparkles className="h-4 w-4 mr-1.5" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="library">
              <LayoutGrid className="h-4 w-4 mr-1.5" />
              Library
              {totalCount > 0 && (
                <Badge variant="info" size="sm" className="ml-1.5">
                  {totalCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* GENERATE TAB */}
          <TabsContent value="generate">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration sidebar */}
              <div className="lg:col-span-1 space-y-4">
                {/* Content Type Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {contentTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedType === type.id;
                        return (
                          <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                              isSelected
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${isSelected ? type.color : ""}`} />
                            <span className="leading-tight text-center">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Tone Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tones.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTone(t.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                            tone === t.id
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                          }`}
                        >
                          {tone === t.id && <Check className="h-3 w-3" />}
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Topic Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Topic / Focus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 h-24 resize-none"
                      placeholder="What should the content be about?"
                    />
                  </CardContent>
                </Card>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !topic.trim()}
                  loading={generating}
                  icon={<Sparkles className="h-4 w-4" />}
                  className="w-full"
                  size="lg"
                >
                  {generating ? "Generating..." : "Generate Content"}
                </Button>
              </div>

              {/* Results area */}
              <div className="lg:col-span-2">
                {generating && (
                  <LoadingProgress
                    steps={[
                      "Researching your topic",
                      "Crafting content variations",
                      "Optimizing for engagement",
                      "Adding hashtags & CTAs",
                    ]}
                  />
                )}

                {!generating && !result && (
                  <Card className="h-full">
                    <CardContent className="flex items-center justify-center py-20">
                      <EmptyState
                        icon="✨"
                        title="Ready to create"
                        description={`Select a content type, enter a topic, and click generate to create ${selectedTypeLabel.toLowerCase()} content`}
                      />
                    </CardContent>
                  </Card>
                )}

                {!generating && result && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">
                        Generated Variations
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="info" size="md">
                          {result.variations?.length || 0} results
                        </Badge>
                        <Badge variant="default" size="md">
                          {getTypeLabel(result.asset_type || selectedType)}
                        </Badge>
                      </div>
                    </div>
                    {result.variations?.map((v: any, i: number) => {
                      const isExpanded = selectedVariation === i;
                      return (
                        <Card key={i} hoverable onClick={() => setSelectedVariation(isExpanded ? null : i)}>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="default" size="md">
                                Variation {String.fromCharCode(65 + i)}
                              </Badge>
                              <div className="flex items-center gap-2">
                                {v.engagement_prediction && (
                                  <Badge variant="success" size="sm">
                                    <BarChart3 className="h-3 w-3 mr-1" />
                                    {v.engagement_prediction}
                                  </Badge>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(v.content);
                                  }}
                                  icon={<Copy className="h-3.5 w-3.5" />}
                                >
                                  Copy
                                </Button>
                              </div>
                            </div>

                            {v.title && (
                              <h4 className="font-semibold text-foreground">{v.title}</h4>
                            )}

                            <p className={`text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed ${
                              isExpanded ? "" : "line-clamp-4"
                            }`}>
                              {v.content}
                            </p>

                            {!isExpanded && v.content?.length > 200 && (
                              <button className="text-xs text-primary hover:underline">
                                Click to expand
                              </button>
                            )}

                            {isExpanded && (
                              <>
                                {v.hashtags?.length > 0 && (
                                  <div className="pt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                                      <Hash className="h-3 w-3" />
                                      Hashtags
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {v.hashtags.map((tag: string, j: number) => (
                                        <span
                                          key={j}
                                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/5 text-primary text-xs font-medium"
                                        >
                                          #{tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {v.call_to_action && (
                                  <div className="flex items-center gap-1.5 text-sm pt-1">
                                    <Target className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">CTA:</span>
                                    <span className="font-medium text-foreground">{v.call_to_action}</span>
                                  </div>
                                )}

                                {v.best_time_to_post && (
                                  <div className="flex items-center gap-1.5 text-sm">
                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-muted-foreground">Best time:</span>
                                    <span className="font-medium text-foreground">{v.best_time_to_post}</span>
                                  </div>
                                )}

                                {v.seo_keywords?.length > 0 && (
                                  <div className="pt-1">
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                                      <Search className="h-3 w-3" />
                                      SEO Keywords
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {v.seo_keywords.map((kw: string, j: number) => (
                                        <span
                                          key={j}
                                          className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs"
                                        >
                                          {kw}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}

                            <div className="flex items-center gap-2 pt-3 border-t border-border">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(v.content);
                                }}
                                icon={<Copy className="h-3.5 w-3.5" />}
                              >
                                Copy
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(v.content, v.title || "content", "text");
                                }}
                                icon={<FileText className="h-3.5 w-3.5" />}
                              >
                                .txt
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(v.content, v.title || "content", "markdown");
                                }}
                                icon={<FileCode className="h-3.5 w-3.5" />}
                              >
                                .md
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExport(v.content, v.title || "content", "html");
                                }}
                                icon={<FileType className="h-3.5 w-3.5" />}
                              >
                                .html
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* LIBRARY TAB */}
          <TabsContent value="library">
            <div className="space-y-4">
              {/* Search and Filters Bar */}
              <Card>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search content by title, type, or keywords..."
                        className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/50 transition-all"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Filter Toggle */}
                    <Button
                      variant={showFilters ? "secondary" : "outline"}
                      size="md"
                      onClick={() => setShowFilters(!showFilters)}
                      icon={<Filter className="h-4 w-4" />}
                    >
                      Filters
                    </Button>

                    {/* View Mode Toggle */}
                    <div className="flex items-center border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 transition-colors ${
                          viewMode === "grid"
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 transition-colors ${
                          viewMode === "list"
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Filter Dropdowns */}
                  {showFilters && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Type:</span>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="px-2 py-1 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="all">All Types</option>
                          {contentTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-2 py-1 rounded-md border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="all">All Statuses</option>
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      {(filterType !== "all" || filterStatus !== "all") && (
                        <button
                          onClick={() => {
                            setFilterType("all");
                            setFilterStatus("all");
                          }}
                          className="text-xs text-primary hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {filteredContent.length} result{filteredContent.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Loading State */}
              {listLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="space-y-3 animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-5 bg-muted rounded w-2/3" />
                        <div className="h-20 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!listLoading && filteredContent.length === 0 && (
                <Card>
                  <CardContent className="flex items-center justify-center py-16">
                    {totalCount === 0 ? (
                      <EmptyState
                        icon="📝"
                        title="No content yet"
                        description="Generate your first piece of content and it will appear here"
                        action={{
                          label: "Create Content",
                          onClick: () => {
                            const tabTrigger = document.querySelector('[value="generate"]') as HTMLElement;
                            tabTrigger?.click();
                          },
                        }}
                      />
                    ) : (
                      <EmptyState
                        icon="🔍"
                        title="No matches found"
                        description="Try adjusting your search or filters"
                        action={{
                          label: "Clear Filters",
                          onClick: () => {
                            setSearchQuery("");
                            setFilterType("all");
                            setFilterStatus("all");
                          },
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Content Grid View */}
              {!listLoading && filteredContent.length > 0 && viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredContent.map((item: any) => {
                    const TypeIcon = getTypeIcon(item.asset_type);
                    return (
                      <Card key={item.id} hoverable onClick={() => handleViewDetail(item)}>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TypeIcon className={`h-4 w-4 ${getTypeColor(item.asset_type)}`} />
                              <span className="text-xs font-medium text-muted-foreground">
                                {getTypeLabel(item.asset_type)}
                              </span>
                            </div>
                            <Badge variant={statusColors[item.status] || "default"} size="sm">
                              {item.status || "draft"}
                            </Badge>
                          </div>

                          <h4 className="font-semibold text-foreground line-clamp-1">
                            {item.title || "Untitled"}
                          </h4>

                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {item.content}
                          </p>

                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDate(item.created_at)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.content);
                                }}
                                icon={<Copy className="h-3.5 w-3.5" />}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(item.id);
                                }}
                                icon={<Trash2 className="h-3.5 w-3.5" />}
                                className="text-destructive hover:text-destructive"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Content List View */}
              {!listLoading && filteredContent.length > 0 && viewMode === "list" && (
                <Card>
                  <div className="divide-y divide-border">
                    {filteredContent.map((item: any) => {
                      const TypeIcon = getTypeIcon(item.asset_type);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => handleViewDetail(item)}
                        >
                          <TypeIcon className={`h-5 w-5 shrink-0 ${getTypeColor(item.asset_type)}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-foreground truncate">
                                {item.title || "Untitled"}
                              </h4>
                              <Badge variant={statusColors[item.status] || "default"} size="sm">
                                {item.status || "draft"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {getTypeLabel(item.asset_type)} &middot; {formatDate(item.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetail(item);
                              }}
                              icon={<Eye className="h-3.5 w-3.5" />}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(item.content);
                              }}
                              icon={<Copy className="h-3.5 w-3.5" />}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.id);
                              }}
                              icon={<Trash2 className="h-3.5 w-3.5" />}
                              className="text-destructive hover:text-destructive"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* DETAIL MODAL */}
        {showDetail && detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowDetail(false)}
            />
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {(() => {
                    const TypeIcon = getTypeIcon(detailItem.asset_type);
                    return <TypeIcon className={`h-5 w-5 shrink-0 ${getTypeColor(detailItem.asset_type)}`} />;
                  })()}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {detailItem.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {getTypeLabel(detailItem.asset_type)}
                      </span>
                      <span className="text-xs text-muted-foreground">&middot;</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(detailItem.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status:</span>
                  <Badge variant={statusColors[detailItem.status] || "default"} size="sm">
                    {detailItem.status || "draft"}
                  </Badge>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Content</h4>
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {detailItem.content}
                    </p>
                  </div>
                </div>

                {/* Metadata */}
                {detailItem.meta_data && Object.keys(detailItem.meta_data).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Metadata</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(detailItem.meta_data).map(([key, value]: [string, any]) => (
                        <div key={key} className="p-3 rounded-lg bg-muted/50">
                          <div className="text-xs text-muted-foreground capitalize">
                            {key.replace(/_/g, " ")}
                          </div>
                          <div className="text-sm font-medium text-foreground mt-0.5">
                            {typeof value === "object" ? JSON.stringify(value) : String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SEO Data */}
                {detailItem.seo_data && Object.keys(detailItem.seo_data).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">SEO Data</h4>
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {JSON.stringify(detailItem.seo_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRegenerate(detailItem)}
                    icon={<RefreshCw className="h-3.5 w-3.5" />}
                  >
                    Regenerate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(detailItem.id)}
                    icon={<Trash2 className="h-3.5 w-3.5" />}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(detailItem.content)}
                    icon={<Copy className="h-3.5 w-3.5" />}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(detailItem.content, detailItem.title || "content", "text")}
                    icon={<FileText className="h-3.5 w-3.5" />}
                  >
                    .txt
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(detailItem.content, detailItem.title || "content", "markdown")}
                    icon={<FileCode className="h-3.5 w-3.5" />}
                  >
                    .md
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(detailItem.content, detailItem.title || "content", "html")}
                    icon={<FileType className="h-3.5 w-3.5" />}
                  >
                    .html
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
