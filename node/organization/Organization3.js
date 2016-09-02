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

var _Organization2 = require('./Organization.jsx');

var _Organization3 = _interopRequireDefault(_Organization2);

var _Account = require('../Account.jsx');

var _Account2 = _interopRequireDefault(_Account);

var _Balance = require('../Balance.jsx');

var _Balance2 = _interopRequireDefault(_Balance);

var _Profile = require('./Profile2.jsx');

var _Profile2 = _interopRequireDefault(_Profile);

var _Agent = require('./Agent2.jsx');

var _Agent2 = _interopRequireDefault(_Agent);

var _Approvals = require('./Approvals3.jsx');

var _Approvals2 = _interopRequireDefault(_Approvals);

var _Permissions = require('./Permissions3.jsx');

var _Permissions2 = _interopRequireDefault(_Permissions);

var _configure = require('../configure');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Organization3 = function (_Organization) {
  _inherits(Organization3, _Organization);

  function Organization3() {
    _classCallCheck(this, Organization3);

    return _possibleConstructorReturn(this, (Organization3.__proto__ || Object.getPrototypeOf(Organization3)).apply(this, arguments));
  }

  _createClass(Organization3, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h3',
          null,
          '  ',
          _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'home' }),
          ' Company / School'
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
                _react2.default.createElement(_Profile2.default, { web3: this.props.web3, profile: this.state.profile, onSave: this.saveProfile.bind(this) }),
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
                  lockedTime: this.state.lockedTime, balance: this.state.balance, profile: this.state.profile,
                  abi: this.state.abi, systemAgent: this.state.systemAgent, agent: this.state.agent,
                  onStarted: this.agentStarted.bind(this), onAutoUnlocked: this.accountAutoUnlocked.bind(this) })
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
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'check' }),
                  ' Applied list'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Approvals2.default, { web3: this.props.web3, device: this.props.device, account: this.state.account,
                  password: this.state.password, lockedTime: this.state.lockedTime, balance: this.state.balance,
                  profile: this.state.profile, abi: this.state.abi, systemAgent: this.state.systemAgent,
                  agent: this.state.agent, topicName: _configure.APPROVAL_TOPIC2_NAME, onApproved: this.approved.bind(this),
                  onAutoUnlocked: this.accountAutoUnlocked.bind(this) }),
                _react2.default.createElement('br', null),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                  'h4',
                  null,
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'eye-open' }),
                  ' Published resume'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Permissions2.default, { web3: this.props.web3, device: this.props.device, profile: this.state.profile,
                  abi: this.state.abi, topicName: _configure.PERMISSION_TOPIC2_NAME })
              )
            )
          )
        )
      );
    }
  }]);

  return Organization3;
}(_Organization3.default);

exports.default = Organization3;