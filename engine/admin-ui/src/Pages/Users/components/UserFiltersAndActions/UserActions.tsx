import { Check, CustomOptionProps, Select } from 'kwc';
import React, { FC } from 'react';

import { AccessLevel } from 'Graphql/types/globalTypes';
import IconDelete from '@material-ui/icons/Delete';
import IconRevoke from '@material-ui/icons/HighlightOff';
import { UserSelection } from 'Graphql/client/models/UserSettings';
import cx from 'classnames';
import styles from './UserFiltersAndActions.module.scss';
import { useReactiveVar } from '@apollo/client';
import useUserSettings from 'Graphql/hooks/useUserSettings';
import { userSettings } from '../../../../Graphql/client/cache';

type CheckSelectAllPros = {
  handleCheckClick: (value: boolean) => void;
  userSelection: UserSelection;
};
const CheckSelectAll: FC<CheckSelectAllPros> = ({
  handleCheckClick,
  userSelection
}) => (
  <div className={styles.selectAll}>
    <Check
      onChange={handleCheckClick}
      checked={userSelection === UserSelection.ALL}
      indeterminate={userSelection === UserSelection.INDETERMINATE}
    />
    <span>Select All</span>
  </div>
);

const CustomRemove: FC<CustomOptionProps> = ({ label }) => (
  <div className={styles.customOption}>
    <IconDelete className="icon-small" />
    <div>{label}</div>
  </div>
);
const CustomRevoke: FC<CustomOptionProps> = ({ label }) => (
  <div className={styles.customOption}>
    <IconRevoke className="icon-small" />
    <div>{label}</div>
  </div>
);
const CustomSeparator: FC<CustomOptionProps> = ({ label }) => (
  <div className={cx(styles.customOption, styles.separator)}>{label}</div>
);

enum Actions {
  DELETE = 'DELETE',
  REVOKE_ACCESS = 'REVOKE ACTIVE SESSIONS',
  CHANGE_ACCESS_LEVEL_TO = 'CHANGE ACCESS LEVEL TO',
  VIEWER = 'VIEWER',
  MANAGER = 'MANAGER',
  ADMIN = 'ADMIN'
}

type Props = {
  onDeleteUsers: () => void;
  onRevokeUsers: () => void;
  onUpdateUsers: (newAccessLevel: AccessLevel) => void;
};
function UserActions({ onDeleteUsers, onRevokeUsers, onUpdateUsers }: Props) {
  const { changeUserSelection } = useUserSettings();

  const dataUserSettings = useReactiveVar(userSettings);

  const types = Object.values(Actions);

  const nSelections = dataUserSettings.selectedUserIds.length || 0;
  const userSelection = dataUserSettings.userSelection;

  const nSelectionsText = `(${nSelections} selected)`;

  function onAction(action: Actions) {
    switch (action) {
      case Actions.DELETE:
        onDeleteUsers();
        break;
      case Actions.REVOKE_ACCESS:
        onRevokeUsers();
        break;
      case Actions.VIEWER:
        onUpdateUsers(AccessLevel.VIEWER);
        break;
      case Actions.MANAGER:
        onUpdateUsers(AccessLevel.MANAGER);
        break;
      case Actions.ADMIN:
        onUpdateUsers(AccessLevel.ADMIN);
        break;
    }
  }

  function handleCheckClick() {
    let newUserSelection;

    switch (userSelection) {
      case UserSelection.NONE:
        newUserSelection = UserSelection.ALL;
        break;
      case UserSelection.INDETERMINATE:
        newUserSelection = UserSelection.ALL;
        break;
      case UserSelection.ALL:
        newUserSelection = UserSelection.NONE;
        break;
    }

    changeUserSelection(newUserSelection);
  }

  return (
    <div className={styles.actions}>
      <CheckSelectAll
        userSelection={userSelection}
        handleCheckClick={handleCheckClick}
      />
      <span className={styles.nSelections}>{nSelectionsText}</span>
      <div className={styles.formActions}>
        <Select
          label="Actions"
          options={types}
          onChange={onAction}
          placeholder="Select one"
          showSelectAllOption={false}
          shouldSort={false}
          disabled={nSelections === 0}
          disabledOptions={[types[2]]}
          CustomOptions={{
            [Actions.DELETE]: CustomRemove,
            [Actions.REVOKE_ACCESS]: CustomRevoke,
            [Actions.CHANGE_ACCESS_LEVEL_TO]: CustomSeparator
          }}
        />
      </div>
    </div>
  );
}

export default UserActions;
