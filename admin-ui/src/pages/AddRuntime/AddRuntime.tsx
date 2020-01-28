import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import useInput from '../../hooks/useInput';

import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import * as PAGES from '../../constants/routes';

import styles from './AddRuntime.module.scss';

import { useMutation } from '@apollo/react-hooks';
import {
  ADD_RUNTIME,
  AddRuntimeResponse,
  AddRuntimeVars
} from './AddRuntime.graphql';
import {
  GET_DASHBOARD,
  GetDashboardResponse
} from '../Dashboard/Dashboard.graphql';

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
        const cacheResult = cache.readQuery<GetDashboardResponse>({
          query: GET_DASHBOARD
        });

        if (cacheResult !== null) {
          const { runtimes, alerts } = cacheResult;
          cache.writeQuery({
            query: GET_DASHBOARD,
            data: { runtimes: runtimes.concat([newRuntime]), alerts }
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
    history.push(PAGES.DASHBOARD);
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
