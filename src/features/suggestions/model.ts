import { openAISuggestionModel } from "@/lib/ai/openai/suggestion-model";

import type { SuggestionModel } from "./types";

export const suggestionModel: SuggestionModel = openAISuggestionModel;
