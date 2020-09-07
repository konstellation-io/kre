import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import VersionInfo from './VersionInfo';
import { mount } from 'enzyme';
import { version } from 'Mocks/version';

const Component = (
  <BrowserRouter>
    <VersionInfo version={version} />
  </BrowserRouter>
);

describe('VersionInfo', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
