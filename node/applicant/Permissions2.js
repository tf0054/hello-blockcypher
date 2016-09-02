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

var _Alert = require('../Alert.jsx');

var _Alert2 = _interopRequireDefault(_Alert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Permissions2 = function (_Component) {
  _inherits(Permissions2, _Component);

  function Permissions2() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Permissions2);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Permissions2.__proto__ || Object.getPrototypeOf(Permissions2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      organizations: [],
      orgAgent: '',
      from: '',
      to: '',
      permissions: [],
      publishing: false,
      message: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Permissions2, [{
    key: 'loadOrganizations',
    value: function loadOrganizations(props) {
      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.SYSTEM_CONTRACT_NAME]).at(props.systemAgent);

      var size = instance.sizeOrganizations().toNumber();
      var organizations = {};
      for (var i = 0; i < size; i++) {
        var organization = instance.getOrganization(i);
        organizations[organization[3]] = {
          account: organization[0], name: organization[1], identity: organization[2], agent: organization[3],
          createTime: organization[4].toNumber()
        };
      }
      return organizations;
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
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this.loaded && nextProps.abi.length > 0) {
        var state = {};
        var organizations = this.loadOrganizations(nextProps);
        if (organizations) {
          state.organizations = organizations;
        }
        this.watchOrganizations(nextProps);

        var permissions = localStorage.getItem(_configure.APPLICANT_PERMISSIONS_KEY + this.props.device);
        if (permissions) {
          state.permissions = JSON.parse(permissions);
        }

        this.setState(state);
        this.loaded = true;
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
    key: 'postResumes',
    value: function postResumes(to, payload, callback) {
      console.log('post resumes');
      try {
        var web3 = this.props.web3;
        var shh = web3.shh;
        shh.post({
          from: this.props.profile.identity,
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
    key: 'publishClick',
    value: function publishClick() {
      var _this3 = this;

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

      var identity = this.state.organizations[this.state.orgAgent].identity;
      var resumes = [];
      for (var _i in this.props.resumes) {
        var resume = this.props.resumes[_i];
        if (resume.approveTime > 0) {
          resumes.push({
            id: resume.id,
            orgAgent: resume.orgAgent,
            name: this.state.organizations[resume.orgAgent].name,
            from: resume.from,
            to: resume.to,
            createTime: resume.createTime,
            acceptTime: resume.acceptTime,
            approveResult: resume.approveResult,
            approveTime: resume.approveTime,
            signature: resume.signature
          });
        }
      }
      var payload = { profile: this.props.profile, from: from, to: to, resumes: resumes };

      this.postResumes(identity, payload, function (err, result) {
        if (!err) {
          _this3.state.permissions.push({
            orgAgent: _this3.state.orgAgent, from: from, to: to, publicationTime: (0, _moment2.default)().unix()
          });
          _this3.setState({ publishing: false, orgAgent: '', from: '', to: '', permissions: _this3.state.permissions });
          localStorage.setItem(_configure.APPLICANT_PERMISSIONS_KEY + _this3.props.device, JSON.stringify(_this3.state.permissions));
        } else {
          _this3.setState({ publishing: false, orgAgent: '', from: '', to: '' });
        }
      });
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
      var _this4 = this;

      var options = [];
      for (var agent in this.state.organizations) {
        options.push(_react2.default.createElement(
          'option',
          { key: agent, value: agent },
          this.state.organizations[agent].name
        ));
      }

      var now = (0, _moment2.default)();
      var from = (0, _moment2.default)(this.state.from, 'YYYY/MM/DD');
      var to = (0, _moment2.default)(this.state.to, 'YYYY/MM/DD');

      var rows = [];
      for (var i in this.state.permissions) {
        var permission = this.state.permissions[i];
        rows.push(_react2.default.createElement(
          'tr',
          { key: i },
          _react2.default.createElement(
            'td',
            null,
            this.state.organizations[permission.orgAgent].name
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
            _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: 'primary' },
              'Published'
            ),
            ' ',
            this.formatTime(permission.publicationTime)
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
              disabled: this.state.orgAgent.length == 0 || this.state.from.length == 0 || !from.isValid() || this.state.to.length == 0 || !to.isValid() || from.isAfter(to) || !this.props.profile || this.state.publishing
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
            return _this4.setState({ message: null });
          } })
      );
    }
  }]);

  return Permissions2;
}(_react.Component);

Permissions2.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  device: _react.PropTypes.string,
  profile: _react.PropTypes.shape({
    identity: _react2.default.PropTypes.string,
    name: _react2.default.PropTypes.string,
    birthday: _react2.default.PropTypes.string,
    createTime: _react2.default.PropTypes.number,
    updateTime: _react2.default.PropTypes.number
  }),
  resumes: _react2.default.PropTypes.arrayOf(_react.PropTypes.shape({
    id: _react2.default.PropTypes.string,
    orgAgent: _react2.default.PropTypes.string,
    identity: _react2.default.PropTypes.string,
    from: _react2.default.PropTypes.number,
    to: _react2.default.PropTypes.number,
    createTime: _react2.default.PropTypes.number,
    acceptTime: _react2.default.PropTypes.number,
    approveResult: _react2.default.PropTypes.bool,
    approveTime: _react2.default.PropTypes.number,
    signature: _react2.default.PropTypes.string
  })).isRequired,
  abi: _react.PropTypes.string.isRequired,
  systemAgent: _react.PropTypes.string.isRequired,
  topicName: _react.PropTypes.string.isRequired
};
Permissions2.defaultProps = {
  device: '0'
};
exports.default = Permissions2;