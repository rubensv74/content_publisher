alter table public.suggestions
  add column if not exists topic text,
  add column if not exists story_draft jsonb;

alter table public.suggestions
  add constraint suggestions_topic_length_valid
    check (topic is null or char_length(topic) <= 100),
  add constraint suggestions_story_draft_object_valid
    check (story_draft is null or jsonb_typeof(story_draft) = 'object');

comment on column public.suggestions.topic is
  'Editorial topic proposed by the assisted ChatGPT workflow. Internal source labels must not be stored here.';

comment on column public.suggestions.story_draft is
  'Structured STORY draft proposed from source-backed evidence. Unsupported blocks remain null and are reviewed by the user before publication.';
