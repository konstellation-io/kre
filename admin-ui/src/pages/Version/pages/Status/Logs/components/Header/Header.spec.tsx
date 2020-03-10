import React from 'react';
import Header from './Header';

import IconClose from '@material-ui/icons/Close';
import IconStickBottom from '@material-ui/icons/VerticalAlignBottom';
import IconClear from '@material-ui/icons/DeleteOutline';
import { shallow, ShallowWrapper } from 'enzyme';

const mockWriteData = jest.fn();
jest.mock('@apollo/react-hooks', () => ({
  useApolloClient: () => ({
    writeData: mockWriteData
  })
}));

describe('Logs Header', () => {
  let wrapper: ShallowWrapper<any, Readonly<{}>, React.Component<{}, {}, any>>;
  const closeLogsMock = jest.fn();
  const toggleStickToBottomMock = jest.fn();

  beforeEach(() => {
    wrapper = shallow(
      <Header
        closeLogs={closeLogsMock}
        opened
        stickToBottom
        toggleStickToBottom={toggleStickToBottomMock}
      />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right components', () => {
    expect(wrapper.find('.buttons > div').length).toBe(3);
  });

  it('handles events', () => {
    wrapper
      .find(IconClose)
      .parent()
      .simulate('click');
    wrapper
      .find(IconStickBottom)
      .parent()
      .simulate('click');
    wrapper
      .find(IconClear)
      .parent()
      .simulate('click');

    expect(closeLogsMock).toHaveBeenCalledTimes(1);
    expect(toggleStickToBottomMock).toHaveBeenCalledTimes(1);
    expect(mockWriteData).toHaveBeenCalledTimes(1);
  });
});
