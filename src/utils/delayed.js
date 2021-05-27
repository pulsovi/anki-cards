const DEFAULT_DELAY = 200;

function makeDelayedCallback(cb, delay = DEFAULT_DELAY) {
  let timeout = null;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => cb(...args), delay);
  };
}

module.exports = makeDelayedCallback;
