import React from 'react';
import styles from './LogsFooter.module.scss';
import Button from '../../../../../../../components/Button/Button';
import ClearIcon from '@material-ui/icons/Block';
import FollowIcon from '@material-ui/icons/VerticalAlignBottom';
import LoadMoreIcon from '@material-ui/icons/SystemUpdateAlt';
import Left from '../../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../../components/Layout/Right/Right';
import cx from 'classnames';

type Props = {
  clearLogs: () => void;
  loadMore: () => void;
  toggleAutoScrollActive: () => void;
  autoScrollActive: boolean;
};

function LogsFooter({
  clearLogs,
  loadMore,
  toggleAutoScrollActive,
  autoScrollActive
}: Props) {
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
      <Right style={styles.right}>
        <Button
          height={32}
          label={followText}
          Icon={FollowIcon}
          onClick={toggleAutoScrollActive}
          className={cx({ [styles.active]: autoScrollActive })}
        />
        <Button
          height={32}
          label="LOAD MORE"
          Icon={LoadMoreIcon}
          onClick={loadMore}
        />
      </Right>
    </div>
  );
}

export default LogsFooter;
