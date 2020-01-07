import * as PAGES from '../../../constants/routes';

import { useMutation } from '@apollo/react-hooks';
import { useHistory } from 'react-router';
import {
  ACTIVATE_VERSION,
  DEPLOY_VERSION,
  ActivateVersionResponse,
  DeployVersionResponse,
  ActivateDeployVersionVars
} from '../pages/RuntimeStatusPreview/RuntimeStatusPreview.graphql';

export enum actions {
  activate = 'activateVersion',
  deploy = 'deployVersion',
  stop = 'stopVersion',
  deactivate = 'deactivateVersion'
}

export default function useVersionAction(redirectionPath: string) {
  const history = useHistory();
  const [activateMutation] = useMutation<
    ActivateVersionResponse,
    ActivateDeployVersionVars
  >(ACTIVATE_VERSION, { onCompleted: refreshPage });
  const [deployMutation] = useMutation<
    DeployVersionResponse,
    ActivateDeployVersionVars
  >(DEPLOY_VERSION, { onCompleted: refreshPage });

  function refreshPage() {
    history.push(PAGES.NEW_VERSION);
    history.replace(redirectionPath);
  }

  function getMutationVars(versionId: string, comment?: string) {
    const variables = {
      variables: {
        input: {
          versionId: versionId
        }
      }
    } as any;

    if (comment) {
      variables.variables.input.comment = comment;
    }

    return variables;
  }

  return {
    [actions.activate]: activateMutation,
    [actions.deploy]: deployMutation,
    [actions.stop]: function() {},
    [actions.deactivate]: function() {},
    getMutationVars
  };
}
