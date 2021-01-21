const VERSIONS = `/versions`;
const VERSION = `${VERSIONS}/:versionId`;
const SETTINGS = '/settings';
const ROUTE = {
  HOME: '/',
  LOGIN: '/login',
  VERIFY_EMAIL: '/verify_email',
  MAGIC_LINK: '/signin/:token',
  SETTINGS: '/settings',
  SETTINGS_GENERAL: `${SETTINGS}/general`,
  SETTINGS_SECURITY: `${SETTINGS}/security`,
  USERS: '/users',
  AUDIT: '/audit',
  LOGS: '/logs/:logTabInfo',
  PROFILE: '/profile',
  VERSIONS,
  VERSION,
  VERSION_STATUS: `${VERSION}/status`,
  VERSION_CONFIGURATION: `${VERSION}/configuration`,
  VERSION_METRICS: `${VERSION}/metrics`,
  VERSION_DOCUMENTATION: `${VERSION}/documentation`,
  NEW_USER: '/new-user',
  NEW_API_TOKEN: `/new_api_token`,
  NEW_VERSION: `/new_version`
};

export interface VersionRouteParams {
  versionId: string;
}

export default ROUTE;
