import React from 'react';
import { shallow } from 'enzyme';
import AddVersion from './AddVersion';

jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(() => [jest.fn(), { loading: false, error: '' }])
}));
jest.mock('react-router', () => ({
  useHistory: jest.fn(() => ({})),
  useParams: jest.fn(() => ({ runtimeId: 'runtimeId' }))
}));

describe('AddVersion', () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = shallow(<AddVersion />);
  });

  it('matches snapshot', () => {
    expect(wrapper).toMatchSnapshot();
  });
});
