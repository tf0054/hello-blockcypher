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

var Organizations = function (_Component) {
  _inherits(Organizations, _Component);

  function Organizations() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Organizations);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Organizations.__proto__ || Object.getPrototypeOf(Organizations)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      organizations: [],
      stopping: {}
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Organizations, [{
    key: 'loadOrganizations',
    value: function loadOrganizations(props) {
      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).at(props.agent);

      var size = instance.sizeOrganizations({ from: props.account }).toNumber();
      var organizations = [];
      for (var i = 0; i < size; i++) {
        var organization = instance.getOrganization(i, { from: props.account });
        if (organization.length == 5) {
          organizations.push({
            account: organization[0], name: organization[1], identity: organization[2], agent: organization[3],
            createTime: organization[4].toNumber()
          });
        } else {
          organizations.push({
            account: organization[0], name: organization[1], agent: organization[2],
            createTime: organization[3].toNumber()
          });
        }
      }
      return organizations;
    }
  }, {
    key: 'watchUpdate',
    value: function watchUpdate(props) {
      var _this2 = this;

      console.log('watch OrganizationsUpdate');

      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).at(props.agent);

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
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this.loaded && nextProps.account.length > 0 && nextProps.abi.length > 0 && nextProps.agent.length > 0) {
        var organizations = this.loadOrganizations(nextProps);
        if (organizations) {
          this.setState({ organizations: organizations });
        }
        this.watchUpdate(nextProps);

        this.loaded = true;
      }
    }
  }, {
    key: 'stopAgentClick',
    value: function stopAgentClick(agent) {
      var _this3 = this;

      this.state.stopping[agent] = true;
      this.setState({ stopping: this.state.stopping });

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            if (unlockTime) {
              _this3.props.onAutoUnlocked(unlockTime);
            }

            var abi = JSON.parse(_this3.props.abi);

            var eth = _this3.props.web3.eth;
            var instance = eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).at(_this3.props.agent);

            var gas = instance.removeOrganization.estimateGas(agent, { from: _this3.props.account });
            console.log('removeOrganization {gas: %d}', gas);

            var transactionHash = instance.removeOrganization(agent, { from: _this3.props.account, gas: gas });
            console.log('removeOrganization {transactionHash; %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);

                _this3.props.onStopped(agent);
                for (var i in _this3.state.organizations) {
                  if (_this3.state.organizations[i].agent == agent) {
                    _this3.state.organizations.splice(i, 1);
                    break;
                  }
                }
                delete _this3.state.stopping[agent];
                _this3.setState({ stopping: _this3.state.stopping, organizations: _this3.state.organizations });
              } else {
                console.error(err);
                delete _this3.state.stopping[agent];
                _this3.setState({ stopping: _this3.state.stopping });
              }
            });
          }
        });
      } catch (err) {
        console.error(err);
        delete this.state.stopping[agent];
        this.setState({ stopping: this.state.stopping });
      }
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
      for (var i in this.state.organizations) {
        var organization = this.state.organizations[i];
        rows.push(_react2.default.createElement(
          'tr',
          { key: i },
          _react2.default.createElement(
            'td',
            { style: { width: 200 } },
            _react2.default.createElement(
              'div',
              { style: { width: 200, overflowX: 'scroll' } },
              organization.agent
            )
          ),
          _react2.default.createElement(
            'td',
            { style: { width: 200 } },
            _react2.default.createElement(
              'div',
              { style: { width: 200, overflowX: 'scroll' } },
              organization.account,
              _react2.default.createElement('br', null),
              organization.name
            )
          ),
          _react2.default.createElement(
            'td',
            null,
            this.formatTime(organization.createTime)
          ),
          _react2.default.createElement(
            'td',
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'danger', bsSize: 'small', onClick: this.stopAgentClick.bind(this, organization.agent),
                disabled: this.props.password.length == 0 || this.props.balance.toNumber() == 0 || this.state.stopping[organization.agent]
              },
              this.state.stopping[organization.agent] ? 'Stopping ...' : 'Stop agent'
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
              'Agent'
            ),
            _react2.default.createElement(
              'th',
              null,
              'Account'
            ),
            _react2.default.createElement(
              'th',
              null,
              'Create time'
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

  return Organizations;
}(_react.Component);

Organizations.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  account: _react.PropTypes.string.isRequired,
  password: _react.PropTypes.string.isRequired,
  lockedTime: _react.PropTypes.number.isRequired,
  balance: _react.PropTypes.object.isRequired,
  abi: _react.PropTypes.string.isRequired,
  agent: _react.PropTypes.string.isRequired,
  onStopped: _react.PropTypes.func.isRequired,
  onAutoUnlocked: _react.PropTypes.func.isRequired
};
exports.default = Organizations;