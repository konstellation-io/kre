import * as CHECK from './check';

test('if isFieldNotEmpty makes correct validations', () => {
  const empty = CHECK.isFieldNotEmpty('');
  const oneCharacter = CHECK.isFieldNotEmpty('a');
  // @ts-ignore
  const numberZero = CHECK.isFieldNotEmpty(0);
  // @ts-ignore
  const nullContent = CHECK.isFieldNotEmpty(null);
  // @ts-ignore
  const undefinedContent = CHECK.isFieldNotEmpty(null);

  expect(empty.valid).toBeFalsy();

  expect(oneCharacter.valid).toBeTruthy();
  expect(nullContent.valid).toBeTruthy();
  expect(undefinedContent.valid).toBeTruthy();
  expect(numberZero.valid).toBeTruthy();
});

test('if isFieldAnString makes correct validations', () => {
  const numberInput = CHECK.isFieldAnString(1);
  const stringInput = CHECK.isFieldAnString('a');
  const functionInput = CHECK.isFieldAnString(function() {});
  const booleanInput = CHECK.isFieldAnString(false);

  expect(functionInput.valid).toBeFalsy();
  expect(booleanInput.valid).toBeFalsy();
  expect(numberInput.valid).toBeFalsy();

  expect(stringInput.valid).toBeTruthy();
});

test('if isFieldAnInteger makes correct validations', () => {
  const numberInput = CHECK.isFieldAnInteger(1);
  const negativeNumberInput = CHECK.isFieldAnInteger(-50);
  const positiveNumberInput = CHECK.isFieldAnInteger(50);
  const bigNumberInput = CHECK.isFieldAnInteger(9999999999);
  const tinyNumberInput = CHECK.isFieldAnInteger(0.00000001);
  const stringInput = CHECK.isFieldAnInteger('a');
  const functionInput = CHECK.isFieldAnInteger(function() {});
  const booleanInput = CHECK.isFieldAnInteger(false);

  const negativeNumberInputWithPositiveCheck = CHECK.isFieldAnInteger(
    -50,
    true
  );
  const positiveNumberInputWithPositiveCheck = CHECK.isFieldAnInteger(50, true);

  expect(functionInput.valid).toBeFalsy();
  expect(booleanInput.valid).toBeFalsy();
  expect(stringInput.valid).toBeFalsy();
  expect(negativeNumberInputWithPositiveCheck.valid).toBeFalsy();

  expect(numberInput.valid).toBeTruthy();
  expect(negativeNumberInput.valid).toBeTruthy();
  expect(positiveNumberInput.valid).toBeTruthy();
  expect(bigNumberInput.valid).toBeTruthy();
  expect(tinyNumberInput.valid).toBeTruthy();
  expect(positiveNumberInputWithPositiveCheck.valid).toBeTruthy();
});

test('if isIntegerWithinRange makes correct validations', () => {
  const integerWithinSmallRange = CHECK.isIntegerWithinRange(5, [3, 7]);
  const integerWithinBigRange = CHECK.isIntegerWithinRange(5, [0, 99999]);
  const integerSameAsRange = CHECK.isIntegerWithinRange(5, [5, 5]);
  const integerSameAsRangeBorder = CHECK.isIntegerWithinRange(5, [0, 5]);
  const integerWithinRangeNegative = CHECK.isIntegerWithinRange(-5, [-3, -7]);
  const integerOutsideRange = CHECK.isIntegerWithinRange(5, [0, 4]);

  expect(integerOutsideRange.valid).toBeFalsy();

  expect(integerWithinSmallRange.valid).toBeTruthy();
  expect(integerWithinBigRange.valid).toBeTruthy();
  expect(integerSameAsRange.valid).toBeTruthy();
  expect(integerSameAsRangeBorder.valid).toBeTruthy();
  expect(integerWithinRangeNegative.valid).toBeTruthy();
});

test('if isEmailValid makes correct validations', () => {
  const validEmail1 = CHECK.isEmailValid('mariano@intelygenz.com');
  const validEmail2 = CHECK.isEmailValid('a__something-2@google.de');
  const invalidEmail1 = CHECK.isEmailValid('mariano@intelygenz');
  const invalidEmail2 = CHECK.isEmailValid('mariano@.com');
  const invalidEmail3 = CHECK.isEmailValid('@intelygenz.com');

  expect(invalidEmail1.valid).toBeFalsy();
  expect(invalidEmail2.valid).toBeFalsy();
  expect(invalidEmail3.valid).toBeFalsy();

  expect(validEmail1.valid).toBeTruthy();
  expect(validEmail2.valid).toBeTruthy();
});

test('if isDomainValid makes correct validations', () => {
  const validDomain1 = CHECK.isDomainValid('mariano.intelygenz');
  const validDomain2 = CHECK.isDomainValid('i.n.t.e.l.y.g.e.n.z');
  const invalidDomain1 = CHECK.isDomainValid('intelygenz');
  const invalidDomain2 = CHECK.isDomainValid('intelygenz.');
  const invalidDomain3 = CHECK.isDomainValid('domain@intelygenz');

  expect(invalidDomain1.valid).toBeFalsy();
  expect(invalidDomain2.valid).toBeFalsy();
  expect(invalidDomain3.valid).toBeFalsy();

  expect(validDomain1.valid).toBeTruthy();
  expect(validDomain2.valid).toBeTruthy();
});

test('if isMagicLinkTokenValid makes correct validations', () => {
  const validToken = CHECK.isMagicLinkTokenValid('123456');
  const invalidToken1 = CHECK.isMagicLinkTokenValid('');
  const invalidToken2 = CHECK.isMagicLinkTokenValid('12345');
  const invalidToken3 = CHECK.isMagicLinkTokenValid('1234567');
  const invalidToken4 = CHECK.isMagicLinkTokenValid('adlshfjgdsc');

  expect(invalidToken1.valid).toBeFalsy();
  expect(invalidToken2.valid).toBeFalsy();
  expect(invalidToken3.valid).toBeFalsy();
  expect(invalidToken4.valid).toBeFalsy();

  expect(validToken.valid).toBeTruthy();
});

test('if getValidationError returns errors', () => {
  const isFieldNotEmptyError = CHECK.getValidationError([
    CHECK.isFieldNotEmpty('')
  ]);
  const isFieldAnStringError = CHECK.getValidationError([
    CHECK.isFieldNotEmpty('1234'),
    CHECK.isFieldAnString(1234)
  ]);
  const isFieldValid = CHECK.getValidationError([
    CHECK.isFieldNotEmpty('1234'),
    CHECK.isFieldAnInteger('1234')
  ]);

  expect(isFieldNotEmptyError).toBe('This field cannot be empty');
  expect(isFieldAnStringError).toBe('Invalid type, field is not a text');
  expect(isFieldValid).toBe('');
});
