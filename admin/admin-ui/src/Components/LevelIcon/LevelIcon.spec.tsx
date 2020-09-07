import IconInfo from '@material-ui/icons/Info';
import LevelIcon from './LevelIcon';
import { LogLevel } from 'Graphql/types/globalTypes';
import React from 'react';
import { shallow } from 'enzyme';

describe('LevelIcon', () => {
  let wrapper: any;

  beforeEach(async () => {
    wrapper = shallow(<LevelIcon level={LogLevel.INFO} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show Info level', () => {
    expect(wrapper.exists(IconInfo)).toBeTruthy();
  });

  it('show Debug level', () => {
    wrapper.setProps({ level: LogLevel.DEBUG });

    expect(wrapper.text()).toBe('!');
  });

  it('show Warn level', () => {
    wrapper.setProps({ level: LogLevel.WARN });

    expect(wrapper.text()).toBe('!!');
  });

  it('show Error level', () => {
    wrapper.setProps({ level: LogLevel.ERROR });

    expect(wrapper.text()).toBe('!!!');
  });
});
