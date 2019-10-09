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
const RUNTIME_A = {
  id: '564645987',
  status: '',
  title: 'Electricity system prediction',
  info: [
    {
      type: 'CREATED',
      date: '07/12/2019',
    },
    {
      type: 'UPDATED',
      date: '07/18/2019',
    },
  ],
};
const RUNTIME_B = {
  id: '564645987',
  status: '',
  title: 'Electricity system prediction',
  info: [
    {
      type: 'CREATED',
      date: '07/12/2019',
    },
    {
      type: 'UPDATED',
      date: '07/18/2019',
    },
  ],
  disabled: true,
};
export const RUNTIMES = [
  RUNTIME_A,
  {
    id: '523564366',
    status: 'Discovery',
    title: 'DAS Intrusion Detection',
    info: [
      {
        type: 'CREATED',
        date: '07/12/2019',
      },
      {
        type: 'UPDATED',
        date: '07/18/2019',
      },
    ],
  },
  RUNTIME_A,
  RUNTIME_A,
  RUNTIME_A,
  RUNTIME_B,
  RUNTIME_B,
  RUNTIME_A,
  {
    id: '0969969963',
    status: 'POC',
    title: 'Electricity system prediction',
    info: [
      {
        type: 'CREATED',
        date: '07/12/2019',
      },
      {
        type: 'UPDATED',
        date: '07/18/2019',
      },
    ],
  },
  RUNTIME_A,
  RUNTIME_B,
  RUNTIME_B,
  RUNTIME_B,
];

export function addToRuntimes(newRuntime: Runtime) {
  RUNTIMES.push(newRuntime);
}
