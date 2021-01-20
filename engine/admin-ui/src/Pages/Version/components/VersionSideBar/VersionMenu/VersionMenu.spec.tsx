import { runtime, version } from 'Mocks/version';

import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import VersionMenu from './VersionMenu';
import { mount } from 'enzyme';

const Component = (
  <BrowserRouter>
    <VersionMenu runtime={runtime} version={version} />
  </BrowserRouter>
);

describe('VersionMenu', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(Component);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
