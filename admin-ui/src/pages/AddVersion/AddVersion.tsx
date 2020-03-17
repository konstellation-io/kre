import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/react-hooks';
import { useHistory, useParams } from 'react-router';

import { get } from 'lodash';

import SpinnerLinear from '../../components/LoadingComponents/SpinnerLinear/SpinnerLinear';
import FileUpload from '../../components/Form/FileUpload/FileUpload';
import Button from '../../components/Button/Button';
import ROUTE, { RuntimeRouteParams } from '../../constants/routes';

import styles from './AddVersion.module.scss';

import { loader } from 'graphql.macro';
import {
  CreateVersion,
  CreateVersionVariables
} from '../../graphql/mutations/types/CreateVersion';
import { buildRoute } from '../../utils/routes';

import { mutationPayloadHelper } from '../../utils/formUtils';

const AddVersionMutation = loader('../../graphql/mutations/addVersion.graphql');

function AddVersion() {
  const history = useHistory();
  const { runtimeId } = useParams<RuntimeRouteParams>();
  const { register, handleSubmit, errors, setError, clearError } = useForm();
  const [addVersion, { loading, error }] = useMutation<
    CreateVersion,
    CreateVersionVariables
  >(AddVersionMutation, {
    onCompleted
  });

  function onCompleted(updatedData: CreateVersion) {
    // TODO: CHECK FOR API ERRORS
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
                />
                <Button label="CANCEL" onClick={onCancelClick} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddVersion;
