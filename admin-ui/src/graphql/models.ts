enum ErrorCode {
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR'
}

export interface Error {
  code: ErrorCode;
  message: string;
}

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
  workflows: Workflow[];
  configurationVariables: ConfigurationVariable[];
  configurationCompleted: boolean;
}

export type Workflow = {
  name: string;
  nodes: Node[];
  edges: Edge[];
};

export type Edge = {
  id: string;
  fromNode: string;
  toNode: string;
};

export type Node = {
  id: string;
  name?: string;
  status: NodeStatus;
};

export enum ConfigurationVariableType {
  VARIABLE = 'VARIABLE',
  FILE = 'FILE'
}

export interface ConfigurationVariable {
  key: string;
  value: string;
  type: ConfigurationVariableType;
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

export type VersionNodeStatus = {
  date: string;
  nodeId: string;
  status: NodeStatus;
  message: string;
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
  STARTED = 'STARTED',
  STOPPED = 'STOPPED',
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
  UPDATE_SETTING = 'UPDATE_SETTING',
  UPDATE_VERSION_CONFIGURATION = 'UPDATE_VERSION_CONFIGURATION'
}

export type NodeLog = {
  date: string;
  type: LogType;
  versionId: string;
  nodeId: string;
  podId: string;
  message: string;
  level: LogLevel;
};

export enum LogType {
  SYSTEM = 'SYSTEM',
  LEVEL = 'LEVEL'
}

export enum LogLevel {
  INFO = 'INFO'
}
