import {
  ADD_NOTIFICATION,
  AddNotification,
  AddNotificationVariables
} from 'Graphql/client/mutations/addNotification.graphql';
import { clone, get } from 'lodash';

import ApolloClient from 'apollo-client';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import { NotificationType } from 'Graphql/client/typeDefs';
import ROUTE from 'Constants/routes';
import { loader } from 'graphql.macro';
import { runtimeCreated } from 'Graphql/subscriptions/types/runtimeCreated';
import { runtimeCreated_runtimeCreated } from 'Graphql/subscriptions/types/runtimeCreated';

const RuntimeCreatedSubscription = loader(
  'Graphql/subscriptions/runtimeCreated.graphql'
);
const GetRuntimesQuery = loader('Graphql/queries/getRuntimes.graphql');

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

function onRuntimeCreated(client: ApolloClient<object>) {
  client
    .subscribe<runtimeCreated>({
      query: RuntimeCreatedSubscription
    })
    .subscribe({
      next(data) {
        const runtime: runtimeCreated_runtimeCreated = get(
          data,
          'data.runtimeCreated'
        );
        const runtimePath = ROUTE.RUNTIME.replace(':runtimeId', runtime.id);

        updateRuntimesCache(client, runtime);

        client.mutate<AddNotification, AddNotificationVariables>({
          mutation: ADD_NOTIFICATION,
          variables: {
            input: {
              id: `runtime-${runtime.id}-created`,
              message: `The RUNTIME "${runtime.name}" has been successfully created!`,
              type: NotificationType.MESSAGE,
              typeLabel: 'CREATED',
              timeout: NOTIFICATION_TIMEOUT,
              to: runtimePath
            }
          }
        });
      },
      error(err) {
        console.error(
          `Error at onRuntimeCreated subscription: ${err.toString()}`
        );
      }
    });
}

export default onRuntimeCreated;
