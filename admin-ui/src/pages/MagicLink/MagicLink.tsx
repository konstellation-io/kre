import { get } from 'lodash';

import React, { useEffect, useState, useRef } from 'react';
import useEndpoint from '../../hooks/useEndpoint';
import { useParams, useHistory } from 'react-router-dom';

import { ENDPOINT } from '../../constants/application';
import ROUTE from '../../constants/routes';
import * as CHECK from '../../components/Form/check';
import Circle from '../../components/Shape/Circle/Circle';
import { STATES } from '../../constants/application';

import styles from './MagicLink.module.scss';

const DEFAULT_ERROR = 'Unexpected error. Contact support for more information';

const getTitle = {
  [STATES.INITIALIZING]: 'Connecting to KRE',
  [STATES.SUCCESS]: 'You are connected!',
  [STATES.ERROR]: 'Cannot connect to KRE'
};
const getSubtitle = {
  [STATES.INITIALIZING]: 'It will take a moment',
  [STATES.SUCCESS]:
    'Cras quis nulla commodo, aliquam lectus sed, blandit augue. Cras ullamcorper bibendum bibendum. ',
  [STATES.ERROR]:
    'Cras quis nulla commodo, aliquam lectus sed, blandit augue. Cras ullamcorper bibendum bibendum. '
};
const getCircleText = {
  [STATES.INITIALIZING]: 'LOADING',
  [STATES.SUCCESS]: 'DONE',
  [STATES.ERROR]: 'ERROR'
};

function checkToken(token: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(token)]);
}

interface RouteParams {
  token: string;
}

/**
 * Design requirements:
 *  - Loading animation must be shown for a short period of time
 *  - After loading animation time, if there is a response or an error the
 *    status of the page must be updated.
 *  - The SUCCESS animation must be shown for another period of time before leaving
 *    the view.
 */
function MagicLink() {
  const history = useHistory();
  const [error, setError] = useState<string | boolean>('');
  const [animationPending, setAnimationPending] = useState(true);
  const [status, setStatus] = useState(STATES.INITIALIZING);
  const [response, makeRequest] = useEndpoint({
    endpoint: ENDPOINT.VALIDATE_MAGIC_LINK,
    method: 'POST'
  });
  const timeout = useRef<number>();
  const { token } = useParams<RouteParams>();

  // Checks for token errors and send login request
  useEffect(function() {
    const err = checkToken(token);

    if (err === true) {
      makeRequest({ verificationCode: token });
    } else {
      setError(err);
    }

    timeout.current = window.setTimeout(() => {
      setAnimationPending(false);
    }, 3000);

    return function() {
      if (timeout.current) window.clearTimeout(timeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Updates status after getting a response and waiting for loading animation.
  useEffect(
    function() {
      if (!animationPending) {
        timeout.current = undefined;
        if (error) {
          setStatus(STATES.ERROR);
          setError(error || DEFAULT_ERROR);
        } else if (response.complete) {
          if (response.status === 200) {
            setStatus(STATES.SUCCESS);

            timeout.current = window.setTimeout(() => {
              history.push(ROUTE.HOME);
            }, 2500);
          } else if (
            response.error &&
            get(response, 'data.code') === 'invalid_verification_code'
          ) {
            setError('Invalid verification code');
          } else {
            setError('Unexpected error. Contact support for more information');
          }
        }
      }
    },
    [response, history, animationPending, status, error]
  );

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>{getTitle[status]}</h1>
          <p className={styles.subtitle}>{getSubtitle[status]}</p>
          <Circle animation={status} label={getCircleText[status]} />
          {status === STATES.ERROR && (
            <div className={styles.errorText}>{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MagicLink;
