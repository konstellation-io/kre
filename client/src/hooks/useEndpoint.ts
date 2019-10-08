import {useState, useCallback} from 'react';
import axios from 'axios';

export type Response = {
  data: any;
  complete: boolean;
  pending: boolean;
  error: boolean | string;
};

const apiURL = process.env.REACT_APP_API_URL;
const defaultResponseState:Response = {
  data: null,
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

  const sendRequest = useCallback(async (data:Object = {}) => {
    if (response.pending) return;

    setResponse({
      ...defaultResponseState,
      pending: true,
    });

    axios({
      data,
      method,
      url: `${apiURL}/${endpoint}`
    })
      .then((response:any) => {
        setResponse({
          ...defaultResponseState,
          data: response.data,
          complete: true,
        });
      })
      .catch(() => {
        setResponse({
          ...defaultResponseState,
          complete: true,
          error: true
        });
      });
  }, [method, response.pending, endpoint]);

  return [response, sendRequest];
}
