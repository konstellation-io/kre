import React from 'react';
import styles from './VersionsList.module.scss';
import { Button } from 'kwc';
import ROUTE from 'Constants/routes';
import VersionInfo from '../VersionInfo/VersionInfo';
import Can from 'Components/Can/Can';
import { GetVersionConfStatus_versions } from 'Graphql/queries/types/GetVersionConfStatus';

type Props = {
  title: string;
  versions: GetVersionConfStatus_versions[];
  showAddVersionButton?: boolean;
  hideNumberOnTitle?: boolean;
};
function VersionsList({
  title,
  versions,
  showAddVersionButton = false,
  hideNumberOnTitle = false
}: Props) {
  if (!versions.length) return null;

  function getTitle() {
    return hideNumberOnTitle ? title : `${title} (${versions.length})`;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>{getTitle()}</span>
        {showAddVersionButton && (
          <Can perform="version:edit">
            <Button
              label="ADD VERSION"
              to={ROUTE.NEW_VERSION}
              primary
              height={30}
            />
          </Can>
        )}
      </div>
      <ul className={styles.list}>
        {versions.map(version => (
          <VersionInfo key={version.id} version={version} />
        ))}
      </ul>
    </section>
  );
}

export default VersionsList;
