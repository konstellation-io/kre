import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import ROUTE from '../../../../constants/routes';
import { buildRoute } from '../../../../utils/routes';
import {
  GetUsersActivity_userActivityList,
  GetUsersActivity_userActivityList_vars
} from '../../../../graphql/queries/types/GetUsersActivity';
import { UserActivityType } from '../../../../graphql/types/globalTypes';

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
  CONFIG_KEYS = 'CONFIG_KEYS'
}

function getVar(text: string | ReactElement | undefined): ReactElement {
  return <strong>{text}</strong>;
}

type Message = ReactElement | null;

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

  let runtimeName: string | undefined = vars[VarTypes.RUNTIME_NAME],
    runtimeId: string | undefined = vars[VarTypes.RUNTIME_ID],
    versionName: string | undefined = vars[VarTypes.VERSION_NAME],
    versionId: string | undefined = vars[VarTypes.VERSION_ID],
    oldPublishedVersionName: string | undefined =
      vars[VarTypes.OLD_PUBLISHED_VERSION_NAME],
    oldPublishedVersionId: string | undefined =
      vars[VarTypes.OLD_PUBLISHED_VERSION_ID],
    comment: string | undefined = vars[VarTypes.COMMENT],
    settingName: string | undefined = vars[VarTypes.SETTING_NAME],
    oldValue: string | undefined = vars[VarTypes.OLD_VALUE],
    newValue: string | undefined = vars[VarTypes.NEW_VALUE],
    configKeys: string | undefined = vars[VarTypes.CONFIG_KEYS];

  const runtimeLink =
    userActivity.type === UserActivityType.CREATE_RUNTIME && runtimeId ? (
      <Link to={buildRoute.runtime(ROUTE.RUNTIME, runtimeId)}>
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
      >
        {`${runtimeName} - ${versionName}`}
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
      >
        {oldPublishedVersionName}
      </Link>
    ) : (
      undefined
    );

  switch (userActivity.type) {
    case UserActivityType.LOGIN:
      message = <>{'Has logged in'}</>;
      break;
    case UserActivityType.LOGOUT:
      message = <>{'Has logged out'}</>;
      break;
    case UserActivityType.CREATE_RUNTIME:
      message = (
        <>
          {'Has created a new Runtime: '}
          {getVar(runtimeLink)}
        </>
      );
      break;
    case UserActivityType.CREATE_VERSION:
      message = (
        <>
          {'Has created a new Version: '}
          {getVar(versionLink)}
        </>
      );
      break;
    case UserActivityType.PUBLISH_VERSION:
      message = (
        <>
          {'Has published version: '}
          {getVar(versionLink)}
          {'. '}
          {oldVersionLink && (
            <>
              {'Previous published version: '}
              {getVar(oldVersionLink)}
            </>
          )}
        </>
      );
      break;
    case UserActivityType.UNPUBLISH_VERSION:
      message = (
        <>
          {'Has unpublished version '}
          {getVar(versionLink)}
        </>
      );
      break;
    case UserActivityType.STOP_VERSION:
      message = (
        <>
          {'Has stopped version '}
          {getVar(versionLink)}
        </>
      );
      break;
    case UserActivityType.START_VERSION:
      message = (
        <>
          {'Has started version '}
          {getVar(versionLink)}
        </>
      );
      break;
    case UserActivityType.UPDATE_SETTING:
      message = (
        <>
          {'Has updated '}
          {getVar(settingName)}
          {' setting from '}
          {getVar(oldValue)}
          {' to '}
          {getVar(newValue)}
        </>
      );
      break;
    case UserActivityType.UPDATE_VERSION_CONFIGURATION:
      message = (
        <>
          {'Has changed settings: '}
          {getVar(configKeys)}
          {' from version '}
          {getVar(versionLink)}
        </>
      );
      break;
    default:
      break;
  }

  return [message, comment];
}
