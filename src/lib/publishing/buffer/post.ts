import { BufferApiError, bufferGraphQL } from "./client";

const CREATE_POST_MUTATION = `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      __typename
      ... on PostActionSuccess {
        post {
          id
          dueAt
          externalLink
          status
          shareMode
        }
      }
      ... on MutationError {
        message
      }
    }
  }
`;

const DELETE_POST_MUTATION = `
  mutation DeletePost($input: DeletePostInput!) {
    deletePost(input: $input) {
      __typename
      ... on DeletePostSuccess {
        id
      }
      ... on VoidMutationError {
        message
      }
    }
  }
`;

export type BufferPublishAction = "publish-now" | "schedule" | "draft";

export type BufferPublishMedia =
  | {
      kind: "image";
      url: string;
    }
  | {
      kind: "document";
      url: string;
      thumbnailUrl: string;
      title: string;
    };

export type BufferCreatePostInput = {
  channelId: string;
  text: string;
  action: BufferPublishAction;
  scheduledFor?: string;
  media: BufferPublishMedia;
};

export type BufferCreatedPost = {
  id: string;
  dueAt?: string | null;
  externalLink?: string | null;
  status?: string;
  shareMode?: string;
};

type CreatePostPayload = {
  createPost: {
    __typename: string;
    post?: BufferCreatedPost;
    message?: string;
  };
};

type DeletePostPayload = {
  deletePost: {
    __typename: string;
    id?: string;
    message?: string;
  };
};

function buildAsset(media: BufferPublishMedia) {
  if (media.kind === "image") {
    return {
      image: {
        url: media.url,
      },
    };
  }

  return {
    document: {
      url: media.url,
      thumbnailUrl: media.thumbnailUrl,
      title: media.title,
    },
  };
}

function buildScheduling(input: BufferCreatePostInput) {
  if (input.action === "publish-now") {
    return {
      mode: "shareNow",
      saveToDraft: false,
    };
  }

  if (input.action === "draft") {
    return {
      mode: "addToQueue",
      saveToDraft: true,
    };
  }

  if (!input.scheduledFor) {
    throw new BufferApiError(
      "La publicación programada necesita una fecha y hora.",
      "graphql",
    );
  }

  return {
    mode: "customScheduled",
    dueAt: input.scheduledFor,
    saveToDraft: false,
  };
}

export async function createBufferPost(
  input: BufferCreatePostInput,
): Promise<BufferCreatedPost> {
  const scheduling = buildScheduling(input);
  const data = await bufferGraphQL<
    CreatePostPayload,
    { input: Record<string, unknown> }
  >(CREATE_POST_MUTATION, {
    input: {
      text: input.text,
      channelId: input.channelId,
      schedulingType: "automatic",
      assets: [buildAsset(input.media)],
      source: "content-publisher",
      ...scheduling,
    },
  });

  if (!data.createPost.post) {
    throw new BufferApiError(
      data.createPost.message ||
        `Buffer rechazó la publicación (${data.createPost.__typename}).`,
      "graphql",
    );
  }

  return data.createPost.post;
}

export async function deleteBufferPost(postId: string): Promise<string> {
  const data = await bufferGraphQL<
    DeletePostPayload,
    { input: { id: string } }
  >(DELETE_POST_MUTATION, {
    input: { id: postId },
  });

  if (!data.deletePost.id) {
    throw new BufferApiError(
      data.deletePost.message ||
        `Buffer no pudo eliminar el post (${data.deletePost.__typename}).`,
      "graphql",
    );
  }

  return data.deletePost.id;
}
