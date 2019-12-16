import * as ACTION_TYPE from '../constants/actionTypes';

export interface AppState {
  loggedIn: boolean;
}

const initialState: AppState = {
  loggedIn: false
};

export function appReducer(
  state = initialState,
  action: { [key: string]: any }
): AppState {
  switch (action.type) {
    case ACTION_TYPE.LOGIN:
      return {
        ...state,
        loggedIn: true
      };
    case ACTION_TYPE.LOGOUT:
      return {
        ...state,
        loggedIn: false
      };
    default:
      return state;
  }
}
