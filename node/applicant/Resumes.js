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

var Resumes = function (_Component) {
  _inherits(Resumes, _Component);

  function Resumes() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Resumes);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Resumes.__proto__ || Object.getPrototypeOf(Resumes)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      organizations: [],
      orgAgent: '',
      from: '',
      to: '',
      resumes: [],
      applying: false,
      message: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Resumes, [{
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
    key: 'loadResumes',
    value: function loadResumes(props) {
      var abi = JSON.parse(props.abi);

      var eth = this.props.web3.eth;
      var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(props.agent);

      var size = instance.sizeResumes({ from: props.account }).toNumber();
      var resumes = [];
      for (var i = 0; i < size; i++) {
        var resume = instance.getResume(i, { from: props.account });
        var from = resume[2].toNumber();
        var acceptTime = resume[5].toNumber();
        var approveTime = resume[7].toNumber();

        var identity = '';
        if (acceptTime > 0 && approveTime == 0) {
          identity = instance.getApproveContact(resume[0], from, { from: props.account });
        }

        resumes.push({
          orgAgent: resume[0], name: resume[1], from: from, to: resume[3].toNumber(), createTime: resume[4].toNumber(),
          acceptTime: acceptTime, approveResult: resume[6], approveTime: approveTime, identity: identity
        });
      }
      return resumes;
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
    key: 'removeContact',
    value: function removeContact(props, resume) {
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

            var gas = instance.removeApproveContact.estimateGas(resume.orgAgent, resume.from, { from: props.account });
            console.log('removeApproveContact {gas: %d}', gas);

            var transactionHash = instance.removeApproveContact(resume.orgAgent, resume.from, { from: props.account, gas: gas });
            console.log('removeApproveContact {transactionHash: %s}', transactionHash);

            (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
              if (!err) {
                console.log(receipt);
                _this3.props.onRemoveApproveContact(resume);
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
    value: function postProfile(props, resume) {
      var _this4 = this;

      console.log('post profile {orgAgent: %s, from: %d}', resume.orgAgent, resume.from);
      try {
        var web3 = this.props.web3;
        var shh = web3.shh;
        shh.post({
          from: shh.newIdentity(),
          to: resume.identity,
          topics: [web3.fromAscii(_configure.TOPIC_NAME)],
          payload: web3.fromAscii(JSON.stringify(this.props.profile)),
          ttl: _configure.TOPIC_MSG_TTL
        }, function (err, result) {
          if (!err) {
            console.log('shh post {to: %s}', resume.identity);

            _this4.removeContact(props, resume);
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
        console.log('watch ApproveResponse');

        var abi = JSON.parse(props.abi);

        var eth = this.props.web3.eth;
        var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(props.agent);

        instance.ApproveResponse().watch(function (err, event) {
          if (!err) {
            console.log('ApproveResponse event');
            console.log(event);

            var resumes = _this5.loadResumes(props);
            if (resumes) {
              _this5.setState({ resumes: resumes });
            }
          } else {
            console.error(err);
          }
        });
        this.responseWatching = true;
      }
    }
  }, {
    key: 'watchAccept',
    value: function watchAccept(props) {
      var _this6 = this;

      if (!this.acceptWatching) {
        console.log('watch ApproveAccept');

        var abi = JSON.parse(props.abi);

        var eth = this.props.web3.eth;
        var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(props.agent);

        instance.ApproveAccept().watch(function (err, event) {
          if (!err) {
            console.log('ApproveAccept event');
            console.log(event);

            var resumes = _this6.loadResumes(props);
            if (resumes) {
              _this6.setState({ resumes: resumes });

              for (var i in resumes) {
                if (resumes[i].acceptTime > 0 && resumes[i].approveTime == 0 && resumes[i].identity.length > 0) {
                  console.log('post watch accept');
                  _this6.postProfile(props, resumes[i]);
                }
              }

              _this6.watchResponse(props);
            }
          } else {
            console.error(err);
          }
        });
        this.acceptWatching = true;
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this.loaded && nextProps.account.length > 0 && nextProps.abi.length > 0 && nextProps.agent.length > 0) {
        var state = {};
        var organizations = this.loadOrganizations(nextProps);
        if (organizations) {
          state.organizations = organizations;
        }
        var resumes = this.loadResumes(nextProps);
        if (resumes) {
          state.resumes = resumes;
        }

        this.watchOrganizations(nextProps);

        this.loaded = true;
      }

      if (!this.preprocessed && nextProps.account.length > 0 && nextProps.password.length > 0 && nextProps.balance.toNumber() > 0 && nextProps.abi.length > 0 && nextProps.agent.length > 0) {
        for (var i in this.state.resumes) {
          var resume = this.state.resumes[i];
          if (resume.acceptTime == 0) {
            this.watchAccept(nextProps);
          } else if (resume.approveTime == 0) {
            if (resume.identity.length > 0) {
              console.log('post will no hou');
              this.postProfile(nextProps, resume);
            }
            this.watchResponse(nextProps);
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
    key: 'approveApplyClick',
    value: function approveApplyClick() {
      var _this7 = this;

      var from = (0, _moment2.default)(this.state.from, 'YYYY/MM').unix();

      for (var i in this.state.resumes) {
        var resume = this.state.resumes[i];
        if (resume.orgAgent == this.state.orgAgent && resume.from == from) {
          this.setState({ message: 'すでに登録している組織に対して、同じ開始月を指定しています。' });
          return;
        }
      }

      this.setState({ applying: true });

      try {
        (0, _utils.unlockAccount)(this.props.web3.personal, this.props.lockedTime, this.props.account, this.props.password, function (result, unlockTime) {
          if (result) {
            (function () {
              if (unlockTime) {
                _this7.props.onAutoUnlocked(unlockTime);
              }

              var abi = JSON.parse(_this7.props.abi);

              var eth = _this7.props.web3.eth;
              var instance = eth.contract(abi[_configure.APPLICANT_CONTRACT_NAME]).at(_this7.props.agent);

              var name = void 0;
              for (var _i in _this7.state.organizations) {
                if (_this7.state.organizations[_i].agent == _this7.state.orgAgent) {
                  name = _this7.state.organizations[_i].name;
                  break;
                }
              }
              var to = (0, _moment2.default)(_this7.state.to, 'YYYY/MM').unix();

              var gas1 = instance.addResume.estimateGas(_this7.state.orgAgent, name, from, to, { from: _this7.props.account });

              var instance2 = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(_this7.state.orgAgent);
              var gas2 = instance2.approveApply.estimateGas(from, to, { from: _this7.props.account });

              var gas = gas1 + gas2;
              console.log('addResume {gas: %d}', gas);

              var transactionHash = instance.addResume(_this7.state.orgAgent, name, from, to, { from: _this7.props.account, gas: gas });
              console.log('addResume {transactionHash: %s}', transactionHash);

              (0, _utils.watchTransaction)(eth, transactionHash, function (err, receipt) {
                if (!err) {
                  console.log(receipt);
                  _this7.props.onApproveApply({ orgAgent: _this7.state.orgAgent, from: from, to: to });
                } else {
                  console.error(err);
                }
              });

              _this7.watchAccept(_this7.props);

              _this7.state.resumes.push({
                orgAgent: _this7.state.orgAgent, name: name, from: from, to: to, createTime: 0, acceptTime: 0,
                approveResult: false, approveTime: 0
              });

              _this7.setState({ applying: false, orgAgent: '', from: '', to: '', resumes: _this7.state.resumes });
            })();
          } else {
            console.error(err);
            _this7.setState({ applying: false });
          }
        });
      } catch (err) {
        console.error(err);
        this.setState({ applying: false });
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
      var _this8 = this;

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
      var from = (0, _moment2.default)(this.state.from, 'YYYY/MM');
      var to = (0, _moment2.default)(this.state.to, 'YYYY/MM');

      var rows = [];
      for (var _i2 in this.state.resumes) {
        var resume = this.state.resumes[_i2];
        rows.push(_react2.default.createElement(
          'tr',
          { key: _i2 },
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
            { bsStyle: 'primary', onClick: this.approveApplyClick.bind(this),
              disabled: this.props.password.length == 0 || this.props.balance.toNumber() == 0 || this.state.orgAgent.length == 0 || this.state.from.length == 0 || !from.isValid() || this.state.to.length == 0 || !to.isValid() || from.isAfter(to) || !this.props.profile || this.state.applying },
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
            return _this8.setState({ message: null });
          } })
      );
    }
  }]);

  return Resumes;
}(_react.Component);

Resumes.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  account: _react.PropTypes.string.isRequired,
  password: _react.PropTypes.string.isRequired,
  lockedTime: _react.PropTypes.number.isRequired,
  balance: _react.PropTypes.object.isRequired,
  profile: _react.PropTypes.shape({
    name: _react2.default.PropTypes.string,
    birthday: _react2.default.PropTypes.string
  }),
  abi: _react.PropTypes.string.isRequired,
  systemAgent: _react.PropTypes.string.isRequired,
  agent: _react.PropTypes.string.isRequired,
  onApproveApply: _react.PropTypes.func.isRequired,
  onRemoveApproveContact: _react.PropTypes.func.isRequired,
  onAutoUnlocked: _react.PropTypes.func.isRequired
};
exports.default = Resumes;