import gql from 'graphql-tag';
import { AccessLevel } from '../typeDefs';

export interface GetAccessLevel {
  accessLevel: AccessLevel;
}

export const GET_ACCESS_LEVEL = gql`
  {
    accessLevel @client
  }
`;
