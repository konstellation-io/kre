import React, { useRef, useState } from 'react';
import SettingsHeader from '../../components/SettingsHeader/SettingsHeader';
import UserFiltersAndActions from './components/UserFiltersAndActions/UserFiltersAndActions';
import UserList from './components/UserList/UserList';
import ModalContainer from '../../../../components/Layout/ModalContainer/ModalContainer';
import ModalLayoutConfirmList from '../../../../components/Layout/ModalContainer/layouts/ModalLayoutConfirmList/ModalLayoutConfirmList';
import styles from './UsersSettings.module.scss';
import { loader } from 'graphql.macro';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GetUsers } from '../../../../graphql/queries/types/GetUsers';
import {
  RemoveUsers,
  RemoveUsersVariables
} from '../../../../graphql/mutations/types/RemoveUsers';
import {
  RevokeUserSessions,
  RevokeUserSessionsVariables
} from '../../../../graphql/mutations/types/RevokeUserSessions';
import {
  UpdateUsers,
  UpdateUsersVariables
} from '../../../../graphql/mutations/types/UpdateUsers';
import SpinnerCircular from '../../../../components/LoadingComponents/SpinnerCircular/SpinnerCircular';
import ErrorMessage from '../../../../components/ErrorMessage/ErrorMessage';
import {
  AccessLevel,
  UsersInput,
  UpdateUsersInput
} from '../../../../graphql/types/globalTypes';
import { mutationPayloadHelper } from '../../../../utils/formUtils';
import {
  GET_USER_SETTINGS,
  GetUserSettings
} from '../../../../graphql/client/queries/getUserSettings.graphql';
import UserRow from './components/UserRow/UserRow';
import {
  ModalInfo,
  defaultModalInfo,
  getModalInfo
} from './confirmationModals';

const GetUsersQuery = loader('../../../../graphql/queries/getUsers.graphql');
const UpdateUsersMutation = loader(
  '../../../../graphql/mutations/updateUsers.graphql'
);
const RemoveUsersMutation = loader(
  '../../../../graphql/mutations/removeUsers.graphql'
);
const RevokeUserSessionsMutation = loader(
  '../../../../graphql/mutations/revokeUserSessions.graphql'
);

function UsersSettings() {
  const { data, loading, error } = useQuery<GetUsers>(GetUsersQuery);
  const { data: localData } = useQuery<GetUserSettings>(GET_USER_SETTINGS);
  const [removeUsers] = useMutation<RemoveUsers, RemoveUsersVariables>(
    RemoveUsersMutation
  );
  const [revokeUsers] = useMutation<
    RevokeUserSessions,
    RevokeUserSessionsVariables
  >(RevokeUserSessionsMutation);
  const [updateUsers] = useMutation<UpdateUsers, UpdateUsersVariables>(
    UpdateUsersMutation
  );

  const [showConfirmation, setShowConfirmation] = useState(false);
  const modalInfo = useRef<ModalInfo>(defaultModalInfo);

  function openModal() {
    setShowConfirmation(true);
  }
  function closeModal() {
    setShowConfirmation(false);
  }

  function onSubmit() {
    modalInfo.current.action();
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
      action: () => {
        removeUsers(
          mutationPayloadHelper<UsersInput>({
            userIds: usersInfo.userIds
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
      action: () => {
        revokeUsers(
          mutationPayloadHelper<UsersInput>({
            userIds: usersInfo.userIds
          })
        );
        closeModal();
      },
      ...usersInfo
    });
  }

  function onUpdateUsers(newAccessLevel: AccessLevel, user?: [string]) {
    const usersInfo = getUsersInfo(user);

    openModal();
    modalInfo.current = getModalInfo({
      type: 'update',
      accessLevel: newAccessLevel,
      action: () => {
        updateUsers(
          mutationPayloadHelper<UpdateUsersInput>({
            userIds: usersInfo.userIds,
            accessLevel: newAccessLevel
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
          onUpdateUsers={onUpdateUsers}
        />
        <UserList
          users={data.users}
          onDeleteUsers={onDeleteUsers}
          onRevokeUsers={onRevokeUsers}
          onUpdateUsers={onUpdateUsers}
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
          <ModalLayoutConfirmList
            message={modalInfo.current.message}
            confirmMessage={modalInfo.current.confirmMessage}
          >
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
        </ModalContainer>
      )}
    </div>
  );
}

export default UsersSettings;
