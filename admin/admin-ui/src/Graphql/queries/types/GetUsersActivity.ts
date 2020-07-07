/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {UserActivityType} from '../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetUsersActivity
// ====================================================

export interface GetUsersActivity_userActivityList_user {
  __typename: 'User';
  email: string;
}

export interface GetUsersActivity_userActivityList_vars {
  __typename: 'UserActivityVar';
  key: string;
  value: string;
}

export interface GetUsersActivity_userActivityList {
  __typename: 'UserActivity';
  id: string;
  user: GetUsersActivity_userActivityList_user;
  date: string;
  type: UserActivityType;
  vars: GetUsersActivity_userActivityList_vars[];
}

export interface GetUsersActivity {
  userActivityList: GetUsersActivity_userActivityList[];
}

export interface GetUsersActivityVariables {
  userEmail?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  types?: UserActivityType[] | null;
  versionIds?: string[] | null;
  lastId?: string | null;
}
