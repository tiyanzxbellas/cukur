'use strict';

const chalk = (() => {
  try {
    return require('chalk');
  } catch {
    return null;
  }
})();

const c = chalk || {
  cyan: (s) => s,
  green: (s) => s,
  yellow: (s) => s,
  red: (s) => s,
  magenta: (s) => s,
};

function makeSpinner(label) {
  const frames = ['|', '/', '-', '\\'];
  let index = 0;
  const timer = setInterval(() => {
    const frame = frames[index++ % frames.length];
    process.stdout.write(`\r${c.cyan('[Saurus]')} ${c.magenta(frame)} ${label}`);
  }, 90);
  return {
    stop(message, color = 'green') {
      clearInterval(timer);
      const colorFn = c[color] || ((s) => s);
      process.stdout.write(`\r${c.cyan('[Saurus]')} ${colorFn(message)}\n`);
    }
  };
}

const bootSpinner = makeSpinner('Menyalakan server...');
const app = require('./api/index');
const { server } = require('./config');

const PORT = server.port;
const HOST = server.host;

app.listen(PORT, HOST, () => {
  bootSpinner.stop(`Server running at http://168.144.134.179:${PORT}`, 'green');
});
