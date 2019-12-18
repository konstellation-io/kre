export interface User {
  email: string;
}

export interface UserActivity {
  user: User;
  message: string;
  date: string;
  type: string;
}

export interface Version {
  id: string;
  description: string;
  name: string;
  creationDate: string;
  creationAuthor: User;
  activationDate: string;
  activationAuthor: User;
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

export type Settings = {
  authAllowedDomains?: string[];
  sessionLifetimeInDays?: number;
};
