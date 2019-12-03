import { Moment, isMoment } from 'moment';

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

export function isDefined(value: any) {
  return [null, undefined].includes(value)
    ? setInvalid('This field is mandatory')
    : VALID;
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

export function isGreaterThan(value: any, minValue: number) {
  return value >= minValue
    ? VALID
    : setInvalid(`Invalid value, ${value} must be greater than ${minValue}`);
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
  const re = new RegExp(
    /^((?:(?:(?:\w[.\-+]?)*)\w)+)((?:(?:(?:\w[.\-+]?){0,62})\w)+)\.(\w{2,6})$/
  );

  return re.test(value) ? VALID : setInvalid('Invalid domain format');
}

export function isFieldInList(
  value: string,
  list: string[],
  optional: boolean = false
) {
  return list.includes(value) || (optional && value === null)
    ? VALID
    : setInvalid(`Value must be in list: ${list}`);
}

export function isFieldAMomentDate(value: Moment, optional: boolean = false) {
  return isMoment(value) || (optional && value === null)
    ? VALID
    : setInvalid(`Value is not a Date`);
}
