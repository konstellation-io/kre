import ApolloClient from 'apollo-client';
import { loader } from 'graphql.macro';
import { WatchVersionStatus } from 'Graphql/subscriptions/types/WatchVersionStatus';
import { get } from 'lodash';
import ROUTE from '../../../../Constants/routes';

const VersionStatusSubscription = loader(
  'Graphql/subscriptions/watchVersionStatus.graphql'
);

function onVersionStatus(client: ApolloClient<object>) {
  client
    .subscribe<WatchVersionStatus>({
      query: VersionStatusSubscription
    })
    .subscribe({
      error(err) {
        console.error(
          `Error at onVersionStatus subscription: ${err.toString()}`
        );
      }
    });
}

export default onVersionStatus;
