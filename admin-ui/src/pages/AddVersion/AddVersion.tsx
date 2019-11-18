import React, { useEffect } from 'react';
import useForm from '../../hooks/useForm';

import TextInput from '../../components/Form/TextInput/TextInput';
import Select from '../../components/Form/Select/Select';
import FileUpload from '../../components/Form/FileUpload/FileUpload';
import UploadProgress from '../../components/Form/UploadProgress/UploadProgress';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import * as PAGES from '../../constants/routes';

import styles from './AddVersion.module.scss';

import { useMutation } from '@apollo/react-hooks';
import { ADD_VERSION } from './dataModels';

function verifyVersionName(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value)
  ]);
}
function verifyVersionType(value: string) {
  return CHECK.getValidationError([CHECK.isFieldInList(value, versionTypes)]);
}
function verifyVersionFile(value: string) {
  return CHECK.getValidationError([CHECK.isDefined(value)]);
}

const versionTypes = [
  'Fix some issues',
  'Compatible changes',
  'Breaking changes'
];

const inputs = [
  {
    defaultValue: '',
    verifier: verifyVersionName,
    id: 'name'
  },
  {
    defaultValue: versionTypes[0],
    verifier: verifyVersionType,
    id: 'type'
  },
  {
    defaultValue: null,
    verifier: verifyVersionFile,
    id: 'file'
  }
];

type Props = {
  history: any;
};

function AddVersion({ history }: Props) {
  const form = useForm(inputs, ADD_VERSION);

  const [
    addVersion,
    { loading, error: mutationError }
  ] = useMutation(ADD_VERSION, { onCompleted: onCompleteAddVersion });

  useEffect(() => {
    if (mutationError) {
      form.input.name.setError(mutationError.toString());
    }
  }, [mutationError, form]);

  function onCompleteAddVersion(updatedData: any) {
    // TODO: CHECK FOR API ERRORS
    console.log(`${form.input.name.value} version created`);
    history.push(PAGES.RUNTIME_VERSIONS);
  }

  function onSubmit() {
    console.log(form.input);
    if (form.isValid()) {
      addVersion({ variables: { name: form.input.name.value } });
    }
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
            <TextInput
              whiteColor
              label="version name"
              error={form.input.name.error}
              onChange={form.input.name.onChange}
              onSubmit={onSubmit}
            />
            <Select
              label="version type"
              options={versionTypes}
              error={form.input.type.error}
              onChange={form.input.type.onChange}
            />
            <FileUpload
              label="upload version file (karrete)"
              placeholder=".krt"
              error={form.input.file.error}
              onChange={form.input.file.onChange}
            />
            <UploadProgress fileName="" progress={73} />
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

export default AddVersion;
