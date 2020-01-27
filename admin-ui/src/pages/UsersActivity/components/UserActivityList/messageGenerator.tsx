import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../../../../constants/routes';
import { buildRoute } from '../../../../utils/routes';
import {
  UserActivity,
  UserActivityVar,
  UserActivityType
} from '../../../../graphql/models';

enum VarTypes {
  RUNTIME_ID = 'RUNTIME_ID',
  RUNTIME_NAME = 'RUNTIME_NAME',
  VERSION_ID = 'VERSION_ID',
  VERSION_NAME = 'VERSION_NAME',
  OLD_ACTIVE_VERSION_NAME = 'OLD_ACTIVE_VERSION_NAME',
  OLD_ACTIVE_VERSION_ID = 'OLD_ACTIVE_VERSION_ID',
  COMMENT = 'COMMENT',
  SETTING_NAME = 'SETTING_NAME',
  OLD_VALUE = 'OLD_VALUE',
  NEW_VALUE = 'NEW_VALUE',
  CONFIG_KEYS = 'CONFIG_KEYS'
}

function getVar(text: any) {
  return <strong>{text}</strong>;
}

export default function getMessage(
  userActivity: UserActivity
): [any, string | undefined] {
  let message: any = '';

  const vars = userActivity.vars.reduce(
    (result: { [key: string]: string }, v: UserActivityVar) => {
      result[v.key] = v.value;
      return result;
    },
    {}
  );

  let runtimeName: string | undefined = vars[VarTypes.RUNTIME_NAME],
    runtimeId: string | undefined = vars[VarTypes.RUNTIME_ID],
    versionName: string | undefined = vars[VarTypes.VERSION_NAME],
    versionId: string | undefined = vars[VarTypes.VERSION_ID],
    oldActiveVersionName: string | undefined =
      vars[VarTypes.OLD_ACTIVE_VERSION_NAME],
    oldActiveVersionId: string | undefined =
      vars[VarTypes.OLD_ACTIVE_VERSION_ID],
    comment: string | undefined = vars[VarTypes.COMMENT],
    settingName: string | undefined = vars[VarTypes.SETTING_NAME],
    oldValue: string | undefined = vars[VarTypes.OLD_VALUE],
    newValue: string | undefined = vars[VarTypes.NEW_VALUE],
    configKeys: string | undefined = vars[VarTypes.CONFIG_KEYS];

  const runtimeLink =
    userActivity.type === UserActivityType.CREATE_RUNTIME && runtimeId ? (
      <Link to={buildRoute.runtime(ROUTES.RUNTIME, runtimeId)}>
        {runtimeName}
      </Link>
    ) : (
      undefined
    );
  const versionLink =
    runtimeId && versionId ? (
      <Link
        to={buildRoute.version(
          ROUTES.RUNTIME_VERSION_STATUS,
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
    userActivity.type === UserActivityType.ACTIVATE_VERSION &&
    runtimeId &&
    oldActiveVersionId ? (
      <Link
        to={buildRoute.version(
          ROUTES.RUNTIME_VERSION_STATUS,
          runtimeId,
          oldActiveVersionId
        )}
      >
        {oldActiveVersionName}
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
    case UserActivityType.ACTIVATE_VERSION:
      message = (
        <>
          {'Has activated version '}
          {getVar(versionLink)}
          {'. '}
          {oldVersionLink && (
            <>
              {'Previous active version: '}
              {getVar(oldVersionLink)}
            </>
          )}
        </>
      );
      break;
    case UserActivityType.DEACTIVATE_VERSION:
      message = (
        <>
          {'Has deactivated version '}
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
    case UserActivityType.DEPLOY_VERSION:
      message = (
        <>
          {'Has deployed version '}
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
