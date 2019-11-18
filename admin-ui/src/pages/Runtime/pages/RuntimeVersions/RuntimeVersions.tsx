import React from 'react';

import Spinner from '../../../../components/Spinner/Spinner';

import { GET_VERSIONS } from './dataModels';
import { useQuery } from '@apollo/react-hooks';

import styles from './RuntimeVersions.module.scss';

type Props = {
  history: History;
  location: Location;
};
function RuntimeVersions({ history, location }: Props) {
  const { data, loading, error } = useQuery(GET_VERSIONS);

  if (loading) return <Spinner />;
  if (error) return <div>'ERROR'</div>;

  return (
    <>
      <h3>Versions</h3>
      <p>
        Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec
        viverra eleifend lacus, vitae ullamcorper metus. Sed sollicitudin ipsum
        quis nunc sollicitudin ultrices. Donec euismod scelerisque ligula.
        Maecenas eu varius risus, eu aliquet arcu. Curabitur fermentum suscipit
        est, tincidunt.
      </p>
      <div>
        ICON Version active CREATED: 12..... CIRCLE VersionName BUTTON: LOCATE
        THIS VERSION
      </div>
      <div>VERSION LIST</div>
    </>
  );
}

export default RuntimeVersions;
