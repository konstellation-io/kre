export interface User {
  email: string;
}

export interface Version {
  description: string;
  versionNumber: string;
  creationDate: string;
  creatorName: string;
  activationDate: string;
  activationAuthor: string;
  status: string;
}

export interface Runtime {
  id: string;
  name: string;
  status: string;
  creationDate: string;
  versions: Version[];
}

export interface Alert {
  type: string;
  message: string;
  runtime: Runtime;
}

export interface Dashboard {
  runtimes: Runtime[];
  alerts: Alert[];
}

export type Settings = {
  authAllowedDomains?: string[];
  cookieExpirationTime?: number;
};
