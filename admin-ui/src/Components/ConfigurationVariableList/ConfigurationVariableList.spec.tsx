import ConfigurationVariableItem from './ConfigurationVariableItem';
import ConfigurationVariableList from './ConfigurationVariableList';
import React from 'react';
import TextInput from '../Form/TextInput/TextInput';
import { confVarsMock } from 'Mocks/version';
import { shallow } from 'enzyme';

const DATA = confVarsMock.result.data.version.configurationVariables;
const VARIABLE_DATA = DATA[0];

let wrapper: any;
const mockOnType = jest.fn();

afterEach(() => {
  mockOnType.mockClear();
});

describe('ConfigurationVariableList', () => {
  beforeEach(() => {
    wrapper = shallow(
      <ConfigurationVariableList
        data={DATA}
        filterValues={{ varName: '', type: undefined }}
        hideAll={true}
        onType={mockOnType}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.find(ConfigurationVariableItem).length).toBe(3);

    // varaibles should be sorted by default
    expect(
      wrapper
        .find(ConfigurationVariableItem)
        .at(0)
        .prop('variable').key
    ).toBe('var1');
  });

  it('calls onType properly', () => {
    wrapper
      .find(ConfigurationVariableItem)
      .at(1)
      .dive()
      .find(TextInput)
      .dive()
      .find('input')
      .simulate('change', { target: { value: 'new-value' } });

    expect(mockOnType).toHaveBeenCalledTimes(1);
  });

  test('all inputs are hidden by default', () => {
    for (let idx = 0; idx <= 2; idx++) {
      expect(
        wrapper
          .find(ConfigurationVariableItem)
          .at(idx)
          .prop('hide')
      ).toBeTruthy();
    }
  });

  test('all inputs all shown with hideAll prop set to false', () => {
    wrapper.setProps({ hideAll: false });

    for (let idx = 0; idx <= 2; idx++) {
      expect(
        wrapper
          .find(ConfigurationVariableItem)
          .at(idx)
          .prop('hide')
      ).toBeFalsy();
    }
  });
});

describe('VariableRow', () => {
  beforeEach(() => {
    wrapper = shallow(
      <ConfigurationVariableItem
        variable={VARIABLE_DATA}
        onType={mockOnType}
        hide={true}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.exists(TextInput)).toBeTruthy();
    expect(wrapper.find('.typeColValue').text()).toBe('Variable');
    expect(wrapper.find('.variableCol div').text()).toBe('var2');
  });

  it('calls onType properly', () => {
    wrapper
      .find(TextInput)
      .dive()
      .find('input')
      .simulate('change', { target: { value: 'new-value' } });

    expect(mockOnType).toHaveBeenCalledTimes(1);
  });
});
