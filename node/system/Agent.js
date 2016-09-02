'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _configure = require('../configure');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Agent = function (_Component) {
  _inherits(Agent, _Component);

  function Agent() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Agent);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Agent.__proto__ || Object.getPrototypeOf(Agent)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      source: '',
      code: '',
      compiling: false,
      starting: false,
      stopping: false
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Agent, [{
    key: 'sourceFileChange',
    value: function sourceFileChange(e) {
      var _this2 = this;

      var file = e.target.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        _this2.setState({ source: reader.result });
      };
      reader.readAsText(file);
    }
  }, {
    key: 'compileClick',
    value: function compileClick() {
      var _this3 = this;

      this.setState({ compiling: true });

      var eth = this.props.web3.eth;
      eth.compile.solidity(this.state.source, function (err, compiled) {
        if (!err) {
          if (compiled) {
            console.log(compiled);
            var code = void 0;
            var abi = {};
            for (var name in compiled) {
              if (name == _configure.SYSTEM_CONTRACT_NAME) {
                code = compiled[name].code;
                abi[name] = compiled[name].info.abiDefinition;
              } else if (name == _configure.APPLICANT_CONTRACT_NAME) {
                abi[name] = compiled[name].info.abiDefinition;
              } else if (name == _configure.ORGANIZATION_CONTRACT_NAME) {
                abi[name] = compiled[name].info.abiDefinition;
              }
            }
            if (code) {
              _this3.props.onCompiled(abi);
              _this3.setState({ code: code });
            }
            _this3.setState({ compiling: false });
          }
        } else {
          console.error(err);
          _this3.setState({ compiling: false });
        }
      });
    }
  }, {
    key: 'startAgentClick',
    value: function startAgentClick() {
      var _this4 = this;

      this.setState({ starting: true });

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            (function () {
              if (unlockTime) {
                _this4.props.onAutoUnlocked(unlockTime);
              }

              var abi = JSON.parse(_this4.props.abi);

              var eth = _this4.props.web3.eth;
              var gas = eth.estimateGas({ data: _this4.state.code });
              console.log('contract new {gas: %d}', gas);

              eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).new({
                from: _this4.props.account,
                data: _this4.state.code,
                gas: gas
              }, function (err, contract) {
                if (!err) {
                  if (contract.address) {
                    console.log('contract new {transactionHash: %s}', contract.transactionHash);

                    var transaction = eth.getTransaction(contract.transactionHash);
                    console.log(transaction);
                    var receipt = eth.getTransactionReceipt(contract.transactionHash);
                    console.log(receipt);

                    console.log('contract new {agent: %s}', contract.address);

                    _this4.props.onStarted(_this4.props.abi, contract.address);
                    _this4.setState({ starting: false });
                  }
                } else {
                  console.error(err);
                  _this4.setState({ starting: false });
                }
              });
            })();
          } else {
            _this4.setState({ starting: false });
          }
        });
      } catch (err) {
        console.error(err);
        this.setState({ starting: false });
      }
    }
  }, {
    key: 'stopAgentClick',
    value: function stopAgentClick() {
      var _this5 = this;

      this.setState({ stopping: true });

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this5.props.onAutoUnlocked(unlockTime);
            }

            var abi = JSON.parse(_this5.props.abi);

            var eth = _this5.props.web3.eth;
            var instance = eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).at(_this5.props.agent);

            var gas = instance.kill.estimateGas({ from: _this5.props.account });
            console.log('kill {gas: %d}', gas);

            var transactionHash = instance.kill({ from: _this5.props.account, gas: gas });
            console.log('kill {transactionHash; %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);

                _this5.props.onStopped();
                _this5.setState({ stopping: false });
              } else {
                console.error(err);
                _this5.setState({ stopping: false });
              }
            });
          } else {
            _this5.setState({ stopping: false });
          }
        });
      } catch (err) {
        console.error(err);
        this.setState({ stopping: false });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Contract source'
          ),
          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'file', onChange: this.sourceFileChange.bind(this) })
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.Button,
            { bsStyle: 'primary', onClick: this.compileClick.bind(this),
              disabled: this.state.source.length == 0 || this.props.abi.length > 0 || this.state.compiling
            },
            this.state.compiling ? 'Compiling ...' : 'Compile contract'
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Code'
          ),
          _react2.default.createElement(
            'pre',
            null,
            this.state.code
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'ABI'
          ),
          _react2.default.createElement(
            'pre',
            null,
            this.props.abi
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ButtonToolbar,
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'info', onClick: this.startAgentClick.bind(this),
                disabled: this.props.account.length == 0 || this.props.password.length == 0 || this.props.balance.toNumber() == 0 || this.props.abi.length == 0 || this.props.agent.length > 0 || this.state.starting
              },
              this.state.starting ? 'Starting ...' : 'Start agent'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'danger', onClick: this.stopAgentClick.bind(this),
                disabled: this.props.account.length == 0 || this.props.password.length == 0 || this.props.balance.toNumber() == 0 || this.props.abi.length == 0 || this.props.agent.length == 0 || this.state.stopping
              },
              this.state.stopping ? 'Stopping ...' : 'Stop agent'
            )
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Agent address'
          ),
          _react2.default.createElement(
            'pre',
            null,
            this.props.agent
          )
        )
      );
    }
  }]);

  return Agent;
}(_react.Component);

Agent.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  account: _react.PropTypes.string.isRequired,
  password: _react.PropTypes.string.isRequired,
  lockedTime: _react.PropTypes.number.isRequired,
  balance: _react.PropTypes.object.isRequired,
  abi: _react.PropTypes.string.isRequired,
  agent: _react.PropTypes.string.isRequired,
  onCompiled: _react.PropTypes.func.isRequired,
  onStarted: _react.PropTypes.func.isRequired,
  onStopped: _react.PropTypes.func.isRequired,
  onAutoUnlocked: _react.PropTypes.func.isRequired
};
exports.default = Agent;