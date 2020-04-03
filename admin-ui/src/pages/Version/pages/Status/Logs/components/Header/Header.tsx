import React from 'react';

import IconOpen from '@material-ui/icons/ExpandLess';
import IconClose from '@material-ui/icons/ExpandMore';
import IconStickBottom from '@material-ui/icons/VerticalAlignBottom';
import IconClear from '@material-ui/icons/DeleteOutline';
import IconLogs from '@material-ui/icons/ListAlt';

import cx from 'classnames';
import styles from './Header.module.scss';
import { useApolloClient, useQuery } from '@apollo/react-hooks';
import { GET_LOGS } from '../../../../../../../graphql/client/queries/getLogs.graphql';
import { LocalState } from '../../../../../../..';

type Props = {
  togglePanel: () => void;
  opened: boolean;
  onClearClick: Function;
};
function Header({ togglePanel, opened, onClearClick }: Props) {
  const Icon = opened ? IconClose : IconOpen;
  const client = useApolloClient();
  const { data: localData } = useQuery<LocalState>(GET_LOGS);

  function clearLogs(): void {
    onClearClick();
  }
  function onToggleAutoScroll() {
    client.writeData({ data: { logsAutoScroll: !localData?.logsAutoScroll } });
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: opened
      })}
    >
      <div className={styles.title}>
        <IconLogs className="icon-regular" />
        <span>Logs console</span>
      </div>
      <div className={styles.buttons}>
        <div onClick={clearLogs}>
          <IconClear className="icon-regular" />
        </div>
        <div
          className={cx(styles.stickBottom, {
            [styles.active]: localData?.logsAutoScroll
          })}
          onClick={onToggleAutoScroll}
        >
          <IconStickBottom className="icon-regular" />
        </div>
        <div onClick={togglePanel}>
          <Icon className="icon-regular" />
        </div>
      </div>
    </div>
  );
}

export default Header;
