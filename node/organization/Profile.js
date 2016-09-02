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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Profile = function (_Component) {
  _inherits(Profile, _Component);

  function Profile() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Profile);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Profile.__proto__ || Object.getPrototypeOf(Profile)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      name: '',
      message: null
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Profile, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.profile) {
        this.setState({ name: nextProps.profile.name });
      }
    }
  }, {
    key: 'nameChange',
    value: function nameChange(e) {
      this.setState({ name: e.target.value });
    }
  }, {
    key: 'saveClick',
    value: function saveClick() {
      this.props.onSave({ name: this.state.name });
      this.setState({ message: 'Saved at ' + (0, _moment2.default)().format('HH:mm:ss') });
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            'Name'
          ),
          _react2.default.createElement(_reactBootstrap.FormControl, { type: 'text', value: this.state.name, onChange: this.nameChange.bind(this) })
        ),
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          null,
          _react2.default.createElement(
            _reactBootstrap.Button,
            { bsStyle: 'primary', onClick: this.saveClick.bind(this), disabled: this.state.name.length == 0 },
            'Save'
          ),
          this.state.message ? _react2.default.createElement(
            'span',
            null,
            '  ',
            this.state.message
          ) : ''
        )
      );
    }
  }]);

  return Profile;
}(_react.Component);

Profile.propTypes = {
  profile: _react.PropTypes.shape({
    name: _react2.default.PropTypes.string
  }),
  onSave: _react.PropTypes.func.isRequired
};
exports.default = Profile;