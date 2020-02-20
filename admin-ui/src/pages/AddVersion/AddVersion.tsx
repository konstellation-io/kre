import React, { useEffect } from 'react';
import useForm from '../../hooks/useForm';
import { useMutation } from '@apollo/react-hooks';
import { useHistory, useParams } from 'react-router';

import SpinnerLinear from '../../components/LoadingComponents/SpinnerLinear/SpinnerLinear';
import FileUpload from '../../components/Form/FileUpload/FileUpload';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import ROUTE from '../../constants/routes';

import styles from './AddVersion.module.scss';

import { loader } from 'graphql.macro';
import {
  CreateVersion,
  CreateVersionVariables
} from '../../graphql/mutations/types/CreateVersion';
import { buildRoute } from '../../utils/routes';

const AddVersionMutation = loader('../../graphql/mutations/addVersion.graphql');

function verifyVersionFile(value: string) {
  return CHECK.getValidationError([CHECK.isDefined(value)]);
}

const inputs = [
  {
    defaultValue: null,
    verifier: verifyVersionFile,
    id: 'file'
  }
];

function AddVersion() {
  const history = useHistory();
  const { runtimeId } = useParams();
  const [addVersion, { loading, error }] = useMutation<
    CreateVersion,
    CreateVersionVariables
  >(AddVersionMutation, {
    onCompleted
  });
  const form = useForm({
    inputElements: inputs,
    fetchFunction: addVersion,
    additionalInputProps: { runtimeId }
  });

  useEffect(() => {
    if (error) {
      console.error('FORM ERROR', error);
    }
  }, [error]);

  function onCompleted(updatedData: any) {
    // TODO: CHECK FOR API ERRORS
    const versionCreatedId = updatedData.createVersion.version.id;
    console.log(`${versionCreatedId} version created`);

    history.push(
      buildRoute.version(
        ROUTE.RUNTIME_VERSION_STATUS,
        runtimeId,
        versionCreatedId
      )
    );
  }

  function onCancelClick() {
    history.goBack();
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Add Version</h1>
          <p className={styles.subtitle}></p>
          <div className={styles.content}>
            <FileUpload
              label="upload version file (KRT file)"
              placeholder=".krt"
              error={error ? error.toString() : form.input.file.error}
              onChange={form.input.file.onChange}
            />
            {loading && (
              <div className={styles.spinner}>
                <SpinnerLinear />
              </div>
            )}
            {/* <UploadProgress fileName="" progress={100} /> */}
            <div className={styles.buttons}>
              <Button
                primary
                disabled={error !== undefined || loading}
                label={'CREATE'}
                onClick={() => form.submit()}
              />
              <Button label="CANCEL" onClick={onCancelClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddVersion;
