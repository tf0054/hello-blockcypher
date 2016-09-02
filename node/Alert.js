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

var Alert = function (_Component) {
  _inherits(Alert, _Component);

  function Alert() {
    _classCallCheck(this, Alert);

    return _possibleConstructorReturn(this, (Alert.__proto__ || Object.getPrototypeOf(Alert)).apply(this, arguments));
  }

  _createClass(Alert, [{
    key: 'render',
    value: function render() {
      var _context;

      return _react2.default.createElement(
        _reactBootstrap.Modal,
        { bsSize: 'small', show: this.props.message ? true : false, onHide: (_context = this.props).onHide.bind(_context) },
        _react2.default.createElement(
          _reactBootstrap.Modal.Body,
          null,
          _react2.default.createElement(
            'div',
            { style: { height: 100 } },
            _react2.default.createElement(
              'font',
              { size: '5', color: '#36558f' },
              _react2.default.createElement(
                'font',
                { size: '3' },
                '(＾0＾)'
              ),
              ' ',
              _react2.default.createElement(_reactBootstrap.Glyphicon, { glyph: 'bullhorn' })
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement('br', null),
            this.props.message
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Modal.Footer,
          null,
          this.props.onYes ? _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'success', onClick: (_context = this.props).onYes.bind(_context) },
              'Yes'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
              { bsStyle: 'warning', onClick: (_context = this.props).onHide.bind(_context) },
              'No'
            )
          ) : _react2.default.createElement(
            _reactBootstrap.Button,
            { bsStyle: 'primary', onClick: (_context = this.props).onHide.bind(_context) },
            'OK'
          )
        )
      );
    }
  }]);

  return Alert;
}(_react.Component);

Alert.propTypes = {
  message: _react.PropTypes.string,
  onHide: _react.PropTypes.func.isRequired,
  onYes: _react.PropTypes.func
};
exports.default = Alert;