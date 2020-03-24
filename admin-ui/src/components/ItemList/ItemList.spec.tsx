import React from 'react';
import ItemList from './ItemList';

import { domainMock } from '../../mocks/settings';
import { shallow } from 'enzyme';
import { testid } from '../../utils/testUtilsEnzyme';

const mockedDomains = domainMock.result.data.settings.authAllowedDomains;
const mockOnRemoveDomain = jest.fn();

describe('ItemList', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(
      <ItemList
        data={mockedDomains}
        loading={false}
        error={undefined}
        onRemoveItem={mockOnRemoveDomain}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('Shows right texts', () => {
    // Check first domain text
    expect(wrapper.find(testid('itemListName0')).text()).toBe('domain.1');
    // Check second domain text
    expect(wrapper.find(testid('itemListName1')).text()).toBe('domain.2');
  });

  it('Handles events', () => {
    wrapper.find(testid('itemListRemove0')).simulate('click');

    expect(mockOnRemoveDomain).toHaveBeenCalledTimes(1);
  });
});
