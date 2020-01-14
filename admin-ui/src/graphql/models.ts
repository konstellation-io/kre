export interface User {
  email: string;
}

export interface UserActivityVar {
  key: string;
  value: string;
}

export interface UserActivity {
  id: string;
  user: User;
  date: string;
  type: string;
  vars: UserActivityVar[];
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

export enum UserActivityType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE_RUNTIME = 'CREATE_RUNTIME',
  CREATE_VERSION = 'CREATE_VERSION',
  ACTIVATE_VERSION = 'ACTIVATE_VERSION',
  DEACTIVATE_VERSION = 'DEACTIVATE_VERSION',
  STOP_VERSION = 'STOP_VERSION',
  DEPLOY_VERSION = 'DEPLOY_VERSION',
  UPDATE_GENERAL_SETTINGS = 'UPDATE_GENERAL_SETTINGS',
  UPDATE_SECURITY_SETTINGS = 'UPDATE_SECURITY_SETTINGS',
  UPDATE_VERSION_CONFIGURATION = 'UPDATE_VERSION_CONFIGURATION'
}
