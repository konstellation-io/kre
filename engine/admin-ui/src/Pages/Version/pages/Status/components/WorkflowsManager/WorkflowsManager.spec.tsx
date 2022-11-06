import { NodeStatus, VersionStatus } from 'Graphql/types/globalTypes';

import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import React from 'react';
import WorkflowsManager from './WorkflowsManager';
import { mount } from 'enzyme';
import { workflow } from 'Mocks/version';

const mocks: any[] = [];

function Wrapper() {
  return (
    <BrowserRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <WorkflowsManager
          versionStatus={VersionStatus.STARTED}
          entrypointAddress="some-address"
          entrypointStatus={NodeStatus.STARTED}
          workflows={[workflow]}
        />
      </MockedProvider>
    </BrowserRouter>
  );
}

describe('WorkflowsManager', () => {
  // Skipped test due to error with react-force-graph dependency
  xit('matches snapshot', async () => {
    const wrapper = mount(<Wrapper />);

    expect(wrapper).toMatchSnapshot();
  });
});
