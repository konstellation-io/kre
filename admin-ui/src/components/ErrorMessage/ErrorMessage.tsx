import React from 'react';

export default function ErrorMessage({ refetch }: any) {
  return (
    <span>
      Something went wrong, you can try to
      <button onClick={refetch}>refetch</button>
    </span>
  );
}
