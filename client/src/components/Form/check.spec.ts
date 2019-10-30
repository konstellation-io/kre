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
