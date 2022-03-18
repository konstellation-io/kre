import {
  BUTTON_THEMES,
  Button,
  CHECK,
  ModalContainer,
  ModalLayoutInfo,
  ModalLayoutJustify
} from 'kwc';
import {GetVersionConfStatus_runtime, GetVersionConfStatus_versions} from 'Graphql/queries/types/GetVersionConfStatus';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import Tag, { TagTypes } from 'Components/Tag/Tag';

import { Link } from 'react-router-dom';
import PublishIcon from '@material-ui/icons/Publish';
import ROUTE from 'Constants/routes';
import StartIcon from '@material-ui/icons/PlayCircleOutline';
import StopIcon from '@material-ui/icons/PauseCircleFilled';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import UnpublishIcon from '@material-ui/icons/GetApp';
import { VersionStatus } from 'Graphql/types/globalTypes';
import { buildRoute } from 'Utils/routes';
import cx from 'classnames';
import { get } from 'lodash';
import styles from './VersionActions.module.scss';
import { useForm } from 'react-hook-form';
import useVersionAction from 'Pages/Version/utils/hooks';

function verifyComment(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value)]);
}

type WarningProps = {
  runtime: GetVersionConfStatus_runtime;
  publishedVersion: GetVersionConfStatus_versions;
};
function Warning({ runtime, publishedVersion }: WarningProps) {
  return (
    <>
      <Tag type={TagTypes.WARNING}>WARNING</Tag>A published version already
      exists, publishing this version will unpublish the following version:{' '}
      <Link to={buildRoute.version(ROUTE.VERSION, runtime.id, publishedVersion.name)}>
        <span
          className={styles.publishedVersion}
          title={publishedVersion.description}
        >
          {publishedVersion.name}
        </span>
      </Link>
    </>
  );
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

type FormData = {
  comment: string;
};

type Props = {
  runtime: GetVersionConfStatus_runtime;
  versions: GetVersionConfStatus_versions[];
  version: GetVersionConfStatus_versions;
  quickActions?: boolean;
};

function VersionActions({ runtime, versions, version, quickActions = false }: Props) {
  const { handleSubmit, setValue, register, unregister, errors } = useForm<
    FormData
  >({
    defaultValues: {
      comment: ''
    }
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const modalInfo = useRef<ModalInfo>({
    action: () => {},
    label: ''
  });

  useEffect(() => {
    register('comment', { validate: verifyComment });

    return () => unregister('comment');
  }, [register, unregister, setValue]);

  function onSubmit() {
    handleSubmit((formData: FormData) =>
      modalInfo.current.action(formData.comment)
    )();
  }

  const {
    publishVersion,
    startVersion,
    stopVersion,
    unpublishVersion,
    getMutationVars
  } = useVersionAction();

  function openModal(label: string, mutation: Function) {
    modalInfo.current = {
      action: (comment: string) => {
        mutation(getMutationVars(version.name, comment));
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
    case VersionStatus.CREATED:
    case VersionStatus.STOPPED:
      buttons[0] = {
        Icon: StartIcon,
        label: 'START',
        action: () => openModal('START', startVersion),
        primary: version.config.completed,
        disabled: !version.config.completed
      };
      buttons[1] = {
        Icon: PublishIcon,
        label: 'PUBLISH',
        disabled: true
      };
      break;
    case VersionStatus.STOPPING:
      buttons[0] = {
        Icon: StartIcon,
        label: 'START',
        action: () => openModal('START', startVersion),
        primary: version.config.completed,
        disabled: true
      };
      buttons[1] = {
        Icon: PublishIcon,
        label: 'PUBLISH',
        disabled: true
      };
      break;
    case VersionStatus.CREATING:
      buttons[0] = {
        Icon: StartIcon,
        label: 'START',
        disabled: true
      };
      buttons[1] = {
        Icon: PublishIcon,
        label: 'PUBLISH',
        disabled: true
      };
      break;
    case VersionStatus.STARTING:
      buttons[0] = {
        Icon: StopIcon,
        label: 'STOP',
        action: () => openModal('STOP', stopVersion),
        disabled: true
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

  const publishedVersion = versions.filter(
    v => v.status === VersionStatus.PUBLISHED
  )[0];

  const showWarning = publishedVersion && modalInfo.current.label === 'PUBLISH';

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
          actionButtonLabel={modalInfo.current.label}
          onAccept={onSubmit}
          onCancel={closeModal}
          warning={showWarning}
          blocking
        >
          <ModalLayoutJustify
            onUpdate={(value: string) => setValue('comment', value)}
            submit={onSubmit}
            error={get(errors.comment, 'message', '') as string}
          />
          {showWarning && (
            <ModalLayoutInfo className={styles.warning}>
              <Warning runtime={runtime}  publishedVersion={publishedVersion} />
            </ModalLayoutInfo>
          )}
        </ModalContainer>
      )}
    </div>
  );
}

export default VersionActions;
