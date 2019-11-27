import React from 'react';
import { MemoryRouter } from 'react-router';
import { render, fireEvent, cleanup } from '@testing-library/react';
import NavBar, { Tab } from './NavBar';
import '@testing-library/jest-dom/extend-expect';

const tabs = [
  { label: 'TAB 1' } as Tab,
  { label: 'TAB 2' } as Tab,
  { label: 'TAB 3' } as Tab
];

afterEach(cleanup);

function renderComponent(params: any = {}) {
  return render(
    <MemoryRouter>
      <NavBar tabs={tabs} {...params} />
    </MemoryRouter>
  );
}

it('TODO: TESTS', () => {});
/*
it('Renders NavBar without crashing', () => {
  const { container } = renderComponent();
  expect(container).toMatchSnapshot();
});

it('Shows different options', () => {
  const { getByText } = renderComponent();

  expect(getByText('TAB 1')).toBeInTheDocument();
  expect(getByText('TAB 2')).toBeInTheDocument();
  expect(getByText('TAB 3')).toBeInTheDocument();
});

it('Highlights selected option', () => {
  const { container } = renderComponent({ defaultActive: 1 });

  const primary = container.querySelector('.primary');
  expect(primary && primary.textContent).toBe('TAB 2');
});

it('Handles click events', () => {
  const clickMock = jest.fn(() => true);

  const { container, getByText } = renderComponent({
    defaultActive: 0,
    onChange: clickMock
  });

  let primary = container.querySelector('.primary');
  expect(primary && primary.textContent).toBe('TAB 1');

  fireEvent.click(getByText('TAB 3'));

  primary = container.querySelector('.primary');
  expect(primary && primary.textContent).toBe('TAB 3');
  expect(clickMock).toHaveBeenCalledTimes(1);
});

it('Updates active tab', () => {
  const { container, rerender } = renderComponent({ defaultActive: 0 });

  let primary = container.querySelector('.primary');
  expect(primary && primary.textContent).toBe('TAB 1');

  rerender(
    <MemoryRouter>
      <NavBar tabs={tabs} defaultActive={1} />
    </MemoryRouter>
  );

  primary = container.querySelector('.primary');
  expect(primary && primary.textContent).toBe('TAB 2');
});
*/
