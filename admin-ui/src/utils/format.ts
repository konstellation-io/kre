import moment from 'moment-timezone';

export function formatDate(date: Date, showTime: boolean = false) {
  const format = showTime ? 'LLL' : 'LL';
  return moment(date).format(format);
}
