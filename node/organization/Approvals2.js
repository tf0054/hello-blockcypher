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

var Approvals2 = function (_Component) {
  _inherits(Approvals2, _Component);

  function Approvals2() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Approvals2);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Approvals2.__proto__ || Object.getPrototypeOf(Approvals2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      approvals: [],
      approving: {}
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Approvals2, [{
    key: 'loadApprovals',
    value: function loadApprovals() {
      var approvals = [];
      var size = localStorage.getItem(_configure.ORGANIZATION_APPROVALS_KEY + this.props.device + '.size');
      if (size) {
        size = Number(size);
        for (var i = 0; i < size; i++) {
          approvals.push(JSON.parse(localStorage.getItem(_configure.ORGANIZATION_APPROVALS_KEY + this.props.device + '.' + i)));
        }
      }
      return approvals;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.setState({ approvals: this.loadApprovals() });
    }
  }, {
    key: 'watchApprovalRequest',
    value: function watchApprovalRequest(props) {
      var _this2 = this;

      console.log('watch approval request');

      var hashes = localStorage.getItem(_configure.ORGANIZATION_APPROVAL_RECV_HASHES + this.props.device);
      if (hashes) {
        this.hashes = {};
        var size = hashes.length / 66;
        for (var i = 0; i < size; i++) {
          var hash = hashes.substring(i * 66, (i + 1) * 66);
          this.hashes[hash] = true;
        }
      } else {
        hashes = '';
        this.hashes = {};
      }

      var web3 = this.props.web3;
      var shh = web3.shh;
      var filter = shh.filter({ topics: [this.props.topicName], to: props.profile.identity });
      console.log(props.profile.identity);

      filter.get(function (err, results) {
        if (!err) {
          var delHashes = Object.assign({}, _this2.hashes);
          for (var _i in results) {
            if (delHashes[results[_i].hash]) {
              delete delHashes[results[_i].hash];
            }
          }

          if (Object.keys(delHashes).length > 0) {
            hashes = '';
            for (var h in _this2.hashes) {
              if (delHashes[h]) {
                delete _this2.hashes[h];
              } else {
                hashes += h;
              }
            }
            localStorage.setItem(_configure.ORGANIZATION_APPROVAL_RECV_HASHES + _this2.props.device, hashes);
          }

          filter.watch(function (err, result) {
            if (!err) {
              if (!_this2.hashes[result.hash]) {
                (function () {
                  var json = new Buffer(result.payload.substring(2), 'hex').toString();
                  console.log('recv {approval: %s}', json);

                  var approval = JSON.parse(json);
                  approval.resume.acceptTime = (0, _moment2.default)().unix();

                  _this2.postApprovalAcceptance(props, approval, function (err, result2) {
                    if (!err) {
                      _this2.state.approvals.push(approval);
                      _this2.setState({ approvals: _this2.state.approvals });

                      var _size = localStorage.getItem(_configure.ORGANIZATION_APPROVALS_KEY + _this2.props.device + '.size');
                      if (_size) {
                        _size = Number(_size);
                      } else {
                        _size = 0;
                      }
                      localStorage.setItem(_configure.ORGANIZATION_APPROVALS_KEY + _this2.props.device + '.size', _size + 1);
                      localStorage.setItem(_configure.ORGANIZATION_APPROVALS_KEY + _this2.props.device + '.' + _size, JSON.stringify(approval));

                      _this2.hashes[result.hash] = true;
                      hashes += result.hash;
                      localStorage.setItem(_configure.ORGANIZATION_APPROVAL_RECV_HASHES + _this2.props.device, hashes);
                    }
                  });
                })();
              }
            } else {
              console.error(err);
            }
          });
        } else {
          console.error(err);
        }
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this.preprocessed && nextProps.profile) {
        this.watchApprovalRequest(nextProps);
        this.preprocessed = true;
      }
    }
  }, {
    key: 'postResponse',
    value: function postResponse(from, to, payload, callback) {
      try {
        var web3 = this.props.web3;
        var shh = web3.shh;
        shh.post({
          from: from,
          to: to,
          topics: [this.props.topicName],
          payload: new Buffer(JSON.stringify(payload)).toString('hex'),
          ttl: _configure.TOPIC_MSG_TTL
        }, function (err, result) {
          if (!err) {
            console.log('shh post {to: %s}', to);
          } else {
            console.error(err);
          }
          callback(err, result);
        });
      } catch (err) {
        console.error(err);
        callback(err, null);
      }
    }
  }, {
    key: 'postApprovalAcceptance',
    value: function postApprovalAcceptance(props, approval, callback) {
      console.log('post acceptance {id: %s}', approval.resume.id);
      var payload = { id: approval.resume.id, acceptTime: approval.resume.acceptTime };
      this.postResponse(props.profile.identity, approval.profile.identity, payload, callback);
    }
  }, {
    key: 'postApprovalResponse',
    value: function postApprovalResponse(approval, callback) {
      console.log('post approval response {id: %s, result: %s}', approval.resume.id, approval.resume.approveResult);
      var payload = {
        id: approval.resume.id, approveResult: approval.resume.approveResult, approveTime: approval.resume.approveTime
      };
      this.postResponse(this.props.profile.identity, approval.profile.identity, payload, callback);
    }
  }, {
    key: 'approveClick',
    value: function approveClick(index, approveResult) {
      var _this3 = this;

      this.state.approving[index] = true;
      this.setState({ approving: this.state.approving });

      var approval = this.state.approvals[index];

      var web3 = this.props.web3;

      var hash = web3.sha3(approval.profile.identity + approval.resume.id);

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this3.props.onAutoUnlocked(unlockTime);
            }

            var abi = JSON.parse(_this3.props.abi);

            var eth = web3.eth;
            var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(_this3.props.agent);

            var gas = instance.approve.estimateGas(hash, { from: _this3.props.account });
            console.log('approve {gas: %d}', gas);

            var transactionHash = instance.approve(hash, { from: _this3.props.account, gas: gas });
            console.log('approve {transactionHash: %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);

                approval.resume.approveResult = approveResult;
                approval.resume.approveTime = (0, _moment2.default)().unix();

                _this3.postApprovalResponse(approval, function (err, result) {
                  if (!err) {
                    delete _this3.state.approving[index];
                    _this3.setState({ approving: _this3.state.approving, approvals: _this3.state.approvals });
                  } else {
                    delete _this3.state.approving[index];
                    _this3.setState({ approving: _this3.state.approving });
                  }
                });

                _this3.props.onApproved(approval, approveResult);
              } else {
                console.error(err);
                delete _this3.state.approving[index];
                _this3.setState({ approving: _this3.state.approving });
              }
            });
          } else {
            console.error(err);
            delete _this3.state.approving[index];
            _this3.setState({ approving: _this3.state.approving });
          }
        });
      } catch (err) {
        console.error(err);
        delete this.state.approving[index];
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
                  disabled: this.props.password.length == 0 || this.props.balance.toNumber() == 0 || this.state.approving[i], style: { width: 100 } },
                'Approve'
              ),
              ' ',
              _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'danger', bsSize: 'small', onClick: this.approveClick.bind(this, i, false),
                  disabled: this.props.password.length == 0 || this.props.balance.toNumber() == 0 || this.state.approving[i] },
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

  return Approvals2;
}(_react.Component);

Approvals2.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  device: _react.PropTypes.string,
  account: _react.PropTypes.string.isRequired,
  password: _react.PropTypes.string.isRequired,
  lockedTime: _react.PropTypes.number.isRequired,
  balance: _react.PropTypes.object.isRequired,
  profile: _react.PropTypes.shape({
    identity: _react2.default.PropTypes.string,
    name: _react2.default.PropTypes.string,
    createTime: _react2.default.PropTypes.number,
    updateTime: _react2.default.PropTypes.number
  }),
  abi: _react.PropTypes.string.isRequired,
  agent: _react.PropTypes.string.isRequired,
  topicName: _react.PropTypes.string.isRequired,
  onApproved: _react.PropTypes.func.isRequired,
  onAutoUnlocked: _react.PropTypes.func.isRequired
};
Approvals2.defaultProps = {
  device: '0'
};
exports.default = Approvals2;