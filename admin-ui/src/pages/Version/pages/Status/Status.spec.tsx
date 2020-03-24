import React from 'react';
import Status from './Status';
import { MockedProvider } from '@apollo/react-testing';
import {
  version,
  workflowsMock,
  nodeStatus,
  errorMorkflowsMock
} from '../../../../mocks/version';
import StatusViewer from '../../components/StatusViewer/StatusViewer';
import { mountApolloComponent } from '../../../../utils/testUtilsEnzyme';
import Logs from './Logs/Logs';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';

jest.mock('react-router', () => ({
  useParams: jest.fn(() => ({
    runtimeId: 'someId'
  }))
}));

const mocks = [workflowsMock, nodeStatus, nodeStatus];
const errorMocks = [errorMorkflowsMock, nodeStatus, nodeStatus];

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
  it('show right components', async () => {
    const wrapper = await mountApolloComponent(Component);

    expect(wrapper.exists(StatusViewer)).toBeTruthy();
  });

  it('show loading component', async () => {
    const wrapper = await mountApolloComponent(Component, false);

    expect(wrapper.exists(SpinnerCircular)).toBeTruthy();
    expect(wrapper.exists(Logs)).toBeFalsy();
  });

  it('show error on error response', async () => {
    const wrapper = await mountApolloComponent(ErrorComponent);

    expect(wrapper.exists(ErrorMessage)).toBeTruthy();
  });
});
