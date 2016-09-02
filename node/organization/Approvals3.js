'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _utils = require('../utils');

var _Approvals2 = require('./Approvals2.jsx');

var _Approvals3 = _interopRequireDefault(_Approvals2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Approvals3 = function (_Approvals) {
  _inherits(Approvals3, _Approvals);

  function Approvals3() {
    _classCallCheck(this, Approvals3);

    return _possibleConstructorReturn(this, (Approvals3.__proto__ || Object.getPrototypeOf(Approvals3)).apply(this, arguments));
  }

  _createClass(Approvals3, [{
    key: 'postApprovalResponse',
    value: function postApprovalResponse(approval, callback) {
      console.log('post approval response {id: %s, result: %s}', approval.resume.id, approval.resume.approveResult);
      var payload = {
        id: approval.resume.id, approveResult: approval.resume.approveResult, approveTime: approval.resume.approveTime,
        signature: approval.resume.signature
      };
      this.postResponse(this.props.profile.identity, approval.profile.identity, payload, callback);
    }
  }, {
    key: 'approveClick',
    value: function approveClick(index, approveResult) {
      var _this2 = this;

      this.state.approving[index] = true;
      this.setState({ approving: this.state.approving });

      var approval = this.state.approvals[index];

      var web3 = this.props.web3;

      var hash = web3.sha3(approval.profile.identity + approval.resume.id);

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this2.props.onAutoUnlocked(unlockTime);
            }

            approval.resume.approveResult = approveResult;
            approval.resume.approveTime = (0, _moment2.default)().unix();
            approval.resume.signature = web3.eth.sign(_this2.props.account, hash);

            _this2.postApprovalResponse(approval, function (err, result) {
              if (!err) {
                delete _this2.state.approving[index];
                _this2.setState({ approving: _this2.state.approving, approvals: _this2.state.approvals });
              } else {
                delete _this2.state.approving[index];
                _this2.setState({ approving: _this2.state.approving });
              }
            });
          } else {
            console.error(err);
            delete _this2.state.approving[index];
            _this2.setState({ approving: _this2.state.approving });
          }
        });
      } catch (err) {
        console.error(err);
        delete this.state.approving[approval.applicantAgent + approval.from];
        this.setState({ approving: this.state.approving });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var rows = [];
      for (var i in this.state.approvals) {
        var approval = this.state.approvals[i];

        rows.push(_react2.default.createElement(
          'tr',
          { key: i },
          _react2.default.createElement(
            'td',
            null,
            'Name: ',
            approval.profile.name,
            _react2.default.createElement('br', null),
            'Birthday: ',
            approval.profile.birthday
          ),
          _react2.default.createElement(
            'td',
            null,
            this.formatMonth(approval.resume.from)
          ),
          _react2.default.createElement(
            'td',
            null,
            this.formatMonth(approval.resume.to)
          ),
          _react2.default.createElement(
            'td',
            null,
            approval.resume.approveTime > 0 ? approval.resume.approveResult ? _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'primary' },
                'Approved'
              ),
              ' ',
              this.formatTime(approval.resume.approveTime)
            ) : _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'danger' },
                'Disapproved'
              ),
              ' ',
              this.formatTime(approval.resume.approveTime)
            ) : approval.resume.acceptTime > 0 ? _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'info', bsSize: 'small', onClick: this.approveClick.bind(this, i, true),
                  disabled: this.props.password.length == 0 || this.state.approving[i],
                  style: { width: 100 } },
                'Approve'
              ),
              ' ',
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'danger', bsSize: 'small', onClick: this.approveClick.bind(this, i, false),
                  disabled: this.props.password.length == 0 || this.state.approving[i] },
                'Disapprove'
              ),
              _react2.default.createElement('br', null),
              ' ',
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'warning' },
                'Accepted'
              ),
              ' ',
              this.formatTime(approval.resume.acceptTime)
            ) : _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: 'default' },
              'Accepting'
            )
          )
        ));
      }

      return _react2.default.createElement(
        _reactBootstrap.Table,
        { striped: true, bordered: true, condensed: true, hover: true },
        _react2.default.createElement(
          'thead',
          null,
          _react2.default.createElement(
            'tr',
            null,
            _react2.default.createElement(
              'th',
              null,
              'Job applicant'
            ),
            _react2.default.createElement(
              'th',
              null,
              'From'
            ),
            _react2.default.createElement(
              'th',
              null,
              'To'
            ),
            _react2.default.createElement('th', null)
          )
        ),
        _react2.default.createElement(
          'tbody',
          null,
          rows
        )
      );
    }
  }]);

  return Approvals3;
}(_Approvals3.default);

Approvals3.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  device: _react.PropTypes.string,
  account: _react.PropTypes.string.isRequired,
  password: _react.PropTypes.string.isRequired,
  lockedTime: _react.PropTypes.number.isRequired,
  profile: _react.PropTypes.shape({
    identity: _react2.default.PropTypes.string,
    name: _react2.default.PropTypes.string,
    createTime: _react2.default.PropTypes.number,
    updateTime: _react2.default.PropTypes.number
  }),
  abi: _react.PropTypes.string.isRequired,
  topicName: _react.PropTypes.string.isRequired,
  onAutoUnlocked: _react.PropTypes.func.isRequired
};
exports.default = Approvals3;