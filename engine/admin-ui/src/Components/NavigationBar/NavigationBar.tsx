import { ErrorMessage, SpinnerCircular, VerticalBar } from 'kwc';
import React, { memo } from 'react';

import ConditionalLink from '../ConditionalLink/ConditionalLink';
import { GetVersionConfStatus } from 'Graphql/queries/types/GetVersionConfStatus';
import HexButton from './HexButton';
import { NavLink } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import { buildRoute } from 'Utils/routes';
import { loader } from 'graphql.macro';
import styles from './NavigationBar.module.scss';
import { useQuery } from '@apollo/client';

const GetRuntimeQuery = loader('Graphql/queries/getRuntimeAndVersions.graphql');

function NavigationBar() {
  const { data, loading, error } = useQuery<GetVersionConfStatus>(
    GetRuntimeQuery
  );

  if (loading || !data) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  return (
    <VerticalBar>
      <div className={styles.container} data-testid="navigation-bar">
        <ConditionalLink
          LinkType={NavLink}
          to={buildRoute.runtime(ROUTE.RUNTIME, data.runtime.id)}
          linkProps={{
            activeClassName: styles.active,
            className: styles.link
          }}
        >
          <HexButton label={data.runtime.name} />
        </ConditionalLink>
      </div>
    </VerticalBar>
  );
}

export default memo(NavigationBar);
