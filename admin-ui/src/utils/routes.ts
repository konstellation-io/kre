// TODO: use this function everywhere
export const buildRoute = {
  runtime: function(route: string, runtimeId: string = ''): string {
    return route.replace(':runtimeId', runtimeId);
  },
  version: function(
    route: string,
    runtimeId: string = '',
    versionId: string = ''
  ): string {
    return route
      .replace(':runtimeId', runtimeId)
      .replace(':versionId', versionId);
  }
};
