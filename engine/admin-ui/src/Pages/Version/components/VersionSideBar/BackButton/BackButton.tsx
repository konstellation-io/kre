import RuntimeHexagon, {
  RuntimeHexagonSize
} from 'Components/RuntimeHexagon/RuntimeHexagon';

import { GetVersionConfStatus_runtime } from 'Graphql/queries/types/GetVersionConfStatus';
import IconArrowBack from '@material-ui/icons/KeyboardBackspace';
import { Link } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import React from 'react';
import styles from './BackButton.module.scss';

type BackButtonProps = {
  runtime: GetVersionConfStatus_runtime;
};

function BackButton({ runtime }: BackButtonProps) {
  return (
    <Link to={ROUTE.VERSIONS}>
      <div className={styles.backSection}>
        <IconArrowBack className="icon-regular" />
        <div className={styles.runtimeHexagon}>
          <RuntimeHexagon size={RuntimeHexagonSize.SMALL} />
        </div>
        <div className={styles.runtimeName}>{runtime.name}</div>
      </div>
    </Link>
  );
}

export default BackButton;
