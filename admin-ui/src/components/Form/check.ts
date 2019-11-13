type Check = {
  valid: boolean;
  message: string;
};
const VALID = { valid: true, message: '' } as Check;
function setInvalid(message: String) {
  return {
    message,
    valid: false
  } as Check;
}

export function getValidationError(validations: Check[]) {
  let errorMessage: string = '';

  for (let idx = 0; idx < validations.length; idx++) {
    const validation = validations[idx];

    if (!validation.valid) {
      errorMessage = validation.message;
      break;
    }
  }

  return errorMessage;
}

export function isFieldNotEmpty(value: string) {
  return value !== '' ? VALID : setInvalid('This field cannot be empty');
}

export function isFieldAnString(value: any) {
  return typeof value === 'string' || value instanceof String
    ? VALID
    : setInvalid('Invalid type, field is not a text');
}

export function isFieldAnInteger(
  value: any | number,
  positive: boolean = false
) {
  const integerValue = parseInt(value);
  const isValid =
    typeof value !== 'boolean' &&
    !isNaN(value) &&
    (positive ? integerValue >= 0 : true);

  return isValid
    ? VALID
    : setInvalid(
        `Invalid type, field is not ${positive ? 'a positive' : 'an'} integer`
      );
}

export function isIntegerWithinRange(value: any, range: number[]) {
  const [minValue, maxValue] = range.sort((a, b) => a - b);
  return value >= minValue && value <= maxValue
    ? VALID
    : setInvalid(
        `Invalid value, must be within the range ${minValue}-${maxValue}`
      );
}

export function isEmailValid(email: string) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  return re.test(String(email).toLowerCase())
    ? VALID
    : setInvalid('Invalid email address');
}

export function isDomainValid(value: string) {
  const re = /([a-z0-9]+\.)*[a-z0-9]+\.[a-z.]+/;

  return re.test(String(value).toLowerCase())
    ? VALID
    : setInvalid('Invalid domain format');
}

export function isMagicLinkTokenValid(token: string) {
  return token.length === 6
    ? VALID
    : setInvalid('Authentication link is not valid');
}
