import { ErrorMessage, InfoMessage, SpinnerCircular } from 'kwc';
import {
  GetUsersActivity,
  GetUsersActivity_userActivityList,
  GetUsersActivityVariables
} from 'Graphql/queries/types/GetUsersActivity';
import React, { UIEvent, useState } from 'react';

import { GetRuntime } from 'Graphql/queries/types/GetRuntime';
import UserActivityItem from './UserActivityItem';
import { queryPayloadHelper } from 'Utils/formUtils';
import styles from './UserActivityList.module.scss';
import { useQuery } from '@apollo/client';

import GetUserActivityQuery from 'Graphql/queries/getUserActivity';
import GetRuntimeQuery from 'Graphql/queries/getRuntime';

const N_LIST_ITEMS_STEP = 30;
const ITEM_HEIGHT = 76;
const LIST_STEP_HEIGHT = N_LIST_ITEMS_STEP * ITEM_HEIGHT;
const SCROLL_THRESHOLD = LIST_STEP_HEIGHT * 0.8;

type Props = {
  variables: GetUsersActivityVariables;
};
function UserActivityList({ variables }: Props) {
  const [nPages, setNPages] = useState(0);

  const { loading, error, fetchMore } = useQuery<GetUsersActivity>(
    GetUserActivityQuery,
    {
      onCompleted: data => {
        setNPages(0);
        setUsersActivityData(data.userActivityList);
      },
      variables: queryPayloadHelper(variables),
      fetchPolicy: 'no-cache'
    }
  );
  const {
    data: getRuntimeData,
    loading: getRuntimeLoading,
    error: getRuntimeError
  } = useQuery<GetRuntime>(GetRuntimeQuery);

  const [usersActivityData, setUsersActivityData] = useState<
    GetUsersActivity_userActivityList[]
  >([]);

  function handleOnScroll({ currentTarget }: UIEvent<HTMLDivElement>) {
    const actualScroll = currentTarget.scrollTop + currentTarget.clientHeight;
    const scrollLimit = SCROLL_THRESHOLD + nPages * LIST_STEP_HEIGHT;

    if (actualScroll >= scrollLimit) {
      setNPages(nPages + 1);

      const lastId = usersActivityData && usersActivityData.slice(-1)[0].id;

      fetchMore<GetUsersActivity, GetUsersActivityVariables & { lastId: string }>({
        query: GetUserActivityQuery,
        variables: { ...variables, lastId },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newData = fetchMoreResult && fetchMoreResult.userActivityList;

          setUsersActivityData([...usersActivityData, ...(newData || [])]);

          return previousResult;
        }
      });
    }
  }

  if (loading || getRuntimeLoading || !getRuntimeData)
    return <SpinnerCircular />;
  if (error || getRuntimeError) return <ErrorMessage />;
  if (!usersActivityData || usersActivityData.length === 0)
    return <InfoMessage message="No activity with the specified filters" />;

  return (
    <div className={styles.elements} onScroll={handleOnScroll}>
      {usersActivityData.map(
        (userActivity: GetUsersActivity_userActivityList, idx: number) => (
          <UserActivityItem
            key={userActivity.id}
            userActivity={userActivity}
            runtimeId={getRuntimeData.runtime.id}
            idx={idx}
          />
        )
      )}
    </div>
  );
}

export default UserActivityList;
