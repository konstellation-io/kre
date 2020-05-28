import React from 'react';
import styles from './LogsFooter.module.scss';
import Button from '../../../../../../../components/Button/Button';
import ClearIcon from '@material-ui/icons/Block';
import FollowIcon from '@material-ui/icons/VerticalAlignBottom';
import ExpandAllIcon from '@material-ui/icons/UnfoldMore';
import ContractAllIcon from '@material-ui/icons/UnfoldLess';
import Left from '../../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../../components/Layout/Right/Right';
import cx from 'classnames';

type Props = {
  clearLogs: () => void;
  toggleAutoScrollActive: () => void;
  autoScrollActive: boolean;
  allLogsOpened: boolean;
  toggleAllLogsOpened: () => void;
};

function LogsFooter({
  clearLogs,
  toggleAutoScrollActive,
  autoScrollActive,
  allLogsOpened,
  toggleAllLogsOpened
}: Props) {
  const IconAllLogsOpened = allLogsOpened ? ContractAllIcon : ExpandAllIcon;
  const allLogsOpenedText = allLogsOpened ? 'CLOSE ALL LOGS' : 'OPEN ALL LOGS';
  const followText = `${autoScrollActive ? 'UN' : ''}FOLLOW NEW LOGS`;
  return (
    <div className={styles.container}>
      <Left>
        <Button
          height={32}
          label="CLEAR"
          Icon={ClearIcon}
          onClick={clearLogs}
        />
      </Left>
      <Right className={styles.right}>
        <Button
          height={32}
          label={allLogsOpenedText}
          Icon={IconAllLogsOpened}
          onClick={toggleAllLogsOpened}
          className={cx({ [styles.active]: autoScrollActive })}
        />
        <Button
          height={32}
          label={followText}
          Icon={FollowIcon}
          onClick={toggleAutoScrollActive}
          className={cx({ [styles.active]: autoScrollActive })}
        />
      </Right>
    </div>
  );
}

export default LogsFooter;
