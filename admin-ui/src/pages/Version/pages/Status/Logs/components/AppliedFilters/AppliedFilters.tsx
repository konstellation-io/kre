import React from 'react';
import styles from './AppliedFilters.module.scss';
import Button from '../../../../../../../components/Button/Button';
import Left from '../../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../../components/Layout/Right/Right';

type FilterProps = {
  filter: string;
  value: string;
};
export function Filter({ filter, value }: FilterProps) {
  return (
    <div className={styles.filter}>
      <div>{`${filter}: `}</div>
      <div>{value}</div>
    </div>
  );
}

type Props = {
  filters: { [key: string]: string };
};
function AppliedFilters({ filters }: Props) {
  const filterNodes = Object.keys(filters).map((filter: string) => (
    <Filter filter={filter} value={filters[filter]} key={filter} />
  ));

  return (
    <div className={styles.container}>
      <Left style={styles.leftPannel}>
        <div className={styles.title}>Filtered by</div>
        <div className={styles.filters}>{filterNodes}</div>
      </Left>
      <Right>
        <Button label="RESET FILTERS" />
      </Right>
    </div>
  );
}

export default AppliedFilters;
