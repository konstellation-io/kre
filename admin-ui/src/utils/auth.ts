import Cookies from 'js-cookie';

export const JWT_COOKIE = '__jwt';

export const isUserAuthenticated = () => {
  const jwt = Cookies.get(JWT_COOKIE);

  return jwt;
};
