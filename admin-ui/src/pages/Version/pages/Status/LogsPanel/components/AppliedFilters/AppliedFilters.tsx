import React, { MouseEvent } from 'react';
import styles from './AppliedFilters.module.scss';
import Button from '../../../../../../../components/Button/Button';
import Left from '../../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../../components/Layout/Right/Right';
import Filter from './Filter';
import { NodeSelection } from '../../../../../../../graphql/client/typeDefs';
import { defaultFilters } from '../../../../../../../graphql/client/resolvers/updateTabFilters';
import useWorkflowsAndNodes from '../../../../../../../hooks/useWorkflowsAndNodes';

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
          nodeNames.length === workflowsAndNodesNames[workflowName].length;

        if (allNodesSelected) newSelections.push(['workflow', workflowName]);
        else {
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

  const filterNodes = filtersSortened.map(([filter, value]: [string, any]) => (
    <Filter
      filter={filter}
      value={value}
      key={`${filter}${JSON.stringify(value)}`}
      removeFilter={removeFilter}
    />
  ));

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
