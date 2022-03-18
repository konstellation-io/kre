import ROUTE from 'Constants/routes';
import { buildRoute } from './routes';

describe('buildRoute', () => {
  const runtime = 'runtime001'
  const version1 = 'version0001';
  const version2 = 'some-otherVersion001naME';

  it('builds version routes', () => {
    const expectedRoute1 = `/runtimes/${runtime}/versions/${version1}`;
    const expectedRoute2 = `/runtimes/${runtime}/versions/${version2}/status`;

    expect(buildRoute.version(ROUTE.VERSION, runtime,version1)).toBe(expectedRoute1);
    expect(buildRoute.version(ROUTE.VERSION_STATUS, runtime, version2)).toBe(expectedRoute2);
  });
});
