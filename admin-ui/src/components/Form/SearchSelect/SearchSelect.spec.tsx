import React from 'react';
import { shallow } from 'enzyme';
import SearchSelect from './SearchSelect';

describe('SearchSelect component', () => {
  let wrapper: any;

  const optionsMock = ['foo', 'bar', 'baz'];
  const onChangeMock = jest.fn();
  const valueMock = '';

  beforeEach(() => {
    jest.resetAllMocks();
    wrapper = shallow(
      <SearchSelect
        options={optionsMock}
        onChange={onChangeMock}
        value={valueMock}
      />
    );
  });

  it('should render without crashing', () => {
    expect(wrapper).toMatchSnapshot();
  });
  describe('Search items', () => {
    it('should render the list with the matching elements', () => {
      // Arrange.
      // Act.
      wrapper.find('input').simulate('change', { target: { value: 'ba' } });

      // Assert.
      const list = wrapper.find('li');
      expect(list.length).toBe(2);
      expect(list).toMatchSnapshot();
    });

    it('should not render the list when there is no matches', () => {
      // Arrange.
      // Act.
      wrapper
        .find('input')
        .simulate('change', { target: { value: 'foobarbaz' } });

      // Assert.
      const list = wrapper.find('li');
      expect(list.length).toBe(0);
    });

    it('should call onChange prop when click on a list element', () => {
      // Arrange.
      wrapper.find('input').simulate('change', { target: { value: 'foo' } });

      // Act.
      wrapper.find('li').simulate('click');

      // Assert.
      expect(onChangeMock).toBeCalledWith(optionsMock[0]);
    });
  });
});
