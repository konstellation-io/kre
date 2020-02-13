import React, { useEffect } from 'react';
import { useHistory } from 'react-router';
import useInput from '../../hooks/useInput';

import TextInput from '../../components/Form/TextInput/TextInput';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';

import styles from './AddRuntime.module.scss';

import { loader } from 'graphql.macro';
import { useMutation } from '@apollo/react-hooks';
import {
  GetRuntimes,
  GetRuntimes_runtimes
} from '../../graphql/queries/types/GetRuntimes';
import {
  CreateRuntime,
  CreateRuntimeVariables
} from '../../graphql/mutations/types/CreateRuntime';
import ROUTE from '../../constants/routes';

const GetRuntimesQuery = loader('../../graphql/queries/getRuntimes.graphql');
const CreateRuntimeMutation = loader(
  '../../graphql/mutations/createRuntime.graphql'
);

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
    CreateRuntime,
    CreateRuntimeVariables
  >(CreateRuntimeMutation, {
    onCompleted: onCompleteAddRuntime,
    update(cache, updateResult) {
      if (updateResult.data !== undefined && updateResult.data !== null) {
        const newRuntime = updateResult.data.createRuntime
          .runtime as GetRuntimes_runtimes;
        const cacheResult = cache.readQuery<GetRuntimes>({
          query: GetRuntimesQuery
        });

        if (cacheResult !== null) {
          const { runtimes } = cacheResult;
          cache.writeQuery({
            query: GetRuntimesQuery,
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
