/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { UserActivityType } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetAllUserActivity
// ====================================================

export interface GetAllUserActivity_userActivityList_user {
  __typename: 'User';
  email: string;
}

export interface GetAllUserActivity_userActivityList_vars {
  __typename: 'UserActivityVar';
  key: string;
  value: string;
}

export interface GetAllUserActivity_userActivityList {
  __typename: 'UserActivity';
  user: GetAllUserActivity_userActivityList_user;
  date: string;
  type: UserActivityType;
  vars: GetAllUserActivity_userActivityList_vars[];
}

export interface GetAllUserActivity {
  userActivityList: GetAllUserActivity_userActivityList[];
}
