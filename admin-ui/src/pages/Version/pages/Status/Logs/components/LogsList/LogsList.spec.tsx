import React from 'react';
import LogItem from './LogItem';
import IconExpand from '@material-ui/icons/ArrowDownward';
import { shallow } from 'enzyme';
import { LogLevel } from '../../../../../../../graphql/types/globalTypes';

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

  it('opens on open log click', () => {
    wrapper
      .find(IconExpand)
      .parent()
      .simulate('click');
    expect(wrapper.exists('.opened')).toBeTruthy();
    expect(wrapper.find('.messageComplete').text()).toBe('some message');
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
