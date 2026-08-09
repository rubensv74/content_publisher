const GITHUB_API_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2026-03-10";

export type GitHubSourceCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string | null; date: string | null } | null;
    committer: { name: string | null; date: string | null } | null;
  };
};

export type GitHubSourceConnectionStatus = {
  configured: boolean;
  tokenPresent: boolean;
  repositories: string[];
  knowledgeBaseRepository: string | null;
};

export class GitHubSourceError extends Error {
  readonly status?: number;
  readonly code: "not-configured" | "not-allowed" | "unauthorized" | "network";

  constructor(
    message: string,
    code: GitHubSourceError["code"],
    status?: number,
  ) {
    super(message);
    this.name = "GitHubSourceError";
    this.code = code;
    this.status = status;
  }
}

function normalizeRepository(value: string) {
  return value.trim().replace(/^https:\/\/github\.com\//i, "").replace(/\.git$/i, "");
}

function configuredRepositories() {
  return [...new Set(
    (process.env.GITHUB_SOURCE_REPOSITORIES ?? "")
      .split(",")
      .map(normalizeRepository)
      .filter((value) => /^[^/\s]+\/[^/\s]+$/.test(value)),
  )];
}

export function getGitHubSourceConnectionStatus(): GitHubSourceConnectionStatus {
  const repositories = configuredRepositories();
  const tokenPresent = Boolean(process.env.GITHUB_SOURCE_TOKEN?.trim());
  const knowledgeBaseRepository = normalizeRepository(
    process.env.GITHUB_KNOWLEDGE_BASE_REPOSITORY ?? "",
  );

  return {
    configured: tokenPresent && repositories.length > 0,
    tokenPresent,
    repositories,
    knowledgeBaseRepository: knowledgeBaseRepository || null,
  };
}

function getToken() {
  const token = process.env.GITHUB_SOURCE_TOKEN?.trim();

  if (!token) {
    throw new GitHubSourceError(
      "GitHub Source Reader todavía no está configurado en el servidor.",
      "not-configured",
    );
  }

  return token;
}

function assertAllowed(repository: string) {
  const normalized = normalizeRepository(repository);
  const allowed = configuredRepositories().some(
    (candidate) => candidate.toLowerCase() === normalized.toLowerCase(),
  );

  if (!allowed) {
    throw new GitHubSourceError(
      `El repositorio ${normalized} no pertenece a la allowlist de Content Publisher.`,
      "not-allowed",
    );
  }

  return normalized;
}

async function githubGet<T>(repository: string, path: string): Promise<T> {
  const allowedRepository = assertAllowed(repository);
  const token = getToken();
  const [owner, repo] = allowedRepository.split("/");
  let response: Response;

  try {
    response = await fetch(
      `${GITHUB_API_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}${path}`,
      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
        },
        cache: "no-store",
      },
    );
  } catch {
    throw new GitHubSourceError(
      "No se pudo conectar con GitHub desde Content Publisher.",
      "network",
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new GitHubSourceError(
      "GitHub rechazó la credencial de lectura o sus permisos no son suficientes.",
      "unauthorized",
      response.status,
    );
  }

  if (!response.ok) {
    throw new GitHubSourceError(
      `GitHub respondió con HTTP ${response.status} al leer ${allowedRepository}.`,
      "network",
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function listRecentRepositoryCommits(
  repository: string,
  limit = 12,
): Promise<GitHubSourceCommit[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 30);
  return githubGet<GitHubSourceCommit[]>(repository, `/commits?per_page=${safeLimit}`);
}
