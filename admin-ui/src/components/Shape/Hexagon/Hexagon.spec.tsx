import React from 'react';
import { shallow } from 'enzyme';
import Hexagon from './Hexagon';
import HexagonBorder from './HexagonBorder';

describe('Hexagon', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<Hexagon />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

describe('HexagonBorder', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallow(<HexagonBorder />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
