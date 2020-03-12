import { useEffect } from 'react';
import { ApolloError } from 'apollo-client';
import { useMutation } from '@apollo/react-hooks';
import { NotificationType } from '../graphql/client/typeDefs';
import { ADD_NOTIFICATION } from '../graphql/client/mutations/addNotification.graphql';

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
