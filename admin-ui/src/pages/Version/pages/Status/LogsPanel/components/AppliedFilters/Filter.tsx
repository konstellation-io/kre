import React from 'react';
import Chip from '../../../../../../../components/Chip/Chip';
import { NodeChip } from './AppliedFilters';
import moment from 'moment';

const filterToLabel = new Map([
  ['search', 'Search'],
  ['nodes', 'Process'],
  ['workflow', 'Workflow']
]);
function getFilterLabel(filter: string) {
  return filterToLabel.get(filter);
}

function getValueLabel(filter: string, value: string | NodeChip) {
  if (filter === 'startDate' || filter === 'endDate') {
    if (typeof value === 'string')
      return moment(value).format('MMM DD, YYYY HH:mm');
  }
  if (filter === 'nodes') {
    if (typeof value !== 'string')
      return `${value.nodeName} [${value.workflowName}]`;
  }

  return value;
}

type Props = {
  filter: string;
  value: string;
  removeFilter: Function;
};
export function Filter({ filter, value, removeFilter }: Props) {
  const label = `${getFilterLabel(filter)}: ${getValueLabel(filter, value)}`;

  function onClose() {
    removeFilter(filter, value);
  }
  return <Chip label={label} onClose={onClose} />;
}

export default Filter;
