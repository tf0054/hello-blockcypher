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
      organizations: [],
      orgAgent: '',
      from: '',
      to: '',
      permissions: [],
      publishing: false,
      message: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Permissions, [{
    key: 'loadOrganizations',
    value: function loadOrganizations(props) {
      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).at(props.systemAgent);

      var size = instance.sizeOrganizations({ from: props.account }).toNumber();
      var organizations = [];
      for (var i = 0; i < size; i++) {
        var organization = instance.getOrganization(i, { from: props.account });
        organizations.push({
          account: organization[0], name: organization[1], agent: organization[2],
          createTime: organization[3].toNumber()
        });
      }
      return organizations;
    }
  }, {
    key: 'loadPermissions',
    value: function loadPermissions(props) {
      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(props.agent);

      var size = instance.sizePermissions({ from: props.account }).toNumber();
      var permissions = [];
      for (var i = 0; i < size; i++) {
        var permission = instance.getPermission(i, { from: props.account });
        var from = permission[1].toNumber();
        var to = permission[2].toNumber();
        var responseTime = permission[5].toNumber();

        var identity = '';
        if (responseTime > 0) {
          identity = instance.getPublishContact(permission[0], from, to, { from: props.account });
        }

        permissions.push({
          orgAgent: permission[0], from: from, to: to, createTime: permission[3].toNumber(), account: permission[4],
          responseTime: responseTime, identity: identity
        });
      }
      return permissions;
    }
  }, {
    key: 'watchOrganizations',
    value: function watchOrganizations(props) {
      var _this2 = this;

      console.log('watch OrganizationsUpdate');

      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).at(props.systemAgent);

      instance.OrganizationsUpdate().watch(function (err, event) {
        if (!err) {
          console.log('OrganizationsUpdate event {sender: %s}', event.args.sender);

          var organizations = _this2.loadOrganizations(props);
          if (organizations) {
            _this2.setState({ organizations: organizations });
          }
        } else {
          console.error(err);
        }
      });
      this.orgsWatching = true;
    }
  }, {
    key: 'removeContact',
    value: function removeContact(props, permission) {
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
            var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(props.agent);

            var gas = instance.removePublishContact.estimateGas(permission.orgAgent, permission.from, permission.to, { from: props.account });
            console.log('removePublishContact {gas: %d}', gas);

            var transactionHash = instance.removePublishContact(permission.orgAgent, permission.from, permission.to, { from: _this3.props.account, gas: gas });
            console.log('removePublishContact {transactionHash: %s}' + transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);
                _this3.props.onRemovePublishContact(permission);
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
    key: 'postProfile',
    value: function postProfile(props, permission) {
      var _this4 = this;

      console.log('post profile {orgAgent: %s, from: %s, to %s}', permission.orgAgent, permission.from, permission.to);
      try {
        var web3 = this.props.web3;
        var shh = web3.shh;
        shh.post({
          from: shh.newIdentity(),
          to: permission.identity,
          topics: [web3.fromAscii(_configure.TOPIC_NAME)],
          payload: web3.fromAscii(JSON.stringify(this.props.profile)),
          ttl: _configure.TOPIC_MSG_TTL
        }, function (err, result) {
          if (!err) {
            console.log('shh post {to: %s}', permission.identity);

            _this4.removeContact(props, permission);
          } else {
            console.error(err);
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, {
    key: 'watchResponse',
    value: function watchResponse(props) {
      var _this5 = this;

      if (!this.responseWatching) {
        console.log('watch PublishResponse');

        var abi = JSON.parse(props.abi);

        var eth = this.props.web3.eth;
        var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(props.agent);

        instance.PublishResponse().watch(function (err, event) {
          if (!err) {
            console.log('PublishResponse event {sender: %s, transaction: %s}', event.args.sender, event.transactionHash);

            var permissions = _this5.loadPermissions(props);
            if (permissions) {
              _this5.setState({ permissions: permissions });

              for (var i in permissions) {
                if (permissions[i].responseTime > 0 && permissions[i].identity.length > 0) {
                  _this5.postProfile(props, permissions[i]);
                }
              }
            }
          } else {
            console.error(err);
          }
        });
        this.responseWatching = true;
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this.loaded && nextProps.account.length > 0 && nextProps.abi.length > 0 && nextProps.agent.length > 0) {
        var organizations = this.loadOrganizations(nextProps);
        if (organizations) {
          this.setState({ organizations: organizations });
        }
        this.watchOrganizations(nextProps);

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
            this.watchResponse(nextProps);
          } else if (permission.identity.length > 0) {
            this.postProfile(nextProps, permission);
          }
        }

        this.preprocessed = true;
      }
    }
  }, {
    key: 'organizationChange',
    value: function organizationChange(e) {
      this.setState({ orgAgent: e.target.value });
    }
  }, {
    key: 'fromChange',
    value: function fromChange(e) {
      this.setState({ from: e.target.value });
    }
  }, {
    key: 'toChange',
    value: function toChange(e) {
      this.setState({ to: e.target.value });
    }
  }, {
    key: 'publishClick',
    value: function publishClick() {
      var _this6 = this;

      var from = (0, _moment2.default)(this.state.from, 'YYYY/MM/DD').unix();
      var to = (0, _moment2.default)(this.state.to + ' 23:59:59', 'YYYY/MM/DD HH:mm:ss').unix();

      for (var i in this.state.permissions) {
        var permission = this.state.permissions[i];
        if (permission.orgAgent == this.state.orgAgent && permission.from <= to && permission.to >= from) {
          this.setState({ message: 'すでに公開している組織に対して、重複する期間する指定しています。' });
          return;
        }
      }

      this.setState({ publishing: true });

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this6.props.onAutoUnlocked(unlockTime);
            }

            var abi = JSON.parse(_this6.props.abi);

            var eth = _this6.props.web3.eth;
            var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(_this6.props.agent);

            var gas1 = instance.publish.estimateGas(_this6.state.orgAgent, from, to, { from: _this6.props.account });

            var instance2 = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(_this6.state.orgAgent);
            var gas2 = instance2.publishNotify.estimateGas(from, to, { from: _this6.props.account });

            var gas = gas1 + gas2;
            console.log('publish {gas: %d}', gas);

            var transactionHash = instance.publish(_this6.state.orgAgent, from, to, {
              from: _this6.props.account,
              gas: gas
            });
            console.log('publish {transactionHash: %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);
                _this6.props.onPublish({ orgAgent: _this6.state.orgAgent, from: from, to: to });
              } else {
                console.error(err);
              }
            });

            _this6.watchResponse(_this6.props);

            _this6.state.permissions.push({
              orgAgent: _this6.state.orgAgent, from: from, to: to, createTime: 0,
              responseTime: 0
            });

            _this6.setState({ publishing: false, orgAgent: '', from: '', to: '', permissions: _this6.state.permissions });
          } else {
            console.error(err);
            _this6.setState({ publishing: false });
          }
        });
      } catch (err) {
        console.error(err);
        this.setState({ publishing: false });
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
      var _this7 = this;

      var options = [];
      for (var i in this.state.organizations) {
        var organization = this.state.organizations[i];
        options.push(_react2.default.createElement(
          'option',
          { key: i, value: organization.agent },
          organization.name
        ));
      }

      var now = (0, _moment2.default)();
      var from = (0, _moment2.default)(this.state.from, 'YYYY/MM/DD');
      var to = (0, _moment2.default)(this.state.to, 'YYYY/MM/DD');

      var rows = [];
      for (var _i in this.state.permissions) {
        var permission = this.state.permissions[_i];
        var name = void 0;
        for (var _i2 in this.state.organizations) {
          if (this.state.organizations[_i2].agent == permission.orgAgent) {
            name = this.state.organizations[_i2].name;
            break;
          }
        }

        rows.push(_react2.default.createElement(
          'tr',
          { key: _i },
          _react2.default.createElement(
            'td',
            null,
            name
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
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'primary' },
                'Published'
              ),
              ' ',
              this.formatTime(permission.responseTime)
            ) : _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: 'default' },
              'Preparing'
            )
          )
        ));
      }

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Company / School'
          ),
          _react2.default.createElement(
            _reactBootstrap.FormControl,
            { componentClass: 'select', value: this.state.orgAgent, onChange: this.organizationChange.bind(this) },
            _react2.default.createElement('option', { value: '' }),
            options
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'From'
          ),
          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.from, placeholder: now.format('YYYY/MM/DD'),
            onChange: this.fromChange.bind(this) })
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'End'
          ),
          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.to, placeholder: now.format('YYYY/MM/DD'),
            onChange: this.toChange.bind(this) })
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.Button,
            { bsStyle: 'primary', onClick: this.publishClick.bind(this),
              disabled: this.props.password.length == 0 || this.props.balance.toNumber() == 0 || this.state.orgAgent.length == 0 || this.state.from.length == 0 || !from.isValid() || this.state.to.length == 0 || !to.isValid() || from.isAfter(to) || !this.props.profile || this.state.publishing
            },
            'Publish'
          )
        ),
        _react2.default.createElement('hr', null),
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
                'End'
              ),
              _react2.default.createElement(
                'th',
                null,
                'Status'
              )
            )
          ),
          _react2.default.createElement(
            'tbody',
            null,
            rows
          )
        ),
        _react2.default.createElement(_Alert2.default, { message: this.state.message, onHide: function onHide() {
            return _this7.setState({ message: null });
          } })
      );
    }
  }]);

  return Permissions;
}(_react.Component);

Permissions.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  account: _react.PropTypes.string.isRequired,
  lockedTime: _react.PropTypes.number.isRequired,
  balance: _react.PropTypes.object.isRequired,
  profile: _react.PropTypes.shape({
    name: _react2.default.PropTypes.string,
    birthday: _react2.default.PropTypes.string
  }),
  abi: _react.PropTypes.string.isRequired,
  systemAgent: _react.PropTypes.string.isRequired,
  agent: _react.PropTypes.string.isRequired,
  onPublish: _react.PropTypes.func.isRequired,
  onRemovePublishContact: _react.PropTypes.func.isRequired,
  onAutoUnlocked: _react.PropTypes.func.isRequired
};
exports.default = Permissions;