import React from 'react';
import { shallow } from 'enzyme';
import Metrics from './Metrics';
import { version, runtime } from '../../../../mocks/version';

describe('Metrics', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Metrics runtime={runtime} version={version} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
