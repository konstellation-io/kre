import React from 'react';
import Check from '../../../../../../components/Form/Check/Check';
import IconOptions from '@material-ui/icons/MoreVert';
import IconDelete from '@material-ui/icons/Delete';
import IconRevoke from '@material-ui/icons/HighlightOff';
import IconArrowDown from '@material-ui/icons/ArrowDropDown';
import IconArrowUp from '@material-ui/icons/ArrowDropUp';
import { useTable, useSortBy, useRowSelect } from 'react-table';
import cx from 'classnames';
import styles from './UserList.module.scss';
import ContextMenu, {
  MenuCallToAction
} from '../../../../../../components/ContextMenu/ContextMenu';

const columns = [
  {
    Header: 'Date added',
    accessor: 'dateAdded'
  },
  {
    Header: 'User email',
    accessor: 'userEmail'
  },
  {
    Header: 'Access level',
    accessor: 'accessLevel'
  },
  {
    Header: 'Last access',
    accessor: 'lastAccess'
  }
];

const data = [
  {
    dateAdded: '2018-01-02',
    userEmail: 'mariano.gonzalez@intelygenz.com',
    accessLevel: 'ADMIN',
    lastAccess: '2020-01-02'
  },
  {
    dateAdded: '2018-01-02',
    userEmail: 'angel.sanchez@intelygenz.com',
    accessLevel: 'ADMIN',
    lastAccess: '2020-01-02'
  },
  {
    dateAdded: '2018-01-02',
    userEmail: 'daniel.chavero@intelygenz.com',
    accessLevel: 'ADMIN',
    lastAccess: '2020-01-02'
  }
];

// @ts-ignore
function IndeterminateCheckbox({
  indeterminate,
  checked,
  onChange,
  className
}: any) {
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

function UserList() {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { selectedRowIds }
  } = useTable(
    {
      // @ts-ignore
      columns,
      data
    },
    useSortBy,
    useRowSelect,
    (hooks: any) => {
      hooks.visibleColumns.push((columns: any) => [
        {
          id: 'selection',
          Header: ({ getToggleAllRowsSelectedProps }: any) => (
            <IndeterminateCheckbox
              {...getToggleAllRowsSelectedProps()}
              className={styles.headerCheck}
            />
          ),
          Cell: ({ row }: any) => (
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
          )
        },
        ...columns,
        {
          id: 'options',
          Cell: ({ row }: any) => (
            <ContextMenu actions={contextMenuActions} openOnLeftClick>
              <div className={styles.options}>
                <IconOptions className="icon-regular" />
              </div>
            </ContextMenu>
          )
        }
      ]);
    }
  );

  const contextMenuActions: MenuCallToAction[] = [
    {
      Icon: IconDelete,
      text: 'delete',
      callToAction: () => {}
    },
    {
      Icon: IconRevoke,
      text: 'revoke access',
      callToAction: () => {}
    },
    {
      text: 'change user type to',
      separator: true
    },
    {
      text: 'viewer',
      callToAction: () => {}
    },
    {
      text: 'manager',
      callToAction: () => {}
    },
    {
      text: 'administrator',
      callToAction: () => {}
    }
  ];

  return (
    <div>
      <table {...getTableProps()} className={styles.table}>
        <thead>
          {headerGroups.map((headerGroup: any) => (
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
          {rows.map((row: any) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: any) => {
                  return (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UserList;
