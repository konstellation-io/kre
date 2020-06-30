export function registerMany(register: Function, fields: string[]) {
  fields.forEach(f => register({ name: f }));
}

export function unregisterMany(unregister: Function, fields: string[]) {
  fields.forEach(f => unregister(f));
}
