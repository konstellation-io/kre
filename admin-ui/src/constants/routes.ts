export const HOME = '/';
export const LOGIN = '/login';
export const VERIFY_EMAIL = '/verify_email';
export const MAGIC_LINK = '/signin/:token';
export const DASHBOARD = '/dashboard';

export const RUNTIME = `${DASHBOARD}/runtime/:runtimeId`;
export const RUNTIME_STATUS = `${DASHBOARD}/runtime/:runtimeId/status`;
export const RUNTIME_VERSIONS = `${DASHBOARD}/runtime/:runtimeId/versions`;

export const SETTINGS = '/settings';
export const SETTINGS_GENERAL = `${SETTINGS}/general`;
export const SETTINGS_SECURITY = `${SETTINGS}/security`;
export const SETTINGS_AUDIT = `${SETTINGS}/audit`;

export const NEW_RUNTIME = '/new-runtime';
export const NEW_VERSION = `${DASHBOARD}/runtime/:runtimeId/versions/new_version`;
