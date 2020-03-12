import React from 'react';
import AddRuntime from './AddRuntime';
import { MockedProvider } from '@apollo/react-testing';
import { usernameMock } from '../../mocks/auth';
import { addRuntimeMock, dashboardMock } from '../../mocks/runtime';
import {
  testid,
  label,
  mountApolloComponent
} from '../../utils/testUtilsEnzyme';
import TextInput from '../../components/Form/TextInput/TextInput';
import SpinnerLinear from '../../components/LoadingComponents/SpinnerLinear/SpinnerLinear';

const mocks = [addRuntimeMock, dashboardMock, usernameMock];

function Wrapper() {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <AddRuntime />
    </MockedProvider>
  );
}

jest.mock('react-router', () => ({
  useHistory: jest.fn()
}));

describe('AddRuntime', () => {
  it('matches snapshot', async () => {
    const wrapper = await mountApolloComponent(<Wrapper />);

    expect(wrapper).toMatchSnapshot();
  });

  test('show right texts', async () => {
    const wrapper = await mountApolloComponent(<Wrapper />);

    expect(wrapper.exists('.container h1')).toBeTruthy();
    expect(wrapper.exists(label('SAVE'))).toBeTruthy();
  });

  it('handles input changes', async () => {
    const wrapper = await mountApolloComponent(<Wrapper />);

    wrapper
      .find(TextInput)
      .find('input')
      .simulate('change', { target: { value: '' } });

    wrapper.find(label('SAVE')).simulate('click');

    expect(wrapper.exists(SpinnerLinear)).toBeFalsy();

    expect(wrapper.find(testid('error-message')).text()).not.toBe('');

    wrapper
      .find(TextInput)
      .find('input')
      .simulate('change', { target: { value: 'New Runtime' } });

    wrapper.find(label('SAVE')).simulate('click');
    expect(wrapper.exists(SpinnerLinear)).toBeTruthy();
  });
});
