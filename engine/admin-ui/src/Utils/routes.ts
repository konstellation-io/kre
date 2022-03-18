export const buildRoute = {
  runtime: (route: string, runtimeId: string = ''): string => (
    route.replace(':runtimeId', runtimeId)
  ),
  version: (route: string, runtimeId: string = '', versionName: string = ''): string => (
    route
      .replace(':runtimeId', runtimeId)
      .replace(':versionName', versionName)
  )
};

