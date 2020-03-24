import { Moment, isMoment } from 'moment';

type Check = {
  valid: boolean;
  message: string;
};
const VALID = { valid: true, message: '' } as Check;
function setInvalid(message: string) {
  return {
    message,
    valid: false
  } as Check;
}

export function getValidationError(validations: Check[]): string | boolean {
  let errorMessage: string | boolean = true;

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

export function isLengthAllowed(value: string, maxLength: number) {
  return value.length > maxLength
    ? setInvalid(`This field cannot be longer than ${maxLength}`)
    : VALID;
}

export function isFieldAnInteger(value: string, positive: boolean = false) {
  const integerValue = parseInt(value);
  const isValid =
    !Number.isNaN(integerValue) && (positive ? integerValue >= 0 : true);

  return isValid
    ? VALID
    : setInvalid(
        `Invalid type, field is not ${positive ? 'a positive' : 'an'} integer`
      );
}

export function isGreaterThan(value: number | string, minValue: number) {
  return value >= minValue
    ? VALID
    : setInvalid(`Invalid value, ${value} must be greater than ${minValue}`);
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

export function isFieldNotInList(
  value: string,
  list: string[],
  optional: boolean = false,
  message?: string
) {
  return list.includes(value) || (optional && !value)
    ? VALID
    : setInvalid(message || `Value must be in list: ${list}`);
}

export function isFieldAMomentDate(value: Moment, optional: boolean = false) {
  return isMoment(value) || (optional && !value)
    ? VALID
    : setInvalid(`Value is not a Date`);
}

export function isItemDuplicated(
  newItem: string,
  items: string[],
  itemName: string = 'item'
) {
  const valid = !items.includes(newItem);
  const msg = valid ? '' : `Duplicated ${itemName}`;
  return { valid, message: msg };
}
