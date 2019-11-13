const formatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric'
};
const formatOptionsWithMinutes = {
  ...formatOptions,
  hour: '2-digit',
  minute: '2-digit'
};
export function formatDate(date: Date, showTime: boolean = false) {
  const options = showTime ? formatOptionsWithMinutes : formatOptions;
  return date.toLocaleString('en-us', options);
}
