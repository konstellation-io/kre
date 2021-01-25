export const envVariables: { [variable: string]: unknown } = {};

const config = fetch('/config/config.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(
        `Unexpected status code: ${response.status} getting configuration file`
      );
    }

    return response.json();
  })
  .then(json => {
    Object.entries(json).forEach(
      ([variable, value]) => (envVariables[variable] = value)
    );

    return json;
  });

export default config;
