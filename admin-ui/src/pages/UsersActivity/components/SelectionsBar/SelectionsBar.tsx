import React from 'react';
import styles from './SelectionsBar.module.scss';
import Left from '../../../../components/Layout/Left/Left';
import Filter from '../../../../components/Form/Filter';
import { VersionsData } from '../../../../hooks/useAllVersions';
import {
  flatSelections,
  GroupSelectData
} from '../../../../components/Form/GroupSelect/GroupSelect';
import { isEmpty } from 'lodash';

type Filter =
  | string[]
  | [
      string,
      (
        | string
        | {
            [key: string]: string;
          }
      )
    ];
export type VersionChip = {
  runtime: string;
  version: string;
};

const filtersOrder = ['userEmail', 'runtime', 'version'];
const filtersOrderDict = Object.fromEntries(
  filtersOrder.map((f, idx) => [f, idx])
);
const sortFilters = (
  [a]: [string, string | { [key: string]: string }],
  [b]: [string, string | { [key: string]: string }]
) => filtersOrderDict[a] - filtersOrderDict[b] || a.localeCompare(b);

function getActiveFilters(filters: Filter[]) {
  return filters.filter(([_, value]) => !isEmpty(value));
}

function getLabelAndTitle(filter: string, value: any) {
  let label = '',
    title = '';

  switch (filter) {
    case 'userEmail':
      label = `User: "${value}"`;
      title = label;
      break;
    case 'runtime':
      label = `Runtime: ${value}`;
      title = label;
      break;
    case 'version':
      label = `${value.runtime}: ${value.version}`;
      title = label;
      break;
    default:
      label = 'unknown';
  }

  return { label, title };
}

type Props = {
  filterValues: {
    userEmail: string;
    versionIds: GroupSelectData;
  };
  runtimesAndVersions: VersionsData[];
  onRemoveFilter: (filter: string, value: string | VersionChip) => void;
};
function SelectionsBar({
  filterValues,
  runtimesAndVersions,
  onRemoveFilter
}: Props) {
  const versionOptions = Object.fromEntries(
    runtimesAndVersions.map(({ runtime: { name: runtimeName }, versions }) => [
      runtimeName,
      versions.map(v => v.name)
    ])
  );

  const filtersFormatted: Filter[] = [
    ['userEmail', filterValues.userEmail],
    ...flatSelections(
      versionOptions,
      filterValues.versionIds,
      'runtime',
      'version'
    )
  ];

  // @ts-ignore
  filtersFormatted.sort(sortFilters);
  const activeFilters = getActiveFilters(filtersFormatted);

  const filterNodes = activeFilters.map(([filter, value]) => (
    <Filter
      filter={filter}
      value={value as any}
      key={`${filter}${JSON.stringify(value)}`}
      removeFilter={onRemoveFilter}
      getLabelAndTitle={getLabelAndTitle}
    />
  ));

  return (
    <>
      {filterNodes.length !== 0 && (
        <div className={styles.container}>
          <Left className={styles.leftPannel}>
            <div className={styles.title}>Filtered by:</div>
            <div className={styles.filters}>{filterNodes}</div>
          </Left>
        </div>
      )}
    </>
  );
}

export default SelectionsBar;
