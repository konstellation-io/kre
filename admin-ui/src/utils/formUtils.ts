export function mutationPayloadHelper<Params>(params: Params) {
  return {
    variables: {
      input: {
        ...params
      }
    }
  };
}
export function queryPayloadHelper<Params>(params: Params) {
  return {
    ...params
  };
}
