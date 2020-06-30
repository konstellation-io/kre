import useEndpoint, { Response } from './useEndpoint';

import { act } from '@testing-library/react';
import axios from 'axios';
import { testHook } from 'Utils/testUtils';

jest.mock('axios');

describe('useEndpoint tests', () => {
  let response: Response, sendRequest: Function;
  const endpoint = 'some_endpoint';
  beforeEach(() => {
    testHook(() => {
      [response, sendRequest] = useEndpoint({ endpoint });
    });
  });

  it('should produce a well formed request hook values', () => {
    expect(response).toBeInstanceOf(Object);
    expect(response.pending).toBeFalsy();
    expect(response.error).toBeFalsy();
    expect(response.data).toBeNull();
    expect(sendRequest).toBeInstanceOf(Function);
  });

  it('handles success request correctly', async () => {
    // @ts-ignore
    axios.mockResolvedValue({ data: 'OK', status: 200 });

    expect(response.complete).toBeFalsy();

    await act(async () => {
      expect(response.complete).toBeFalsy();

      await sendRequest({ someParam: 'some value' });
    });

    expect(response.complete).toBeTruthy();
    expect(response.pending).toBeFalsy();
    expect(response.data).toBe('OK');

    expect(axios).toHaveBeenCalledTimes(1);
  });

  it('handles failure request correctly', async () => {
    // @ts-ignore
    axios.mockRejectedValue({
      response: { data: { code: 'error' }, status: 400 }
    });

    expect(response.complete).toBeFalsy();

    await act(async () => {
      expect(response.complete).toBeFalsy();

      await sendRequest({ someParam: 'some value' });
    });

    expect(response.complete).toBeTruthy();
    expect(response.pending).toBeFalsy();
    expect(response.data.code).toBe('error');
    expect(response.error).toBeTruthy();
  });
});
