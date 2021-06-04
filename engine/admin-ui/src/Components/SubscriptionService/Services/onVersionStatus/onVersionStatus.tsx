import { ApolloClient } from '@apollo/client';
import { WatchVersion } from 'Graphql/subscriptions/types/WatchVersion';

import VersionStatusSubscription from 'Graphql/subscriptions/watchVersion';

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
