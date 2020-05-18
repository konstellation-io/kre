import { AccessLevel } from './graphql/types/globalTypes';

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
      'runtime-add-page:visit',
      'version:edit',
      'version-add-page:visit',
      'version-config-page:visit'
    ]
  },
  ADMIN: {
    static: [
      'audit-page:visit',
      'logs-page:visit',
      'runtime:edit',
      'runtime-add-page:visit',
      'version:edit',
      'version-add-page:visit',
      'version-config-page:visit',
      'settings:edit',
      'settings-page:visit'
    ]
  }
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
