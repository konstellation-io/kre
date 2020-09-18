import { ApolloClient } from '@apollo/client';
import { WatchVersion } from 'Graphql/subscriptions/types/WatchVersion';
import { loader } from 'graphql.macro';

const VersionStatusSubscription = loader(
  'Graphql/subscriptions/watchVersion.graphql'
);

function onVersionStatus(client: ApolloClient<object>) {
  client
    .subscribe<WatchVersion>({
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
