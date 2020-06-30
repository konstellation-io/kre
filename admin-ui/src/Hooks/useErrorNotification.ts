import { ADD_NOTIFICATION } from 'Graphql/client/mutations/addNotification.graphql';
import { ApolloError } from 'apollo-client';
import { NotificationType } from 'Graphql/client/typeDefs';
import { useEffect } from 'react';
import { useMutation } from '@apollo/react-hooks';

type Props = {
  id: string;
  error?: ApolloError;
};
function useErrorNotification({ id, error }: Props) {
  const [addErrorNotification] = useMutation(ADD_NOTIFICATION);

  useEffect(() => {
    if (error) {
      addErrorNotification({
        variables: {
          input: {
            id,
            message: error.toString(),
            type: NotificationType.ERROR,
            timeout: 0,
            to: ''
          }
        }
      });
    }
  }, [error]);
}

export default useErrorNotification;
