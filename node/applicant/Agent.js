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
      starting: false
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Agent, [{
    key: 'startAgentClick',
    value: function startAgentClick() {
      var _this2 = this;

      this.setState({ starting: true });

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            (function () {
              if (unlockTime) {
                _this2.props.onAutoUnlocked(unlockTime);
              }

              var abi = JSON.parse(_this2.props.abi);

              var eth = _this2.props.web3.eth;
              var instance = eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).at(_this2.props.systemAgent);

              var gas = instance.addApplicant.estimateGas({ from: _this2.props.account });
              console.log('addApplicant {gas: %d}', gas);

              var transactionHash = instance.addApplicant({ from: _this2.props.account, gas: gas });
              console.log('addApplicant {transactionHash: %s}', transactionHash);

              (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
                if (!err) {
                  console.log(receipt);

                  var agent = instance.getApplicantAgent({ from: _this2.props.account });
                  console.log('addApplicant {agent: %s}', agent);

                  _this2.props.onStarted(agent);
                  _this2.setState({ starting: false });
                } else {
                  console.error(err);
                  _this2.setState({ starting: false });
                }
              });
            })();
          } else {
            console.error(err);
            _this2.setState({ starting: false });
          }
        });
      } catch (err) {
        console.error(err);
        this.setState({ starting: false });
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
            _reactBootstrap.ControlLabel,
            null,
            'System agent address'
          ),
          _react2.default.createElement(
            'pre',
            null,
            this.props.systemAgent
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
                disabled: this.props.account.length == 0 || this.props.password.length == 0 || this.props.balance.toNumber() == 0 || this.props.abi.length == 0 || this.props.systemAgent.length == 0 || this.props.agent.length > 0 || this.state.starting
              },
              this.state.starting ? 'Starting ...' : 'Start agent'
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
  systemAgent: _react.PropTypes.string.isRequired,
  agent: _react.PropTypes.string.isRequired,
  onStarted: _react.PropTypes.func.isRequired
};
exports.default = Agent;