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

var _configure = require('../configure.js');

var _Profile = require('./Profile2.jsx');

var _Profile2 = _interopRequireDefault(_Profile);

var _Resumes = require('./Resumes2.jsx');

var _Resumes2 = _interopRequireDefault(_Resumes);

var _Permissions = require('./Permissions2.jsx');

var _Permissions2 = _interopRequireDefault(_Permissions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Applicant2 = function (_Component) {
  _inherits(Applicant2, _Component);

  function Applicant2() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Applicant2);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Applicant2.__proto__ || Object.getPrototypeOf(Applicant2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      profile: null,
      resumes: [],
      abi: '',
      systemAgent: ''
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Applicant2, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var state = {};
      var profile = localStorage.getItem(_configure.APPLICANT_PROFILE_KEY + this.props.device);
      if (profile) {
        state.profile = JSON.parse(profile);
      }
      var resumes = localStorage.getItem(_configure.APPLICANT_RESUMES_KEY + this.props.device);
      if (resumes) {
        state.resumes = JSON.parse(resumes);
      }
      var abi = localStorage.getItem(_configure.AGENT_ABI_KEY);
      if (abi) {
        state.abi = abi;
      }
      var systemAgent = localStorage.getItem(_configure.SYSTEM_AGENT_ADDRESS_KEY);
      if (systemAgent) {
        state.systemAgent = systemAgent;
      }
      this.setState(state);
    }
  }, {
    key: 'saveProfile',
    value: function saveProfile(profile) {
      this.setState({ profile: profile });
      localStorage.setItem(_configure.APPLICANT_PROFILE_KEY + this.props.device, JSON.stringify(profile));
    }
  }, {
    key: 'approvalRequested',
    value: function approvalRequested(resume) {
      this.state.resumes.push(resume);
      this.setState({ resumes: this.state.resumes });
      localStorage.setItem(_configure.APPLICANT_RESUMES_KEY + this.props.device, JSON.stringify(this.state.resumes));
    }
  }, {
    key: 'approvalAccepted',
    value: function approvalAccepted(response) {
      for (var i in this.state.resumes) {
        var resume = this.state.resumes[i];
        if (resume.id == response.id) {
          resume.acceptTime = response.acceptTime;
          break;
        }
      }
      this.setState({ resumes: this.state.resumes });
      localStorage.setItem(_configure.APPLICANT_RESUMES_KEY + this.props.device, JSON.stringify(this.state.resumes));
    }
  }, {
    key: 'approvalResponded',
    value: function approvalResponded(response) {
      for (var i in this.state.resumes) {
        var resume = this.state.resumes[i];
        if (resume.id == response.id) {
          resume.approveResult = response.approveResult;
          resume.approveTime = response.approveTime;
          if (response.signature) {
            resume.signature = response.signature;
          }
          break;
        }
      }
      this.setState({ resumes: this.state.resumes });
      localStorage.setItem(_configure.APPLICANT_RESUMES_KEY + this.props.device, JSON.stringify(this.state.resumes));
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
                _react2.default.createElement(_Profile2.default, { web3: this.props.web3, profile: this.state.profile, onSave: this.saveProfile.bind(this) }),
                _react2.default.createElement('br', null),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(
                  'h4',
                  null,
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'play' }),
                  ' System agent information'
                ),
                _react2.default.createElement('hr', null),
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
                    this.state.abi
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
                    this.state.systemAgent
                  )
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
                  _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'pencil' }),
                  ' Resume'
                ),
                _react2.default.createElement('hr', null),
                _react2.default.createElement(_Resumes2.default, { web3: this.props.web3, device: this.props.device, profile: this.state.profile,
                  resumes: this.state.resumes, abi: this.state.abi, systemAgent: this.state.systemAgent,
                  topicName: this.props.aTopicName, onApprovalRequested: this.approvalRequested.bind(this),
                  onApprovalAccepted: this.approvalAccepted.bind(this), onApprovalResponded: this.approvalResponded.bind(this) }),
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
                _react2.default.createElement(_Permissions2.default, { web3: this.props.web3, device: this.props.device, profile: this.state.profile,
                  resumes: this.state.resumes, abi: this.state.abi, systemAgent: this.state.systemAgent,
                  topicName: this.props.pTopicName })
              )
            )
          )
        )
      );
    }
  }]);

  return Applicant2;
}(_react.Component);

Applicant2.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  device: _react.PropTypes.string,
  aTopicName: _react.PropTypes.string.isRequired,
  pTopicName: _react.PropTypes.string.isRequired
};
Applicant2.defaultProps = {
  device: '0'
};
exports.default = Applicant2;