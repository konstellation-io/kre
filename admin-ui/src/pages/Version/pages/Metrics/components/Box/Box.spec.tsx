import React from 'react';
import { shallow } from 'enzyme';
import Box from './Box';
import ExpandButton from './ExpandButton';
import InfoNumber from './InfoNumber';
import Title from './Title';

let wrapper;

describe('Box', () => {
  beforeEach(() => {
    wrapper = shallow(
      <Box>
        <div>Some component</div>
      </Box>
    );
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

describe('ExpandButton', () => {
  beforeEach(() => {
    wrapper = shallow(<ExpandButton onClick={jest.fn()} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

describe('InfoNumber', () => {
  beforeEach(() => {
    wrapper = shallow(<InfoNumber text="some text" size={'regular'} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});

describe('Title', () => {
  beforeEach(() => {
    wrapper = shallow(<Title text="some text" />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
