import LogItem from './LogItem';
import { LogLevel } from 'Graphql/types/globalTypes';
import React from 'react';
import { shallow } from 'enzyme';

describe('LogItem', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(
      <LogItem
        __typename="NodeLog"
        level={LogLevel.DEBUG}
        nodeName="nodeName"
        date={'2020-01-01'}
        message={'some message'}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.exists('.container')).toBeTruthy();
    expect(wrapper.find('.message').text()).toBe('some message');
  });

  it('closed by default', () => {
    expect(wrapper.exists('.opened')).toBeFalsy();
  });
});

const mockData = {
  data: {
    logs: [
      {
        nodeId: 'someNode1',
        message: 'some message 1',
        date: '2020-01-01'
      },
      {
        nodeId: 'someNode2',
        message: 'some message 2',
        date: '2020-01-01'
      }
    ]
  },
  refetch: jest.fn(),
  fetchMore: jest.fn(),
  subscribeToMore: jest.fn()
};
jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({
    runtimeId: 'someId'
  }))
}));
const mockWriteData = jest.fn();
jest.mock('@apollo/react-hooks', () => ({
  useQuery: jest.fn(() => mockData),
  useSubscription: jest.fn(() => mockData),
  useApolloClient: () => ({
    writeData: mockWriteData
  })
}));
