'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _web = require('web3');

var _web2 = _interopRequireDefault(_web);

var _configure = require('./configure');

var _System = require('./system/System.jsx');

var _System2 = _interopRequireDefault(_System);

var _System3 = require('./system/System2.jsx');

var _System4 = _interopRequireDefault(_System3);

var _Organization = require('./organization/Organization.jsx');

var _Organization2 = _interopRequireDefault(_Organization);

var _Organization3 = require('./organization/Organization2.jsx');

var _Organization4 = _interopRequireDefault(_Organization3);

var _Organization5 = require('./organization/Organization3.jsx');

var _Organization6 = _interopRequireDefault(_Organization5);

var _Applicant = require('./applicant/Applicant.jsx');

var _Applicant2 = _interopRequireDefault(_Applicant);

var _Applicant3 = require('./applicant/Applicant2.jsx');

var _Applicant4 = _interopRequireDefault(_Applicant3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DApps = function (_Component) {
  _inherits(DApps, _Component);

  function DApps(props) {
    _classCallCheck(this, DApps);

    var _this = _possibleConstructorReturn(this, (DApps.__proto__ || Object.getPrototypeOf(DApps)).call(this, props));

    _this.web3 = new _web2.default();
    _this.web3.setProvider(new _this.web3.providers.HttpProvider(_configure.GETH_RPC));

    var match = location.search.match(/[\?|\&]device=(.*)$/);
    if (match) {
      _this.device = match[1];
    } else {
      _this.device = '';
    }
    return _this;
  }

  _createClass(DApps, [{
    key: 'render',
    value: function render() {
      var className = document.getElementById('app').className;
      if (className == 'system') {
        return _react2.default.createElement(_System2.default, { web3: this.web3 });
      } else if (className == 'system2') {
        return _react2.default.createElement(_System4.default, { web3: this.web3 });
      } else if (className == 'organization') {
        return _react2.default.createElement(_Organization2.default, { web3: this.web3, device: this.device });
      } else if (className == 'organization2') {
        return _react2.default.createElement(_Organization4.default, { web3: this.web3, device: this.device });
      } else if (className == 'organization3') {
        return _react2.default.createElement(_Organization6.default, { web3: this.web3, device: this.device });
      } else if (className == 'applicant') {
        return _react2.default.createElement(_Applicant2.default, { web3: this.web3, device: this.device });
      } else if (className == 'applicant2') {
        return _react2.default.createElement(_Applicant4.default, { web3: this.web3, device: this.device, aTopicName: _configure.APPROVAL_TOPIC_NAME,
          pTopicName: _configure.PERMISSION_TOPIC_NAME });
      } else if (className == 'applicant3') {
        return _react2.default.createElement(_Applicant4.default, { web3: this.web3, device: this.device, aTopicName: _configure.APPROVAL_TOPIC2_NAME,
          pTopicName: _configure.PERMISSION_TOPIC2_NAME });
      }
    }
  }]);

  return DApps;
}(_react.Component);

(0, _reactDom.render)(_react2.default.createElement(DApps, null), document.getElementById('app'));