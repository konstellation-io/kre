import React from 'react';
import SettingsHeader from '../../components/SettingsHeader/SettingsHeader';
import UserFiltersAndActions from './components/UserFiltersAndActions/UserFiltersAndActions';
import UserList from './components/UserList/UserList';
import styles from './UsersSettings.module.scss';

function UsersSettings() {
  return (
    <div>
      <SettingsHeader>Users Settings</SettingsHeader>
      <UserFiltersAndActions />
      <UserList />
    </div>
  );
}

export default UsersSettings;
