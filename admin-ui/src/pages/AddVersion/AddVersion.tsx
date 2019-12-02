import React, { useEffect, useState } from 'react';
import useForm from '../../hooks/useForm';
import { useMutation } from '@apollo/react-hooks';
import { useHistory, useParams } from 'react-router';

import FileUpload from '../../components/Form/FileUpload/FileUpload';
import UploadProgress from '../../components/Form/UploadProgress/UploadProgress';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import * as PAGES from '../../constants/routes';

import styles from './AddVersion.module.scss';

import { ADD_VERSION } from './AddVersion.graphql';

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
  const [addVersion, { loading, error }] = useMutation(ADD_VERSION, {
    onCompleted
  });
  const form = useForm({
    inputElements: inputs,
    fetchFunction: addVersion,
    additionalInputProps: { runtimeId }
  });
  const [versionUploaded, setVersionUploaded] = useState(false);

  useEffect(() => {
    if (error) {
      console.error('FORM ERROR', error);
    }
  }, [error]);

  function onCompleted(updatedData: any) {
    // TODO: CHECK FOR API ERRORS
    console.log(`${updatedData.createVersion.version.id} version created`);
    setVersionUploaded(true);
  }

  function onDeploy() {
    history.push(PAGES.RUNTIME_STATUS.replace(':runtimeId', runtimeId || ''));
  }

  function onCancelClick() {
    history.goBack();
  }

  return (
    <div className={styles.bg}>
      <div className={styles.grid}>
        <div className={styles.container}>
          <h1>Add Version</h1>
          <p className={styles.subtitle}>
            Cras quis nulla commodo, aliquam lectus sed, blandit augue. Cras
            ullamcorper bibendum bibendum.
          </p>
          <div className={styles.content}>
            <FileUpload
              label="upload version file (KRT file)"
              placeholder=".krt"
              error={form.input.file.error}
              onChange={form.input.file.onChange}
            />
            <UploadProgress fileName="" progress={100} />
            <div className={styles.buttons}>
              <Button
                primary
                disabled={error !== undefined}
                label={versionUploaded ? 'ACCEPT' : 'CREATE'}
                onClick={versionUploaded ? onDeploy : () => form.submit()}
                loading={loading}
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
