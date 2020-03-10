import React from 'react';
import DomainList from './DomainList';

import { domainMock } from '../../mocks/settings';
import { shallow } from 'enzyme';
import { testid } from '../../utils/testUtilsEnzyme';

const mockedDomains = domainMock.result.data.settings.authAllowedDomains;
const mockOnRemoveDomain = jest.fn();

describe('DomainList', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <DomainList
        data={mockedDomains}
        loading={false}
        error={undefined}
        onRemoveDomain={mockOnRemoveDomain}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('Shows right texts', () => {
    expect(wrapper.exists(testid('domainListElement0'))).toBeFalsy();
    expect(wrapper.exists(testid('domainListName0'))).toBeTruthy();
    expect(wrapper.find(testid('domainListName0')).text()).toBe('domain.1');
    expect(wrapper.find(testid('domainListName1')).text()).toBe('domain.2');
  });

  it('Handles events', () => {
    wrapper.find(testid('domainListRemove0')).simulate('click');

    expect(mockOnRemoveDomain).toHaveBeenCalledTimes(1);
  });
});
