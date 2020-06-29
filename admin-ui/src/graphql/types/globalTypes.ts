/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AccessLevel {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  VIEWER = 'VIEWER'
}

export enum ConfigurationVariableType {
  FILE = 'FILE',
  VARIABLE = 'VARIABLE'
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  ERROR = 'ERROR',
  INFO = 'INFO',
  WARN = 'WARN'
}

export enum NodeStatus {
  ERROR = 'ERROR',
  STARTED = 'STARTED',
  STOPPED = 'STOPPED'
}

export enum RuntimeStatus {
  CREATING = 'CREATING',
  ERROR = 'ERROR',
  STARTED = 'STARTED'
}

export enum UserActivityType {
  CREATE_RUNTIME = 'CREATE_RUNTIME',
  CREATE_USER = 'CREATE_USER',
  CREATE_VERSION = 'CREATE_VERSION',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PUBLISH_VERSION = 'PUBLISH_VERSION',
  REMOVE_USERS = 'REMOVE_USERS',
  REVOKE_SESSIONS = 'REVOKE_SESSIONS',
  START_VERSION = 'START_VERSION',
  STOP_VERSION = 'STOP_VERSION',
  UNPUBLISH_VERSION = 'UNPUBLISH_VERSION',
  UPDATE_ACCESS_LEVELS = 'UPDATE_ACCESS_LEVELS',
  UPDATE_SETTING = 'UPDATE_SETTING',
  UPDATE_VERSION_CONFIGURATION = 'UPDATE_VERSION_CONFIGURATION'
}

export enum VersionStatus {
  PUBLISHED = 'PUBLISHED',
  STARTED = 'STARTED',
  STARTING = 'STARTING',
  STOPPED = 'STOPPED'
}

export interface ConfigurationVariablesInput {
  key: string;
  value: string;
}

export interface CreateRuntimeInput {
  name: string;
  description: string;
}

export interface CreateUserInput {
  email: string;
  accessLevel: AccessLevel;
}

export interface CreateVersionInput {
  file: any;
  runtimeId: string;
}

export interface LogFilters {
  startDate: string;
  endDate?: string | null;
  search?: string | null;
  levels?: LogLevel[] | null;
  nodeIds?: string[] | null;
}

export interface PublishVersionInput {
  versionId: string;
  comment: string;
}

export interface SettingsInput {
  authAllowedDomains?: string[] | null;
  sessionLifetimeInDays?: number | null;
}

export interface StartVersionInput {
  versionId: string;
  comment: string;
}

export interface StopVersionInput {
  versionId: string;
  comment: string;
}

export interface UnpublishVersionInput {
  versionId: string;
  comment: string;
}

export interface UpdateAccessLevelInput {
  userIds: string[];
  accessLevel: AccessLevel;
  comment: string;
}

export interface UpdateConfigurationInput {
  versionId: string;
  configurationVariables: ConfigurationVariablesInput[];
}

export interface UsersInput {
  userIds: string[];
  comment: string;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
