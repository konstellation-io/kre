import { addRuntimeMock, dashboardMock } from 'Mocks/runtime';
import { label, mountApolloComponent, testid } from 'Utils/testUtilsEnzyme';

import AddRuntime from './AddRuntime';
import { MockedProvider } from '@apollo/react-testing';
import React from 'react';
import SpinnerLinear from 'Components/LoadingComponents/SpinnerLinear/SpinnerLinear';
import TextInput from 'Components/Form/TextInput/TextInput';
import { usernameMock } from 'Mocks/auth';

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

  // FIXME: Research how to mock react-hook-form properly in order to trigger errors
  it.skip('handles input changes', async () => {
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
