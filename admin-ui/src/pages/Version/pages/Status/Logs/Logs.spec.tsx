import React from 'react';
import Logs from './Logs';
import { shallow } from 'enzyme';
import Filters from './components/Filters/Filters';
import Header from './components/Header/Header';
import { useQuery } from '@apollo/react-hooks';

const mockLogsPanel = {
  data: {
    logPanel: {
      runtimeId: 'runtimeIdMock',
      nodeId: 'nodeIdMock',
      nodeName: 'nodeNameMock'
    }
  }
};

jest.mock('@apollo/react-hooks', () => ({
  useQuery: jest.fn(() => mockLogsPanel),
  useApolloClient: jest.fn(() => ({ writeData: jest.fn() }))
}));

describe('Logs', () => {
  let wrapper: any;
  const mockSetSelectedNode = jest.fn();

  beforeEach(() => {
    wrapper = shallow(<Logs />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.exists('.container')).toBeTruthy();
    expect(wrapper.exists(Header)).toBeTruthy();
    expect(wrapper.exists(Filters)).toBeTruthy();
  });

  it('should be empty when there is no node', () => {
    // Arrange.
    useQuery.mockReturnValueOnce({ data: undefined });

    // Act.
    const wrapper2 = shallow(<Logs />);

    // Assert.
    expect(useQuery).toBeCalled();
    expect(wrapper2).toMatchSnapshot();
  });

  // FIXME: fix it when you can mock or use useEffect with shallow
  it.skip('calls setSelectedNode on shield click', () => {
    expect(wrapper.exists(Filters)).toBeTruthy();

    wrapper.find('.shield').simulate('click');

    expect(mockSetSelectedNode).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedNode).toHaveBeenCalledWith(undefined);
  });

  it('toggleStickToBottom', () => {
    expect(wrapper.find(Header).prop('stickToBottom')).toBeFalsy();

    wrapper.find(Header).prop('toggleStickToBottom')();

    expect(wrapper.find(Header).prop('stickToBottom')).toBeTruthy();
  });
});
