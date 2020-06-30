import {
  GetUsersActivity_userActivityList,
  GetUsersActivity_userActivityList_vars
} from 'Graphql/queries/types/GetUsersActivity';
import React, { FC, ReactElement } from 'react';

import { Link } from 'react-router-dom';
import ROUTE from 'Constants/routes';
import { UserActivityType } from 'Graphql/types/globalTypes';
import { buildRoute } from 'Utils/routes';
import cx from 'classnames';
import styles from './UserActivityList.module.scss';

export enum VarTypes {
  RUNTIME_ID = 'RUNTIME_ID',
  RUNTIME_NAME = 'RUNTIME_NAME',
  VERSION_ID = 'VERSION_ID',
  VERSION_NAME = 'VERSION_NAME',
  OLD_PUBLISHED_VERSION_NAME = 'OLD_PUBLISHED_VERSION_NAME',
  OLD_PUBLISHED_VERSION_ID = 'OLD_PUBLISHED_VERSION_ID',
  COMMENT = 'COMMENT',
  SETTING_NAME = 'SETTING_NAME',
  OLD_VALUE = 'OLD_VALUE',
  NEW_VALUE = 'NEW_VALUE',
  CONFIG_KEYS = 'CONFIG_KEYS',
  CREATED_USER_EMAIL = 'CREATED_USER_EMAIL',
  CREATED_USER_ACCESS_LEVEL = 'CREATED_USER_ACCESS_LEVEL',
  USER_EMAILS = 'USER_EMAILS',
  ACCESS_LEVEL = 'ACCESS_LEVEL'
}

type Message = ReactElement | null;

type HighlightProps = {
  children: string;
  type?: string;
};
const Highlight: FC<HighlightProps> = ({ children, type }) => (
  <span className={cx(styles.highlight, styles[type || ''])}>{children}</span>
);

export default function getMessage(
  userActivity: GetUsersActivity_userActivityList
): [Message | null, string | undefined] {
  let message: Message | null = null;

  const vars = userActivity.vars.reduce(
    (
      result: { [key: string]: string },
      v: GetUsersActivity_userActivityList_vars
    ) => {
      result[v.key] = v.value;
      return result;
    },
    {}
  );

  const runtimeName = vars[VarTypes.RUNTIME_NAME];
  const runtimeId = vars[VarTypes.RUNTIME_ID];
  const versionName = vars[VarTypes.VERSION_NAME];
  const versionId = vars[VarTypes.VERSION_ID];
  const oldPublishedVersionName = vars[VarTypes.OLD_PUBLISHED_VERSION_NAME];
  const oldPublishedVersionId = vars[VarTypes.OLD_PUBLISHED_VERSION_ID];
  const comment = vars[VarTypes.COMMENT];
  const settingName = vars[VarTypes.SETTING_NAME];
  const oldValue = vars[VarTypes.OLD_VALUE];
  const newValue = vars[VarTypes.NEW_VALUE];
  const configKeys = vars[VarTypes.CONFIG_KEYS];
  const createdUserEmail = vars[VarTypes.CREATED_USER_EMAIL];
  const createdUserAccessLevel = vars[VarTypes.CREATED_USER_ACCESS_LEVEL];
  const userEmails = vars[VarTypes.USER_EMAILS];
  const accessLevel = vars[VarTypes.ACCESS_LEVEL];

  const runtimeLink = runtimeId ? (
    <Link
      to={buildRoute.runtime(ROUTE.RUNTIME, runtimeId)}
      className={cx(styles.link)}
    >
      {runtimeName}
    </Link>
  ) : (
    undefined
  );
  const versionLink =
    runtimeId && versionId ? (
      <Link
        to={buildRoute.version(
          ROUTE.RUNTIME_VERSION_STATUS,
          runtimeId,
          versionId
        )}
        className={cx(styles.link)}
      >
        {versionName}
      </Link>
    ) : (
      undefined
    );
  const oldVersionLink =
    userActivity.type === UserActivityType.PUBLISH_VERSION &&
    runtimeId &&
    oldPublishedVersionId ? (
      <Link
        to={buildRoute.version(
          ROUTE.RUNTIME_VERSION_STATUS,
          runtimeId,
          oldPublishedVersionId
        )}
        className={cx(styles.link)}
      >
        {oldPublishedVersionName}
      </Link>
    ) : (
      undefined
    );

  switch (userActivity.type) {
    case UserActivityType.LOGIN:
      message = <>Log in</>;
      break;
    case UserActivityType.LOGOUT:
      message = <>Log out</>;
      break;
    case UserActivityType.CREATE_RUNTIME:
      message = (
        <>
          New Runtime created:
          {runtimeLink}
        </>
      );
      break;
    case UserActivityType.CREATE_VERSION:
      message = (
        <>
          New Version created:
          {versionLink}
          at Runtime
          {runtimeLink}
        </>
      );
      break;
    case UserActivityType.PUBLISH_VERSION:
      message = (
        <>
          The version
          {versionLink}
          Have been
          <Highlight type="published">Published</Highlight>
          at Runtime
          {runtimeLink}
          {oldVersionLink && (
            <>
              {'. Previous published version: '}
              {oldVersionLink}
            </>
          )}
        </>
      );
      break;
    case UserActivityType.UNPUBLISH_VERSION:
      message = (
        <>
          The version
          {versionLink}
          Have been
          <Highlight type="unpublished">Unpublished</Highlight>
          at Runtime
          {runtimeLink}
        </>
      );
      break;
    case UserActivityType.STOP_VERSION:
      message = (
        <>
          The version
          {versionLink}
          Have been
          <Highlight type="stopped">Stopped</Highlight>
          at Runtime
          {runtimeLink}
        </>
      );
      break;
    case UserActivityType.START_VERSION:
      message = (
        <>
          The version
          {versionLink}
          Have been
          <Highlight type="started">Started</Highlight>
          at Runtime
          {runtimeLink}
        </>
      );
      break;
    case UserActivityType.UPDATE_SETTING:
      message = (
        <>
          Has updated
          <Highlight>{settingName}</Highlight>
          setting from
          <Highlight>{oldValue}</Highlight>
          to
          <Highlight>{newValue}</Highlight>
        </>
      );
      break;
    case UserActivityType.UPDATE_VERSION_CONFIGURATION:
      message = (
        <>
          Updated settings
          <Highlight>{configKeys}</Highlight>
          from version
          {versionLink}
        </>
      );
      break;
    case UserActivityType.CREATE_USER:
      message = (
        <>
          New user created
          <Highlight>{createdUserEmail}</Highlight>
          with access level
          <Highlight>{createdUserAccessLevel}</Highlight>
        </>
      );
      break;
    case UserActivityType.REMOVE_USERS:
      message = (
        <>
          Users removed
          <Highlight>{userEmails}</Highlight>
        </>
      );
      break;
    case UserActivityType.UPDATE_ACCESS_LEVELS:
      message = (
        <>
          Updated access level to
          <Highlight>{accessLevel}</Highlight>
          for the following users
          <Highlight>{userEmails}</Highlight>
        </>
      );
      break;
    case UserActivityType.REVOKE_SESSIONS:
      message = (
        <>
          Revoked the sessions of the following users
          <Highlight>{userEmails}</Highlight>
        </>
      );
      break;
    default:
      break;
  }

  message = <div className={styles.message}>{message}</div>;

  return [message, comment];
}
