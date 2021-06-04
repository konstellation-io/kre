import Filters from './components/Filters/Filters';
import Header from './components/Header/Header';
import LogsPanel from './LogsPanel';
import React from 'react';
import { shallow } from 'enzyme';
import * as apolloClient from '@apollo/client';

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

apolloClient.useQuery = jest.fn(() => mocksLogTabs);
apolloClient.useApolloClient = jest.fn(() => ({ writeData: jest.fn() }));
apolloClient.useReactiveVar = jest.fn(() => []);

jest.mock('Graphql/client/cache', () => ({}));

jest.mock('react-router', () => ({
  useLocation: jest.fn(() => ({
    pathname: ''
  }))
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

  // FIXME: fix it when you can mock or use useEffect with shallow
  it.skip('calls setSelectedNode on shield click', () => {
    expect(wrapper.exists(Filters)).toBeTruthy();

    wrapper.find('.shield').simulate('click');

    expect(mockSetSelectedNode).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedNode).toHaveBeenCalledWith(undefined);
  });
});
