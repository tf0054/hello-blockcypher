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

var _Alert = require('../Alert.jsx');

var _Alert2 = _interopRequireDefault(_Alert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Permissions = function (_Component) {
  _inherits(Permissions, _Component);

  function Permissions() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Permissions);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Permissions.__proto__ || Object.getPrototypeOf(Permissions)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      permissions: [],
      profile: null,
      resumes: [],
      message: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Permissions, [{
    key: 'loadPermissions',
    value: function loadPermissions(props) {
      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(props.agent);

      var size = instance.sizePermissions({ from: props.account }).toNumber();
      var permissions = [];
      for (var i = 0; i < size; i++) {
        var permission = instance.getPermission(i, { from: props.account });
        var from = permission[1].toNumber();
        var to = permission[2].toNumber();
        var responseTime = permission[3].toNumber();

        var profile = null;
        var identity = '';
        if (responseTime > 0) {
          profile = localStorage.getItem(this.props.profileKey + permission[0] + from + to);
          if (profile) {
            profile = JSON.parse(profile);
          } else {
            identity = instance.getPublishContact(permission[0], from, to, { from: props.account });
          }
        }

        permissions.push({
          applicantAgent: permission[0], from: permission[1].toNumber(), to: to, responseTime: responseTime,
          profile: profile, identity: identity
        });
      }
      return permissions;
    }
  }, {
    key: 'removeContact',
    value: function removeContact(props, permission) {
      var _this2 = this;

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, props.lockedTime, props.account, props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this2.props.onAutoUnlocked(unlockTime);
            }

            var abi = JSON.parse(props.abi);

            var eth = _this2.props.web3.eth;
            var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(props.agent);

            var gas = instance.removePublishContact.estimateGas(permission.applicantAgent, permission.from, permission.to, { from: props.account });
            console.log('removePublishContact gas: ' + gas);

            var transactionHash = instance.removePublishContact(permission.applicantAgent, permission.from, permission.to, { from: props.account, gas: gas });
            console.log('removePublishContact transactionHash: ' + transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);
                _this2.props.onRemovePublishContact(permission);
              } else {
                console.error(err);
              }
            });
          } else {
            console.error(err);
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, {
    key: 'watchTopic',
    value: function watchTopic(props, permission) {
      var _this3 = this;

      console.log('watch topic');

      var web3 = this.props.web3;
      var shh = web3.shh;
      var filter = shh.filter({ topics: [web3.fromAscii(_configure.TOPIC_NAME)], to: permission.identity });
      filter.watch(function (err, result) {
        filter.stopWatching();
        if (!err) {
          var json = web3.toAscii(result.payload);
          var profile = JSON.parse(json);
          console.log('recv {profile: %s}', json);

          localStorage.setItem(_this3.props.profileKey + permission.applicantAgent + permission.from + permission.to, json);

          _this3.removeContact(props, permission);

          var permissions = _this3.loadPermissions(props);
          if (permissions) {
            _this3.setState({ permissions: permissions });
          }
        } else {
          console.error(err);
        }
      });
    }
  }, {
    key: 'publishResponse',
    value: function publishResponse(props, permission) {
      var _this4 = this;

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, props.lockedTime, props.account, props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this4.props.onAutoUnlocked(unlockTime);
            }

            var abi = JSON.parse(props.abi);

            var web3 = _this4.props.web3;
            var eth = web3.eth;
            var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(props.agent);

            var shh = web3.shh;
            var identity = shh.newIdentity();
            console.log('publishResponse {identity: %s}', identity);

            var gas1 = instance.publishResponse.estimateGas(permission.applicantAgent, permission.from, permission.to, identity, { from: props.account });

            var instance2 = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(permission.applicantAgent);
            var gas2 = instance2.publishResponse.estimateGas(_this4.props.account, permission.from, permission.to, identity, { from: props.agent });

            var gas = gas1 + gas2;
            console.log('publishResponse {gas: %d}', gas);

            var transactionHash = instance.publishResponse(permission.applicantAgent, permission.from, permission.to, identity, { from: props.account, gas: gas });
            console.log('publishResponse {transactionHash: %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);
                _this4.props.onPublishResponse(permission);
              } else {
                console.error(err);
              }
            });

            permission.identity = identity;
            _this4.watchTopic(props, permission);
          } else {
            console.error(err);
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, {
    key: 'watchNotify',
    value: function watchNotify(props) {
      var _this5 = this;

      console.log('watch PublishNotify');

      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(props.agent);

      instance.PublishNotify().watch(function (err, event) {
        if (!err) {
          console.log('PublishNotify event {sender: %s}', event.args.sender);

          var permissions = _this5.loadPermissions(props);
          if (permissions) {
            _this5.setState({ permissions: permissions });

            for (var i in permissions) {
              if (permissions[i].responseTime == 0) {
                _this5.publishResponse(props, permissions[i]);
              } else if (!permissions[i].profile) {
                _this5.watchTopic(props, permissions[i]);
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
        var permissions = this.loadPermissions(nextProps);
        if (permissions) {
          this.setState({ permissions: permissions });
        }

        this.loaded = true;
      }

      if (!this.preprocessed && nextProps.account.length > 0 && nextProps.password.length > 0 && nextProps.balance.toNumber() > 0 && nextProps.abi.length > 0 && nextProps.agent.length > 0) {
        for (var i in this.state.permissions) {
          var permission = this.state.permissions[i];
          if (permission.responseTime == 0) {
            this.publishResponse(nextProps, permission);
          } else if (permission.approveTime == 0) {
            if (!permission.profile) {
              this.watchTopic(nextProps, permission);
            }
          }
        }

        this.watchNotify(nextProps);

        this.preprocessed = true;
      }
    }
  }, {
    key: 'accessResumesClick',
    value: function accessResumesClick(index) {
      var permission = this.state.permissions[index];

      var now = (0, _moment2.default)().unix();

      if (permission.from > now || permission.to < now) {
        this.setState({ message: '閲覧可能な期間を過ぎています。' });
        return;
      }

      this.state.accessing[index] = true;
      this.setState({ accessing: this.state.accessing });

      var abi = JSON.parse(this.props.abi);

      var web3 = this.props.web3;
      var eth = web3.eth;
      var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(permission.applicantAgent);

      try {
        var size = instance.sizeResumes({ from: this.props.account }).toNumber();
        var resumes = [];
        for (var i = 0; i < size; i++) {
          var resume = instance.getResume(i, { from: this.props.account });
          if (resume[6]) {
            resumes.push({
              orgAgent: resume[0], name: resume[1], from: resume[2].toNumber(), to: resume[3].toNumber(),
              createTime: resume[4].toNumber(), acceptTime: resume[5].toNumber(), approveResult: resume[6],
              approveTime: resume[7].toNumber()
            });
          }
        }

        this.state.accessing[index] = false;
        this.setState({ profile: permission.profile, resumes: resumes, accessing: this.state.accessing });
      } catch (err) {
        console.error(err);
        this.state.accessing[index] = false;
        this.setState({ accessing: this.state.accessing });
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
    key: 'formatDay',
    value: function formatDay(time) {
      if (time > 0) {
        return _moment2.default.unix(time).format('YYYY/MM/DD');
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
      var _this6 = this;

      var now = (0, _moment2.default)().unix();

      var rows = [];
      for (var i in this.state.permissions) {
        var permission = this.state.permissions[i];
        rows.push(_react2.default.createElement(
          'tr',
          { key: i },
          _react2.default.createElement(
            'td',
            null,
            permission.profile ? _react2.default.createElement(
              'div',
              null,
              'Name: ',
              permission.profile.name,
              _react2.default.createElement('br', null),
              'Birthday: ',
              permission.profile.birthday
            ) : permission.applicantAgent
          ),
          _react2.default.createElement(
            'td',
            null,
            this.formatDay(permission.from)
          ),
          _react2.default.createElement(
            'td',
            null,
            this.formatDay(permission.to)
          ),
          _react2.default.createElement(
            'td',
            null,
            permission.responseTime > 0 ? _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'info', bsSize: 'small', onClick: this.accessResumesClick.bind(this, i),
                disabled: permission.from > now || permission.to < now || !permission.profile },
              'Access'
            ) : _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: 'default' },
              'Waiting'
            )
          )
        ));
      }

      var resumes = void 0;
      if (this.state.profile) {
        var resumesRows = [];
        for (var _i in this.state.resumes) {
          var resume = this.state.resumes[_i];
          resumesRows.push(_react2.default.createElement(
            'tr',
            { key: _i },
            _react2.default.createElement(
              'td',
              null,
              resume.name
            ),
            _react2.default.createElement(
              'td',
              null,
              this.formatMonth(resume.from)
            ),
            _react2.default.createElement(
              'td',
              null,
              this.formatMonth(resume.to)
            )
          ));
        }

        resumes = _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement('hr', null),
          _react2.default.createElement(
            'h5',
            null,
            this.state.profile.name,
            ' resume'
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
                  'Company / School'
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
                )
              )
            ),
            _react2.default.createElement(
              'tbody',
              null,
              resumesRows
            )
          )
        );
      }

      return _react2.default.createElement(
        'div',
        null,
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
                'End'
              ),
              _react2.default.createElement('th', null)
            )
          ),
          _react2.default.createElement(
            'tbody',
            null,
            rows
          )
        ),
        resumes,
        _react2.default.createElement(_Alert2.default, { message: this.state.message, onHide: function onHide() {
            return _this6.setState({ message: null });
          } })
      );
    }
  }]);

  return Permissions;
}(_react.Component);

Permissions.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  account: _react.PropTypes.string.isRequired,
  password: _react.PropTypes.string.isRequired,
  lockedTime: _react.PropTypes.number.isRequired,
  balance: _react.PropTypes.object.isRequired,
  abi: _react.PropTypes.string.isRequired,
  agent: _react.PropTypes.string.isRequired,
  profileKey: _react.PropTypes.string.isRequired,
  onPublishResponse: _react.PropTypes.func.isRequired,
  onRemovePublishContact: _react.PropTypes.func.isRequired,
  onAutoUnlocked: _react.PropTypes.func.isRequired
};
exports.default = Permissions;