import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import useInput from '../../hooks/useInput';

import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';

import styles from './AddRuntime.module.scss';

import { useMutation } from '@apollo/react-hooks';
import {
  ADD_RUNTIME,
  AddRuntimeResponse,
  AddRuntimeVars
} from './AddRuntime.graphql';
import {
  GET_RUNTIMES,
  GetRuntimesResponse
} from '../Dashboard/Dashboard.graphql';
import ROUTE from '../../constants/routes';

function verifyRuntimeName(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value)
  ]);
}

function AddRuntime() {
  const history = useHistory();
  const { value, isValid, onChange, error, setError } = useInput(
    '',
    verifyRuntimeName
  );
  const [addRuntime, { loading, error: mutationError }] = useMutation<
    AddRuntimeResponse,
    AddRuntimeVars
  >(ADD_RUNTIME, {
    onCompleted: onCompleteAddRuntime,
    update(cache, updateResult) {
      if (updateResult.data !== undefined && updateResult.data !== null) {
        const newRuntime = updateResult.data.createRuntime.runtime;
        const cacheResult = cache.readQuery<GetRuntimesResponse>({
          query: GET_RUNTIMES
        });

        if (cacheResult !== null) {
          const { runtimes } = cacheResult;
          cache.writeQuery({
            query: GET_RUNTIMES,
            data: { runtimes: runtimes.concat([newRuntime]) }
          });
        }
      }
    }
  });

  useEffect(() => {
    if (mutationError) {
      setError(mutationError.toString());
    }
  }, [mutationError, setError]);

  function onCompleteAddRuntime(updatedData: any) {
    // TODO: CHECK FOR API ERRORS
    console.log(`${value} runtime created`);
    history.push(ROUTE.HOME);
  }

  function onSubmit() {
    if (isValid()) {
      const input = { name: value };
      addRuntime({ variables: { input } });
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Add Runtime</h1>
          <p className={styles.subtitle}></p>
          <div className={styles.content}>
            <TextInput
              whiteColor
              label="runtime name"
              error={error}
              onChange={onChange}
              onSubmit={onSubmit}
              autoFocus
            />
            <div className={styles.buttons}>
              <Button
                primary
                label="SAVE"
                onClick={onSubmit}
                loading={loading}
              />
              <Button
                label="CANCEL"
                onClick={() => {
                  history.goBack();
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddRuntime;
