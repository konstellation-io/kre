import { get, clone } from 'lodash';
import React from 'react';
import { loader } from 'graphql.macro';
import { runtimeCreated } from '../../../../graphql/subscriptions/types/runtimeCreated';
import {
  useSubscription,
  SubscriptionHookOptions,
  useMutation,
  useApolloClient
} from '@apollo/react-hooks';
import {
  ADD_NOTIFICATION,
  AddNotification,
  AddNotificationVariables
} from '../../../../graphql/client/mutations/addNotification.graphql';
import { GetRuntimes_runtimes } from '../../../../graphql/queries/types/GetRuntimes';
import { runtimeCreated_runtimeCreated } from '../../../../graphql/subscriptions/types/runtimeCreated';
import ROUTE from '../../../../constants/routes';
import ApolloClient from 'apollo-client';
import { NotificationType } from '../../../../graphql/client/typeDefs';

const RuntimeCreatedSubscription = loader(
  '../../../../graphql/subscriptions/runtimeCreated.graphql'
);
const GetRuntimesQuery = loader(
  '../../../../graphql/queries/getRuntimes.graphql'
);

const NOTIFICATION_TIMEOUT = 15 * 1000;

function updateRuntimesCache(
  client: ApolloClient<object>,
  runtime: runtimeCreated_runtimeCreated
) {
  const data = client.readQuery({ query: GetRuntimesQuery });
  const runtimes = data && clone(data.runtimes);
  const updatedRuntime = runtimes.indexOf(
    (r: GetRuntimes_runtimes) => r.id === runtime.id
  );
  runtimes[updatedRuntime] = runtime;

  client.writeQuery({ query: GetRuntimesQuery, data: { runtimes } });
}

function RuntimeCreated() {
  const client = useApolloClient();
  const [addInfoNotification] = useMutation<
    AddNotification,
    AddNotificationVariables
  >(ADD_NOTIFICATION);
  useSubscription<runtimeCreated>(RuntimeCreatedSubscription, {
    onSubscriptionData: (msg: SubscriptionHookOptions<runtimeCreated>) => {
      const runtime: runtimeCreated_runtimeCreated = get(
        msg,
        'subscriptionData.data.runtimeCreated'
      );
      const runtimePath = ROUTE.RUNTIME.replace(':runtimeId', runtime.id);

      updateRuntimesCache(client, runtime);

      addInfoNotification({
        variables: {
          input: {
            id: `runtime-${runtime.id}-created`,
            message: `The RUNTIME "${runtime.name}" has been successfully created!`,
            type: NotificationType.MESSAGE,
            timeout: NOTIFICATION_TIMEOUT,
            to: runtimePath
          }
        }
      });
    }
  });

  return <div />;
}

export default RuntimeCreated;
