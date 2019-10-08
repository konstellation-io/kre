import { testHook } from '../utils/testUtils';
import { act } from '@testing-library/react';
import useInput, { InputHookElement } from './useInput';
import useEndpoint, { Response } from './useEndpoint';
import axios from 'axios';


jest.mock('axios');

describe('useInput tests', () => {
  let input:InputHookElement;
  const validator = (value:string) => {
    return value === 'validInput' ? false : 'Input is not valid';
  };
  beforeEach(() => {
    testHook(() => {
      input = useInput('name', validator);
    });
  });

  it('should produce a well formed input hooks object', () => {
    expect(input.value).toBe('name');
    expect(input.setValue).toBeInstanceOf(Function);
    expect(input.error).toBe('');
    expect(input.setError).toBeInstanceOf(Function);
    expect(input.onChange).toBeInstanceOf(Function);
  });

  it('updates value', () => {
    act(() => {
      input.onChange('newName');
    });
    expect(input.value).toBe('newName');
    
    act(() => {
      input.clear();
    });
    expect(input.value).toBe('name');
  });

  it('validates the value and updates the error', () => {
    let isValid;

    act(() => {
      isValid = input.isValid();
    });
    expect(isValid).toBeFalsy();
    expect(input.error).toBe('Input is not valid');

    act(() => {
      input.onChange('validInput');
    });
    act(() => {
      isValid = input.isValid();
    });

    expect(isValid).toBeTruthy();
    expect(input.error).toBe('');

    act(() => {
      input.setError('some error');
    });
    expect(input.error).toBe('some error');
    
    act(() => {
      input.clearError();
    });
    expect(input.error).toBe('');
  });
});

describe('useEndpoint tests', () => {
  let response: Response, sendRequest:Function;
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
    axios.mockResolvedValue({ data: 'OK' });
      
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
    axios.mockRejectedValue();
      
    expect(response.complete).toBeFalsy();

    await act(async () => {
      expect(response.complete).toBeFalsy();

      await sendRequest({ someParam: 'some value' });
    });
      
    expect(response.complete).toBeTruthy();
    expect(response.pending).toBeFalsy();
    expect(response.data).toBe(null);
    expect(response.error).toBeTruthy();
  });
});
