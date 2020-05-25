import React from 'react';
import styles from './LogsFooter.module.scss';
import Button from '../../../../../../../components/Button/Button';
import ClearIcon from '@material-ui/icons/Block';
import FollowIcon from '@material-ui/icons/VerticalAlignBottom';
import LoadMoreIcon from '@material-ui/icons/SystemUpdateAlt';
import Left from '../../../../../../../components/Layout/Left/Left';
import Right from '../../../../../../../components/Layout/Right/Right';
import cx from 'classnames';
import SpinnerCircular from '../../../../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';

type Props = {
  clearLogs: () => void;
  loadMore: () => void;
  toggleAutoScrollActive: () => void;
  autoScrollActive: boolean;
  loading: boolean;
  noMoreData: boolean;
};

function LogsFooter({
  clearLogs,
  loadMore,
  toggleAutoScrollActive,
  autoScrollActive,
  loading = false,
  noMoreData = false
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
      <Right className={styles.right}>
        <Button
          height={32}
          label={followText}
          Icon={FollowIcon}
          onClick={toggleAutoScrollActive}
          className={cx({ [styles.active]: autoScrollActive })}
        />
        <div title={noMoreData ? 'No more data to show' : ''}>
          <Button
            height={32}
            label="LOAD MORE"
            Icon={LoadMoreIcon}
            onClick={loadMore}
            disabled={loading || noMoreData}
          />
        </div>
        {loading && (
          <div className={styles.loadMoreLoading}>
            <SpinnerCircular size={40} />
          </div>
        )}
      </Right>
    </div>
  );
}

export default LogsFooter;
