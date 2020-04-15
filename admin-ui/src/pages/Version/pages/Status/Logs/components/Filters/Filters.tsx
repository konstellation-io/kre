import React from 'react';
import styles from './Filters.module.scss';
import DateFilter from './components/DatesFilter/DateFilter';

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
  onDateChange: Function;
};
function Filters({ filters, onDateChange }: Props) {
  const filterNodes = Object.keys(filters).map((filter: string) => (
    <Filter filter={filter} value={filters[filter]} key={filter} />
  ));

  return (
    <div className={styles.container}>
      <div className={styles.leftFilters}>
        <div className={styles.title}>
          Showing logs with the following filters:{' '}
        </div>
        <div className={styles.filters}>{filterNodes}</div>
      </div>
      <div className={styles.rightFilters}>
        <DateFilter onDateChange={onDateChange} />
      </div>
    </div>
  );
}

export default Filters;
