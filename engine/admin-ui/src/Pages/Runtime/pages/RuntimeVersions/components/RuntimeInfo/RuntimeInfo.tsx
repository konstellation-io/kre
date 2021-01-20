import { GetVersionConfStatus_runtime } from 'Graphql/queries/types/GetVersionConfStatus';
import IconEmail from '@material-ui/icons/Email';
import IconTime from '@material-ui/icons/AccessTime';
import InfoField from '../InfoField/InfoField';
import React from 'react';
import { formatDate } from 'Utils/format';
import styles from '../../RuntimeVersions.module.scss';

type Props = {
  runtime: GetVersionConfStatus_runtime;
};
function RuntimeInfo({ runtime }: Props) {
  return (
    <div className={styles.runtimeInfo}>
      <div className={styles.infoFields}>
        <InfoField
          field="CREATOR"
          Icon={IconEmail}
          value={runtime.creationAuthor.email}
        />
        <InfoField
          field="CREATED"
          Icon={IconTime}
          value={formatDate(new Date(runtime.creationDate), true)}
        />
      </div>
      <p className={styles.description}>{runtime.description}</p>
    </div>
  );
}

export default RuntimeInfo;
