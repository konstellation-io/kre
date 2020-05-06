import React from 'react';
import styles from './Filters.module.scss';
import DateFilter from './components/DatesFilter/DateFilter';
import { TabFilters } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import Button from '../../../../../../../components/Button/Button';
import Right from '../../../../../../../components/Layout/Right/Right';

type Props = {
  onDateChange: Function;
  filterValues: TabFilters;
};
function Filters({ onDateChange, filterValues }: Props) {
  return (
    <div className={styles.container}>
      <Right style={styles.rightFilters}>
        <DateFilter
          selectedOption={filterValues.dateOption}
          onDateChange={onDateChange}
        />
        <Button label="JUMP TO NOW" />
      </Right>
    </div>
  );
}

export default Filters;
