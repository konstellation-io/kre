import { SpinnerCircular } from 'kwc';
import {
  errorMorkflowsMock,
  nodeStatus,
  version,
  workflowsMock
} from 'Mocks/version';

import LogsPanel from './LogsPanel/LogsPanel';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import Status from './Status';
import { mountApolloComponent } from 'Utils/testUtilsEnzyme';

jest.mock('react-router', () => ({
  useParams: () => ({
    versionName: ''
  }),
}));

const mocks = [workflowsMock, nodeStatus];
const errorMocks = [errorMorkflowsMock, nodeStatus];

function Wrapper(props: any) {
  return (
    <MockedProvider mocks={mocks} addTypename={false} {...props}>
      <Status version={version} />
    </MockedProvider>
  );
}
const Component = <Wrapper mocks={mocks} />;
const ErrorComponent = <Wrapper mocks={errorMocks} />;

describe('Status', () => {
  it('show loading component', async () => {
    const wrapper = await mountApolloComponent(Component, false);

    expect(wrapper.exists(SpinnerCircular)).toBeTruthy();
    expect(wrapper.exists(LogsPanel)).toBeFalsy();
  });

  it('show error on error response', async () => {
    const wrapper = await mountApolloComponent(ErrorComponent, false);

    expect(wrapper.exists(LogsPanel)).toBeFalsy();
  });
});
