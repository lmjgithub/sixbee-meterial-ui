'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _icon = require('../icon');

var _icon2 = _interopRequireDefault(_icon);

var _popover = require('../popover');

var _popover2 = _interopRequireDefault(_popover);

var _control = require('../control');

var _control2 = _interopRequireDefault(_control);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Filter = function (_Component) {
    (0, _inherits3.default)(Filter, _Component);

    function Filter(props) {
        (0, _classCallCheck3.default)(this, Filter);

        var _this = (0, _possibleConstructorReturn3.default)(this, (Filter.__proto__ || (0, _getPrototypeOf2.default)(Filter)).call(this, props));

        _this.state = {
            open: false,
            value: undefined,
            anchorEl: {}
        };

        _this.handleOpen = function (event) {
            _this.setState({
                open: true,
                anchorEl: event.currentTarget
            });
            var type = _this.getFilterType();
            if (type == 'text' || type == 'auto' || type == 'date') {
                setTimeout(function () {
                    _this.refs.control.focus();
                }, 50);
            }
            if (type == 'date-range') {}
        };

        _this.handleRequestClose = function (event) {
            _this.setState({ open: false });
        };

        _this.handleReset = function (event) {
            _this.state.value = undefined;
            _this.refs.control.setValue(undefined);
            _this.filter();
        };

        _this.handleSubmit = function (event) {
            _this.filter();
        };

        _this.initData(props);
        return _this;
    }

    (0, _createClass3.default)(Filter, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(nextProps) {
            this.initData(nextProps);
        }
    }, {
        key: 'initData',
        value: function initData(props) {
            this.state.value = props.value;
        }
    }, {
        key: 'filter',
        value: function filter() {
            this.setState({ open: false });
            if (this.props.onFilter) {
                this.props.onFilter(this.state.value, this.props.field);
            }
        }
    }, {
        key: 'getFilterType',
        value: function getFilterType() {
            return this.props.field.filterType || this.props.field.type;
        }
    }, {
        key: 'render',
        value: function render() {
            var _this2 = this;

            var hintText = void 0;
            var type = this.getFilterType();
            if (type == 'text' || type == 'auto') {
                hintText = '输入关键字查询';
            }
            return _react2.default.createElement(
                'div',
                { ref: 'container', style: { display: 'inline-block', position: 'relative', lineHeight: 1 } },
                _react2.default.createElement(_icon2.default, { type: 'button',
                    name: 'filter-fill',
                    color: this.state.value ? this.props.filterColor : this.props.color,
                    hoverColor: this.props.hoverColor,
                    padding: 2,
                    size: 14,
                    onClick: this.handleOpen }),
                _react2.default.createElement(
                    _popover2.default,
                    { style: { left: -10000 },
                        open: this.state.open,
                        anchorEl: this.state.anchorEl,
                        onRequestClose: this.handleRequestClose },
                    _react2.default.createElement(
                        'div',
                        { className: 'space', style: { width: this.props.field.filterWidth || 'auto' } },
                        _react2.default.createElement(_control2.default, (0, _extends3.default)({
                            ref: 'control',
                            hintText: hintText
                        }, this.props.field, {
                            label: false,
                            value: this.state.value,
                            filter: undefined,
                            hasClear: false,
                            defaultValue: undefined,
                            onEnter: function onEnter(event) {
                                _this2.handleSubmit(event);
                            },
                            type: type,
                            onChange: function onChange(value) {
                                _this2.state.value = value;
                                if (_this2.props.field.onChange) {
                                    _this2.props.field.onChange(value);
                                }
                            } })),
                        _react2.default.createElement(
                            'div',
                            { className: 'flex text-center right', style: { marginTop: 12, flexDirection: 'row-reverse' } },
                            this.props.submit ? _react2.default.createElement(
                                'div',
                                { className: 'text-primary cursor-pointer', style: { marginLeft: 12 }, onClick: this.handleSubmit },
                                this.props.submitLabel
                            ) : null,
                            this.props.reset ? _react2.default.createElement(
                                'div',
                                { className: 'text-muted cursor-pointer', onClick: this.handleReset },
                                this.props.resetLabel
                            ) : null
                        )
                    )
                )
            );
        }
    }]);
    return Filter;
}(_react.Component);

Filter.contextTypes = {
    Table: _propTypes2.default.object,
    state: _propTypes2.default.object,
    props: _propTypes2.default.object,
    setTableState: _propTypes2.default.func,
    handleStateChange: _propTypes2.default.func,
    getDataRows: _propTypes2.default.func
};
Filter.defaultProps = {
    reset: true,
    submit: true,
    resetLabel: '重置',
    submitLabel: '确定',
    filterColor: '#28a7e1',
    hoverColor: '#a1a1a1',
    color: '#bfbfbf',
    field: {},
    onFilter: undefined
};
exports.default = Filter;