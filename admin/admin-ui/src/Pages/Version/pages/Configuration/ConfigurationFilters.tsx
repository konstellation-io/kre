import Select, { SelectTheme } from 'Components/Form/Select/Select';

import Button from 'Components/Button/Button';
import { ConfigurationVariableType } from 'Graphql/types/globalTypes';
import HideIcon from '@material-ui/icons/VisibilityOff';
import React from 'react';
import SearchSelect from 'Components/Form/SearchSelect/SearchSelect';
import { VersionConfigurationFormData } from './Configuration';
import ViewIcon from '@material-ui/icons/Visibility';
import styles from './Configuration.module.scss';

type Props = {
  filterValues: VersionConfigurationFormData;
  setValue: Function;
  showAll: boolean;
  toggleShowAll: Function;
};
function ConfigurationFilters({
  setValue,
  showAll,
  filterValues,
  toggleShowAll
}: Props) {
  const showAllText = `${showAll ? 'HIDE' : 'SHOW'} ALL`;
  const ShowAllIcon = showAll ? HideIcon : ViewIcon;

  return (
    <div className={styles.filters}>
      <div className={styles.filterSearch}>
        <SearchSelect
          options={[]}
          onChange={(newValue: string) => setValue('varName', newValue)}
          value={filterValues.varName}
          placeholder="Search"
          hideError
          hideLabel
          showSearchIcon
          showClear
        />
      </div>
      <div className={styles.filterType}>
        <Select
          onChange={(newType: ConfigurationVariableType) =>
            setValue('type', newType)
          }
          label=""
          hideError
          placeholder="ALL TYPES"
          options={Object.values(ConfigurationVariableType)}
          formSelectedOption={filterValues.type}
          theme={SelectTheme.LIGHT}
        />
      </div>
      <div className={styles.button}>
        <Button
          label={showAllText}
          Icon={ShowAllIcon}
          onClick={() => toggleShowAll()}
        />
      </div>
    </div>
  );
}

export default ConfigurationFilters;
