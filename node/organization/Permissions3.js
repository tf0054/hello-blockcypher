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

var _Permissions2 = require('./Permissions2.jsx');

var _Permissions3 = _interopRequireDefault(_Permissions2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Permissions3 = function (_Permissions) {
  _inherits(Permissions3, _Permissions);

  function Permissions3() {
    _classCallCheck(this, Permissions3);

    return _possibleConstructorReturn(this, (Permissions3.__proto__ || Object.getPrototypeOf(Permissions3)).apply(this, arguments));
  }

  _createClass(Permissions3, [{
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
          var sig = permission.resumes[i].signature.substr(2);
          var r = '0x' + sig.substring(0, 64);
          var s = '0x' + sig.substring(64, 128);
          var v = web3.toDecimal('0x' + sig.substring(128, 130)) + 27;

          var instance = eth.contract(abi[_configure.ORGANIZATION_CONTRACT_NAME]).at(permission.resumes[i].orgAgent);
          try {
            if (!instance.validate(hash, r, s, v)) {
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
  }]);

  return Permissions3;
}(_Permissions3.default);

exports.default = Permissions3;