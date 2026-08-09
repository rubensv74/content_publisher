import {
  getGitHubSourceConnectionStatus,
  listRecentRepositoryCommits,
} from "@/lib/github-source/client";

import type { SourceSignalAdapter } from "../types";

function firstLine(message: string) {
  return message.split("\n")[0]?.trim() || "Actualización de conocimiento";
}

export const knowledgeBaseSourceAdapter: SourceSignalAdapter = {
  key: "knowledge-base-github",
  sourceType: "knowledge-base",
  async collect() {
    const configuration = getGitHubSourceConnectionStatus();
    const repository = configuration.knowledgeBaseRepository;

    if (!configuration.configured || !repository) {
      return [];
    }

    if (
      !configuration.repositories.some(
        (candidate) => candidate.toLowerCase() === repository.toLowerCase(),
      )
    ) {
      return [];
    }

    const commits = await listRecentRepositoryCommits(repository, 20);

    return commits.map((commit) => ({
      sourceType: "knowledge-base" as const,
      sourceLocator: repository,
      sourceRef: commit.sha,
      fingerprint: `knowledge-base:commit:${repository.toLowerCase()}:${commit.sha}`,
      signalType: "knowledge-change",
      title: firstLine(commit.commit.message),
      summary: "Cambio detectado en la base de conocimiento. El contenido profundo permanece en GitHub y se recuperará solo cuando sea necesario.",
      occurredAt: commit.commit.author?.date ?? commit.commit.committer?.date ?? null,
      metadata: {
        repository,
        sha: commit.sha,
        url: commit.html_url,
        author: commit.commit.author?.name ?? null,
      },
    }));
  },
};
