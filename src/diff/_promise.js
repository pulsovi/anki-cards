const promise = {
  noCallBack: function noCallBack() {
    const retval = {};

    retval.promise = new Promise((resolve, reject) => {
      retval.resolve = resolve;
      retval.reject = reject;
    });

    return retval;
  },
};

module.exports = promise;
