import gql from 'graphql-tag';

export const GET_RUNTIME = gql`
  query GetRuntime($runtimeId: ID!) {
    runtime(id: $runtimeId) {
      name
      versions(status: "active") {
        versionNumber
        creationDate
        creatorName
        activationDate
        activatorName
      }
    }
  }
`;

type Version = {
  status: string;
  version: string;
  created: string;
  activated: string;
};
type Runtime = {
  name: string;
  activeVersion: Version;
};

function formatRuntime(runtime: any) {
  return {
    name: runtime.name,
    activeVersion: {
      version: runtime.versions[0].versionNumber,
      created: runtime.versions[0].creationDate,
      activated: runtime.versions[0].activationDate,
      status: 'active'
    } as Version
  } as Runtime;
}

type SidebarData = {
  title: string;
  status: string;
  version: string;
  created: string;
  activated: string;
};
export function formatSidebarData(data: any): SidebarData {
  const runtimeData = formatRuntime(data) as Runtime;
  return {
    ...runtimeData.activeVersion,
    title: runtimeData.name
  };
}
