import {
  getRepositoryCommit,
  getRepositoryMarkdownFile,
} from "@/lib/github-source/client";

import type {
  SuggestionModelSignal,
  SuggestionSignalContext,
} from "./types";

export const MAX_ENRICHED_SIGNALS_PER_RUN = 6;
const MAX_CHANGED_FILES = 12;
const MAX_MARKDOWN_DOCUMENTS = 2;
const MAX_MARKDOWN_CHARS = 2_400;

export interface SourceContextResolver {
  readonly key: string;
  supports(signal: SuggestionModelSignal): boolean;
  resolve(signal: SuggestionModelSignal): Promise<SuggestionSignalContext | null>;
}

function isSensitivePath(path: string) {
  const normalized = path.toLowerCase();
  const segments = normalized.split("/");

  return segments.some(
    (segment) =>
      segment === ".env" ||
      segment.startsWith(".env.") ||
      /(?:secret|credential|password|private[-_]?key|access[-_]?token)/.test(segment),
  );
}

function isMarkdown(path: string) {
  return /\.(?:md|mdx)$/i.test(path);
}

function redactPotentialSecrets(value: string) {
  return value
    .replace(
      /-----BEGIN [^-\n]*PRIVATE KEY-----[\s\S]*?-----END [^-\n]*PRIVATE KEY-----/gi,
      "[REDACTED_PRIVATE_KEY]",
    )
    .replace(/\b(?:github_pat_|ghp_|sk-)[A-Za-z0-9_-]{12,}\b/g, "[REDACTED_TOKEN]")
    .replace(
      /((?:api[_-]?key|token|secret|password)\s*[:=]\s*)[^\s"'`]+/gi,
      "$1[REDACTED]",
    )
    .replace(/\u0000/g, "");
}

const githubCommitContextResolver: SourceContextResolver = {
  key: "github-commit-context",

  supports(signal) {
    return signal.sourceType === "github" || signal.sourceType === "knowledge-base";
  },

  async resolve(signal) {
    const commit = await getRepositoryCommit(signal.sourceLocator, signal.sourceRef);
    const safeFiles = (commit.files ?? []).filter(
      (file) => !isSensitivePath(file.filename),
    );
    const changedFiles = safeFiles.slice(0, MAX_CHANGED_FILES).map((file) => ({
      path: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
    }));

    const documentation: SuggestionSignalContext["documentation"] = [];
    const markdownCandidates = safeFiles
      .filter((file) => isMarkdown(file.filename))
      .slice(0, MAX_MARKDOWN_DOCUMENTS);

    for (const file of markdownCandidates) {
      try {
        const content = await getRepositoryMarkdownFile({
          repository: signal.sourceLocator,
          path: file.filename,
          ref: signal.sourceRef,
          maxBytes: MAX_MARKDOWN_CHARS * 2,
        });

        if (!content) continue;

        const excerpt = redactPotentialSecrets(content)
          .replace(/\r\n/g, "\n")
          .trim()
          .slice(0, MAX_MARKDOWN_CHARS);

        if (excerpt) {
          documentation.push({ path: file.filename, excerpt });
        }
      } catch {
        // El enriquecimiento es best-effort: una lectura fallida no invalida la señal ligera.
      }
    }

    return {
      kind: "source-commit",
      repository: signal.sourceLocator,
      commitMessage: redactPotentialSecrets(commit.commit.message).slice(0, 2_000),
      changeStats: {
        additions: commit.stats?.additions ?? 0,
        deletions: commit.stats?.deletions ?? 0,
        filesChanged: commit.files?.length ?? 0,
      },
      changedFiles,
      documentation,
      truncated:
        safeFiles.length > MAX_CHANGED_FILES ||
        safeFiles.filter((file) => isMarkdown(file.filename)).length >
          MAX_MARKDOWN_DOCUMENTS,
    };
  },
};

const resolvers: SourceContextResolver[] = [githubCommitContextResolver];

export async function enrichSuggestionSignals(signals: SuggestionModelSignal[]) {
  const enriched: SuggestionModelSignal[] = [];
  let enrichedCount = 0;

  for (const signal of signals) {
    const resolver = resolvers.find((candidate) => candidate.supports(signal));

    if (!resolver || enrichedCount >= MAX_ENRICHED_SIGNALS_PER_RUN) {
      enriched.push(signal);
      continue;
    }

    try {
      const context = await resolver.resolve(signal);
      if (context) {
        enriched.push({ ...signal, context });
        enrichedCount += 1;
      } else {
        enriched.push(signal);
      }
    } catch {
      enriched.push(signal);
    }
  }

  return {
    signals: enriched,
    enrichedCount,
  };
}
