import React from 'react';
import { GetVersionConfStatus_versions } from '../../../../graphql/queries/types/GetVersionConfStatus';
import styles from './Documentation.module.scss';

type Props = {
  version?: GetVersionConfStatus_versions;
};

function Documentation({ version }: Props) {
  return <>{`Version Documentation: ${version && version.name}`}</>;
}

export default Documentation;
