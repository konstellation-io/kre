import { ApolloClient } from '@apollo/client';
import { WatchVersionStatus } from 'Graphql/subscriptions/types/WatchVersionStatus';
import { loader } from 'graphql.macro';

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
