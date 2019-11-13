import React, { useEffect } from 'react';
import useInput from '../../hooks/useInput';

import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import * as PAGES from '../../constants/routes';

import styles from './AddVersion.module.scss';

import { useMutation } from '@apollo/react-hooks';
import {ADD_VERSION} from './dataModels';


function verifyRuntimeName(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value)
  ]);
}

type Props = {
  history: any;
};

function AddVersion({ history }: Props) {
  const {
    value,
    isValid,
    onChange,
    error,
    setError
  } = useInput('', verifyRuntimeName);
  const [
    addVersion,
    {loading, error: mutationError}
  ] = useMutation(ADD_VERSION, { onCompleted: onCompleteAddVersion });

  useEffect(() => {
    if(mutationError) {
      setError(mutationError.toString());
    }
  }, [mutationError, setError]);

  function onCompleteAddVersion(updatedData:any) {
    // TODO: CHECK FOR API ERRORS
    console.log(`${value} version created`);
    history.push(PAGES.RUNTIME_VERSIONS);
  }

  function onSubmit() {
    if(isValid()) {
      addVersion({ variables: { name: value }});
    }
  }

  return (
    <div className={ styles.bg }>
      <div className={ styles.grid }>
        <div className={ styles.container }>
          <h1>Add Version</h1>
          <p className={styles.subtitle}>
            Cras quis nulla commodo, aliquam lectus sed, blandit augue. Cras ullamcorper bibendum bibendum.
          </p>
          <div className={ styles.content }>
            <TextInput
              whiteColor
              label="version name"
              error={error}
              onChange={onChange}
              onSubmit={onSubmit}
            />
            <div className={ styles.buttons }>
              <Button
                primary
                label="SAVE"
                onClick={onSubmit}
                loading={ loading }
              />
              <Button
                label="CANCEL"
                to={PAGES.DASHBOARD}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddVersion;
