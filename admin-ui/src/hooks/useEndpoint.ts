import { get } from 'lodash';

import { envVariables } from '../config';

import { useState, useCallback } from 'react';
import axios from 'axios';

export type Response = {
  data: any;
  status?: number;
  complete: boolean;
  pending: boolean;
  error: boolean | string;
};

const defaultResponseState: Response = {
  data: null,
  status: undefined,
  complete: false,
  pending: false,
  error: false
};

type Params = {
  endpoint?: string;
  method?: any;
};
export default function useEndpoint({
  endpoint = '',
  method = 'GET'
}: Params = {}): [Response, Function] {
  const [response, setResponse] = useState(defaultResponseState);
  const apiURL = `${envVariables.API_BASE_URL}/api/v1/auth`;

  const sendRequest = useCallback(
    async (data: Object = {}) => {
      if (response.pending) return;

      setResponse({
        ...defaultResponseState,
        pending: true
      });

      axios({
        data,
        method,
        url: `${apiURL}/${endpoint}`,
        withCredentials: true
      })
        .then((response: any) => {
          setResponse({
            ...defaultResponseState,
            data: response.data,
            status: response.status,
            complete: true
          });
        })
        .catch(error => {
          setResponse({
            ...defaultResponseState,
            complete: true,
            status: get(error, 'response.status'),
            data: get(error, 'response.data'),
            error: true
          });
        });
    },
    [method, response.pending, endpoint, apiURL]
  );

  return [response, sendRequest];
}
