import { buildNoteDefinition } from "./build-note/definition";

export const publicationArchetypes = [buildNoteDefinition] as const;

export function getArchetypeDefinition(key: string) {
  return publicationArchetypes.find((archetype) => archetype.key === key) ?? null;
}
