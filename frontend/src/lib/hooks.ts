import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAuth() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.auth.me(),
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
}

export function useBusinesses(orgId: string | null) {
  return useQuery({
    queryKey: ["businesses", orgId],
    queryFn: () => api.businesses.list(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBusiness(orgId: string, businessId: string) {
  return useQuery({
    queryKey: ["business", orgId, businessId],
    queryFn: () => api.businesses.get(orgId, businessId),
    enabled: !!orgId && !!businessId,
  });
}

export function useDashboard(businessId: string | null) {
  return useQuery({
    queryKey: ["dashboard", businessId],
    queryFn: () => api.analytics.dashboard(businessId!),
    enabled: !!businessId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useContentList(businessId: string | null) {
  return useQuery({
    queryKey: ["content", businessId],
    queryFn: () => api.content.list(businessId!),
    enabled: !!businessId,
  });
}

export function useCampaignList(businessId: string | null) {
  return useQuery({
    queryKey: ["campaigns", businessId],
    queryFn: () => api.campaigns.list(businessId!),
    enabled: !!businessId,
  });
}

export function useSEOReports(businessId: string | null) {
  return useQuery({
    queryKey: ["seo", businessId],
    queryFn: () => api.seo.list(businessId!),
    enabled: !!businessId,
  });
}

export function useAdsList(businessId: string | null) {
  return useQuery({
    queryKey: ["ads", businessId],
    queryFn: () => api.ads.list(businessId!),
    enabled: !!businessId,
  });
}

export function useCompetitors(businessId: string | null) {
  return useQuery({
    queryKey: ["competitors", businessId],
    queryFn: () => api.competitors.list(businessId!),
    enabled: !!businessId,
  });
}

export function usePersonas(businessId: string | null) {
  return useQuery({
    queryKey: ["personas", businessId],
    queryFn: () => api.personas.list(businessId!),
    enabled: !!businessId,
  });
}

export function useWorkflows(businessId: string | null) {
  return useQuery({
    queryKey: ["workflows", businessId],
    queryFn: () => api.automation.workflows(businessId!),
    enabled: !!businessId,
  });
}

export function useWorkflowTemplates() {
  return useQuery({
    queryKey: ["workflow-templates"],
    queryFn: () => api.automation.templates(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useEmailTemplates() {
  return useQuery({
    queryKey: ["email-templates"],
    queryFn: () => api.email.templates(),
    staleTime: 30 * 60 * 1000,
  });
}

export function useGenerateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.content.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}

export function useGenerateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.campaigns.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useGenerateSEO() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.seo.analyze(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo"] });
    },
  });
}

export function useCrawlWebsite() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.seo.crawl(data),
  });
}

export function useGenerateAds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.ads.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useAnalyzeCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.competitors.analyze(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
    },
  });
}

export function useGeneratePersonas() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.personas.generate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personas"] });
    },
  });
}

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.automation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}

export function useActivateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.automation.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}

export function useDeactivateWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.automation.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });
}

export function useAnalyzeBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, businessId }: { orgId: string; businessId: string }) =>
      api.businesses.analyze(orgId, businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function usePredictROI() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.analytics.predict(data),
  });
}

export function useGenerateEmailTemplate() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.email.generateTemplate(data),
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) =>
      api.request(`/api/v1/content/detail/${assetId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (campaignId: string) =>
      api.request(`/api/v1/campaigns/detail/${campaignId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}

export function useDeleteCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (competitorId: string) =>
      api.request(`/api/v1/competitors/detail/${competitorId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competitors"] });
    },
  });
}

export function useDeleteSEOReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportId: string) =>
      api.request(`/api/v1/seo/detail/${reportId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo"] });
    },
  });
}
