import {
  GroupSelect,
  GroupSelectData,
  Left,
  MultiSelect,
  MultiSelectOption,
  MultiSelectTheme,
  Right,
  SearchSelect
} from 'kwc';

import DateFilter from './components/DatesFilter/DateFilter';
import { GetLogTabs_logTabs_filters } from 'Graphql/client/queries/getLogs.graphql';
import LevelIcon from 'Components/LevelIcon/LevelIcon';
import { LogLevel } from 'Graphql/types/globalTypes';
import { NodeSelection } from 'Graphql/client/typeDefs';
import React from 'react';
import cx from 'classnames';
import styles from './Filters.module.scss';
import useWorkflowsAndNodes from 'Hooks/useWorkflowsAndNodes';

// TODO: use GroupSelectData in the filters instead of [string]
function nodesSelectionToDoubleSelector(
  selections: NodeSelection[]
): GroupSelectData {
  const data: { [key: string]: string[] } = {};

  selections.forEach(({ workflowName, nodeNames }) => {
    data[workflowName] = nodeNames;
  });

  return data;
}

function doubleSelectorToNodesSelection(
  selections: GroupSelectData
): NodeSelection[] {
  const data: NodeSelection[] = Object.entries(selections).map(
    ([workflowName, nodeNames]) => ({
      workflowName,
      nodeNames,
      __typename: 'NodeSelection'
    })
  );

  return data;
}

const levelsOrdered = [
  LogLevel.INFO,
  LogLevel.DEBUG,
  LogLevel.WARN,
  LogLevel.ERROR
];

type Props = {
  versionId: string;
  updateFilters: Function;
  filterValues: GetLogTabs_logTabs_filters;
};
function Filters({ updateFilters, filterValues, versionId }: Props) {
  const { workflowsAndNodesNames } = useWorkflowsAndNodes(versionId);

  const levelOptions = levelsOrdered.map(
    (level: LogLevel) =>
      ({
        label: level,
        Icon: <LevelIcon level={level} />
      } as MultiSelectOption<LogLevel>)
  );

  function onNodeSelection(newSelection: GroupSelectData) {
    updateFilters({
      nodes: doubleSelectorToNodesSelection(newSelection)
    });
  }

  function onLevelSelection(newLevels: LogLevel[]) {
    updateFilters({ levels: newLevels });
  }

  function onSearchUpdate(newSearch: string) {
    updateFilters({ search: newSearch });
  }

  return (
    <div className={styles.container}>
      <Left className={cx(styles.filterContainer, styles.leftContainer)}>
        <div className={styles.searchFilter}>
          <SearchSelect
            options={[]}
            onChange={onSearchUpdate}
            value={filterValues.search}
            className={styles.searchForm}
            placeholder="Search"
            hideError
            hideLabel
            showSearchIcon
          />
        </div>
        <div className={styles.selectProcesses}>
          <GroupSelect
            options={workflowsAndNodesNames}
            formSelectedOptions={nodesSelectionToDoubleSelector(
              filterValues.nodes || []
            )}
            onChange={onNodeSelection}
            label=""
            placeholder="Select Processes"
            className={styles.selectProcessForm}
            hideError
            hideSelections
          />
        </div>
      </Left>
      <Right className={cx(styles.filterContainer, styles.rightFilters)}>
        <div className={styles.filterLevel}>
          <MultiSelect<LogLevel>
            onChange={onLevelSelection}
            label=""
            hideError
            placeholder="ALL LEVELS"
            selectionUnit="LEVEL"
            selectAllText="ALL LEVELS"
            options={levelOptions}
            formSelectedOptions={filterValues.levels || []}
            theme={MultiSelectTheme.LIGHT}
          />
        </div>
        <DateFilter
          selectedOption={filterValues.dateOption}
          updateFilters={updateFilters}
          formStartDate={filterValues.startDate}
          formEndDate={filterValues.endDate}
        />
      </Right>
    </div>
  );
}

export default Filters;
