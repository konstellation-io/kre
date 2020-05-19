import React from 'react';
import styles from './Filters.module.scss';
import DateFilter from './components/DatesFilter/DateFilter';
import Right from '../../../../../../../components/Layout/Right/Right';
import Left from '../../../../../../../components/Layout/Left/Left';
import SearchSelect from '../../../../../../../components/Form/SearchSelect/SearchSelect';
import { loader } from 'graphql.macro';
import Select, {
  SelectorType
} from '../../../../../../../components/Form/Select/Select';
import DoubleSelect, {
  DoubleSelectData
} from '../../../../../../../components/Form/DoubleSelect/DoubleSelect';
import cx from 'classnames';
import { LogLevel } from '../../../../../../../graphql/types/globalTypes';
import { useQuery } from '@apollo/react-hooks';
import {
  GetVersionWorkflowsVariables,
  GetVersionWorkflows
} from '../../../../../../../graphql/queries/types/GetVersionWorkflows';
import { ProcessSelection } from '../../../../../../../graphql/client/typeDefs';
import { GetLogTabs_logTabs_filters } from '../../../../../../../graphql/client/queries/getLogs.graphql';

const GetVersionWorkflowsQuery = loader(
  '../../../../../../../graphql/queries/getVersionWorkflows.graphql'
);

function processSelectionToDoubleSelector(
  selections: ProcessSelection[]
): DoubleSelectData {
  const data: { [key: string]: string[] } = {};

  selections.forEach(({ workflowName, processNames }) => {
    data[workflowName] = processNames;
  });

  return data;
}

function doubleSelectorToProcessSelection(
  selections: DoubleSelectData
): ProcessSelection[] {
  const data: ProcessSelection[] = Object.entries(selections).map(
    ([workflowName, processes]) => ({
      workflowName,
      processNames: processes,
      __typename: 'ProcessSelection'
    })
  );

  return data;
}

type Props = {
  versionId: string;
  updateFilters: Function;
  filterValues: GetLogTabs_logTabs_filters;
};
function Filters({ updateFilters, filterValues, versionId }: Props) {
  const { data } = useQuery<GetVersionWorkflows, GetVersionWorkflowsVariables>(
    GetVersionWorkflowsQuery,
    {
      variables: { versionId }
    }
  );

  const workflowsAndProcesses: { [key: string]: string[] } = {};
  data?.version.workflows.forEach(
    workflow =>
      (workflowsAndProcesses[workflow.name] = workflow.nodes.map(
        node => node.name
      ))
  );

  const logTypes = Object.values(LogLevel);

  function onProcessSelection(newSelection: DoubleSelectData) {
    updateFilters({
      processes: doubleSelectorToProcessSelection(newSelection)
    });
  }

  function onLevelSelection(newLevel: LogLevel) {
    updateFilters({ level: newLevel });
  }

  function onSearchUpdate(newSearch: string) {
    updateFilters({ search: newSearch });
  }

  return (
    <div className={styles.container}>
      <Left style={styles.filterContainer}>
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
          <DoubleSelect
            options={workflowsAndProcesses}
            formSelectedOptions={processSelectionToDoubleSelector(
              filterValues.processes || []
            )}
            onChange={onProcessSelection}
            label=""
            placeholder="Select Processes"
            hideError
            hideSelections
          />
        </div>
        <div className={styles.selectType}>
          <Select
            placeholder="ALL LEVELS"
            options={logTypes}
            formSelectedOption={filterValues.level}
            onChange={onLevelSelection}
            label=""
            className={styles.selectTypeForm}
            type={SelectorType.LIGHT}
            hideError
          />
        </div>
      </Left>
      <Right style={cx(styles.filterContainer, styles.rightFilters)}>
        <DateFilter
          selectedOption={filterValues.dateOption}
          updateFilters={updateFilters}
        />
      </Right>
    </div>
  );
}

export default Filters;
