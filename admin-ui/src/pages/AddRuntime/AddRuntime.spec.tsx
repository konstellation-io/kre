import React from 'react';
import AddRuntime from './AddRuntime';
import { MockedProvider } from '@apollo/react-testing';
import { usernameMock } from '../../mocks/auth';
import { addRuntimeMock, dashboardMock } from '../../mocks/runtime';
import {
  prepareApolloComponent,
  testid,
  label
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

describe('AddRuntime', () => {
  test('show right texts', async () => {
    const { wrapper } = await prepareApolloComponent(<Wrapper />);

    expect(wrapper.exists('.container h1')).toBeTruthy();
    expect(wrapper.exists(label('SAVE'))).toBeTruthy();
  });

  it('handles input changes', async () => {
    const { wrapper } = await prepareApolloComponent(<Wrapper />);

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
