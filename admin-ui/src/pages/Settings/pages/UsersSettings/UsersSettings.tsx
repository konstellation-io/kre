import * as CHECK from '../../../../components/Form/check';

import {
  AccessLevel,
  UpdateAccessLevelInput,
  UsersInput
} from '../../../../graphql/types/globalTypes';
import {
  GET_USER_SETTINGS,
  GetUserSettings
} from '../../../../graphql/client/queries/getUserSettings.graphql';
import {
  ModalInfo,
  defaultModalInfo,
  getModalInfo
} from './confirmationModals';
import React, { useEffect, useRef, useState } from 'react';
import {
  RemoveUsers,
  RemoveUsersVariables,
  RemoveUsers_removeUsers
} from '../../../../graphql/mutations/types/RemoveUsers';
import {
  RevokeUserSessions,
  RevokeUserSessionsVariables
} from '../../../../graphql/mutations/types/RevokeUserSessions';
import {
  UpdateAccessLevel,
  UpdateAccessLevelVariables
} from '../../../../graphql/mutations/types/UpdateAccessLevel';
import { useMutation, useQuery } from '@apollo/react-hooks';

import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import { GetUsers } from '../../../../graphql/queries/types/GetUsers';
import ModalContainer from '../../../../components/Layout/ModalContainer/ModalContainer';
import ModalLayoutConfirmList from '../../../../components/Layout/ModalContainer/layouts/ModalLayoutConfirmList/ModalLayoutConfirmList';
import ModalLayoutJustify from '../../../../components/Layout/ModalContainer/layouts/ModalLayoutJustify/ModalLayoutJustify';
import SettingsHeader from '../../components/SettingsHeader/SettingsHeader';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import UserFiltersAndActions from './components/UserFiltersAndActions/UserFiltersAndActions';
import UserList from './components/UserList/UserList';
import UserRow from './components/UserRow/UserRow';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from '../../../../utils/formUtils';
import styles from './UsersSettings.module.scss';
import { useForm } from 'react-hook-form';

const GetUsersQuery = loader('../../../../graphql/queries/getUsers.graphql');
const UpdateAccessLevelMutation = loader(
  '../../../../graphql/mutations/updateAccessLevel.graphql'
);
const RemoveUsersMutation = loader(
  '../../../../graphql/mutations/removeUsers.graphql'
);
const RevokeUserSessionsMutation = loader(
  '../../../../graphql/mutations/revokeUserSessions.graphql'
);

function verifyComment(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value)]);
}

type FormData = {
  comment: string;
};

function UsersSettings() {
  const { handleSubmit, setValue, register, errors } = useForm<FormData>();
  const { data, loading, error } = useQuery<GetUsers>(GetUsersQuery);
  const { data: localData } = useQuery<GetUserSettings>(GET_USER_SETTINGS);
  const [removeUsers] = useMutation<RemoveUsers, RemoveUsersVariables>(
    RemoveUsersMutation,
    {
      update: (cache, result) => {
        if (result.data !== undefined && result.data !== null) {
          const removedUsers = result.data
            .removeUsers as RemoveUsers_removeUsers[];
          const cacheResult = cache.readQuery<GetUsers>({
            query: GetUsersQuery
          });
          if (cacheResult !== null) {
            const removedUserIds = removedUsers.map(u => u.id);
            const { users } = cacheResult;
            cache.writeQuery({
              query: GetUsersQuery,
              data: { users: users.filter(u => !removedUserIds.includes(u.id)) }
            });
          }
        }
      }
    }
  );
  const [revokeUsers] = useMutation<
    RevokeUserSessions,
    RevokeUserSessionsVariables
  >(RevokeUserSessionsMutation);
  const [updateAccessLevel] = useMutation<
    UpdateAccessLevel,
    UpdateAccessLevelVariables
  >(UpdateAccessLevelMutation);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const modalInfo = useRef<ModalInfo>(defaultModalInfo);

  useEffect(() => {
    register('comment', { validate: verifyComment });
    setValue('comment', '');
  }, [register, setValue]);

  function openModal() {
    setShowConfirmation(true);
  }
  function closeModal() {
    setShowConfirmation(false);
  }

  function onSubmit() {
    handleSubmit(({ comment }: FormData) =>
      modalInfo.current.action(comment)
    )();
  }

  const selectedUsers = localData?.userSettings.selectedUserIds || [];

  function getUsersInfo(user?: [string]) {
    const userIds = user || selectedUsers;
    const nUsers = userIds.length;
    const plural = nUsers > 1;

    return { userIds, nUsers, plural };
  }

  function onDeleteUsers(user?: [string]) {
    const usersInfo = getUsersInfo(user);

    openModal();
    modalInfo.current = getModalInfo({
      type: 'delete',
      action: (comment: string) => {
        removeUsers(
          mutationPayloadHelper<UsersInput>({
            userIds: usersInfo.userIds,
            comment
          })
        );
        closeModal();
      },
      ...usersInfo
    });
  }

  function onRevokeUsers(user?: [string]) {
    const usersInfo = getUsersInfo(user);

    openModal();
    modalInfo.current = getModalInfo({
      type: 'revoke',
      action: (comment: string) => {
        revokeUsers(
          mutationPayloadHelper<UsersInput>({
            userIds: usersInfo.userIds,
            comment
          })
        );
        closeModal();
      },
      ...usersInfo
    });
  }

  function onUpdateAccessLevel(newAccessLevel: AccessLevel, user?: [string]) {
    const usersInfo = getUsersInfo(user);

    openModal();
    modalInfo.current = getModalInfo({
      type: 'update',
      accessLevel: newAccessLevel,
      action: (comment: string) => {
        updateAccessLevel(
          mutationPayloadHelper<UpdateAccessLevelInput>({
            userIds: usersInfo.userIds,
            accessLevel: newAccessLevel,
            comment
          })
        );
        closeModal();
      },
      ...usersInfo
    });
  }

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error || !data) return <ErrorMessage />;

    return (
      <>
        <UserFiltersAndActions
          onDeleteUsers={onDeleteUsers}
          onRevokeUsers={onRevokeUsers}
          onUpdateAccessLevel={onUpdateAccessLevel}
        />
        <UserList
          users={data.users}
          onDeleteUsers={onDeleteUsers}
          onRevokeUsers={onRevokeUsers}
          onUpdateAccessLevel={onUpdateAccessLevel}
        />
      </>
    );
  }

  return (
    <div className={styles.container}>
      <SettingsHeader>Users Settings</SettingsHeader>
      {getContent()}
      {showConfirmation && (
        <ModalContainer
          title={modalInfo.current.title}
          onAccept={onSubmit}
          onCancel={closeModal}
          actionButtonLabel={modalInfo.current.acceptLabel}
          className={styles.modal}
          blocking
        >
          <ModalLayoutConfirmList message={modalInfo.current.message}>
            {modalInfo.current.userIds.map(userId => {
              const user = data?.users.find(u => u.id === userId);
              return (
                <UserRow
                  key={user?.email}
                  email={user?.email}
                  accessLevel={user?.accessLevel}
                />
              );
            })}
          </ModalLayoutConfirmList>
          <ModalLayoutJustify
            onUpdate={(value: string) => setValue('comment', value)}
            error={get(errors.comment, 'message', '')}
            label={modalInfo.current.commentLabel}
            className={styles.justify}
            submit={onSubmit}
          />
        </ModalContainer>
      )}
    </div>
  );
}

export default UsersSettings;
