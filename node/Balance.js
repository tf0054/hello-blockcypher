'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Balance = function (_Component) {
  _inherits(Balance, _Component);

  function Balance() {
    _classCallCheck(this, Balance);

    return _possibleConstructorReturn(this, (Balance.__proto__ || Object.getPrototypeOf(Balance)).apply(this, arguments));
  }

  _createClass(Balance, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.FormGroup,
        null,
        _react2.default.createElement(
          _reactBootstrap.ControlLabel,
          null,
          'Balance'
        ),
        _react2.default.createElement(
          _reactBootstrap.FormControl.Static,
          null,
          this.props.balance.toString(10),
          ' wei',
          _react2.default.createElement('br', null),
          '( = ',
          this.props.web3.fromWei(this.props.balance, 'ether').toString(10),
          ' ether)'
        )
      );
    }
  }]);

  return Balance;
}(_react.Component);

Balance.propTypes = {
  web3: _react.PropTypes.object.isRequired,
  balance: _react.PropTypes.object.isRequired
};
exports.default = Balance;