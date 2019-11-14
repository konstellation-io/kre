import React, { useEffect } from 'react';
import useForm from '../../hooks/useForm';

import TextInput from '../../components/Form/TextInput/TextInput';
import Select from '../../components/Form/Select/Select';
import Button from '../../components/Button/Button';
import * as CHECK from '../../components/Form/check';
import * as PAGES from '../../constants/routes';

import styles from './AddVersion.module.scss';

import { useMutation } from '@apollo/react-hooks';
import { ADD_VERSION } from './dataModels';

function verifyRuntimeName(value: string) {
  return CHECK.getValidationError([
    CHECK.isFieldNotEmpty(value),
    CHECK.isFieldAnString(value)
  ]);
}

const inputs = [
  {
    defaultValue: '',
    verifier: verifyRuntimeName,
    id: 'name'
  },
  {
    defaultValue: '',
    verifier: verifyRuntimeName,
    id: 'type'
  }
];
const versionTypes = [
  'Fix some issues',
  'Compatible changes',
  'Breaking changes'
];

type Props = {
  history: any;
};

function AddVersion({ history }: Props) {
  const form = useForm(inputs);

  const [
    addVersion,
    { loading, error: mutationError }
  ] = useMutation(ADD_VERSION, { onCompleted: onCompleteAddVersion });

  useEffect(() => {
    if (mutationError) {
      form.name.setError(mutationError.toString());
    }
  }, [mutationError, form]);

  function onCompleteAddVersion(updatedData: any) {
    // TODO: CHECK FOR API ERRORS
    console.log(`${form.name.value} version created`);
    history.push(PAGES.RUNTIME_VERSIONS);
  }

  function onSubmit() {
    if (form.name.isValid()) {
      addVersion({ variables: { name: form.name.value } });
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
              error={form.name.error}
              onChange={form.name.onChange}
              onSubmit={onSubmit}
            />
            <Select
              label="version type"
              options={versionTypes}
              error={form.type.error}
              onChange={form.type.onChange}
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

export default AddVersion;
