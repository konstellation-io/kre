export const buildRoute = (route: string, versionId: string = ''): string =>
  route.replace(':versionId', versionId);
