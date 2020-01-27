export const HOME = '/';
export const LOGIN = '/login';
export const VERIFY_EMAIL = '/verify_email';
export const MAGIC_LINK = '/signin/:token';
export const DASHBOARD = '/dashboard';

export const RUNTIME = `${DASHBOARD}/runtime/:runtimeId`;

export const RUNTIME_VERSION = `${RUNTIME}/version/:versionId`;
export const RUNTIME_VERSION_STATUS = `${RUNTIME_VERSION}/status`;
export const RUNTIME_VERSION_CONFIGURATION = `${RUNTIME_VERSION}/configuration`;

export const SETTINGS = '/settings';
export const SETTINGS_GENERAL = `${SETTINGS}/general`;
export const SETTINGS_SECURITY = `${SETTINGS}/security`;

export const AUDIT = '/audit';

export const NEW_RUNTIME = '/new-runtime';
export const NEW_VERSION = `${DASHBOARD}/runtime/:runtimeId/versions/new_version`;
