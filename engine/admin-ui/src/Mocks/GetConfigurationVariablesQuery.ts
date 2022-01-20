import { version } from './version';


export default {
  version: {
    id: version.id,
    status: version.status,
    config: {
      vars: [
        {
          key: "ODIO",
          value: "Unde eaque autem corrupti vero ex voluptatum.",
          type: "FILE",
          __typename: "ConfigurationVariable"
        }],
      __typename: "VersionConfig"
    },
    __typename: "Version"
  }
}
