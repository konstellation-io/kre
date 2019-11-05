import React, { useEffect, useState } from 'react';
import useEndpoint from '../../hooks/useEndpoint';
import { parse } from 'query-string';

import Spinner from '../../components/Spinner/Spinner';
import * as CHECK from '../../components/Form/check';
import { ENDPOINT } from '../../constants/application';
import * as PAGES from '../../constants/routes';

import styles from './MagicLink.module.scss';


type Props = {
  location: any;
  history: any;
};

export function getToken(location:Location) {
  // @ts-ignore
  return parse(location.search, { ignoreQueryPrefix: true }).token || '';
}

function checkToken(token:string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(token),
    CHECK.isMagicLinkTokenValid(token)
  ]);
}

function MagicLink({ location, history }: Props) {
  const [error, setError] = useState('');
  const [response, makeRequest] = useEndpoint({
    endpoint: ENDPOINT.VALIDATE_MAGIC_LINK,
    method: 'POST'
  });

  const token = getToken(location);

  useEffect(function() {
    const error = checkToken(token);
    
    if (!error) {
      makeRequest({ token });
    } else {
      setError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(function() {
    if (response.complete) {
      if (response.data === 'OK') {
        history.push(PAGES.HOME);
      } else {
        setError('Unexpected error. Contact support for more information');
      }
    }
  }, [response, history]);

  return (
    <div className={ styles.bg }>
      <div className={ styles.grid }>
        <div className={ styles.container }>
          { response.pending
              ? <Spinner size={ 60 } />
              : <p className={ styles.error }>{ error }</p>
          }
        </div>
      </div>
    </div>
  );
}

export default MagicLink;
