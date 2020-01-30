export default (func, wait = 50) => {
  let last;
  let deferTimer;

  const throttled = (...args) => {
    const now = Date.now();

    if (last && now < last + wait) {
      clearTimeout(deferTimer);

      deferTimer = setTimeout(() => {
        last = now;
        func(...args);
      }, wait);
    } else {
      last = now;
      func(...args);
    }
  };

  return throttled;
};
