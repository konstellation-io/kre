import RuntimeHexagon, {
  RuntimeHexagonSize
} from 'Components/RuntimeHexagon/RuntimeHexagon';

import { GetVersionConfStatus_runtime } from 'Graphql/queries/types/GetVersionConfStatus';
import IconArrowBack from '@material-ui/icons/KeyboardBackspace';
import { Link } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import React from 'react';
import { buildRoute } from 'Utils/routes';
import styles from './BackButton.module.scss';

type BackButtonProps = {
  runtime: GetVersionConfStatus_runtime;
};

function BackButton({ runtime }: BackButtonProps) {
  return (
    <Link to={buildRoute.runtime(ROUTE.RUNTIME, runtime.id)}>
      <div className={styles.backSection}>
        <IconArrowBack className="icon-regular" />
        <div className={styles.runtimeHexagon}>
          <RuntimeHexagon runtime={runtime} size={RuntimeHexagonSize.SMALL} />
        </div>
        <div className={styles.runtimeName}>{runtime.name}</div>
      </div>
    </Link>
  );
}

export default BackButton;
