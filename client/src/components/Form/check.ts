export function isFieldEmpty(value: string) {
  return value === '' ? 'This field cannot be empty' : false;
}

export function isFieldNotAnString(value: any) {
  return typeof value === 'string' || value instanceof String
    ? false
    : 'Invalid type, field is not a text';
}

export function isEmailNotValid(email: string) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  
  return re.test(String(email).toLowerCase())
    ? false
    : 'Invalid email address';
}
