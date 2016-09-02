'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _configure = require('./configure');

var _utils = require('./utils');

var _Alert = require('./Alert.jsx');

var _Alert2 = _interopRequireDefault(_Alert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Account = function (_Component) {
  _inherits(Account, _Component);

  function Account() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Account);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Account.__proto__ || Object.getPrototypeOf(Account)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      password: '',
      message: '',
      creating: false,
      unlocking: false
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Account, [{
    key: 'passwordChange',
    value: function passwordChange(e) {
      this.setState({ password: e.target.value });
    }
  }, {
    key: 'transfer',
    value: function transfer(account) {
      var _this2 = this;

      var web3 = this.props.web3;
      var eth = web3.eth;

      if (account != eth.coinbase) {
        var balance = eth.getBalance(account);
        var wei = web3.toWei(_configure.TRANSFER_ETHER, 'ether');
        console.log('coinbase balance: %s', eth.getBalance(eth.coinbase).toString(10));
        console.log('balance: %s', balance.toString(10));
        if (balance.lt(wei * _configure.MIN_ETHER_RATE)) {
          try {
            var transactionHash = eth.sendTransaction({ from: eth.coinbase, to: account, value: wei });
            console.log('transfer　{transactionHash: %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                _this2.props.onTransferred(account);
              } else {
                console.error(err);
              }
            });
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  }, {
    key: 'createAccountClick',
    value: function createAccountClick() {
      var _this3 = this;

      this.setState({ creating: true });

      var personal = this.props.web3.personal;
      try {
        personal.newAccount(this.state.password, function (err, account) {
          if (!err && account) {
            (function () {
              var unlockTime = new Date().getTime();
              personal.unlockAccount(account, _this3.state.password, _configure.ACCOUNT_UNLOCK_DURATION + 10, function (err, result) {
                if (!err) {
                  if (result) {
                    _this3.transfer(account);
                    _this3.props.onCreated(account, _this3.state.password, unlockTime);
                    _this3.setState({ creating: false, account: account });
                  }
                }
              });
            })();
          } else {
            console.error(err);
            _this3.setState({ creating: false, message: err.message });
          }
        });
      } catch (err) {
        console.error(err);
        this.setState({ creating: false });
      }
    }
  }, {
    key: 'unlockClick',
    value: function unlockClick() {
      var _this4 = this;

      this.setState({ unlocking: true });

      var personal = this.props.web3.personal;
      try {
        (function () {
          var unlockTime = new Date().getTime();
          personal.unlockAccount(_this4.props.account, _this4.state.password, _configure.ACCOUNT_UNLOCK_DURATION + 10, function (err, result) {
            if (!err) {
              if (result) {
                _this4.transfer(_this4.props.account);
                _this4.props.onUnlocked(_this4.state.password, unlockTime);
                _this4.setState({ unlocking: false });
              }
            } else {
              console.error(err);
              _this4.setState({ unlocking: false, message: err.message });
            }
          });
        })();
      } catch (err) {
        console.error(err);
        this.setState({ unlocking: false, message: err.message });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this5 = this;

      if (this.props.account.length > 0) {
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Account'
            ),
            _react2.default.createElement(
              'pre',
              null,
              this.props.account
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Password'
            ),
            _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', value: this.state.password, onChange: this.passwordChange.bind(this) })
          ),
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            this.props.password.length == 0 ? _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'success', onClick: this.unlockClick.bind(this), disabled: this.state.password.length == 0 || this.state.unlocking },
              this.state.unlocking ? 'Unlocking ...' : 'Unlock'
            ) : _react2.default.createElement(
              'h4',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'primary' },
                'Unlocked'
              )
            )
          ),
          _react2.default.createElement(_Alert2.default, { message: this.state.message, onHide: function onHide() {
              return _this5.setState({ message: null });
            } })
        );
      } else {
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.ControlLabel,
              null,
              'Password'
            ),
            _react2.default.createElement(_reactBootstrap.FormControl, { type: 'password', value: this.state.password, onChange: this.passwordChange.bind(this) })
          ),
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'success', onClick: this.createAccountClick.bind(this),
                disabled: this.state.password.length == 0 || this.state.creating
              },
              this.state.creating ? 'Creating ...' : 'Create account'
            )
          )
        );
      }
    }
  }]);

  return Account;
}(_react.Component);

Account.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  account: _react.PropTypes.string.isRequired,
  password: _react.PropTypes.string.isRequired,
  onCreated: _react.PropTypes.func.isRequired,
  onUnlocked: _react.PropTypes.func.isRequired,
  onTransferred: _react.PropTypes.func.isRequired
};
exports.default = Account;