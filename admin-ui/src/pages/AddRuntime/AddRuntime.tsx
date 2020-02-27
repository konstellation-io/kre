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
import { CreateRuntimeInput } from '../../graphql/types/globalTypes';

const GetRuntimesQuery = loader('../../graphql/queries/getRuntimes.graphql');
const CreateRuntimeMutation = loader(
  '../../graphql/mutations/createRuntime.graphql'
);

const MAX_LENGTH = 20;

function verifyRuntimeName(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isLengthAllowed(value, MAX_LENGTH)
  ]);
}

function AddRuntime() {
  const history = useHistory();
  const { value, isValid, onChange, error, setError } = useInput<string>(
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
        const newRuntime = updateResult.data
          .createRuntime as GetRuntimes_runtimes;
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

  function onCompleteAddRuntime(updatedData: CreateRuntime) {
    // TODO: CHECK FOR API ERRORS
    console.log(`${value} runtime created`);
    history.push(ROUTE.HOME);
  }

  function onSubmit() {
    if (isValid()) {
      const input: CreateRuntimeInput = { name: value };
      addRuntime({ variables: { input } });
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Add Runtime</h1>
          <p className={styles.subtitle} />
          <div className={styles.content}>
            <TextInput
              whiteColor
              label="runtime name"
              error={error}
              onChange={onChange}
              onSubmit={onSubmit}
              helpText={`${value.length}/${MAX_LENGTH}`}
              maxLength={MAX_LENGTH}
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
