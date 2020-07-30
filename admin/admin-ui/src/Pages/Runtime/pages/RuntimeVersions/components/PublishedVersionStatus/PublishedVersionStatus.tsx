import { Button } from 'konstellation-web-components';
import Can from 'Components/Can/Can';
import ROUTE from 'Constants/routes';
import React from 'react';
import { buildRoute } from 'Utils/routes';
import cx from 'classnames';
import styles from '../../RuntimeVersions.module.scss';
import { useParams } from 'react-router';

type Props = {
  nPublishedVersions: number;
  noVersions: boolean;
};
function PublishedVersionStatus({ noVersions, nPublishedVersions }: Props) {
  const { runtimeId } = useParams();

  let title;
  if (noVersions) {
    title =
      'There are no runtime versions. Please, upload a new version to start working on this runtime.';
  } else if (nPublishedVersions >= 1) {
    title = `${nPublishedVersions} version${
      nPublishedVersions > 1 ? 's' : ''
    } published`;
  } else {
    title = 'There is no published version';
  }

  const newVersionRoute = buildRoute.runtime(ROUTE.NEW_VERSION, runtimeId);

  return (
    <div
      className={cx(styles.activeVersion, {
        [styles['active']]: nPublishedVersions
      })}
    >
      <span className={styles.versionTitle}>{title}</span>
      <Can perform="version:edit">
        <Button
          label="ADD VERSION"
          to={newVersionRoute}
          primary
          height={30}
          style={{ borderRadius: 2 }}
        />
      </Can>
    </div>
  );
}

export default PublishedVersionStatus;
