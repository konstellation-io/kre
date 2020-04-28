import React, { useRef, useState } from 'react';
import Workflow from '../Workflow/Workflow';
import Tooltip, { TooltipHeader } from '../Tooltip/Tooltip';
import { GetVersionWorkflows_version_workflows } from '../../../../../../graphql/queries/types/GetVersionWorkflows';
import {
  VersionStatus,
  NodeStatus
} from '../../../../../../graphql/types/globalTypes';

export type TooltipRefs = {
  body: React.RefObject<HTMLDivElement>;
  header: React.RefObject<HTMLDivElement>;
  content: React.RefObject<HTMLDivElement>;
  onShowTooltip: Function;
  onHideTooltip: Function;
  lastHoveredNode: SVGGElement | null;
};

type OnShowTooltipProps = {
  left: number;
  top: number;
  status: NodeStatus;
  header: TooltipHeader;
  content: JSX.Element;
  node: SVGGElement;
};

type Props = {
  workflows: GetVersionWorkflows_version_workflows[];
  versionStatus?: VersionStatus;
};

function WorkflowsManager({
  workflows,
  versionStatus = VersionStatus.STOPPED
}: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipHeaderRef = useRef<HTMLDivElement>(null);
  const tooltipContentRef = useRef<HTMLDivElement>(null);
  const insideTooltip = useRef<boolean>(false);
  const hideTooltipTimeout = useRef<number>(0);

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipHeader, setTooltipHeader] = useState<TooltipHeader>({
    Icon: null,
    title: ''
  });
  const [tooltipContent, setTooltipContent] = useState(<div />);
  const [lastHoveredNode, setLastHoveredNode] = useState<SVGGElement | null>(
    null
  );
  const [tooltipStatus, setTooltipStatus] = useState<NodeStatus>(
    NodeStatus.STARTED
  );

  const tooltipRefs: TooltipRefs = {
    body: tooltipRef,
    header: tooltipHeaderRef,
    content: tooltipContentRef,
    onShowTooltip,
    onHideTooltip,
    lastHoveredNode
  };

  function setTooltipCoords(left: number, top: number) {
    if (tooltipRef.current !== null) {
      const dimensions = tooltipRef.current.getBoundingClientRect();

      tooltipRef.current.style.left = `${-dimensions.width / 2 + left}px`;
      tooltipRef.current.style.top = `${-dimensions.height + top}px`;
    }
  }

  function showTooltip() {
    setTooltipVisible(true);
  }
  function hideTooltip() {
    setTooltipVisible(false);
    setLastHoveredNode(null);
  }

  function onShowTooltip({
    left,
    top,
    status,
    node,
    header,
    content
  }: OnShowTooltipProps) {
    insideTooltip.current = true;

    setTooltipStatus(status);
    setTooltipHeader(header);
    setTooltipContent(content);
    setTooltipCoords(left, top);
    setLastHoveredNode(node);

    showTooltip();
  }
  function onHideTooltip() {
    insideTooltip.current = false;

    if (hideTooltipTimeout.current) clearTimeout(hideTooltipTimeout.current);

    hideTooltipTimeout.current = window.setTimeout(() => {
      if (!insideTooltip.current) hideTooltip();
    }, 200);
  }

  function onTooltipEnter() {
    insideTooltip.current = true;
  }
  function onTooltipLeave() {
    insideTooltip.current = false;
    hideTooltip();
  }

  return (
    <div>
      {workflows.map((workflow: GetVersionWorkflows_version_workflows) => (
        <Workflow
          workflow={workflow}
          workflowStatus={versionStatus}
          tooltipRefs={tooltipRefs}
          key={workflow.id}
        />
      ))}
      <Tooltip
        tooltipRef={tooltipRef}
        tooltipHeaderRef={tooltipHeaderRef}
        tooltipContentRef={tooltipContentRef}
        tooltipVisible={tooltipVisible}
        onTooltipEnter={onTooltipEnter}
        onTooltipLeave={onTooltipLeave}
        tooltipHeader={tooltipHeader}
        tooltipStatus={tooltipStatus}
      >
        {tooltipContent}
      </Tooltip>
    </div>
  );
}

export default WorkflowsManager;
