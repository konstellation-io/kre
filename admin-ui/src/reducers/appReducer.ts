interface AppState {}

const initialState: AppState = {};

export function appReducer(
  state = initialState,
  action: { [key: string]: any }
): AppState {
  switch (action.type) {
    default:
      return state;
  }
}
