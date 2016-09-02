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

var _Alert = require('../Alert.js');

var _Alert2 = _interopRequireDefault(_Alert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Resumes2 = function (_Component) {
  _inherits(Resumes2, _Component);

  function Resumes2() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Resumes2);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Resumes2.__proto__ || Object.getPrototypeOf(Resumes2)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      organizations: [],
      orgAgent: '',
      from: '',
      to: '',
      applying: false,
      message: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Resumes2, [{
    key: 'loadOrganizations',
    value: function loadOrganizations(props) {
      var abi = JSON.parse(props.abi);

//      var eth = this.props.web3.eth;
      var eth = props.web3.eth;
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
          console.log('OrganizationsUpdate event');
          console.log(event);

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
    key: 'watchApprovalResponse',
    value: function watchApprovalResponse(props) {
      var _this3 = this;

      console.log('watch approval response');

      var hashes = localStorage.getItem(_configure.APPLICANT_APPROVAL_RECV_HASHES + this.props.device);
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

      filter.get(function (err, results) {
        if (!err) {
          var delHashes = Object.assign({}, _this3.hashes);
          for (var _i in results) {
            if (delHashes[results[_i].hash]) {
              delete delHashes[results[_i].hash];
            }
          }

          if (Object.keys(delHashes).length > 0) {
            hashes = '';
            for (var h in _this3.hashes) {
              if (delHashes[h]) {
                delete _this3.hashes[h];
              } else {
                hashes += h;
              }
            }
            localStorage.setItem(_configure.APPLICANT_APPROVAL_RECV_HASHES + _this3.props.device, hashes);
          }

          filter.watch(function (err, result) {
            if (!err) {
              if (!_this3.hashes[result.hash]) {
                var json = new Buffer(result.payload.substring(2), 'hex').toString();
                console.log('recv {response: %s}', json);

                var response = JSON.parse(json);
                if (response.approveTime > 0) {
                  _this3.props.onApprovalResponded(response);
                } else {
                  _this3.props.onApprovalAccepted(response);
                }

                _this3.hashes[result.hash] = true;
                hashes += result.hash;
                localStorage.setItem(_configure.APPLICANT_APPROVAL_RECV_HASHES + _this3.props.device, hashes);
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
      if (!this.loaded && nextProps.abi.length > 0) {
        var organizations = this.loadOrganizations(nextProps);
        if (organizations) {
          this.setState({ organizations: organizations });
        }
        this.watchOrganizations(nextProps);
        this.loaded = true;
      }

      if (!this.preprocessed && nextProps.profile) {
        this.watchApprovalResponse(nextProps);
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
    key: 'postApprovalRequest',
    value: function postApprovalRequest(payload, callback) {
      console.log('post approval request {id: %s}', payload.resume.id);
      try {
        var web3 = this.props.web3;
        var shh = web3.shh;
        shh.post({
          from: this.props.profile.identity,
          to: payload.resume.identity,
          topics: [this.props.topicName],
          payload: new Buffer(JSON.stringify(payload)).toString('hex'),
          ttl: _configure.TOPIC_MSG_TTL
        }, function (err, result) {
          if (!err) {
            console.log('shh post {to: %s}', payload.resume.identity);
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
    key: 'applyClick',
    value: function applyClick() {
      var _this4 = this;

      var from = (0, _moment2.default)(this.state.from, 'YYYY/MM').unix();

      for (var i in this.props.resumes) {
        var _resume = this.props.resumes[i];
        if (_resume.orgAgent == this.state.orgAgent && _resume.from == from) {
          this.setState({ message: 'すでに登録している組織に対して、同じ開始月を指定しています。' });
          return;
        }
      }

      this.setState({ applying: true });

      var identity = this.state.organizations[this.state.orgAgent].identity;
      var to = (0, _moment2.default)(this.state.to, 'YYYY/MM').unix();
      var id = this.props.web3.sha3(JSON.stringify({ orgAgent: this.state.orgAgent, from: from, to: to }));

      var resume = {
        id: id, orgAgent: this.state.orgAgent, identity: identity, from: from, to: to, createTime: (0, _moment2.default)().unix(),
        acceptTime: 0, approveResult: false, approveTime: 0
      };

      var payload = { profile: this.props.profile, resume: resume };
      this.postApprovalRequest(payload, function (err, result) {
        if (!err) {
          _this4.props.onApprovalRequested(resume);
        }
        _this4.setState({ applying: false, orgAgent: '', from: '', to: '' });
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
      var _this5 = this;

      var options = [];
      for (var agent in this.state.organizations) {
        options.push(_react2.default.createElement(
          'option',
          { key: agent, value: agent },
          this.state.organizations[agent].name
        ));
      }

      var now = (0, _moment2.default)();
      var from = (0, _moment2.default)(this.state.from, 'YYYY/MM');
      var to = (0, _moment2.default)(this.state.to, 'YYYY/MM');

      var rows = [];
      for (var i in this.props.resumes) {
        var resume = this.props.resumes[i];
        rows.push(_react2.default.createElement(
          'tr',
          { key: i },
          _react2.default.createElement(
            'td',
            null,
            this.state.organizations[resume.orgAgent].name
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
          ),
          _react2.default.createElement(
            'td',
            null,
            resume.approveTime > 0 ? resume.approveResult ? _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'primary' },
                'Approved'
              ),
              ' ',
              this.formatTime(resume.approveTime)
            ) : _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'danger' },
                'Disapproved'
              ),
              ' ',
              this.formatTime(resume.approveTime)
            ) : resume.acceptTime > 0 ? _react2.default.createElement(
              'div',
              null,
              _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'warning' },
                'Applied'
              ),
              ' ',
              this.formatTime(resume.acceptTime)
            ) : _react2.default.createElement(
              _reactBootstrap.Label,
              { bsStyle: 'default' },
              'Applying'
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
          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.from, placeholder: now.format('YYYY/MM'),
            onChange: this.fromChange.bind(this) })
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Birthday'
          ),
          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.to, placeholder: now.format('YYYY/MM'),
            onChange: this.toChange.bind(this) })
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.Button,
            { bsStyle: 'primary', onClick: this.applyClick.bind(this),
              disabled: this.state.orgAgent.length == 0 || this.state.from.length == 0 || !from.isValid() || this.state.to.length == 0 || !to.isValid() || from.isAfter(to) || !this.props.profile || this.state.applying },
            'Apply'
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
                'To'
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
            return _this5.setState({ message: null });
          } })
      );
    }
  }]);

  return Resumes2;
}(_react.Component);

Resumes2.propTypes = {
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
  topicName: _react.PropTypes.string.isRequired,
  onApprovalRequested: _react.PropTypes.func.isRequired,
  onApprovalAccepted: _react.PropTypes.func.isRequired,
  onApprovalResponded: _react.PropTypes.func.isRequired
};
Resumes2.defaultProps = {
  device: '0'
};
exports.default = Resumes2;
