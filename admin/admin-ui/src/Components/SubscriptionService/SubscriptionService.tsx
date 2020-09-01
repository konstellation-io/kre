import { useApolloClient, useQuery } from '@apollo/client';

import { GET_LOGIN_STATUS } from 'Graphql/client/queries/getLoginStatus.graphql';
import onVersionStatus from './Services/onVersionStatus/onVersionStatus';

function SubscriptionService() {
  const client = useApolloClient();
  const { data } = useQuery(GET_LOGIN_STATUS);

  if (data && data.loggedIn) {
    onVersionStatus(client);
  }

  return null;
}

export default SubscriptionService;
