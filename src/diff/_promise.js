promise = {
  noCallBack : function noCallBack (){
    var Rpromise, Rresolve, Rreject;
    Rpromise = new Promise(function(resolve, reject){
      Rresolve = resolve;
      Rreject = reject;
    });
    return {
      promise: Rpromise,
      resolve: Rresolve,
      reject: Rreject
    };
  }
};

module.exports = promise;
