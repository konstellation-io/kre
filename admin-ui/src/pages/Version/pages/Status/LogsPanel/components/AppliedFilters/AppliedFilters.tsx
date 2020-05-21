import React, { MouseEvent } from 'react';
import styles from './AppliedFilters.module.scss';
import Button from '../../../../../../../components/Button/Button';
import Left from '../../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../../components/Layout/Right/Right';
import Filter from './Filter';
import { GetLogTabs_logTabs_filters } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import { ProcessSelection } from '../../../../../../../graphql/client/typeDefs';
import { defaultFilters } from '../../../../../../../graphql/client/resolvers/updateTabFilters';

export type ProcessChip = {
  workflowName: string;
  processName: string;
};

const filtersToHide = ['dateOption', '__typename', 'nodeId'];
const nonEditableFilters = ['workflowId', 'nodeName', 'startDate', 'endDate'];

const isHidden = (filter: string) => filtersToHide.includes(filter);
export const isEditable = (filter: string) =>
  !nonEditableFilters.includes(filter);
const isEmpty = (filter: null | string | [string]) =>
  filter === null || filter === '' || (Array.isArray(filter) && !filter.length);

const filtersOrder = [
  'workflowId',
  'nodeName',
  'startDate',
  'endDate',
  'processes',
  'search',
  'level'
];
const filtersOrderDict = Object.fromEntries(
  filtersOrder.map((f, idx) => [f, idx])
);
const sortFilters = (
  [a]: [string, string | ProcessChip],
  [b]: [string, string | ProcessChip]
) => filtersOrderDict[a] - filtersOrderDict[b] || a.localeCompare(b);

function getActiveFilters(filters: GetLogTabs_logTabs_filters) {
  return Object.entries(filters).filter(
    ([filter, value]) => !isHidden(filter) && !isEmpty(value)
  );
}

function splitProcessSelections(selections: [string, any][]) {
  return selections
    .map(([filter, value]) =>
      filter === 'processes'
        ? value
            .map(({ workflowName, processNames }: ProcessSelection) =>
              processNames.map(processName => [
                filter,
                {
                  workflowName,
                  processName
                }
              ])
            )
            .flat()
        : [[filter, value]]
    )
    .flat();
}

type Props = {
  filters: GetLogTabs_logTabs_filters;
  updateFilters: Function;
  resetFilters: (e: MouseEvent<HTMLDivElement>) => void;
};
function AppliedFilters({ filters, updateFilters, resetFilters }: Props) {
  const activeFilters = getActiveFilters(filters);
  const filtersFormatted = splitProcessSelections(activeFilters);
  const filtersSortened = filtersFormatted.sort(sortFilters);

  function removeFilter(filter: string, value: ProcessChip | null | string) {
    let newFilterValue: string | ProcessSelection[] | null = null;

    if (filter === 'processes') {
      newFilterValue =
        filters?.processes?.map(workflow => ({
          ...workflow,
          processNames: workflow.processNames.filter(
            process =>
              !(
                workflow.workflowName === (value as ProcessChip).workflowName &&
                process === (value as ProcessChip).processName
              )
          )
        })) || null;
    } else {
      newFilterValue = defaultFilters[filter];
    }
    updateFilters({ [filter]: newFilterValue });
  }

  const filterNodes = filtersSortened.map(([filter, value]) => (
    <Filter
      filter={filter}
      value={value}
      key={`${filter}${value?.workflowName}${value?.processName}`}
      removeFilter={removeFilter}
    />
  ));

  return (
    <div className={styles.container}>
      <Left className={styles.leftPannel}>
        <div className={styles.title}>Filtered by</div>
        <div className={styles.filters}>{filterNodes}</div>
      </Left>
      <Right>
        <Button label="RESET" onClick={resetFilters} />
      </Right>
    </div>
  );
}

export default AppliedFilters;
