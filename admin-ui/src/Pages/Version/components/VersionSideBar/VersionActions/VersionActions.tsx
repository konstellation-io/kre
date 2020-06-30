import * as CHECK from 'Components/Form/check';

import Button, { BUTTON_THEMES } from 'Components/Button/Button';
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from 'Graphql/queries/types/GetVersionConfStatus';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';

import ModalContainer from 'Components/Layout/ModalContainer/ModalContainer';
import ModalLayoutJustify from 'Components/Layout/ModalContainer/layouts/ModalLayoutJustify/ModalLayoutJustify';
import PublishIcon from '@material-ui/icons/Publish';
import StartIcon from '@material-ui/icons/PlayArrowOutlined';
import StopIcon from '@material-ui/icons/Stop';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import UnpublishIcon from '@material-ui/icons/Block';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { get } from 'lodash';
import styles from './VersionActions.module.scss';
import { useForm } from 'react-hook-form';
import useVersionAction from '../../../utils/hooks';

function verifyComment(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value)]);
}

type ModalInfo = {
  action: (comment: string) => void;
  label: string;
};

type VersionActionsProps = {
  runtime: GetVersionConfStatus_runtime;
  version: GetVersionConfStatus_versions;
};

type ActionProps = {
  Icon: FunctionComponent<SvgIconProps>;
  label: string;
  action?: Function;
  disabled?: boolean;
  primary?: boolean;
};

function VersionActions({ runtime, version }: VersionActionsProps) {
  const { handleSubmit, setValue, register, errors } = useForm();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const modalInfo = useRef<ModalInfo>({
    action: () => {},
    label: ''
  });

  useEffect(() => {
    register('comment', { validate: verifyComment });
    setValue('comment', '');
  }, [register, setValue]);

  function onSubmit() {
    handleSubmit((formData: any) =>
      modalInfo.current.action(formData.comment)
    )();
  }

  const {
    publishVersion,
    startVersion,
    stopVersion,
    unpublishVersion,
    getMutationVars
  } = useVersionAction(runtime.id);

  function openModal(label: string, mutation: Function) {
    modalInfo.current = {
      action: (comment: string) => {
        mutation(getMutationVars(version.id, comment));
        closeModal();
      },
      label
    };
    setShowConfirmation(true);
  }

  function closeModal() {
    setShowConfirmation(false);
  }

  const buttons: ActionProps[] = [];

  switch (version.status) {
    case VersionStatus.STOPPED:
      buttons[0] = {
        Icon: StartIcon,
        label: 'START',
        action: () => openModal('START', startVersion),
        primary: version.configurationCompleted,
        disabled: !version.configurationCompleted
      };
      buttons[1] = {
        Icon: PublishIcon,
        label: 'PUBLISH',
        disabled: true
      };
      break;
    case VersionStatus.STARTED:
      buttons[0] = {
        Icon: StopIcon,
        label: 'STOP',
        action: () => openModal('STOP', stopVersion)
      };
      buttons[1] = {
        Icon: PublishIcon,
        label: 'PUBLISH',
        action: () => openModal('PUBLISH', publishVersion),
        primary: true
      };
      break;
    case VersionStatus.PUBLISHED:
      buttons[0] = {
        Icon: StopIcon,
        label: 'STOP',
        disabled: true
      };
      buttons[1] = {
        Icon: UnpublishIcon,
        label: 'UNPUBLISH',
        action: () => openModal('UNPUBLISH', unpublishVersion),
        primary: true
      };
      break;
  }

  return (
    <div className={styles.wrapper}>
      {buttons.map(btn => (
        <Button
          key={btn.label}
          onClick={() => btn.action && btn.action()}
          label={btn.label}
          Icon={btn.Icon}
          theme={BUTTON_THEMES.DEFAULT}
          disabled={btn.disabled}
          primary={btn.primary}
          style={{ flexGrow: 1 }}
        />
      ))}
      {showConfirmation && (
        <ModalContainer
          title={`YOU ARE ABOUT TO ${modalInfo.current.label} A VERSION`}
          onAccept={onSubmit}
          onCancel={closeModal}
        >
          <ModalLayoutJustify
            onUpdate={(value: string) => setValue('comment', value)}
            submit={onSubmit}
            error={get(errors.comment, 'message')}
          />
        </ModalContainer>
      )}
    </div>
  );
}

export default VersionActions;
