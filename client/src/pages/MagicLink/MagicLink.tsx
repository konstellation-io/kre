import React from 'react';
import { parse, ParseOptions } from 'query-string';
import { withRouter } from 'react-router';
import styles from './MagicLink.module.scss';

type Props = {
  location: any;
};

function MagicLink({ location }: Props) {
  // @ts-ignore
  var token = parse(location.search, { ignoreQueryPrefix: true }).token;
  console.log(token);

  return (
    <div className={ styles.bg }>
      <div className={ styles.grid }>
        <div className={ styles.container }>

        </div>
      </div>
    </div>
  );
}

export default withRouter(MagicLink);
