import * as CHECK from './check';

test('if isFieldEmpty makes correct validations', () => {
  const empty = CHECK.isFieldEmpty('');
  const oneCharacter = CHECK.isFieldEmpty('a');
  // @ts-ignore
  const numberZero = CHECK.isFieldEmpty(0);
  // @ts-ignore
  const nullContent = CHECK.isFieldEmpty(null);
  // @ts-ignore
  const undefinedContent = CHECK.isFieldEmpty(null);
  
  expect(empty).toBeTruthy();

  expect(oneCharacter).toBeFalsy();
  expect(nullContent).toBeFalsy();
  expect(undefinedContent).toBeFalsy();
  expect(numberZero).toBeFalsy();
});

test('if isFieldNotAnString makes correct validations', () => {
  const numberInput = CHECK.isFieldNotAnString(1);
  const stringInput = CHECK.isFieldNotAnString('a');
  const functionInput = CHECK.isFieldNotAnString(function() {});
  const booleanInput = CHECK.isFieldNotAnString(false);
  
  expect(functionInput).toBeTruthy();
  expect(booleanInput).toBeTruthy();
  expect(numberInput).toBeTruthy();

  expect(stringInput).toBeFalsy();
});

test('if isEmailNotValid makes correct validations', () => {
  const validEmail1 = CHECK.isEmailNotValid('mariano@intelygenz.com');
  const validEmail2 = CHECK.isEmailNotValid('a__something-2@google.de');
  const invalidEmail1 = CHECK.isEmailNotValid('mariano@intelygenz');
  const invalidEmail2 = CHECK.isEmailNotValid('mariano@.com');
  const invalidEmail3 = CHECK.isEmailNotValid('@intelygenz.com');
  
  expect(invalidEmail1).toBeTruthy();
  expect(invalidEmail2).toBeTruthy();
  expect(invalidEmail3).toBeTruthy();

  expect(validEmail1).toBeFalsy();
  expect(validEmail2).toBeFalsy();
});
