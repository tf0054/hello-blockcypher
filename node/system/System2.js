'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactBootstrap = require('react-bootstrap');

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _bignumber = require('bignumber.js');

var _bignumber2 = _interopRequireDefault(_bignumber);

var _configure = require('../configure');

var _Account = require('../Account.jsx');

var _Account2 = _interopRequireDefault(_Account);

var _Balance = require('../Balance.jsx');

var _Balance2 = _interopRequireDefault(_Balance);

var _Agent = require('./Agent.jsx');

var _Agent2 = _interopRequireDefault(_Agent);

var _Organizations = require('./Organizations.jsx');

var _Organizations2 = _interopRequireDefault(_Organizations);

var _Applicants = require('./Applicants.jsx');

var _Applicants2 = _interopRequireDefault(_Applicants);

var _Alert = require('../Alert.jsx');

var _Alert2 = _interopRequireDefault(_Alert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var System2 = function (_Component) {
  _inherits(System2, _Component);

  function System2() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, System2);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = System2.__proto__ || Object.getPrototypeOf(System2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      account: '',
      password: '',
      lockedTime: 0,
      balance: new _bignumber2.default(0),
      abi: '',
      agent: '',
      message: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(System2, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var state = {};
      var account = localStorage.getItem(_configure.SYSTEM_ACCOUNT_KEY);
      if (account) {
        state.account = account;
      }
      var abi = localStorage.getItem(_configure.AGENT_ABI_KEY);
      if (abi) {
        state.abi = abi;
      }
      var agent = localStorage.getItem(_configure.SYSTEM_AGENT_ADDRESS_KEY);
      if (agent) {
        state.agent = agent;
        var eth = this.props.web3.eth;
        state.code = eth.getCode(agent);
      }
      this.setState(state);
    }
  }, {
    key: 'accountCreated',
    value: function accountCreated(account, password, unlockTime) {
      var balance = this.props.web3.eth.getBalance(account);
      this.setState({
        account: account, password: password, lockedTime: unlockTime + _configure.ACCOUNT_UNLOCK_DURATION * 1000, balance: balance
      });

      localStorage.setItem(_configure.SYSTEM_ACCOUNT_KEY, account);
    }
  }, {
    key: 'accountUnlocked',
    value: function accountUnlocked(password, unlockTime) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ password: password, lockedTime: unlockTime + _configure.ACCOUNT_UNLOCK_DURATION * 1000, balance: balance });
    }
  }, {
    key: 'transferred',
    value: function transferred(account) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ balance: balance });
    }
  }, {
    key: 'accountAutoUnlocked',
    value: function accountAutoUnlocked(unlockTime) {
      this.setState({ lockedTime: unlockTime + _configure.ACCOUNT_UNLOCK_DURATION * 1000 });
    }
  }, {
    key: 'agentCompiled',
    value: function agentCompiled(abi) {
      this.setState({ abi: JSON.stringify(abi) });
    }
  }, {
    key: 'agentStarted',
    value: function agentStarted(abi, agent) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ agent: agent, balance: balance });

      localStorage.setItem(_configure.AGENT_ABI_KEY, abi);
      localStorage.setItem(_configure.SYSTEM_AGENT_ADDRESS_KEY, agent);
    }
  }, {
    key: 'agentStopped',
    value: function agentStopped() {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ abi: '', agent: '', balance: balance });

      localStorage.removeItem(_configure.AGENT_ABI_KEY);
      localStorage.removeItem(_configure.SYSTEM_AGENT_ADDRESS_KEY);
    }
  }, {
    key: 'organizationAgentStopped',
    value: function organizationAgentStopped(agent) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ balance: balance });

      var removeKey = void 0;
      for (var key in localStorage) {
        if (key.indexOf(_configure.ORGANIZATION_AGENT_ADDRESS_KEY) == 0) {
          if (localStorage[key] == agent) {
            localStorage.removeItem(key);
            removeKey = key;
          }
        }
      }
      if (removeKey) {
        var device = removeKey.substring(removeKey.lastIndexOf('.') + 1);
        for (var _key2 in localStorage) {
          if (_key2.indexOf(_configure.ORGANIZATION_APPROVAL_RECV_HASHES + device) == 0 || _key2 == _configure.ORGANIZATION_APPROVALS_KEY + device || _key2.indexOf(_configure.ORGANIZATION_PERMISSIONS_KEY + device) == 0 || _key2 == _configure.ORGANIZATION_PERMISSION_RECV_HASHES + device) {
            localStorage.removeItem(_key2);
          }
        }
      }
    }
  }, {
    key: 'initializeStorage',
    value: function initializeStorage() {
      for (var key in localStorage) {
        if (key.indexOf(_configure.STORAGE_KEY_PREFIX) == 0) {
          localStorage.removeItem(key);
        }
      }
      this.setState({ message: null });
    }
  }, {
    key: 'initializeStorageClick',
    value: function initializeStorageClick() {
      this.setState({ message: 'ストレージを初期化してもよろしいですか？' });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h3',
          null,
          '  ',
          _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'tasks' }),
          ' System'
        ),
        _react2.default.createElement('hr', null),
        _react2.default.createElement(
          _reactBootstrap.Grid,
          null,
          _react2.default.createElement(
            _reactBootstrap.Row,
            null,
            _react2.default.createElement(
              _reactBootstrap.Col,
              { md: 4 },
              _react2.default.createElement(
                _reactBootstrap.Panel,
                null,
                _react2.default.createElement(
                  'h4',
                  null,
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'cog' }),
                  ' Account setting'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Account2.default, { web3: this.props.web3, account: this.state.account, password: this.state.password,
                  onCreated: this.accountCreated.bind(this), onUnlocked: this.accountUnlocked.bind(this),
                  onTransferred: this.transferred.bind(this) }),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Balance2.default, { web3: this.props.web3, balance: this.state.balance }),
                _react2.default.createElement('br', null),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                  'h4',
                  null,
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'play' }),
                  ' Agent management'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Agent2.default, { web3: this.props.web3, account: this.state.account, password: this.state.password,
                  lockedTime: this.state.lockedTime, balance: this.state.balance, abi: this.state.abi,
                  agent: this.state.agent, onCompiled: this.agentCompiled.bind(this), onStarted: this.agentStarted.bind(this),
                  onStopped: this.agentStopped.bind(this), onAutoUnlocked: this.accountAutoUnlocked.bind(this) }),
                _react2.default.createElement('br', null),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                  'h4',
                  null,
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'trash' }),
                  ' Initialize'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  { bsStyle: 'danger', onClick: this.initializeStorageClick.bind(this) },
                  'Initialize storage'
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              { md: 8 },
              _react2.default.createElement(
                _reactBootstrap.Panel,
                null,
                _react2.default.createElement(
                  'h4',
                  null,
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'home' }),
                  ' Company / School Agents'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Organizations2.default, { web3: this.props.web3, account: this.state.account, password: this.state.password,
                  lockedTime: this.state.lockedTime, balance: this.state.balance, abi: this.state.abi,
                  agent: this.state.agent, onStopped: this.organizationAgentStopped.bind(this),
                  onAutoUnlocked: this.accountAutoUnlocked.bind(this) })
              )
            )
          )
        ),
        _react2.default.createElement(_Alert2.default, { message: this.state.message, onYes: this.initializeStorage.bind(this),
          onHide: function onHide() {
            return _this2.setState({ message: null });
          } })
      );
    }
  }]);

  return System2;
}(_react.Component);

System2.propTypes = {
  web3: _react.PropTypes.object.isRequired
};
exports.default = System2;