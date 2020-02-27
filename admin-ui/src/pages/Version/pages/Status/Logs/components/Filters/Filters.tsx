import React from 'react';
import styles from './Filters.module.scss';

type FilterProps = {
  filter: string;
  value: string;
};
function Filter({ filter, value }: FilterProps) {
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
function Filters({ filters }: Props) {
  const filterNodes = Object.keys(filters).map((filter: string) => (
    <Filter filter={filter} value={filters[filter]} key={filter} />
  ));
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        Showing logs with the following filters:{' '}
      </div>
      <div className={styles.filters}>{filterNodes}</div>
    </div>
  );
}

export default Filters;
