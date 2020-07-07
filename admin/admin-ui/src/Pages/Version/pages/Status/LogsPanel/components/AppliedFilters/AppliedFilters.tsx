import React, { MouseEvent } from 'react';

import Button from 'Components/Button/Button';
import Chip from 'Components/Chip/Chip';
import Left from 'Components/Layout/Left/Left';
import { NodeSelection } from 'Graphql/client/typeDefs';
import Right from 'Components/Layout/Right/Right';
import { defaultFilters } from 'Graphql/client/resolvers/updateTabFilters';
import styles from './AppliedFilters.module.scss';
import useWorkflowsAndNodes from 'Hooks/useWorkflowsAndNodes';

export type NodeChip = {
  workflowName: string;
  nodeName: string;
};

const isEmpty = (filter: null | string | NodeSelection[]) =>
  filter === null || filter === '' || (Array.isArray(filter) && !filter.length);

const filtersOrder = ['workflow', 'nodes', 'search'];
const filtersOrderDict = Object.fromEntries(
  filtersOrder.map((f, idx) => [f, idx])
);
const sortFilters = (
  [a]: [string, string | NodeChip],
  [b]: [string, string | NodeChip]
) => filtersOrderDict[a] - filtersOrderDict[b] || a.localeCompare(b);

function getLabelAndTitle(filter: string, value: any) {
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

function getActiveFilters(filters: Filters) {
  return Object.entries(filters).filter(([_, value]) => !isEmpty(value));
}

function extractWorkflowsAndNodes(
  selections: [string, any][],
  workflowsAndNodesNames: {
    [key: string]: string[];
  }
) {
  const newSelections: any = [];

  selections.forEach(([filter, value]) => {
    if (filter !== 'nodes') newSelections.push([filter, value]);
    else {
      value.forEach(({ workflowName, nodeNames }: NodeSelection) => {
        const allNodesSelected =
          nodeNames.length === workflowsAndNodesNames[workflowName]?.length;

        switch (true) {
          case !workflowName:
            nodeNames.forEach(name => newSelections.push(['global', name]));
            break;
          case allNodesSelected:
            newSelections.push(['workflow', workflowName]);
            break;
          default:
            nodeNames.forEach(nodeName =>
              newSelections.push([
                filter,
                {
                  workflowName,
                  nodeName
                }
              ])
            );
        }
      });
    }
  });

  return newSelections;
}

function removeNodeFromWorkflow(
  filters: Filters,
  { workflowName, nodeName }: NodeChip
) {
  return (
    filters?.nodes?.map(workflow => ({
      ...workflow,
      nodeNames: workflow.nodeNames.filter(
        node => !(workflow.workflowName === workflowName && node === nodeName)
      )
    })) || null
  );
}

function removeWorkflow(filters: Filters, targetWorkflowName: string) {
  return (
    filters?.nodes?.filter(
      ({ workflowName }) => workflowName !== targetWorkflowName
    ) || null
  );
}

type Filters = {
  nodes: NodeSelection[] | null;
  search: string | null;
};

type Props = {
  filters: Filters;
  updateFilters: Function;
  versionId: string;
  resetFilters: (e: MouseEvent<HTMLDivElement>) => void;
};
function AppliedFilters({
  filters,
  updateFilters,
  resetFilters,
  versionId
}: Props) {
  const { workflowsAndNodesNames } = useWorkflowsAndNodes(versionId);
  const activeFilters = getActiveFilters(filters);
  const filtersFormatted = extractWorkflowsAndNodes(
    activeFilters,
    workflowsAndNodesNames
  );
  const filtersSortened = filtersFormatted.sort(sortFilters);

  function removeFilter(filter: string, value: NodeChip | null | string) {
    let newFilterValue: string | NodeSelection[] | null = null;
    let updatedFilter: string = filter;

    switch (filter) {
      case 'global':
        newFilterValue = removeNodeFromWorkflow(filters, {
          workflowName: '',
          nodeName: `${value}`
        });
        updatedFilter = 'nodes';
        break;
      case 'nodes':
        newFilterValue = removeNodeFromWorkflow(filters, value as NodeChip);
        break;
      case 'workflow':
        newFilterValue = removeWorkflow(filters, value as string);
        updatedFilter = 'nodes';
        break;
      default:
        newFilterValue = defaultFilters[filter];
    }

    updateFilters({ [updatedFilter]: newFilterValue });
  }

  const filterNodes = filtersSortened.map(([filter, value]: [string, any]) => {
    const { label, title } = getLabelAndTitle(filter, value);
    return (
      <Chip
        key={`${filter}${JSON.stringify(value)}`}
        label={label}
        title={title}
        onClose={() => removeFilter(filter, value)}
      />
    );
  });

  const hasFiltersToShow =
    filters.nodes?.length !== 0 || filters.search !== null;
  const title = hasFiltersToShow
    ? 'Filtered by'
    : 'No processes filtered or search performed';

  return (
    <div className={styles.container}>
      <Left className={styles.leftPannel}>
        <div className={styles.title}>{title}</div>
        <div className={styles.filters}>{filterNodes}</div>
      </Left>
      <Right>
        <Button label="RESET" onClick={resetFilters} />
      </Right>
    </div>
  );
}

export default AppliedFilters;
