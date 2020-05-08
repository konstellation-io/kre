import { AccessLevel } from './graphql/types/globalTypes';
import ROUTE from './constants/routes';

const rules: {
  [key in keyof typeof AccessLevel]: {
    static: string[];
    dynamic?: { [key: string]: (data: object) => boolean };
  };
} = {
  VIEWER: {
    static: []
  },
  MANAGER: {
    static: [
      'audit-page:visit',
      'logs-page:visit',
      'runtime:edit',
      'runtime-add:visit',
      'version:edit',
      'version-add:visit',
      'version-configuration:visit'
    ]
  },
  // TODO: Change this to ADMIN
  ADMINISTRATOR: {
    static: [
      'audit-page:visit',
      'logs-page:visit',
      'runtime:edit',
      'runtime-add:visit',
      'version:edit',
      'version-add:visit',
      'version-configuration:visit',
      'settings:edit',
      'settings-page:visit'
    ]
  }
};

export const pageToRoute = {
  'audit-page': ROUTE.AUDIT,
  'runtime-add': ROUTE.NEW_RUNTIME,
  'settings-page': ROUTE.SETTINGS,
  'version-add': ROUTE.NEW_VERSION,
  'version-configuration': ROUTE.RUNTIME_VERSION_CONFIGURATION
};

export function checkPermission(
  role: AccessLevel,
  action: string,
  data: Object = {}
) {
  const permissions = rules[role];
  if (!permissions) {
    return false;
  }

  const staticPermissions = permissions.static;
  if (staticPermissions && staticPermissions.includes(action)) {
    return true;
  }
  const dynamicPermissions = permissions.dynamic;
  if (dynamicPermissions) {
    const permissionCondition = dynamicPermissions[action];
    if (!permissionCondition) {
      return false;
    }
    return permissionCondition(data);
  }
  return false;
}

export default rules;
