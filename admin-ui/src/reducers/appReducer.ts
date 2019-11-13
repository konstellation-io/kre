interface AppState {}

const initialState: AppState = {};

export function appReducer(state = initialState, action: string): AppState {
  return state;
}
