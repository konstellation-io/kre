import React, { FC } from 'react';
import Select, {
  CustomOptionProps
} from '../../../../../../components/Form/Select/Select';
import Check from '../../../../../../components/Form/Check/Check';
import {
  GET_USER_SETTINGS,
  GetUserSettings
} from '../../../../../../graphql/client/queries/getUserSettings.graphql';
import IconDelete from '@material-ui/icons/Delete';
import IconRevoke from '@material-ui/icons/HighlightOff';
import styles from './UserFiltersAndActions.module.scss';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import { get } from 'lodash';
import cx from 'classnames';
import { AccessLevel } from '../../../../../../graphql/types/globalTypes';
import { UserSelection } from '../../../../../../graphql/client/typeDefs';

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
  CHANGE_USER_TYPE_TO = 'CHANGE USER TYPE TO',
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
  const client = useApolloClient();
  const { data: localData } = useQuery<GetUserSettings>(GET_USER_SETTINGS);

  const types = Object.values(Actions);

  const nSelections: number = get(localData, 'userSettings.selectedUserIds', [])
    .length;
  const userSelection: UserSelection = get(
    localData,
    'userSettings.userSelection',
    UserSelection.NONE
  );

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

    client.writeData({
      data: {
        userSettings: {
          userSelection: newUserSelection,
          __typename: 'UserSettings'
        }
      }
    });
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
            [Actions.CHANGE_USER_TYPE_TO]: CustomSeparator
          }}
        />
      </div>
    </div>
  );
}

export default UserActions;
