import React from 'react';
import DomainList from './DomainList';
import { render, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import {domainMock} from '../../mocks/settings';


const mockedDomains = domainMock.result.data.settings.authAllowedDomains;

const Component = (
  <DomainList data={mockedDomains} onRemoveDomain={() => {}}/>
);

afterEach(cleanup);

it('Render DomainList without crashing', () => {
  const { container } = render(Component );

  expect(container).toMatchSnapshot();
});

it('Shows right texts', () => {
  const { queryByTestId } = render(Component);
  expect(queryByTestId('domainListElement0')).toBeNull();

  const domainNode0 = queryByTestId('domainListName0');
  const domainNode1 = queryByTestId('domainListName1');
  expect(domainNode0).not.toBeNull();

  expect(domainNode0 && domainNode0.textContent).toBe('domain.1');
  expect(domainNode1 && domainNode1.textContent).toBe('domain.2');
});

it('Handles events', () => {
  const clickMock = jest.fn(() => true);

  const { queryByTestId } = render((
    <DomainList data={mockedDomains} onRemoveDomain={clickMock}/>
  ));

  const removeNode0 = queryByTestId('domainListRemove0') as HTMLElement;
  fireEvent.click(removeNode0);

  expect(clickMock).toHaveBeenCalledTimes(1);
});
