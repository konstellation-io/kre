import { loggedIn } from 'Graphql/client/cache';

function useLogin() {
  function login() {
    loggedIn(true);
  }
  function logout() {
    loggedIn(false);
  }

  return {
    login,
    logout
  };
}

export default useLogin;
