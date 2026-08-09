import {
  getGitHubSourceConnectionStatus,
  listRecentRepositoryCommits,
} from "@/lib/github-source/client";

import type { SourceSignalAdapter, SourceSignalCandidate } from "../types";

function firstLine(message: string) {
  return message.split("\n")[0]?.trim() || "Cambio en repositorio";
}

function summaryFromMessage(message: string) {
  const [, ...rest] = message.split("\n");
  const summary = rest.join(" ").trim().replace(/\s+/g, " ");
  return summary ? summary.slice(0, 360) : null;
}

export const githubSourceAdapter: SourceSignalAdapter = {
  key: "github-repositories",
  sourceType: "github",
  async collect() {
    const configuration = getGitHubSourceConnectionStatus();

    if (!configuration.configured) {
      return [];
    }

    const knowledgeBase = configuration.knowledgeBaseRepository?.toLowerCase() ?? null;
    const repositories = configuration.repositories.filter(
      (repository) => repository.toLowerCase() !== knowledgeBase,
    );
    const candidates: SourceSignalCandidate[] = [];

    for (const repository of repositories) {
      const commits = await listRecentRepositoryCommits(repository);

      for (const commit of commits) {
        candidates.push({
          sourceType: "github",
          sourceLocator: repository,
          sourceRef: commit.sha,
          fingerprint: `github:commit:${repository.toLowerCase()}:${commit.sha}`,
          signalType: "repository-commit",
          title: firstLine(commit.commit.message),
          summary: summaryFromMessage(commit.commit.message),
          occurredAt: commit.commit.author?.date ?? commit.commit.committer?.date ?? null,
          metadata: {
            repository,
            sha: commit.sha,
            url: commit.html_url,
            author: commit.commit.author?.name ?? null,
          },
        });
      }
    }

    return candidates;
  },
};
