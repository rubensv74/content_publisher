import {
  BufferApiError,
  bufferGraphQL,
  isBufferConfigured,
} from "./client";

const ORGANIZATIONS_QUERY = `
  query GetOrganizations {
    account {
      id
      email
      name
      organizations {
        id
        name
        ownerEmail
      }
    }
  }
`;

const CHANNELS_QUERY = `
  query GetChannels($organizationId: OrganizationId!) {
    channels(input: { organizationId: $organizationId }) {
      id
      name
      displayName
      service
      avatar
      isQueuePaused
      isDisconnected
      isLocked
      timezone
    }
  }
`;

export type BufferOrganization = {
  id: string;
  name: string;
  ownerEmail?: string | null;
};

export type BufferChannel = {
  id: string;
  name: string;
  displayName?: string | null;
  service: string;
  avatar?: string | null;
  isQueuePaused?: boolean;
  isDisconnected?: boolean;
  isLocked?: boolean;
  timezone?: string;
  organizationId: string;
  organizationName: string;
};

export type BufferConnectionStatus = {
  configured: boolean;
  connected: boolean;
  account?: {
    id: string;
    email: string;
    name?: string | null;
  };
  organizations: BufferOrganization[];
  linkedinChannels: BufferChannel[];
  error?: string;
};

type OrganizationsResponse = {
  account: {
    id: string;
    email: string;
    name?: string | null;
    organizations: BufferOrganization[];
  };
};

type ChannelsResponse = {
  channels: Array<Omit<BufferChannel, "organizationId" | "organizationName">>;
};

export async function getBufferConnectionStatus(): Promise<BufferConnectionStatus> {
  if (!isBufferConfigured()) {
    return {
      configured: false,
      connected: false,
      organizations: [],
      linkedinChannels: [],
    };
  }

  try {
    const accountData = await bufferGraphQL<OrganizationsResponse>(
      ORGANIZATIONS_QUERY,
    );

    const channelGroups = await Promise.all(
      accountData.account.organizations.map(async (organization) => {
        const data = await bufferGraphQL<
          ChannelsResponse,
          { organizationId: string }
        >(CHANNELS_QUERY, { organizationId: organization.id });

        return data.channels.map((channel) => ({
          ...channel,
          organizationId: organization.id,
          organizationName: organization.name,
        }));
      }),
    );

    const linkedinChannels = channelGroups
      .flat()
      .filter((channel) => channel.service === "linkedin");

    return {
      configured: true,
      connected: true,
      account: {
        id: accountData.account.id,
        email: accountData.account.email,
        name: accountData.account.name,
      },
      organizations: accountData.account.organizations,
      linkedinChannels,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      organizations: [],
      linkedinChannels: [],
      error:
        error instanceof BufferApiError
          ? error.message
          : "No se pudo comprobar la conexión con Buffer.",
    };
  }
}
