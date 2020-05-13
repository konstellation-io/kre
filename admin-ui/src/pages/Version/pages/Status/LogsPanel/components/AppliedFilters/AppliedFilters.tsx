import React from 'react';
import styles from './AppliedFilters.module.scss';
import Button from '../../../../../../../components/Button/Button';
import Left from '../../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../../components/Layout/Right/Right';
import Filter from './Filter';
import { GetLogTabs_logTabs_filters } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import { ProcessSelection } from '../../../../../../../graphql/client/typeDefs';

export type ProcessChip = {
  workflowName: string;
  processes: string[];
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
  'processes',
  'startDate',
  'endDate',
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

function splitWorkflowSelections(selections: [string, any][]) {
  return selections
    .map(([filter, value]) =>
      filter === 'processes'
        ? value.map(({ workflowName, processNames }: ProcessSelection) => [
            filter,
            { workflowName, processes: processNames }
          ])
        : [[filter, value]]
    )
    .flat();
}

type Props = {
  filters: GetLogTabs_logTabs_filters;
  removeFilters: Function;
};
function AppliedFilters({ filters, removeFilters }: Props) {
  const activeFilters = getActiveFilters(filters);
  const filtersFormatted = splitWorkflowSelections(activeFilters);
  const filtersSortened = filtersFormatted.sort(sortFilters);

  const filterNodes = filtersSortened.map(([filter, value]) => (
    <Filter
      filter={filter}
      value={value}
      key={`${filter}${value?.workflowName}`}
      removeFilters={removeFilters}
    />
  ));

  function resetFilters() {
    const removableFilters = Object.entries(filters).filter(
      ([filter, value]) =>
        isEditable(filter) && !isHidden(filter) && !isEmpty(value)
    );

    removeFilters(Object.fromEntries(removableFilters));
  }

  return (
    <div className={styles.container}>
      <Left style={styles.leftPannel}>
        <div className={styles.title}>Filtered by</div>
        <div className={styles.filters}>{filterNodes}</div>
      </Left>
      <Right>
        <Button label="RESET FILTERS" onClick={resetFilters} />
      </Right>
    </div>
  );
}

export default AppliedFilters;
