import { BrowserRouter } from 'react-router-dom';
import PublishedVersionStatus from './PublishedVersionStatus';
import React from 'react';
import { mount } from 'enzyme';

describe('PublishedVersionStatus', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(
      <BrowserRouter>
        <PublishedVersionStatus nPublishedVersions={5} noVersions={false} />
      </BrowserRouter>
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
