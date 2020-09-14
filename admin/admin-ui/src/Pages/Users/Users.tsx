import {
  AccessLevel,
  UpdateAccessLevelInput,
  UsersInput
} from 'Graphql/types/globalTypes';
import {
  CHECK,
  ErrorMessage,
  ModalContainer,
  ModalLayoutConfirmList,
  ModalLayoutJustify,
  SpinnerCircular
} from 'kwc';
import {
  GET_USER_SETTINGS,
  GetUserSettings
} from 'Graphql/client/queries/getUserSettings.graphql';
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
} from 'Graphql/mutations/types/RemoveUsers';
import {
  RevokeUserSessions,
  RevokeUserSessionsVariables
} from 'Graphql/mutations/types/RevokeUserSessions';
import {
  UpdateAccessLevel,
  UpdateAccessLevelVariables
} from 'Graphql/mutations/types/UpdateAccessLevel';
import { useMutation, useQuery } from '@apollo/client';

import { GetUsers } from 'Graphql/queries/types/GetUsers';
import PageBase from 'Components/Layout/PageBase/PageBase';
import SettingsHeader from 'Pages/Settings/components/SettingsHeader/SettingsHeader';
import UserFiltersAndActions from './components/UserFiltersAndActions/UserFiltersAndActions';
import UserList from './components/UserList/UserList';
import UserRow from './components/UserRow/UserRow';
import { get } from 'lodash';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './Users.module.scss';
import { useForm } from 'react-hook-form';

const GetUsersQuery = loader('Graphql/queries/getUsers.graphql');
const UpdateAccessLevelMutation = loader(
  'Graphql/mutations/updateAccessLevel.graphql'
);
const RemoveUsersMutation = loader('Graphql/mutations/removeUsers.graphql');
const RevokeUserSessionsMutation = loader(
  'Graphql/mutations/revokeUserSessions.graphql'
);

function verifyComment(value: string) {
  return CHECK.getValidationError([CHECK.isFieldNotEmpty(value)]);
}

type FormData = {
  comment: string;
};

function Users() {
  const { handleSubmit, setValue, register, unregister, errors } = useForm<
    FormData
  >({
    defaultValues: {
      comment: ''
    }
  });
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
      },
      onError: e => console.error(`removeUsers: ${e}`)
    }
  );
  const [revokeUsers] = useMutation<
    RevokeUserSessions,
    RevokeUserSessionsVariables
  >(RevokeUserSessionsMutation, {
    onError: e => console.error(`revokeUsers: ${e}`)
  });
  const [updateAccessLevel] = useMutation<
    UpdateAccessLevel,
    UpdateAccessLevelVariables
  >(UpdateAccessLevelMutation, {
    onError: e => console.error(`updateAccessLevel: ${e}`)
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const modalInfo = useRef<ModalInfo>(defaultModalInfo);

  useEffect(() => {
    register('comment', { validate: verifyComment });

    return () => unregister('comment');
  }, [register, unregister, setValue]);

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
    <PageBase>
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
              error={get(errors.comment, 'message', '') as string}
              label={modalInfo.current.commentLabel}
              className={styles.justify}
              submit={onSubmit}
            />
          </ModalContainer>
        )}
      </div>
    </PageBase>
  );
}

export default Users;
