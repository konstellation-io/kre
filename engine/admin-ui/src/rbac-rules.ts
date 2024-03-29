import { AccessLevel } from 'Graphql/types/globalTypes';

const VIEWER_RULES = ['logs:view'];

const MANAGER_RULES = [
  ...VIEWER_RULES,
  'audit:view',
  'runtime:edit',
  'version:edit'
];

const ADMIN_RULES = [...MANAGER_RULES, 'settings:edit', 'users:edit'];

const rules: {
  [key in keyof typeof AccessLevel]: {
    static: string[];
    dynamic?: { [key: string]: (data: object) => boolean };
  };
} = {
  VIEWER: {
    static: VIEWER_RULES
  },
  MANAGER: {
    static: MANAGER_RULES
  },
  ADMIN: {
    static: ADMIN_RULES
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
