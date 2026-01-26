const LOG_LEVELS = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

const normalizeLevel = (level) => {
  if (!level) return null;
  const normalized = String(level).toLowerCase().trim();
  return Object.prototype.hasOwnProperty.call(LOG_LEVELS, normalized) ? normalized : null;
};

const getDefaultLevel = () => {
  const env = String(process.env.NODE_ENV || 'development').toLowerCase();
  return env === 'production' ? 'info' : 'debug';
};

const getActiveLevel = () => {
  return normalizeLevel(process.env.LOG_LEVEL) || getDefaultLevel();
};

const isEnabled = (level) => {
  const activeLevel = getActiveLevel();
  const levelValue = LOG_LEVELS[normalizeLevel(level) || 'info'];
  const activeValue = LOG_LEVELS[activeLevel];
  return levelValue <= activeValue && activeValue !== LOG_LEVELS.silent;
};

const formatArgs = (scope, args) => {
  if (!scope) return args;
  if (args.length === 0) return [`[${scope}]`];

  const [first, ...rest] = args;
  if (typeof first === 'string') {
    return [`[${scope}] ${first}`, ...rest];
  }

  return [`[${scope}]`, first, ...rest];
};

export const createLogger = (scope = '') => {
  const safeScope = scope ? String(scope) : '';

  return {
    debug: (...args) => {
      if (!isEnabled('debug')) return;
      console.debug(...formatArgs(safeScope, args));
    },
    info: (...args) => {
      if (!isEnabled('info')) return;
      console.info(...formatArgs(safeScope, args));
    },
    warn: (...args) => {
      if (!isEnabled('warn')) return;
      console.warn(...formatArgs(safeScope, args));
    },
    error: (...args) => {
      if (!isEnabled('error')) return;
      console.error(...formatArgs(safeScope, args));
    },
  };
};

export const logger = createLogger();
