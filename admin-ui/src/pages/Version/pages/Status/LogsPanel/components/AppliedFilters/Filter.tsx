import React from 'react';
import Chip from '../../../../../../../components/Chip/Chip';
import { NodeChip } from './AppliedFilters';
import { NODE_NAME_ENTRYPOINT } from '../../../../../../../hooks/useWorkflowsAndNodes';

function getLabelAndTitle(filter: string, value: string | NodeChip) {
  let label = '',
    title = '';

  switch (filter) {
    case 'search':
      label = `Searched by "${value}"`;
      title = label;
      break;
    case 'global':
    case 'workflow':
      label = `${value}`;
      title = label;
      break;
    case 'nodes':
      const node = value as NodeChip;
      const workflowShort = node.workflowName.substring(0, 2).toUpperCase();
      label = `${workflowShort}: ${node.nodeName}`;
      title = `${node.workflowName}: ${node.nodeName}`;
      break;
    default:
      label = 'unknown';
  }

  return { label, title };
}

type Props = {
  filter: string;
  value: string;
  removeFilter: Function;
};
export function Filter({ filter, value, removeFilter }: Props) {
  function onClose() {
    removeFilter(filter, value);
  }

  const { label, title } = getLabelAndTitle(filter, value);
  return <Chip label={label} title={title} onClose={onClose} />;
}

export default Filter;
