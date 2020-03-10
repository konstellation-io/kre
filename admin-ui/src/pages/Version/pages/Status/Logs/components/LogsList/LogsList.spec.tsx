import React from 'react';
import LogItem from './LogItem';
import LogsList from './LogsList';
import IconExpand from '@material-ui/icons/ArrowDownward';
import { shallow, mount } from 'enzyme';

describe('LogItem', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<LogItem date={'2020-01-01'} message={'some message'} />);
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
  }
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

describe('LogsList', () => {
  let wrapper;
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    wrapper = mount(<LogsList node="someNode" onUpdate={mockOnUpdate} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('clear logs before closing logs', () => {
    wrapper.unmount();
    expect(mockWriteData).toHaveBeenCalledTimes(1);
  });

  it('show right components', () => {
    expect(wrapper.exists('.listContainer')).toBeTruthy();
    expect(wrapper.find(LogItem).length).toBe(2);
    expect(
      wrapper
        .find(LogItem)
        .at(1)
        .prop('nodeId')
    ).toBe(mockData.data.logs[1].nodeId);
  });
});
