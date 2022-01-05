import { AccessLevel } from '../Graphql/types/globalTypes';

import GetUsers from '../Graphql/queries/getUsers';

export const userMe = {
  id: 'userMe',
  email: 'admin@konstellation.io',
  creationDate: '2022-01-01',
  lastActivity: '2022-01-01',
  accessLevel: AccessLevel.ADMIN
}

export const usersMock = {
  request: {
    query: GetUsers
  },
  result: {
    data: {
      users: [
        {
          id: 'user1',
          email: 'user1@konstellation.com',
          accessLevel: AccessLevel.ADMIN,
          creationDate: '2018-01-01',
          lastActivity: '2018-01-01',
          activeSessions: 4
        },
        {
          id: 'user2',
          email: 'user2@konstellation.com',
          accessLevel: AccessLevel.MANAGER,
          creationDate: '2018-01-01',
          lastActivity: '2018-01-01',
          activeSessions: 4
        }
      ]
    }
  }
};
