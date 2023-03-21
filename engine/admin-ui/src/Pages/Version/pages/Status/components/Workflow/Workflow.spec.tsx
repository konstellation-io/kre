import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';

import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import Workflow from './Workflow';
import { mount } from 'enzyme';
import { workflow } from 'Mocks/version';

const mocks = [];

function Wrapper() {
  return (
    <BrowserRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <Workflow
          workflow={workflow}
          workflowStatus={VersionStatus.STARTED}
          entrypointStatus={NodeStatus.STARTED}
          entrypointAddress="some-address"
        />
      </MockedProvider>
    </BrowserRouter>
  );
}

describe('Workflow', () => {
  // Skipped test due to error with react-force-graph dependency
  xit('matches snapshot', async () => {
    const wrapper = mount(<Wrapper />);

    expect(wrapper).toMatchSnapshot();
  });
});
