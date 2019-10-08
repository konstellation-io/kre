import { isUserAuthenticated, JWT_COOKIE } from './auth';

it('reads session cookie', () => {
  expect(isUserAuthenticated()).toBeFalsy();

  Object.defineProperty(window.document, 'cookie', {
    writable: true,
    value: 'otherCookie=123456',
  });
  expect(isUserAuthenticated()).toBeFalsy();

  Object.defineProperty(window.document, 'cookie', {
    writable: true,
    value: `${JWT_COOKIE}=123456`,
  });
  expect(isUserAuthenticated()).not.toBeFalsy();
});
