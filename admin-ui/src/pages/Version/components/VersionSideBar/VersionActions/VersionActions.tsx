import * as CHECK from '../../../../../components/Form/check';

import Button, { BUTTON_THEMES } from '../../../../../components/Button/Button';
import {
  GetVersionConfStatus_runtime,
  GetVersionConfStatus_versions
} from '../../../../../graphql/queries/types/GetVersionConfStatus';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';

import ModalContainer from '../../../../../components/Layout/ModalContainer/ModalContainer';
import ModalLayoutJustify from '../../../../../components/Layout/ModalContainer/layouts/ModalLayoutJustify/ModalLayoutJustify';
import PublishIcon from '@material-ui/icons/Publish';
import StartIcon from '@material-ui/icons/PlayCircleOutline';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import UnpublishIcon from '@material-ui/icons/GetApp';
import { VersionStatus } from '../../../../../graphql/types/globalTypes';
import cx from 'classnames';
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

type ActionProps = {
  Icon: FunctionComponent<SvgIconProps>;
  label: string;
  action?: Function;
  disabled?: boolean;
  primary?: boolean;
};

type Props = {
  runtime: GetVersionConfStatus_runtime;
  version: GetVersionConfStatus_versions;
  quickActions?: boolean;
};

function VersionActions({ runtime, version, quickActions = false }: Props) {
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

  let buttons: ActionProps[] = [];

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

  if (quickActions) {
    buttons = buttons.filter(button => !button.disabled);
  }

  return (
    <div
      className={cx(styles.wrapper, { [styles.quickActions]: quickActions })}
    >
      {buttons.map(btn => (
        <Button
          key={btn.label}
          onClick={() => btn.action && btn.action()}
          label={quickActions ? '' : btn.label}
          title={quickActions ? btn.label : ''}
          className={cx({ [styles.quickActionButton]: quickActions })}
          Icon={btn.Icon}
          iconSize="icon-regular"
          theme={
            quickActions ? BUTTON_THEMES.TRANSPARENT : BUTTON_THEMES.DEFAULT
          }
          disabled={btn.disabled}
          primary={quickActions ? false : btn.primary}
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
