/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AccessLevel {
  ADMINISTRATOR = 'ADMINISTRATOR',
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
  CREATE_VERSION = 'CREATE_VERSION',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PUBLISH_VERSION = 'PUBLISH_VERSION',
  START_VERSION = 'START_VERSION',
  STOP_VERSION = 'STOP_VERSION',
  UNPUBLISH_VERSION = 'UNPUBLISH_VERSION',
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
}

export interface CreateVersionInput {
  file: any;
  runtimeId: string;
}

export interface PublishVersionInput {
  versionId: string;
  comment: string;
}

export interface SettingsInput {
  authAllowedDomains?: string[] | null;
  authAllowedEmails?: string[] | null;
  sessionLifetimeInDays?: number | null;
}

export interface StartVersionInput {
  versionId: string;
}

export interface StopVersionInput {
  versionId: string;
}

export interface UnpublishVersionInput {
  versionId: string;
}

export interface UpdateConfigurationInput {
  versionId: string;
  configurationVariables: ConfigurationVariablesInput[];
}

//==============================================================
// END Enums and Input Objects
//==============================================================
