import React, { useEffect } from 'react';
import useInput from '../../hooks/useInput';

import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import * as PAGES from '../../constants/routes';

import styles from './AddRuntime.module.scss';

import { useMutation } from '@apollo/react-hooks';
import { ADD_RUNTIME } from './dataModels';

function verifyRuntimeName(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value)
  ]);
}

type Props = {
  history: any;
};

function AddRuntime({ history }: Props) {
  const { value, isValid, onChange, error, setError } = useInput(
    '',
    verifyRuntimeName
  );
  const [
    addRuntime,
    { loading, error: mutationError }
  ] = useMutation(ADD_RUNTIME, { onCompleted: onCompleteAddRuntime });

  useEffect(() => {
    if (mutationError) {
      setError(mutationError.toString());
    }
  }, [mutationError, setError]);

  function onCompleteAddRuntime(updatedData: any) {
    // TODO: CHECK FOR API ERRORS
    console.log(`${value} runtime created`);
    history.push(PAGES.DASHBOARD);
  }

  function onSubmit() {
    if (isValid()) {
      addRuntime({ variables: { name: value } });
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Add Runtime</h1>
          <p className={styles.subtitle}>
            Cras quis nulla commodo, aliquam lectus sed, blandit augue. Cras
            ullamcorper bibendum bibendum.
          </p>
          <div className={styles.content}>
            <TextInput
              whiteColor
              label="runtime name"
              error={error}
              onChange={onChange}
              onSubmit={onSubmit}
            />
            <div className={styles.buttons}>
              <Button
                primary
                label="SAVE"
                onClick={onSubmit}
                loading={loading}
              />
              <Button label="CANCEL" to={PAGES.DASHBOARD} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRuntime;
