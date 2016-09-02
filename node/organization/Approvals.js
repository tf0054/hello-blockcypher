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

var _configure = require('../configure');

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Approvals = function (_Component) {
  _inherits(Approvals, _Component);

  function Approvals() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Approvals);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Approvals.__proto__ || Object.getPrototypeOf(Approvals)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      approvals: [],
      approving: {}
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Approvals, [{
    key: 'loadApprovals',
    value: function loadApprovals(props) {
      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(props.agent);

      var size = instance.sizeApprovals({ from: props.account }).toNumber();
      var approvals = [];
      for (var i = 0; i < size; i++) {
        var approval = instance.getApproval(i, { from: props.account });
        var from = approval[1].toNumber();
        var acceptTime = approval[3].toNumber();
        var approveTime = approval[5].toNumber();

        var profile = null;
        var identity = '';
        if (acceptTime > 0 && approveTime == 0) {
          profile = localStorage.getItem(this.props.profileKey + approval[0] + from);
          if (profile) {
            profile = JSON.parse(profile);
          } else {
            identity = instance.getApproveContact(approval[0], from, { from: props.account });
          }
        }

        approvals.push({
          applicantAgent: approval[0], from: from, to: approval[2].toNumber(), acceptTime: acceptTime,
          approveResult: approval[4], approveTime: approveTime, profile: profile, identity: identity
        });
      }
      return approvals;
    }
  }, {
    key: 'watchTopic',
    value: function watchTopic(props, approval) {
      var _this2 = this;

      console.log('watch topic');

      var web3 = this.props.web3;
      var shh = web3.shh;
      var filter = shh.filter({ topics: [web3.fromAscii(_configure.TOPIC_NAME)], to: approval.identity });
      filter.watch(function (err, result) {
        filter.stopWatching();
        if (!err) {
          var json = web3.toAscii(result.payload);
          var profile = JSON.parse(json);
          console.log('recv {profile: %s}', json);

          localStorage.setItem(_this2.props.profileKey + approval.applicantAgent + approval.from, json);

          var approvals = _this2.loadApprovals(props);
          if (approvals) {
            _this2.setState({ approvals: approvals });
          }
        } else {
          console.error(err);
        }
      });
    }
  }, {
    key: 'approveAccept',
    value: function approveAccept(props, approval) {
      var _this3 = this;

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, props.lockedTime, props.account, props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this3.props.onAutoUnlocked(unlockTime);
            }

            var abi = JSON.parse(props.abi);

            var web3 = _this3.props.web3;
            var eth = web3.eth;
            var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(props.agent);

            var shh = web3.shh;
            var identity = shh.newIdentity();
            console.log('approveAccept {identity: %s}', identity);

            var gas1 = instance.approveAccept.estimateGas(approval.applicantAgent, approval.from, identity, { from: props.account });

            var instance2 = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(approval.applicantAgent);
            var gas2 = instance2.approveAccept.estimateGas(approval.from, identity, { from: props.agent });

            var gas = gas1 + gas2;
            console.log('approveAccept {gas: %d}', gas);

            var transactionHash = instance.approveAccept(approval.applicantAgent, approval.from, identity, { from: props.account, gas: gas });
            console.log('approveAccept {transactionHash: %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);
                _this3.props.onApproveAccept(approval);
              } else {
                console.error(err);
              }
            });

            approval.identity = identity;
            _this3.watchTopic(props, approval);
          } else {
            console.error(err);
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, {
    key: 'watchApply',
    value: function watchApply(props) {
      var _this4 = this;

      console.log('watch ApproveApply');

      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(props.agent);

      instance.ApproveApply().watch(function (err, event) {
        if (!err) {
          console.log('ApproveApply event {sender: %s}', event.args.sender);

          var approvals = _this4.loadApprovals(props);
          if (approvals) {
            _this4.setState({ approvals: approvals });

            for (var i in approvals) {
              if (approvals[i].acceptTime == 0) {
                _this4.approveAccept(props, approvals[i]);
              } else if (approvals[i].approveTime == 0 && !approvals[i].profile) {
                _this4.watchTopic(props, approvals[i]);
              }
            }
          }
        } else {
          console.error(err);
        }
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this.loaded && nextProps.account.length > 0 && nextProps.abi.length > 0 && nextProps.agent.length > 0) {
        var approvals = this.loadApprovals(nextProps);
        if (approvals) {
          this.setState({ approvals: approvals });
        }

        this.loaded = true;
      }

      if (!this.preprocessed && nextProps.account.length > 0 && nextProps.password.length > 0 && nextProps.balance.toNumber() > 0 && nextProps.abi.length > 0 && nextProps.agent.length > 0) {
        for (var i in this.state.approvals) {
          var approval = this.state.approvals[i];
          if (approval.acceptTime == 0) {
            this.approveAccept(nextProps, approval);
          } else if (approval.approveTime == 0) {
            if (!approval.profile) {
              this.watchTopic(nextProps, approval);
            }
          }
        }

        this.watchApply(nextProps);

        this.preprocessed = true;
      }
    }
  }, {
    key: 'approveClick',
    value: function approveClick(approval, approveResult) {
      var _this5 = this;

      this.state.approving[approval.applicantAgent + approval.from] = true;
      this.setState({ approving: this.state.approving });

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this5.props.onAutoUnlocked(unlockTime);
            }

            var abi = JSON.parse(_this5.props.abi);

            var web3 = _this5.props.web3;
            var eth = web3.eth;
            var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(_this5.props.agent);

            var gas1 = instance.approveResponse.estimateGas(approval.applicantAgent, approval.from, approveResult, { from: _this5.props.account });

            var instance2 = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(approval.applicantAgent);
            var gas2 = instance2.approveResponse.estimateGas(approval.from, approveResult, { from: _this5.props.agent });

            var gas = gas1 + gas2;
            console.log('approveResponse {gas: %d}', gas);

            var transactionHash = instance.approveResponse(approval.applicantAgent, approval.from, approveResult, { from: _this5.props.account, gas: gas });
            console.log('approveResponse {transactionHash: %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);

                var approvals = _this5.loadApprovals(_this5.props);
                if (approvals) {
                  delete _this5.state.approving[approval.applicantAgent + approval.from];
                  _this5.setState({ approving: _this5.state.approving, approvals: approvals });
                } else {
                  delete _this5.state.approving[approval.applicantAgent + approval.from];
                  _this5.setState({ approving: _this5.state.approving });
                }

                localStorage.removeItem(_this5.props.profileKey + approval.applicantAgent + approval.from);

                _this5.props.onApproved(approval, approveResult);
              } else {
                console.error(err);
                delete _this5.state.approving[approval.applicantAgent + approval.from];
                _this5.setState({ approving: _this5.state.approving });
              }
            });
          } else {
            console.error(err);
            delete _this5.state.approving[approval.applicantAgent + approval.from];
            _this5.setState({ approving: _this5.state.approving });
          }
        });
      } catch (err) {
        console.error(err);
        delete this.state.approving[approval.applicantAgent + approval.from];
        this.setState({ approving: this.state.approving });
      }
    }
  }, {
    key: 'formatMonth',
    value: function formatMonth(time) {
      if (time > 0) {
        return _moment2.default.unix(time).format('YYYY/MM');
      }
      return '';
    }
  }, {
    key: 'formatTime',
    value: function formatTime(time) {
      if (time > 0) {
        return _moment2.default.unix(time).format('YYYY/MM/DD HH:mm:ss');
      }
      return '';
    }
  }, {
    key: 'test',
    value: function test() {
      console.log('watch topic');

      var web3 = this.props.web3;
      var shh = web3.shh;
      if (!this.identity) {
        this.identity = shh.newIdentity();
        console.log('identity: ' + this.identity);
      }

      var filter = shh.filter({ topics: [web3.fromAscii(_configure.TOPIC_NAME)], to: this.identity });
      filter.watch(function (err, result) {
        //filter.stopWatching()
        if (!err) {
          var json = web3.toAscii(result.payload);
          console.log('recv %s', json);
        } else {
          console.error(err);
        }
      });
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
            approval.profile ? _react2.default.createElement(
              'div',
              null,
              'Name: ',
              approval.profile.name,
              _react2.default.createElement('br', null),
              'Birthday: ',
              approval.profile.birthday
            ) : approval.applicantAgent
          ),
          _react2.default.createElement(
            'td',
            null,
            this.formatMonth(approval.from)
          ),
          _react2.default.createElement(
            'td',
            null,
            this.formatMonth(approval.to)
          ),
          _react2.default.createElement(
            'td',
            null,
            approval.approveTime > 0 ? approval.approveResult ? _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'primary' },
                'Approved'
              ),
              ' ',
              this.formatTime(approval.approveTime)
            ) : _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'danger' },
                'Disapproved'
              ),
              ' ',
              this.formatTime(approval.approveTime)
            ) : approval.acceptTime > 0 ? _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'info', bsSize: 'small', onClick: this.approveClick.bind(this, approval, true),
                  disabled: this.props.password.length == 0 || this.props.balance.toNumber() == 0 || !approval.profile || this.state.approving[approval.applicantAgent + approval.from],
                  style: { width: 100 } },
                'Approve'
              ),
              ' ',
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'danger', bsSize: 'small', onClick: this.approveClick.bind(this, approval, false),
                  disabled: this.props.password.length == 0 || this.props.balance.toNumber() == 0 || !approval.profile || this.state.approving[approval.applicantAgent + approval.from] },
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
              this.formatTime(approval.acceptTime)
            ) : _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: 'default' },
              'Accepting'
            )
          )
        ));
      }

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.Button,
          { onClick: this.test.bind(this) },
          'まつ'
        ),
        _react2.default.createElement(
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
        )
      );
    }
  }]);

  return Approvals;
}(_react.Component);

Approvals.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  account: _react.PropTypes.string.isRequired,
  password: _react.PropTypes.string.isRequired,
  lockedTime: _react.PropTypes.number.isRequired,
  balance: _react.PropTypes.object.isRequired,
  abi: _react.PropTypes.string.isRequired,
  systemAgent: _react.PropTypes.string.isRequired,
  agent: _react.PropTypes.string.isRequired,
  profileKey: _react.PropTypes.string.isRequired,
  onApproveAccept: _react.PropTypes.func.isRequired,
  onApproved: _react.PropTypes.func.isRequired,
  onAutoUnlocked: _react.PropTypes.func.isRequired
};
exports.default = Approvals;