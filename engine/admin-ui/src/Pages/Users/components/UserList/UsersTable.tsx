import { Check, ContextMenu, MenuCallToAction } from 'kwc';
import { Column, Row, useRowSelect, useSortBy, useTable } from 'react-table';
import React, { useEffect, useMemo } from 'react';
import { capitalize } from 'lodash';

import { AccessLevel } from 'Graphql/types/globalTypes';
import { GetUsers_users } from 'Graphql/queries/types/GetUsers';
import IconArrowDown from '@material-ui/icons/ArrowDropDown';
import IconArrowUp from '@material-ui/icons/ArrowDropUp';
import IconOptions from '@material-ui/icons/MoreVert';
import Message from 'Components/Message/Message';
import { UserSelection } from 'Graphql/client/models/UserSettings';
import cx from 'classnames';
import { formatDate } from 'Utils/format';
import styles from './UserList.module.scss';
import { useReactiveVar } from '@apollo/client';
import useUserSettings from 'Graphql/hooks/useUserSettings';
import { userSettings } from 'Graphql/client/cache';
import { UserSettingsFilters } from 'Graphql/client/typeDefs';

type Data = {
  creationDate: string;
  email: string;
  accessLevel: AccessLevel;
  activeSessions: number;
  lastActivity: string | null;
  selectedRowIds?: string[];
};

const columns: Column<Data>[] = [
  {
    Header: 'Date added',
    accessor: 'creationDate',
    Cell: ({ value }) => formatDate(new Date(value))
  },
  {
    Header: 'User email',
    accessor: 'email'
  },
  {
    Header: 'Access level',
    accessor: 'accessLevel',
    Cell: ({ value }) => capitalize(value)
  },
  {
    Header: 'Active sessions',
    accessor: 'activeSessions'
  },
  {
    Header: 'Last activity',
    accessor: 'lastActivity',
    Cell: ({ value }) => {
      if (value === null) {
        return '-';
      }
      return formatDate(new Date(value), true);
    }
  }
];

type TableColCheckProps = {
  indeterminate?: boolean;
  checked?: boolean;
  onChange?: (arg: { target: { checked: boolean } }) => void;
  className?: string;
};
function TableColCheck({
  indeterminate,
  checked,
  onChange,
  className = ''
}: TableColCheckProps) {
  return (
    <div className={styles.check}>
      <Check
        onChange={() => onChange && onChange({ target: { checked: !checked } })}
        checked={checked || false}
        indeterminate={indeterminate}
        className={cx(className, { [styles.checked]: checked })}
      />
    </div>
  );
}

function rowNotFiltered(row: GetUsers_users, filters: UserSettingsFilters) {
  let filtered = false;

  if (filters.email && !row.email.includes(filters.email)) filtered = true;
  if (filters.accessLevel && row.accessLevel !== filters.accessLevel)
    filtered = true;

  return !filtered;
}

type Props = {
  users: GetUsers_users[];
  contextMenuActions: MenuCallToAction[];
};
function UsersTable({ users, contextMenuActions }: Props) {
  const { updateSelection } = useUserSettings();

  const dataUserSettings = useReactiveVar(userSettings);
  const filters = dataUserSettings.filters || {
    email: null,
    accessLevel: null,
    __typename: 'UserSettingsFilters'
  };
  const userSelection = dataUserSettings.userSelection;

  const data = useMemo(
    // @ts-ignore
    () => users.filter(user => rowNotFiltered(user, filters)),
    [filters, users]
  );

  const actSelectedUsers = dataUserSettings.selectedUserIds || [];
  const initialStateSelectedRowIds = Object.fromEntries(
    data.map((user, idx) => [idx, actSelectedUsers.includes(user.id)])
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    toggleAllRowsSelected,
    state: { selectedRowIds }
  } = useTable<Data>(
    {
      columns,
      data,
      initialState: {
        selectedRowIds: initialStateSelectedRowIds
      }
    },
    useSortBy,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }) => (
            <TableColCheck
              {...getToggleAllRowsSelectedProps()}
              className={styles.headerCheck}
            />
          ),
          Cell: ({ row }: { row: Row }) => (
            <TableColCheck {...row.getToggleRowSelectedProps()} />
          )
        },
        ...columns,
        {
          id: 'options',
          Cell: ({ row }: { row: Row }) => (
            <ContextMenu
              actions={contextMenuActions}
              contextObject={(row.original as Row).id}
              openOnLeftClick
            >
              <div className={styles.options}>
                <IconOptions className="icon-regular" />
              </div>
            </ContextMenu>
          )
        }
      ]);
    }
  );

  useEffect(() => {
    switch (userSelection) {
      case UserSelection.ALL:
        toggleAllRowsSelected(true);
        break;
      case UserSelection.NONE: {
        toggleAllRowsSelected(false);
      }
    }
  }, [userSelection, toggleAllRowsSelected]);

  useEffect(() => {
    const actSelectedUsers = dataUserSettings.selectedUserIds;
    const newSelectedUsersPos = Object.entries(selectedRowIds)
      .filter(([_, isSelected]) => isSelected)
      .map(([rowId, _]) => rowId);

    if (actSelectedUsers?.length !== newSelectedUsersPos.length) {
      let newUserSelection: UserSelection;

      switch (newSelectedUsersPos.length) {
        case 0:
          newUserSelection = UserSelection.NONE;
          break;
        case data.length:
          newUserSelection = UserSelection.ALL;
          break;
        default:
          newUserSelection = UserSelection.INDETERMINATE;
      }

      const newSelectedUsers: string[] = data
        .filter((_: GetUsers_users, idx: number) =>
          newSelectedUsersPos.includes(idx.toString())
        )
        .map((user: GetUsers_users) => user.id);

      updateSelection(newSelectedUsers, newUserSelection);
    }
  }, [selectedRowIds, updateSelection, data, dataUserSettings]);

  if (data.length === 0)
    return <Message text="There are no users with the applied filters" />;

  return (
    <table {...getTableProps()} className={styles.table}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                {column.render('Header')}
                <span>
                  {column.isSorted ? (
                    column.isSortedDesc ? (
                      <span className={styles.sortIcon}>
                        <IconArrowDown className="icon-regular" />
                      </span>
                    ) : (
                      <span className={styles.sortIcon}>
                        <IconArrowUp className="icon-regular" />
                      </span>
                    )
                  ) : (
                    ''
                  )}
                </span>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default UsersTable;
