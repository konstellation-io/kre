import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { getByTestId } from '@testing-library/dom';
import TextInput from './TextInput';

interface Handler {
  handler: Function;
  count: number;
};

afterEach(cleanup);

const getInput = (c:HTMLElement) => getByTestId(c, 'email-input') as HTMLInputElement;
const getLabel = (c:HTMLElement) => getByTestId(c, 'email-label') as HTMLLabelElement;
const getClear = (c:HTMLElement) => getByTestId(c, 'clear-button');

function checkTexts(
  container:HTMLElement,
  inputText:string,
  labelText:string,
  placeholderText:string=''
) {
  const input = getInput(container);
  const label = getLabel(container);
  
  expect(input.textContent).toBe(inputText);
  expect(label.textContent).toBe(labelText);
  
  if (placeholderText) {
    expect(input.placeholder).toBe(placeholderText);
  }
}

function testHandlers(container:HTMLElement, handlers:Handler[]) {
  const input = getInput(container);

  fireEvent.change(input, { target: { value: 'Typing' } });
  fireEvent.keyPress(input, { key: 'Enter', keyCode: 13 });
  fireEvent.keyPress(input, { key: 'a', keyCode: 65, code: 65, charCode: 65 });

  handlers.forEach(({ handler, count }: Handler) => 
    expect(handler).toHaveBeenCalledTimes(count)
  );
}

it('render TextInput without crashing', () => {
  const { container } = render(<TextInput />);
  expect(container).toMatchSnapshot();
});

it('shows right texts', () => {
  let input;
  const { rerender, container } = render(<TextInput />);
  checkTexts(container, '', '');

  rerender(<TextInput label="New Text" placeholder="New Placeholder" />);
  checkTexts(container, '', 'NEW TEXT', 'New Placeholder');

  input = getInput(container);
  fireEvent.change(input, { target: { value: 'Some Typing' } });
  expect(input.value).toBe('Some Typing');
  
  rerender(
    <TextInput label="New Text 2" placeholder="New Placeholder 2" textArea />
  );
  checkTexts(container, 'Some Typing', 'NEW TEXT 2', 'New Placeholder 2');

  input = getInput(container);
  fireEvent.change(input, { target: { value: 'Some Typing 2' } });
  expect(input.value).toBe('Some Typing 2');
});

it('shows error messages', () => {
  const { container } = render(
    <TextInput label="Label" placeholder="Placeholder" error="Some error" />
  );
  const error = getByTestId(container, 'error-message');

  expect(error.textContent).toBe('Some error');
});

it('text input Handle events', () => {
  const summitMock = jest.fn(() => true);
  const updateMock = jest.fn(() => true);

  const { container } = render(
    <TextInput onSubmit={ summitMock } onChange={ updateMock } showClearButton />
  );

  const handlers = [
    { handler: summitMock, count: 1 },
    { handler: updateMock, count: 1 },
  ];
  testHandlers(container, handlers);

  const input = getInput(container);
  const clearButton = getClear(container);
  expect(input.value).toBe('Typing');

  fireEvent.click(clearButton);
  expect(input.value).toBe('');
});

test('text area Handle events', () => {
  const summitMock = jest.fn(() => true);
  const updateMock = jest.fn(() => true);

  const { container } = render(
    <TextInput onSubmit={ summitMock } onChange={ updateMock } textArea />
  );

  const handlers = [
    { handler: summitMock, count: 0 },
    { handler: updateMock, count: 1 },
  ];
  testHandlers(container, handlers);
});
