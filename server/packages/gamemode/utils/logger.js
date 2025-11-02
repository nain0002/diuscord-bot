const formatDate = () => new Date().toISOString();

const log = (level, message, data) => {
  const base = `[${formatDate()}] [${level.toUpperCase()}] ${message}`;
  if (data) {
    // eslint-disable-next-line no-console
    console.log(base, data);
  } else {
    // eslint-disable-next-line no-console
    console.log(base);
  }
};

module.exports = {
  info: (message, data) => log('info', message, data),
  warn: (message, data) => log('warn', message, data),
  error: (message, data) => log('error', message, data)
};
