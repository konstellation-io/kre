export function isFieldEmpty(value: string) {
  return value === '' ? 'This field cannot be empty' : false;
}

export function isFieldNotAnString(value: any) {
  return typeof value === 'string' || value instanceof String
    ? false
    : 'Invalid type, field is not a text';
}

export function isFieldAlreadyToken(value: string, values: string[]) {
  return values.includes(value) ? 'This value is already token' : false;
}
