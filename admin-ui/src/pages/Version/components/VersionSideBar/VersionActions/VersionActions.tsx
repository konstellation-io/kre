import React, { useState, FunctionComponent, useRef, useEffect } from 'react';
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from '../../../../../graphql/queries/types/GetVersionConfStatus';
import { VersionStatus } from '../../../../../graphql/types/globalTypes';
import styles from './VersionActions.module.scss';
import { useForm } from 'react-hook-form';
import * as CHECK from '../../../../../components/Form/check';
import StartIcon from '@material-ui/icons/PlayArrowOutlined';
import StopIcon from '@material-ui/icons/Stop';
import PublishIcon from '@material-ui/icons/Publish';
import UnpublishIcon from '@material-ui/icons/Block';
import useVersionAction from '../../../utils/hooks';
import ModalContainer from '../../../../../components/Layout/ModalContainer/ModalContainer';
import ModalLayoutJustify from '../../../../../components/Layout/ModalContainer/layouts/ModalLayoutJustify/ModalLayoutJustify';
import Button, { BUTTON_THEMES } from '../../../../../components/Button/Button';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import { get } from 'lodash';

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
