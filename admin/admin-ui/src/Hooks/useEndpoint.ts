import axios, { AxiosResponse, Method } from 'axios';
import { useCallback, useState } from 'react';

import { API_BASE_URL } from 'index';
import { get } from 'lodash';

export type Response = {
  data: Response | null;
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
  method?: Method;
};
export default function useEndpoint({
  endpoint = '',
  method = 'GET'
}: Params = {}): [Response, Function] {
  const [response, setResponse] = useState(defaultResponseState);
  const apiURL = `${API_BASE_URL}/api/v1/auth`;

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
        .then((res: AxiosResponse) => {
          setResponse({
            ...defaultResponseState,
            data: res.data,
            status: res.status,
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
