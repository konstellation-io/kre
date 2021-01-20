import ROUTE from 'Constants/routes';
import { buildRoute } from './routes';

describe('buildRoute', () => {
  const runtime1 = 'runtime0001';
  const runtime2 = 'some-otherRuntime001naME';
  const version1 = 'version0001';
  const version2 = 'some-otherVersion001naME';

  it('builds runtime routes', () => {
    const expectedRoute1 = `/runtimes/${runtime1}`;
    const expectedRoute2 = `/runtimes/${runtime2}/versions`;

    expect(buildRoute.runtime(ROUTE.RUNTIME, runtime1)).toBe(expectedRoute1);
    expect(buildRoute.runtime(ROUTE.RUNTIME_VERSIONS, runtime2)).toBe(
      expectedRoute2
    );
  });

  it('builds version routes', () => {
    const expectedRoute1 = `/runtimes/${runtime1}/versions/${version1}`;
    const expectedRoute2 = `/runtimes/${runtime1}/versions/${version2}/status`;

    expect(buildRoute.version(ROUTE.RUNTIME_VERSION, runtime1, version1)).toBe(
      expectedRoute1
    );
    expect(
      buildRoute.version(ROUTE.RUNTIME_VERSION_STATUS, runtime1, version2)
    ).toBe(expectedRoute2);
  });
});
