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
          workflowStatus={VersionStatus.STARTED}
          entrypointAddress="some-address"
          entrypointStatus={NodeStatus.STARTED}
          workflow={workflow}
          tooltipRefs={null}
        />
      </MockedProvider>
    </BrowserRouter>
  );
}

describe('Workflow', () => {
  it('matches snapshot', async () => {
    const wrapper = mount(<Wrapper />);

    expect(wrapper).toMatchSnapshot();
  });
});
