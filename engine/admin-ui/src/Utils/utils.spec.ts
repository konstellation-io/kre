import ROUTE from 'Constants/routes';
import { buildRoute } from './routes';

describe('buildRoute', () => {
  const version1 = 'version0001';
  const version2 = 'some-otherVersion001naME';

  it('builds version routes', () => {
    const expectedRoute1 = `/versions/${version1}`;
    const expectedRoute2 = `/versions/${version2}/status`;

    expect(buildRoute(ROUTE.VERSION, version1)).toBe(expectedRoute1);
    expect(buildRoute(ROUTE.VERSION_STATUS, version2)).toBe(expectedRoute2);
  });
});
