import React from 'react';
import LogsPanel from './LogsPanel';
import { shallow } from 'enzyme';
import Filters from './components/Filters/Filters';
import Header from './components/Header/Header';
import { useQuery } from '@apollo/react-hooks';

const mocksLogTabs = {
  data: {
    logTabs: [
      {
        runtimeId: 'runtimeIdMock',
        nodeId: 'nodeIdMock',
        nodeName: 'nodeNameMock',
        uniqueId: 'foo'
      }
    ]
  }
};

jest.mock('@apollo/react-hooks', () => ({
  useQuery: jest.fn(() => mocksLogTabs),
  useApolloClient: jest.fn(() => ({ writeData: jest.fn() }))
}));

describe('Logs', () => {
  let wrapper: any;
  const mockSetSelectedNode = jest.fn();

  beforeEach(() => {
    wrapper = shallow(<LogsPanel />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.exists('.container')).toBeTruthy();
    expect(wrapper.exists(Header)).toBeTruthy();
  });

  it('should be empty when there is no node', () => {
    // Arrange.
    useQuery.mockReturnValueOnce({ data: undefined });

    // Act.
    const wrapper2 = shallow(<LogsPanel />);

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
});
