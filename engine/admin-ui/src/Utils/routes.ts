export const buildRoute = (route: string, versionName: string = ''): string =>
  route.replace(':versionName', versionName);
