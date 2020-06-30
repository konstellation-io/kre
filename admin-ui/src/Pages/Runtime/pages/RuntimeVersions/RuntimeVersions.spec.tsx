import { runtime, version } from 'Mocks/version';

import React from 'react';
import RuntimeVersions from './RuntimeVersions';
import { shallow } from 'enzyme';

describe('RuntimeVersions', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(
      <RuntimeVersions runtime={runtime} versions={[version, version]} />
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
