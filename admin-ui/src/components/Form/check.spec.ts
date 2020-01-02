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
  const validDomain1 = CHECK.isDomainValid('mariano.intelygenz.com');
  const validDomain2 = CHECK.isDomainValid('igz.es');
  const invalidDomain1 = CHECK.isDomainValid('intelygenz');
  const invalidDomain2 = CHECK.isDomainValid('intelygenz.');
  const invalidDomain3 = CHECK.isDomainValid('domain@intelygenz');

  expect(invalidDomain1.valid).toBeFalsy();
  expect(invalidDomain2.valid).toBeFalsy();
  expect(invalidDomain3.valid).toBeFalsy();

  expect(validDomain1.valid).toBeTruthy();
  expect(validDomain2.valid).toBeTruthy();
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

test('if isDefined makes correct validations', () => {
  const definedValue1 = CHECK.isDefined('someValue');
  const definedValue2 = CHECK.isDefined(false);
  const undefinedValue1 = CHECK.isDefined(null);
  const undefinedValue2 = CHECK.isDefined(undefined);

  expect(undefinedValue1.valid).toBeFalsy();
  expect(undefinedValue2.valid).toBeFalsy();

  expect(definedValue1.valid).toBeTruthy();
  expect(definedValue2.valid).toBeTruthy();
});

test('if isFieldInList makes correct validations', () => {
  const fieldInList1 = CHECK.isFieldInList('a', ['a', 'b', 'c']);
  const fieldInList2 = CHECK.isFieldInList('', ['a', 'b', 'c', '']);
  const fieldNotInList1 = CHECK.isFieldInList('d', ['a', 'b', 'c']);
  const fieldNotInList2 = CHECK.isFieldInList('a', []);

  expect(fieldNotInList1.valid).toBeFalsy();
  expect(fieldNotInList2.valid).toBeFalsy();

  expect(fieldInList1.valid).toBeTruthy();
  expect(fieldInList2.valid).toBeTruthy();
});
