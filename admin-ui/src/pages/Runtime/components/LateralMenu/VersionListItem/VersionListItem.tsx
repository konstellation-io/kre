import React from 'react';
import { Version } from '../../../../../graphql/models';
import IconArrowForward from '@material-ui/icons/ArrowForward';
import cx from 'classnames';
import styles from './VersionListItem.module.scss';

type VersionListItemProps = {
  version: Version;
  selected: boolean;
  onSelect: (v: Version) => void;
};

function VersionListItem({
  version,
  selected,
  onSelect
}: VersionListItemProps) {
  return (
    <div
      className={cx(styles.item, selected ? styles.itemSelected : null)}
      onClick={() => onSelect(version)}
    >
      <div className={styles.name}>
        <div className={cx(styles.circle, styles[version.status])}></div>
        <div>{version.name}</div>
        <div className={styles.arrow}>
          <IconArrowForward className="icon-regular" />
        </div>
      </div>
      <div>
        <div className={styles.desc}>{version.description}</div>
      </div>
    </div>
  );
}

export default VersionListItem;
