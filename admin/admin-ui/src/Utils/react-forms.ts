export function registerMany(register: Function, fields: string[]) {
  fields.forEach(name => register({ name }));
}

export function unregisterMany(unregister: Function, fields: string[]) {
  fields.forEach(name => unregister(name));
}
