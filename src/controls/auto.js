/**
 * Created by zhengzhaowei on 2018/5/21.
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import AutoComplete from 'material-ui/AutoComplete';
import IconButton from 'material-ui/IconButton';
import style from '../style';
import utils from "../utils";

/**
 * 输入文本自动联想
 */
export default class Auto extends Component {

    static defaultProps = {
        supportSearchText: false,   //是否支持文本
        searchText: undefined,      //输入文本
        borderShow: true,           //是否显示下划线
        openOnFocus: true,          //获取焦点时是否显示选项
        hasClear: true,             //最右边是否显示清除按钮
        hasDropDown: false,         //显示所有数据
        labelFixed: false,          //是否固定标签
        disabled: false,            //是否禁止输入
        immutable: false,           //是否不可更改
        dataSourceConfig: {text: 'text', value: 'value'}, //数据配置，text支持多参数，例如{text: '[code] [name]', value: 'value'},
        filter: undefined,          //过滤函数
        reloadDataSource: false,    //是否重载dataSource，主要应用于异步获取数据源，如果是true，dataSource必须为函数
        dataSource: [],             //数据源，支持函数，数组，Promise
        hintText: undefined,        //输入提示
        errorText: undefined,       //错误提示
        maxSearchResults: undefined,//最大的搜索结果
        multiLine: false,           //是否多行显示
        rows: 1,                    //行数
        fullWidth: true,            //宽度100%显示
        events: undefined,
    };

    state = {
        searchText: undefined,      //当前文本
        value: undefined,           //当前选中的值
        dataSource: [],             //数据源
        textFields: [],             //数据配置text解析的参数
        anchorOrigin: {vertical: 'bottom', horizontal: 'left'},
        targetOrigin: {vertical: 'top', horizontal: 'left'},
        focus: false
    };

    static contextTypes = {
        muiTheme: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.initData(props);
        this.setDataSource();
    }

    componentWillReceiveProps(nextProps) {
        this.initData(nextProps);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (_.isEqual(this.state, nextState) && _.isEqual(this.props, nextProps)) {
            return false;
        }
        return true;
    }

    /**
     * 参数初始化处理
     * @param props
     */
    initData = (props) => {
        if (props.hasOwnProperty('value')) {
            this.state.value = props.value;
            if (props.value && this.state.dataSource.length > 0) {
                let data = this.getData(props.value);
                if (data) {
                    this.state.searchText = _.get(data, this.props.dataSourceConfig.text, '');
                }
            }
        }
        if (props.hasOwnProperty('searchText') && props.searchText !== undefined) {
            this.state.searchText = props.searchText;
        }
        if (props.hasOwnProperty('value') && props.searchText === undefined && props.supportSearchText === true) {
            this.state.searchText = props.value;
        }
    };

    /**
     * 根据value获取data
     * @param value
     * @returns {*}
     */
    getData(value) {
        let index = _.findIndex(this.state.dataSource, (o) => {
            return _.get(o, this.props.dataSourceConfig.value) == value;
        });
        return index >= 0 ? this.state.dataSource[index] : undefined;
    }

    /**
     * 设置值，并自动查找对应text填充
     * @param value
     */
    setValue(value) {
        let data = this.getData(value) || {};
        let searchText = this.props.supportSearchText ? value : _.get(data, this.props.dataSourceConfig.text, '');
        this.state.searchText = searchText;
        this.state.value = value;
        this.forceUpdate();
        if (this.props.onChange) {
            this.props.onChange(value, this);
        }
    }

    /**
     * 获取当前值
     * @returns {any}
     */
    getValue() {
        return this.state.value === undefined ? this.props.defaultValue : this.state.value;
    }

    /**
     * 获取当前文本
     * @returns {*}
     */
    getSearchText() {
        return this.state.searchText === undefined ? this.props.searchText : this.state.searchText;
    }

    /**
     * 设置数据源
     * @param dataSource
     */
    setDataSource(dataSource = this.props.dataSource) {
        utils.getDataSource(this.state.searchText, dataSource, this.props.dataSourceConfig, this).then((dataSource) => {
            this.state.dataSource = dataSource;
            let value = this.getValue();
            //设置了value，未设置searchText, 自动从dataSource获取
            if (value !== undefined) {
                let data = this.getData(value);
                if (data) {
                    this.state.searchText = _.get(data, this.props.dataSourceConfig.text, '');
                }
            }
            this.forceUpdate();
        });
    };

    /**
     * 事件 - 文本输入触发
     * @param searchText
     */
    handleUpdateInput = (searchText) => {
        if (!this.props.immutable) {
            //可输入
            if (this.props.supportSearchText) {
                this.setValue(searchText);
            } else {
                this.setState({searchText: searchText, value: undefined});
            }
            if (this.props.reloadDataSource) {
                //重载数据源
                utils.getDataSource(searchText, this.props.dataSource, this.props.dataSourceConfig).then(dataSource => {
                    this.setState({dataSource: dataSource})
                });
            }
        }
    };

    /**
     * 事件 - 菜单关闭时触发
     * @param event
     */
    handleClose = (event) => {
        setTimeout(() => {
            let value = this.getValue();
            if ((value === undefined || value === '') && !this.props.supportSearchText) {
                //没选择值，清除输入文本
                this.setState({searchText: ''});
            }
        }, 100);
    };

    /**
     * 事件 - 选择菜单项后触发
     * @param chosenRequest
     * @param index
     */
    handleNewRequest = (chosenRequest, index) => {
        if (index == -1) {
            return;
        }
        let value = chosenRequest[this.props.dataSourceConfig.value];
        this.setValue(value);
    };

    /**
     * 事件 - 点击清除
     * @param event
     */
    handleClear = (event) => {
        this.setValue(null);
        if (this.props.onClear) {
            this.props.onClear(event, this);
        }
    };

    /**
     * 事件 - 得到焦点
     * @param event
     */
    handleFocus = (event) => {
        this.setState({focus: true});
        if (this.props.onFocus) {
            this.props.onFocus(event, this);
        }
    };

    /**
     * 事件 - 失去焦点
     * @param event
     */
    handleBlur = (event) => {
        this.setState({focus: false});
        if (this.props.onBlur) {
            this.props.onBlur(event, this);
        }
    };

    /**
     * 事件 - 键盘按起
     * @param event
     */
    handleKeyUp = (event) => {
        if (this.props.onKeyUp) {
            this.props.onKeyUp(event, this);
        }
    };

    /**
     * 过滤
     * @param searchText
     * @param key
     */
    filter = (searchText, key) => {
        return searchText == '' || key.indexOf(searchText) !== -1
    };

    render = () => {
        let borderStyle = this.props.borderStyle || this.context.muiTheme.controlBorderStyle || 'underline';
        let value = this.getValue() || '';
        let searchText = this.getSearchText() || '';
        let styleProps = _.merge(style.getStyle('auto', this.props), this.props.styleProps);
        let label = this.props.label;
        if (borderStyle == 'border') {
            styleProps.iconStyle.style.right = 0;
            styleProps.iconStyle.style.top = 3;
        }
        let autoComplete = <AutoComplete
            ref={"auto"}
            filter={this.props.filter || this.filter}
            name={this.props.name || this.props.dataKey || utils.uuid()}
            fullWidth={this.props.fullWidth}
            floatingLabelText={label}
            value={value}
            searchText={searchText}
            disabled={this.props.disabled}
            hintText={_.isFunction(this.props.hintText) ? this.props.hintText(this.props) : this.props.hintText}
            errorText={borderStyle === 'underline' ? this.props.errorText : undefined}
            floatingLabelFixed={this.props.labelFixed}
            underlineShow={borderStyle === 'underline' && this.props.borderShow}
            dataSource={this.state.dataSource}
            dataSourceConfig={this.props.dataSourceConfig}
            maxSearchResults={this.props.maxSearchResults}
            openOnFocus={this.props.openOnFocus}
            onClose={this.handleClose}
            onFocus={this.handleFocus}
            onBlur={this.handleBlur}
            onKeyUp={this.handleKeyUp}
            onNewRequest={this.handleNewRequest}
            onUpdateInput={this.handleUpdateInput}
            multiLine={this.props.multiLine}
            rows={this.props.rows}
            rowsMax={this.props.rowsMax}
            textFieldStyle={{...styleProps.style, ...this.props.style}}
            textareaStyle={styleProps.textareaStyle}
            floatingLabelStyle={styleProps.floatingLabelStyle}
            floatingLabelFocusStyle={styleProps.floatingLabelFocusStyle}
            floatingLabelShrinkStyle={styleProps.floatingLabelShrinkStyle}
            errorStyle={styleProps.errorStyle}
            hintStyle={styleProps.hintStyle}
            underlineStyle={styleProps.underlineStyle}
            inputStyle={styleProps.inputStyle}
            menuProps={styleProps.menuProps}
            menuStyle={styleProps.menuStyle}
            disableFocusRipple={true}
            style={styleProps.style}
            anchorOrigin={this.state.anchorOrigin}
            targetOrigin={this.state.targetOrigin}
            popoverProps={styleProps.popoverProps}
        />;
        return (
            <div className="flex middle between" ref={"container"} style={this.props.rootStyle}>
                <div style={{flexGrow: 1, position: 'relative'}}>
                    {
                        borderStyle === 'border' && this.props.borderShow ?
                            <div className="full-width">
                                <div
                                    className={"control-border" + (this.state.focus ? ' focus' : '') + (this.props.errorText ? ' error' : '')}>{autoComplete}</div>
                                <div className="text-small text-danger"
                                     style={{marginTop: 2}}>{this.props.errorText}</div>
                            </div> : autoComplete
                    }

                    {
                        (value !== undefined && value !== null && value !== '') && this.props.hasClear && !this.props.disabled && !this.props.immutable ?
                            <IconButton iconClassName="iconfont icon-close-circle-fill" onClick={this.handleClear}
                                        style={{
                                            position: 'absolute',
                                            ...styleProps.iconStyle.style
                                        }}
                                        iconStyle={{color: "rgba(0,0,0,0.3)", ...styleProps.iconStyle.iconStyle}}

                            /> : null
                    }
                </div>
                {
                    this.props.events ?
                        <div style={{
                            position: 'relative',
                            top: borderStyle === "underline" ? 18 : 0,
                            paddingLeft: 6,
                            width: this.props.events.length * 20 + 6,
                            paddingBottom: 1,
                            height: 30
                        }}
                             className="flex middle center">
                            {
                                this.props.events.map((event) => {
                                    return <IconButton iconStyle={{color: '#aaa', fontSize: 20, ...event.iconStyle}}
                                                       title={event.title}
                                                       iconClassName={"iconfont icon-" + event.icon}
                                                       onClick={event.onClick.bind(this, this)}
                                                       style={event.style}
                                    />
                                })
                            }
                        </div> : null
                }
            </div>
        )
    }

}
