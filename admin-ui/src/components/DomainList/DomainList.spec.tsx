import React from 'react';
import DomainList from './DomainList';
import { render, fireEvent, cleanup } from '@testing-library/react';

import { domainMock } from '../../mocks/settings';

const mockedDomains = domainMock.result.data.settings.authAllowedDomains;

function renderComponent(params = {}) {
  return render(
    <DomainList
      data={mockedDomains}
      loading={false}
      error={undefined}
      onRemoveDomain={() => {}}
      {...params}
    />
  );
}

afterEach(cleanup);

it('Render DomainList without crashing', () => {
  const { container } = renderComponent();

  expect(container).toMatchSnapshot();
});

it('Shows right texts', () => {
  const { queryByTestId } = renderComponent();

  const domainNode0 = queryByTestId('domainListElement0');
  const domainName0 = queryByTestId('domainListName0');
  const domainName1 = queryByTestId('domainListName1');

  expect(domainNode0).toBeNull();
  expect(domainName0).not.toBeNull();
  expect(domainName0 && domainName0.textContent).toBe('domain.1');
  expect(domainName1 && domainName1.textContent).toBe('domain.2');
});

it('Handles events', () => {
  const clickMock = jest.fn(() => true);

  const { queryByTestId } = renderComponent({ onRemoveDomain: clickMock });

  const domain0 = queryByTestId('domainListRemove0') as HTMLElement;
  fireEvent.click(domain0);

  expect(clickMock).toHaveBeenCalledTimes(1);
});

test('default props', () => {
  const { container } = renderComponent({
    onRemoveDomain: undefined,
    domains: undefined
  });

  expect(container).toMatchSnapshot();
});
