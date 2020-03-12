import React from 'react';
import Logs from './Logs';
import { shallow } from 'enzyme';
import Filters from './components/Filters/Filters';
import Header from './components/Header/Header';
import IconStickBottom from '@material-ui/icons/VerticalAlignBottom';

jest.mock('@apollo/react-hooks', () => ({
  useApolloClient: () => ({
    writeData: jest.fn()
  })
}));

describe('Logs', () => {
  let wrapper;
  const mockSetSelectedNode = jest.fn();

  beforeEach(() => {
    wrapper = shallow(
      <Logs
        node={{ id: 'nodeId', name: 'nodeName' }}
        setSelectedNode={mockSetSelectedNode}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.exists('.container')).toBeTruthy();
    expect(wrapper.exists(Header)).toBeTruthy();
    expect(wrapper.exists(Filters)).toBeTruthy();
  });

  it('is closed when there is no node', () => {
    wrapper.setProps({ node: undefined });

    expect(wrapper.exists('.container')).toBeTruthy();
    expect(wrapper.exists(Header)).toBeTruthy();
    expect(wrapper.exists(Filters)).toBeFalsy();
  });

  test('calls setSelectedNode on shield click', () => {
    expect(wrapper.exists(Filters)).toBeTruthy();

    wrapper.find('.shield').simulate('click');

    expect(mockSetSelectedNode).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedNode).toHaveBeenCalledWith(undefined);
  });

  test('toggleStickToBottom', () => {
    expect(wrapper.find(Header).prop('stickToBottom')).toBeFalsy();

    wrapper
      .find(Header)
      .dive()
      .find(IconStickBottom)
      .parent()
      .simulate('click');

    expect(wrapper.find(Header).prop('stickToBottom')).toBeTruthy();
  });
});
