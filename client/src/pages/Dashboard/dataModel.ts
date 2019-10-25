type Runtime = {
  id: string;
  status: string;
  title: string;
  info: {
    type: string;
    date: string;
  }[];
  disbled?: boolean;
};

export function formatRuntime(runtime:any) {
  return <Runtime>{
    id: runtime.id,
    status: runtime.status,
    title: runtime.name,
    info: [{
      type: 'active',
      date: runtime.creationDate
    }]
  };
}
