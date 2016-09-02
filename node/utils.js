'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EthUtils = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.unlockAccount = unlockAccount;
exports.watchTransaction = watchTransaction;

var _configure = require('./configure');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
const ethUtils = new EthUtils(this.props.web3)
ethUtils.unlockAccount(this.props.account, this.state.password, 0, (result) => {
  console.log(result)
  if (!result) {
    console.log(ethUtils.getLastError())
  }
})
*/

var EthUtils = exports.EthUtils = function () {
  function EthUtils(web3) {
    _classCallCheck(this, EthUtils);

    this.web3 = web3;
  }

  _createClass(EthUtils, [{
    key: 'unlockAccount',
    value: function unlockAccount(account, password, nextLockTime, callback) {
      var _this = this;

      if (new Date().getTime() >= nextLockTime) {
        this.web3.personal.unlockAccount(account, password, _configure.ACCOUNT_UNLOCK_DURATION + 10, function (err, result) {
          if (!err && result) {
            callback(true);
          } else {
            _this.error = err;
            console.error(err);
            callback(false);
          }
        });
      } else {
        this.error = err;
        console.error(err);
        callback(true);
      }
    }
  }, {
    key: 'getLastError',
    value: function getLastError() {
      return this.error;
    }
  }]);

  return EthUtils;
}();

function unlockAccount(personal, lockedTime, account, password, callback) {
  var unlockTime = new Date().getTime();
  if (unlockTime >= lockedTime) {
    personal.unlockAccount(account, password, _configure.ACCOUNT_UNLOCK_DURATION + 10, function (err, result) {
      if (!err) {
        if (result) {
          console.log('unlocked {account: %s}', account);
          callback(true, unlockTime);
        }
      } else {
        console.error(err);
        callback(false);
      }
    });
  } else {
    callback(true);
  }
}

function watchTransaction(eth, transactionHash, callback) {
  var filter = eth.filter('latest').watch(function (err, blockHash) {
    if (!err) {
      console.log('watch block {blockHash: %s}', blockHash);
      eth.getBlock(blockHash, function (e, block) {
        for (var i in block.transactions) {
          console.log('found transaction {transactionHash: %s}', block.transactions[i]);
          if (block.transactions[i] == transactionHash) {
            filter.stopWatching();

            var transaction = eth.getTransaction(transactionHash);
            console.log(transaction);

            eth.getTransactionReceipt(transactionHash, callback);
          }
        }
      });
    } else {
      console.error(err);
      callback(err, null);
    }
  });
}