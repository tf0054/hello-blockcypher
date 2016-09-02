'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

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

var _Profile = require('./Profile.jsx');

var _Profile2 = _interopRequireDefault(_Profile);

var _Agent = require('./Agent.jsx');

var _Agent2 = _interopRequireDefault(_Agent);

var _Resumes = require('./Resumes.jsx');

var _Resumes2 = _interopRequireDefault(_Resumes);

var _Permissions = require('./Permissions.jsx');

var _Permissions2 = _interopRequireDefault(_Permissions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Applicant = function (_Component) {
  _inherits(Applicant, _Component);

  function Applicant() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Applicant);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Applicant.__proto__ || Object.getPrototypeOf(Applicant)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      account: '',
      password: '',
      lockedTime: 0,
      balance: new _bignumber2.default(0),
      profile: null,
      abi: '',
      systemAgent: '',
      agent: ''
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Applicant, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var state = {};
      var account = localStorage.getItem(_configure.APPLICANT_ACCOUNT_KEY + this.props.device);
      if (account) {
        state.account = account;
      }
      var profile = localStorage.getItem(_configure.APPLICANT_PROFILE_KEY + this.props.device);
      if (profile) {
        state.profile = JSON.parse(profile);
      }
      var abi = localStorage.getItem(_configure.AGENT_ABI_KEY);
      if (abi) {
        state.abi = abi;
      }
      var systemAgent = localStorage.getItem(_configure.SYSTEM_AGENT_ADDRESS_KEY);
      if (systemAgent) {
        state.systemAgent = systemAgent;
      }
      var agent = localStorage.getItem(_configure.APPLICANT_AGENT_ADDRESS_KEY + this.props.device);
      if (agent) {
        state.agent = agent;
      }
      this.setState(state);
    }
  }, {
    key: 'accountCreated',
    value: function accountCreated(account, password, unlockTime) {
      var balance = this.props.web3.eth.getBalance(account);
      this.setState({
        account: account, password: password, lockedTime: unlockTime + _configure.ACCOUNT_UNLOCK_DURATION * 1000,
        balance: balance
      });

      localStorage.setItem(_configure.APPLICANT_ACCOUNT_KEY + this.props.device, account);
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
    key: 'saveProfile',
    value: function saveProfile(profile) {
      this.setState({ profile: profile });

      localStorage.setItem(_configure.APPLICANT_PROFILE_KEY + this.props.device, JSON.stringify(profile));
    }
  }, {
    key: 'agentStarted',
    value: function agentStarted(agent) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ agent: agent, balance: balance });

      localStorage.setItem(_configure.APPLICANT_AGENT_ADDRESS_KEY + this.props.device, agent);
    }
  }, {
    key: 'approveApply',
    value: function approveApply(resume) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ balance: balance });
    }
  }, {
    key: 'removeApproveContact',
    value: function removeApproveContact(resume) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ balance: balance });
    }
  }, {
    key: 'publish',
    value: function publish(permission) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ balance: balance });
    }
  }, {
    key: 'removePublishContact',
    value: function removePublishContact(permission) {
      var balance = this.props.web3.eth.getBalance(this.state.account);
      this.setState({ balance: balance });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h3',
          null,
          '  ',
          _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'user' }),
          ' Job applicant'
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
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Profile2.default, { profile: this.state.profile, onSave: this.saveProfile.bind(this) }),
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
                  systemAgent: this.state.systemAgent, agent: this.state.agent, onStarted: this.agentStarted.bind(this),
                  onAutoUnlocked: this.accountAutoUnlocked.bind(this) })
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
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'pencil' }),
                  ' Resume'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Resumes2.default, { web3: this.props.web3, account: this.state.account, password: this.state.password,
                  lockedTime: this.state.lockedTime, balance: this.state.balance, profile: this.state.profile,
                  abi: this.state.abi, systemAgent: this.state.systemAgent, agent: this.state.agent,
                  onApproveApply: this.approveApply.bind(this), onRemoveApproveContact: this.removeApproveContact.bind(this),
                  onAutoUnlocked: this.accountAutoUnlocked.bind(this) }),
                _react2.default.createElement('br', null),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                  'h4',
                  null,
                  '  ',
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'bullhorn' }),
                  ' Publish'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Permissions2.default, { web3: this.props.web3, account: this.state.account, password: this.state.password,
                  lockedTime: this.state.lockedTime, balance: this.state.balance, profile: this.state.profile,
                  abi: this.state.abi, systemAgent: this.state.systemAgent, agent: this.state.agent,
                  onPublish: this.publish.bind(this), onRemovePublishContact: this.removePublishContact.bind(this),
                  onAutoUnlocked: this.accountAutoUnlocked.bind(this) })
              )
            )
          )
        )
      );
    }
  }]);

  return Applicant;
}(_react.Component);

Applicant.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  device: _react.PropTypes.string
};
Applicant.defaultProps = {
  device: '0'
};
exports.default = Applicant;