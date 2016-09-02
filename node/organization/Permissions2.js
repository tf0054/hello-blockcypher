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
      permissions: [],
      permission: null,
      accessing: {},
      message: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Permissions2, [{
    key: 'loadPermissions',
    value: function loadPermissions() {
      var permissions = [];
      var size = localStorage.getItem(_configure.ORGANIZATION_PERMISSIONS_KEY + this.props.device + '.size');
      if (size) {
        size = Number(size);
        for (var i = 0; i < size; i++) {
          permissions.push(JSON.parse(localStorage.getItem(_configure.ORGANIZATION_PERMISSIONS_KEY + this.props.device + '.' + i)));
        }
      }
      return permissions;
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.setState({ permissions: this.loadPermissions() });
    }
  }, {
    key: 'watchPermission',
    value: function watchPermission(props) {
      var _this2 = this;

      console.log('watch permission');

      var hashes = localStorage.getItem(_configure.ORGANIZATION_PERMISSION_RECV_HASHES + this.props.device);
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
            localStorage.setItem(_configure.ORGANIZATION_PERMISSION_RECV_HASHES + _this2.props.device, hashes);
          }

          filter.watch(function (err, result) {
            if (!err) {
              if (!_this2.hashes[result.hash]) {
                var json = new Buffer(result.payload.substring(2), 'hex').toString();
                console.log('recv {permission: %s}', json);

                var permission = JSON.parse(json);

                _this2.state.permissions.push(permission);
                _this2.setState({ permissions: _this2.state.permissions });

                var _size = localStorage.getItem(_configure.ORGANIZATION_PERMISSIONS_KEY + _this2.props.device + '.size');
                if (_size) {
                  _size = Number(_size);
                } else {
                  _size = 0;
                }
                localStorage.setItem(_configure.ORGANIZATION_PERMISSIONS_KEY + _this2.props.device + '.size', _size + 1);
                localStorage.setItem(_configure.ORGANIZATION_PERMISSIONS_KEY + _this2.props.device + '.' + _size, JSON.stringify(permission));

                _this2.hashes[result.hash] = true;
                hashes += result.hash;
                localStorage.setItem(_configure.ORGANIZATION_PERMISSION_RECV_HASHES + _this2.props.device, hashes);
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
        this.watchPermission(nextProps);
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

      if (!permission.confirmed) {
        var abi = JSON.parse(this.props.abi);

        var web3 = this.props.web3;
        var eth = web3.eth;

        for (var i in permission.resumes) {
          var hash = web3.sha3(permission.profile.identity + permission.resumes[i].id);

          var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(permission.resumes[i].orgAgent);
          try {
            if (!instance.existsApproval(hash)) {
              permission.resumes[i].approveResult = false;
            }
          } catch (err) {
            console.error(err);
          }
        }
        permission.confirmed = true;

        this.state.accessing[index] = false;
        this.setState({ accessing: this.state.accessing, permissions: this.state.permissions, permission: permission });
        localStorage.setItem(_configure.ORGANIZATION_PERMISSIONS_KEY + this.props.device + '.' + index, JSON.stringify(permission));
      } else {
        this.state.accessing[index] = false;
        this.setState({ accessing: this.state.accessing, permission: permission });
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
      var _this3 = this;

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
            'Name: ',
            permission.profile.name,
            _react2.default.createElement('br', null),
            'Birthday: ',
            permission.profile.birthday
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
              _reactBootstrap.Button,
              { bsStyle: 'info', bsSize: 'small', onClick: this.accessResumesClick.bind(this, i),
                disabled: permission.from > now || permission.to < now || !permission.profile },
              'Access'
            )
          )
        ));
      }

      var resumes = void 0;
      if (this.state.permission) {
        var resumesRows = [];
        for (var _i2 in this.state.permission.resumes) {
          var resume = this.state.permission.resumes[_i2];
          if (resume.approveResult) {}
          resumesRows.push(_react2.default.createElement(
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
              resume.approveResult ? _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  _reactBootstrap.Label,
                  { bsStyle: 'primary' },
                  'Approved'
                )
              ) : _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  _reactBootstrap.Label,
                  { bsStyle: 'danger' },
                  'Disapproved'
                )
              )
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
            this.state.permission.profile.name,
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
            return _this3.setState({ message: null });
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
    createTime: _react2.default.PropTypes.number,
    updateTime: _react2.default.PropTypes.number
  }),
  abi: _react.PropTypes.string.isRequired,
  topicName: _react.PropTypes.string.isRequired
};
Permissions2.defaultProps = {
  device: '0'
};
exports.default = Permissions2;