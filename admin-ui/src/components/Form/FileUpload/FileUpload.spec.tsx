import React from 'react';
import FileUpload from './FileUpload';
import '@testing-library/jest-dom/extend-expect';
import { shallow } from 'enzyme';
import InputLabel from '../InputLabel/InputLabel';

describe('FileUpload', () => {
  let wrapper;
  const PLACEHOLDER = 'some placeholder';
  const LABEL = 'some label';

  beforeEach(() => {
    wrapper = shallow(<FileUpload placeholder={PLACEHOLDER} label={LABEL} />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });

  it('show right texts', () => {
    expect(wrapper.find(InputLabel).prop('text')).toBe(LABEL);
    expect(wrapper.find('.input').text()).toBe(PLACEHOLDER);
  });
});
