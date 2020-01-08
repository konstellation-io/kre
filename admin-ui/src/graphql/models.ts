export interface User {
  email: string;
}

export interface UserActivity {
  id: string;
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
  status: VersionStatus;
}

export interface Runtime {
  id: string;
  name: string;
  status: RuntimeStatus;
  creationDate: string;
  activeVersion: Version;
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

export enum RuntimeStatus {
  CREATING = 'CREATING',
  RUNNING = 'RUNNING',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN'
}

export enum VersionStatus {
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED'
}

export enum VersionEnvStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR'
}

export enum NodeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR'
}
