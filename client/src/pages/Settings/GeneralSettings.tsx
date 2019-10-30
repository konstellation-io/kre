import React, {useEffect} from 'react';
import Spinner from '../../components/Spinner/Spinner';
import useInput from '../../hooks/useInput';
import * as CHECK from '../../components/Form/check';
import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import HorizontalBar from '../../components/Layout/HorizontalBar/HorizontalBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {ICON} from '../../icons';
import cx from 'classnames';
import styles from './Settings.module.scss';

import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const GET_EXPIRATION_TIME = gql`
  query GetExpirationTime {
    getCookieExpirationTime
  }
`;

const MIN_EXPIRATION_DAYS = 1;
const MAX_EXPIRATION_DAYS = 60;

function isExpirationInvalid(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnInteger(value, true),
    CHECK.isIntegerWithinRange(value, [MIN_EXPIRATION_DAYS, MAX_EXPIRATION_DAYS])
  ]);
}

function GeneralSettings() {
  const { data, loading, error: requestError } = useQuery(GET_EXPIRATION_TIME);

  const {
    value,
    isValid,
    onChange,
    error,
    setError,
  } = useInput('', isExpirationInvalid);

  if (loading) return <Spinner />;
  if (requestError) return <p>ERROR</p>;

  function onSubmit() {
    if(isValid()) {
      //makeRequest({ expDays: value });
    }
  }

  return (
    <>
      <div className={cx(styles.form, styles.generalSettings)}>
        <div className={styles.formTitle}>General settings</div>
        <div className={styles.formDescription}>
          Fusce vehicula dolor arcu, sit amet blandit dolor mollis nec. Donec viverra eleifend
          lacus, vitae ullamcorper metus. Sed sollicitudin ipsum quis nunc sollicitudin ultrices.
          Donec euismod scelerisque ligula. Maecenas eu varius risus, eu aliquet arcu. Curabitur
          fermentum suscipit est, tincidunt.
        </div>
        <div className={styles.formField}>
          <FontAwesomeIcon icon={ICON.COOKIE} />
          <p className={styles.label}>Session Cookie expiration time</p>
          <div className={styles.input}>
            <TextInput
              whiteColor
              onlyNumbers
              label="nº days"
              error={error}
              onChange={onChange}
              onSubmit={onSubmit}
              defaultValue={data.getCookieExpirationTime}
            />
          </div>
        </div>
      </div>
      <HorizontalBar>
        <Button
          label={'SAVE CHANGES'}
          primary
          onClick={onSubmit}
        />
      </HorizontalBar>
    </>
  );
}

export default GeneralSettings;
