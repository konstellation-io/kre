import React, { useEffect, useMemo } from 'react';
import Check from '../../../../../../components/Form/Check/Check';
import IconOptions from '@material-ui/icons/MoreVert';
import IconArrowDown from '@material-ui/icons/ArrowDropDown';
import IconArrowUp from '@material-ui/icons/ArrowDropUp';
import { useTable, useSortBy, useRowSelect, Column } from 'react-table';
import cx from 'classnames';
import styles from './UserList.module.scss';
import ContextMenu, {
  MenuCallToAction
} from '../../../../../../components/ContextMenu/ContextMenu';
import { GetUsers_users } from '../../../../../../graphql/queries/types/GetUsers';
import { formatDate } from '../../../../../../utils/format';
import {
  GET_USER_SETTINGS,
  GetUserSettings,
  GetUserSettings_filters
} from '../../../../../../graphql/client/queries/getUserSettings.graphql';
import { useQuery, useApolloClient } from '@apollo/react-hooks';
import Message from '../../../../../../components/Message/Message';
import { AccessLevel } from '../../../../../../graphql/types/globalTypes';
import { UserSelection } from '../../../../../../graphql/client/typeDefs';
import { get } from 'lodash';

// TODO: [typescript] Review `any`s used in this file

type Data = {
  creationDate: string;
  email: string;
  accessLevel: AccessLevel;
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
    accessor: 'accessLevel'
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
  indeterminate: boolean;
  checked: boolean;
  onChange: Function;
  className: string;
};
function TableColCheck({
  indeterminate,
  checked,
  onChange,
  className
}: TableColCheckProps) {
  return (
    <div className={styles.check}>
      <Check
        onChange={() => onChange({ target: { checked: !checked } })}
        checked={checked}
        indeterminate={indeterminate}
        className={cx(className, { [styles.checked]: checked })}
      />
    </div>
  );
}

function rowNotFiltered(row: GetUsers_users, filters: GetUserSettings_filters) {
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
  const client = useApolloClient();
  const { data: localData } = useQuery<GetUserSettings>(GET_USER_SETTINGS);
  const filters = get(localData, 'userSettings.filters', {
    email: null,
    accessLevel: null
  });
  const userSelection: UserSelection = get(
    localData,
    'userSettings.userSelection',
    UserSelection.NONE
  );

  const data = useMemo(
    () => users.filter(user => rowNotFiltered(user, filters)),
    [filters, users]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    // @ts-ignore  // TODO: [typescript] Fix this
    toggleAllRowsSelected,
    // @ts-ignore  // TODO: [typescript] Fix this
    state: { selectedRowIds }
  } = useTable<Data>(
    {
      columns,
      data
    },
    useSortBy,
    useRowSelect,
    hooks => {
      hooks.visibleColumns.push(columns => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }: any) => (
            <TableColCheck
              {...getToggleAllRowsSelectedProps()}
              className={styles.headerCheck}
            />
          ),
          Cell: ({ row }: any) => (
            <TableColCheck {...row.getToggleRowSelectedProps()} />
          )
        },
        ...columns,
        {
          id: 'options',
          Cell: ({ row }: any) => (
            <ContextMenu
              actions={contextMenuActions}
              contextObject={row.original.id}
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
    const actSelectedUsers = localData?.userSettings.selectedUserIds;
    const newSelectedUsersPos = Object.keys(selectedRowIds);

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

      client.writeData({
        data: {
          userSettings: {
            selectedUserIds: newSelectedUsers,
            userSelection: newUserSelection,
            __typename: 'UserSettings'
          }
        }
      });
    }
  }, [selectedRowIds, client, data, localData]);

  if (data.length === 0)
    return <Message text="There are no users with the applied filters" />;

  return (
    <table {...getTableProps()} className={styles.table}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column: any) => (
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
