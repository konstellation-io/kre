import { useApolloClient, useReactiveVar } from '@apollo/client';
import onVersionStatus from './Services/onVersionStatus/onVersionStatus';
import { loggedIn } from '../../Graphql/client/cache';

function SubscriptionService() {
  const client = useApolloClient();
  const dataLoggedIn = useReactiveVar(loggedIn);

  if (dataLoggedIn) {
    onVersionStatus(client);
  }

  return null;
}

export default SubscriptionService;
