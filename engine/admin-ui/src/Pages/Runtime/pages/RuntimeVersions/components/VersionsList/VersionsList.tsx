import React from 'react';
import styles from './VersionsList.module.scss';
import { Button } from 'kwc';
import ROUTE, {VersionRouteParams} from 'Constants/routes';
import VersionInfo from '../VersionInfo/VersionInfo';
import Can from 'Components/Can/Can';
import { GetVersionConfStatus_versions } from 'Graphql/queries/types/GetVersionConfStatus';
import { buildRoute } from "Utils/routes";
import { useParams } from "react-router-dom";

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

  const { runtimeId } = useParams<VersionRouteParams>();

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
              to={buildRoute.version(ROUTE.NEW_VERSION, runtimeId)}
              primary
              height={30}
            />
          </Can>
        )}
      </div>
      <ul className={styles.list} data-testid="projectsList">
        {versions.map(version => (
          <VersionInfo key={version.id} version={version} />
        ))}
      </ul>
    </section>
  );
}

export default VersionsList;
