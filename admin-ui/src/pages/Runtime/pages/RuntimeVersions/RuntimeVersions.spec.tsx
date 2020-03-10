import React from 'react';
import { shallow } from 'enzyme';
import { runtime, version } from '../../../../mocks/version';
import RuntimeVersions from './RuntimeVersions';

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
