import { Button, FileUpload, SpinnerLinear } from 'kwc';
import {
  CreateVersion,
  CreateVersionVariables
} from 'Graphql/mutations/types/CreateVersion';
import {
  GetVersionConfStatus,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';
import React, { useEffect, useState } from 'react';

import ROUTE, {RuntimeRouteParams} from 'Constants/routes';
import { get } from 'lodash';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './AddVersion.module.scss';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { useMutation } from '@apollo/client';

import AddVersionMutation from 'Graphql/mutations/addVersion';
import GetRuntimeAndVersionQuery from 'Graphql/queries/getRuntimeAndVersions';
import { useParams } from "react-router-dom";
import { buildRoute } from "Utils/routes";

function AddVersion() {
  const history = useHistory();
  const { runtimeId } = useParams<RuntimeRouteParams>();
  const { register, handleSubmit, errors, setError, clearError } = useForm();
  const [addVersion, { loading, error }] = useMutation<
    CreateVersion,
    CreateVersionVariables
  >(AddVersionMutation, {
    onError: e => console.error(`addVersion: ${e}`),
    update(cache, updateResult) {
      if (updateResult.data) {
        const cacheResult = cache.readQuery<GetVersionConfStatus>({
          query: GetRuntimeAndVersionQuery,
          variables: {
            runtimeId: runtimeId,
          }
        });

        const versions = cacheResult?.versions || [];
        const newVersion = updateResult.data
          .createVersion as GetVersionConfStatus_versions;

        cache.writeQuery({
          query: GetRuntimeAndVersionQuery,
          variables: { runtimeId },
          data: { versions: versions.concat([newVersion]) }
        });
      }
    },
    onCompleted
  });

  const [validationErrs, setValidationErrs] = useState<string[]>([]);

  function onCompleted(updatedData: CreateVersion) {
    const versionCreatedId = updatedData.createVersion.id;
    console.log(`${versionCreatedId} version created`);

    history.push(buildRoute.version(ROUTE.VERSION, runtimeId, updatedData.createVersion.name), runtimeId);
  }

  useEffect(() => {
    if (error) {
      setError('addVersionFile', 'apolloError', error.toString());

      const err = error.graphQLErrors[0];
      if (err.extensions?.code === 'krt_validation_error') {
        setValidationErrs(err.extensions?.details);
      }
    } else {
      clearError('addVersionFile');
    }
  }, [error, clearError, setError]);

  function onChange() {
    clearError('addVersionFile');
    setValidationErrs([]);
  }
  function onCancelClick() {
    history.goBack();
  }

  function onSubmit(formData: any) {
    addVersion(mutationPayloadHelper({ file: formData.addVersionFile[0], runtimeId }));
  }

  function getValidationErrors() {
    return (
      <div className={styles.errorBox}>
        The krt.yml file contains the following validation errors:
        <ul>
          {validationErrs.map((err: string) => <li>{err}</li>)}
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Add Version</h1>
          <p className={styles.subtitle} />

          {validationErrs.length > 0 && getValidationErrors()}

          <div className={styles.content} data-testid='uploadVersion'>
            <form data-testid='fileUpload'>
              <FileUpload
                name="addVersionFile"
                inputRef={register({
                  required: 'This field is mandatory',
                  validate: value =>
                    (value[0] && value[0].name.includes('.krt')) ||
                    'Must be a .krt file'
                })}
                label="upload version file (KRT file)"
                placeholder=".krt"
                error={get(errors.addVersionFile, 'message', '')}
                onChange={onChange}
                autofocus
              />
              {loading && (
                <div className={styles.spinner}>
                  <SpinnerLinear />
                </div>
              )}
              <div className={styles.buttons} data-testid='createVersion'>
                <Button
                  primary
                  disabled={!!errors.addVersionFile || loading}
                  label={'CREATE'}
                  onClick={handleSubmit(onSubmit)}
                  className={styles.buttonSave}
                  tabIndex={0}
                />
                <Button label="CANCEL" onClick={onCancelClick} tabIndex={0} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddVersion;
