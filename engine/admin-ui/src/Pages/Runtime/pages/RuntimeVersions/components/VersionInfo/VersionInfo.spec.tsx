import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import VersionInfo from './VersionInfo';
import { mount } from 'enzyme';
import { version } from 'Mocks/version';

describe('VersionInfo', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <BrowserRouter>
        <VersionInfo version={version} />
      </BrowserRouter>
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
