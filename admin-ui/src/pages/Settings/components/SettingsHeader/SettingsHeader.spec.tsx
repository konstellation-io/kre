import React from 'react';
import { shallow } from 'enzyme';
import SettingsHeader from './SettingsHeader';

describe('SettingsHeader', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<SettingsHeader title="title" subtitle="subtitle" />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
