import { EntrypointTooltipContent } from './EntrypointTooltipContent';
import { NodeStatus } from 'Graphql/types/globalTypes';
import React from 'react';
import Tooltip from './Tooltip';
import { mount } from 'enzyme';

function Wrapper() {
  return (
    <Tooltip
      tooltipRef={null}
      tooltipHeaderRef={null}
      tooltipContentRef={null}
      tooltipVisible={true}
      onTooltipEnter={() => {}}
      onTooltipLeave={() => {}}
      tooltipHeader={{ Icon: null, title: 'Some title' }}
      tooltipStatus={NodeStatus.STARTED}
    >
      <EntrypointTooltipContent entrypointAddress="some.url" />
    </Tooltip>
  );
}

describe('Tooltip', () => {
  it('matches snapshot', async () => {
    const wrapper = mount(<Wrapper />);

    expect(wrapper).toMatchSnapshot();
  });
});
