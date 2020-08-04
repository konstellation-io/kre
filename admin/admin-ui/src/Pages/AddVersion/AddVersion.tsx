import { Button, FileUpload, SpinnerLinear } from 'kwc';
import {
  CreateVersion,
  CreateVersionVariables
} from 'Graphql/mutations/types/CreateVersion';
import ROUTE, { RuntimeRouteParams } from 'Constants/routes';
import React, { useEffect } from 'react';
import { useHistory, useParams } from 'react-router';

import { buildRoute } from 'Utils/routes';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './AddVersion.module.scss';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/react-hooks';

const AddVersionMutation = loader('Graphql/mutations/addVersion.graphql');

function AddVersion() {
  const history = useHistory();
  const { runtimeId } = useParams<RuntimeRouteParams>();
  const { register, handleSubmit, errors, setError, clearError } = useForm();
  const [addVersion, { loading, error }] = useMutation<
    CreateVersion,
    CreateVersionVariables
  >(AddVersionMutation, {
    onError: e => console.error(`addVersion: ${e}`),
    onCompleted
  });

  function onCompleted(updatedData: CreateVersion) {
    const versionCreatedId = updatedData.createVersion.id;
    console.log(`${versionCreatedId} version created`);

    history.push(
      buildRoute.version(
        ROUTE.RUNTIME_VERSION_STATUS,
        runtimeId,
        versionCreatedId
      )
    );
  }

  useEffect(() => {
    if (error) {
      setError('addVersionFile', 'apolloError', error.toString());
    } else {
      clearError('addVersionFile');
    }
  }, [error, clearError, setError]);

  function onChange() {
    clearError('addVersionFile');
  }
  function onCancelClick() {
    history.goBack();
  }

  function onSubmit(formData: any) {
    addVersion(
      mutationPayloadHelper({ file: formData.addVersionFile[0], runtimeId })
    );
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Add Version</h1>
          <p className={styles.subtitle} />
          <div className={styles.content}>
            <form>
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
              <div className={styles.buttons}>
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
