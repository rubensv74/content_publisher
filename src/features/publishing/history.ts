import { createClient } from "@/lib/supabase/server";

export type PublishingHistoryItem = {
  id: string;
  publicationId: string;
  publicationTitle: string;
  publicationTopic?: string | null;
  format?: string | null;
  storyType?: string | null;
  archetypeKey?: string | null;
  variantKey?: string | null;
  renderId?: string | null;
  renderType?: string | null;
  action: string;
  status: string;
  providerStatus?: string | null;
  lastReconciledAt?: string | null;
  scheduledFor?: string | null;
  externalId?: string | null;
  externalUrl?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

type JobRow = {
  id: string;
  publication_id: string;
  render_id: string | null;
  action: string;
  status: string;
  scheduled_for: string | null;
  external_id: string | null;
  external_url: string | null;
  error_message: string | null;
  provider_payload: unknown;
  created_at: string;
  completed_at: string | null;
};

type PublicationRow = {
  id: string;
  title: string;
  topic: string | null;
  format: string;
  story_type: string;
  archetype_key: string | null;
  variant_key: string | null;
};

type RenderRow = {
  id: string;
  render_type: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function getPublishingHistory(): Promise<PublishingHistoryItem[]> {
  const supabase = await createClient();
  const { data: jobsData, error: jobsError } = await supabase
    .from("publishing_jobs")
    .select(
      "id,publication_id,render_id,action,status,scheduled_for,external_id,external_url,error_message,provider_payload,created_at,completed_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (jobsError) {
    throw new Error(`No se pudo cargar el historial: ${jobsError.message}`);
  }

  const jobs = (jobsData ?? []) as unknown as JobRow[];

  if (jobs.length === 0) {
    return [];
  }

  const publicationIds = [...new Set(jobs.map((job) => job.publication_id))];
  const renderIds = [
    ...new Set(
      jobs
        .map((job) => job.render_id)
        .filter((id): id is string => typeof id === "string"),
    ),
  ];

  const [publicationsResult, rendersResult] = await Promise.all([
    supabase
      .from("publications")
      .select("id,title,topic,format,story_type,archetype_key,variant_key")
      .in("id", publicationIds),
    renderIds.length > 0
      ? supabase.from("renders").select("id,render_type").in("id", renderIds)
      : Promise.resolve({ data: [] as unknown[], error: null }),
  ]);

  if (publicationsResult.error) {
    throw new Error(
      `No se pudieron cargar las publicaciones del historial: ${publicationsResult.error.message}`,
    );
  }

  if (rendersResult.error) {
    throw new Error(
      `No se pudieron cargar los renders del historial: ${rendersResult.error.message}`,
    );
  }

  const publications = (publicationsResult.data ?? []) as unknown as PublicationRow[];
  const renders = (rendersResult.data ?? []) as unknown as RenderRow[];
  const publicationById = new Map(publications.map((item) => [item.id, item]));
  const renderById = new Map(renders.map((item) => [item.id, item]));

  return jobs.map((job) => {
    const publication = publicationById.get(job.publication_id);
    const render = job.render_id ? renderById.get(job.render_id) : undefined;
    const providerPayload = asRecord(job.provider_payload);

    return {
      id: job.id,
      publicationId: job.publication_id,
      publicationTitle: publication?.title ?? "Publicación",
      publicationTopic: publication?.topic,
      format: publication?.format,
      storyType: publication?.story_type,
      archetypeKey: publication?.archetype_key,
      variantKey: publication?.variant_key,
      renderId: job.render_id,
      renderType: render?.render_type,
      action: job.action,
      status: job.status,
      providerStatus:
        typeof providerPayload.bufferStatus === "string"
          ? providerPayload.bufferStatus
          : null,
      lastReconciledAt:
        typeof providerPayload.lastReconciledAt === "string"
          ? providerPayload.lastReconciledAt
          : null,
      scheduledFor: job.scheduled_for,
      externalId: job.external_id,
      externalUrl: job.external_url,
      errorMessage: job.error_message,
      createdAt: job.created_at,
      completedAt: job.completed_at,
    };
  });
}
