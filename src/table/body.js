import React, {Component} from 'react';
import PropTypes from 'prop-types'
import _ from 'lodash';
import Checkbox from 'material-ui/Checkbox';
import {Scrollbars} from 'react-custom-scrollbars';
import RefreshIndicator from 'material-ui/RefreshIndicator'
import $ from 'jquery';
import Icon from '../icon';

/**
 * 表体数据
 */
export default class TableBody extends Component {

    static contextTypes = {
        state: PropTypes.object,
        props: PropTypes.object,
        setTableState: PropTypes.func,
        handleStateChange: PropTypes.func,
        getDataRows: PropTypes.func
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (this.refs.scrollBar) {
            if (this.context.props.scrollTop) {
                this.refs.scrollBar.scrollTop(this.context.props.scrollTop);
            }
            if (this.context.props.scrollLeft) {
                this.refs.scrollBar.scrollLeft(this.context.props.scrollLeft);
            }
        }
    }

    handleScroll = (event) => {
        let scrollTop = this.refs.scrollBar.getScrollTop();
        let scrollLeft = this.refs.scrollBar.getScrollLeft();
        this.refs.tbody.showData(scrollTop);
        this.context.handleStateChange({
            scrollTop: scrollTop,
            scrollLeft: scrollLeft
        });
        if (this.props.onScroll) {
            this.props.onScroll(event);
        }
    };

    showMasker = () => {
        this.hasMasker = true;
        $(this.refs.masker).fadeIn();
    };

    hideMasker = () => {
        this.hasMasker = false;
        $(this.refs.masker).fadeOut();
    };

    render() {
        let state = this.context.state;
        let props = this.context.props;
        let className = 'table';
        if (props.bordered) className += ' bordered';
        if (props.condensed) className += ' condensed';
        if (props.bodyCellMultiLine) className += ' multi-line';
        if (props.striped) className += ' striped';
        if (props.className) className += ' ' + props.className;
        let table = <table
            ref="table"
            className={className}
            style={{tableLayout: 'fixed', width: state.tableWidth}}>
            <TableBodyColGroup ref="thead"/>
            <TableBodyContent ref="tbody"/>
        </table>;
        return <div ref="container"
                    className="table-body"
                    style={{
                        overflow: 'hidden',
                        position: 'relative',
                        width: state.containerWidth,
                        height: state.bodyHeight,
                        marginTop: -1,
                        ...props.bodyStyle
                    }}
                    onScroll={this.handleScroll}>
            {
                props.loading ? <div ref="masker" className="masker" style={{zIndex: 1}}>
                    <div className="position-center">
                        <RefreshIndicator size={50}
                                          left={-25}
                                          top={-25}
                                          percentage={100}
                                          status="loading"
                                          loadingColor="#28a7e1"
                                          style={{backgroundColor: 'transparent', boxShadow: 'none'}}
                        />
                    </div>
                </div> : null
            }

            {
                state.dataSource.length == 0 && !props.loading ?
                    <div className="position-center text-center">
                        <div>
                            <div><img src={props.emptyDataImage} style={{width: 200}}/></div>
                            <div style={{marginLeft: -8}}>{props.emptyDataTip}</div>
                        </div>
                    </div> : null
            }
            {
                props.containerHeight || state.bodyHeight ?
                    <Scrollbars ref="scrollBar"
                                renderTrackHorizontal={({style, ...props}) =>
                                    <div {...props} style={{
                                        ...style,
                                        height: 12,
                                        bottom: 2,
                                        left: 2,
                                        right: 2,
                                        borderRadius: 3,
                                        zIndex: 1,
                                    }}/>
                                }
                                renderThumbHorizontal={({style, ...props}) =>
                                    <div {...props} style={{
                                        ...style,
                                        height: 12,
                                        cursor: 'pointer',
                                        borderRadius: 'inherit',
                                    }}>
                                        <div style={{
                                            position: 'relative',
                                            top: 4,
                                            height: 8,
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: 'inherit'
                                        }}></div>
                                    </div>
                                }
                                renderTrackVertical={({style, ...props}) =>
                                    <div {...props} style={{
                                        ...style,
                                        width: 12,
                                        right: 2,
                                        bottom: 2,
                                        top: 2,
                                        borderRadius: 3,
                                        zIndex: 1,
                                    }}/>
                                }
                                renderThumbVertical={({style, ...props}) =>
                                    <div {...props} style={{
                                        ...style,
                                        width: 12,
                                        cursor: 'pointer',
                                        borderRadius: 'inherit'
                                    }}>
                                        <div style={{
                                            position: 'relative',
                                            left: 4,
                                            width: 8,
                                            height: '100%',
                                            backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                            borderRadius: 'inherit'
                                        }}></div>
                                    </div>
                                }
                                style={{
                                    width: '100%',
                                    height: '100%'
                                }}
                                autoHeight={false}
                    >
                        {table}
                    </Scrollbars> : table
            }
        </div>
    }

}

class TableBodyContent extends Component {

    static contextTypes = {
        Table: PropTypes.object,
        state: PropTypes.object,
        props: PropTypes.object,
        setTableState: PropTypes.func,
        getDataRows: PropTypes.func,
        cellRender: PropTypes.func,
    };

    state = {
        showMinRows: 0,
        showMaxRows: 30,
        scrollTop: 0,
        rowHeight: {},
        isSameHeight: true
    };

    constructor(props) {
        super(props);
    }

    componentWillReceiveProps(nextProps) {
        this.handleShowRows(this.context.state.scrollTop);
    }

    componentDidMount() {
        this.showData(this.context.state.scrollTop);
    }

    /**
     * 处理行高
     */
    handleRowHeight(list) {
        let state = this.context.state;
        let props = this.context.props;
        this.state.isSameHeight = true;
        this.state.rowHeight = {};
        list.map((data) => {
            let height = props.bodyRowHeight;
            state.dataColumns.map((column) => {
                if (column.groupKey) {
                    let group = _.get(data, column.groupKey);
                    height = Math.max(height, group.length * props.bodyRowHeight)
                }
            });
            if (height != props.bodyRowHeight) {
                this.state.isSameHeight = false;
            }
            this.state.rowHeight[data[props.primaryKey]] = height;
        });
    }

    /**
     * 是否勾选
     * @param data
     * @returns {*|boolean}
     */
    isChecked(data) {
        let state = this.context.state;
        let props = this.context.props;
        return state.checked[data[props.primaryKey]] || false;
    }

    /**
     * 处理显示的行数
     * @param scrollTop
     */
    handleShowRows(scrollTop) {
        let state = this.context.state;
        let props = this.context.props;
        let list = this.handleCollapsedData();
        this.handleRowHeight(list);
        let rows = list.length;
        let showMinRows = 0, showMaxRows = Math.max(rows - 1, 0);
        if (this.state.isSameHeight) {
            //相同行高
            if (props.bodyRowHeight * rows < 2000) {
                this.state.showMinRows = showMinRows;
                this.state.showMaxRows = showMaxRows;
                this.state.scrollTop = scrollTop;
                return true;
            }
            let bodyHeight = state.bodyHeight || $(window).height();
            let showRows = parseInt(bodyHeight / props.bodyRowHeight) + 8;
            showMinRows = Math.max(parseInt(scrollTop / props.bodyRowHeight) - 4, 0);
            showMaxRows = Math.min(showMinRows + showRows, list.length - 1);
        } else {
            let height = 0;
            showMinRows = list.length;
            showMaxRows = -1;
            list.map((row, rowIndex) => {
                let top = height;
                height += this.state.rowHeight[row[props.primaryKey]];
                let bottom = height;
                if (Math.abs(top - scrollTop) <= 1500 || Math.abs(bottom - scrollTop) <= 1500 || (top < scrollTop && bottom > scrollTop)) {
                    showMinRows = Math.min(showMinRows, rowIndex);
                    showMaxRows = Math.max(showMaxRows, rowIndex);
                }
            });
        }
        let diff = Math.abs(this.state.scrollTop - scrollTop);
        if (diff <= 2 && diff > 0 || this.state.showMinRows == showMinRows && this.state.showMaxRows == showMaxRows) {
            return false;
        }
        this.state.scrollTop = scrollTop;
        this.state.showMinRows = showMinRows;
        this.state.showMaxRows = showMaxRows;
        return true;
    }

    /**
     * 处理折叠
     * @param data
     * @returns {Function}
     */
    handleCollapse = (data) => (event) => {
        let state = this.context.state;
        let primaryKey = this.context.props.primaryKey;
        let collapsed = state.collapsed[data[primaryKey]];
        if (collapsed) {
            delete state.collapsed[data[primaryKey]];
        } else {
            state.collapsed[data[primaryKey]] = true;
        }
        //处理子节点
        let displayChildren = (children, collapsed) => {
            children.map((child) => {
                if (collapsed) {
                    //隐藏
                    state.collapsedHidden[child[primaryKey]] = true;
                } else {
                    //显示
                    delete state.collapsedHidden[child[primaryKey]];
                }
                if (child.children && child.children.length > 0) {
                    displayChildren(child.children, collapsed || state.collapsed[child[primaryKey]]);
                }
            });
        };
        if (data.children && data.children.length > 0) {
            displayChildren(data.children, !collapsed);
        }
        this.context.setTableState({collapsed: state.collapsed, collapsedHidden: state.collapsedHidden})
    };

    /**
     * 处理折叠后的数据
     */
    handleCollapsedData() {
        let data = [];
        let state = this.context.state;
        state.dataRows.map((row) => {
            if (!state.collapsedHidden[row[this.context.props.primaryKey]]) {
                data.push(row);
            }
        });
        return data;
    }

    /**
     * 显示数据
     */
    showData(scrollTop) {
        if (this.handleShowRows(scrollTop)) {
            this.forceUpdate();
        }
    }

    /**
     * 是否显示
     * @param rowIndex
     * @returns {boolean}
     */
    isRowShow(rowIndex) {
        return rowIndex >= this.state.showMinRows && rowIndex <= this.state.showMaxRows;
    }

    /**
     * 前部分未渲染内容的高度
     * @param list
     * @returns {number}
     */
    getTopHeight(list) {
        let height = 0;
        for (let i = 0; i < this.state.showMinRows && i < list.length; i++) {
            let data = list[i];
            height += this.state.rowHeight[data[this.context.props.primaryKey]];
        }
        return height;
    }

    /**
     * 后部分未渲染内容的高度
     * @param list
     * @returns {number}
     */
    getBottomHeight(list) {
        let height = 0;
        for (let i = this.state.showMaxRows + 1; i < list.length; i++) {
            let data = list[i];
            height += this.state.rowHeight[data[this.context.props.primaryKey]];
        }
        return height;
    }

    /**
     * 选择行
     * @param data
     * @returns {Function}
     */
    handleRowSelect = (data) => (event) => {
        let props = this.context.props;
        if (props.rowSelect) {
            if (data) {
                this.context.setTableState({
                    selectedRow: data
                });
                if (props.onRowSelect) {
                    props.onRowSelect(data)
                }
            }
        }
    };

    /**
     * 勾选事件
     * @param data
     * @returns {Function}
     */
    handleCheck = (data) => (event, isInputChecked) => {
        let state = this.context.state;
        let props = this.context.props;
        if (isInputChecked) {
            state.checked[data[props.primaryKey]] = true;
        } else {
            delete state.checked[data[props.primaryKey]];
        }
        if (props.onCheck) {
            props.onCheck(state.checked);
        }
        this.context.setTableState({
            checked: state.checked
        });
    };

    render() {
        let state = this.context.state;
        let props = this.context.props;
        let hasChildren = false;
        let rows = this.context.getDataRows();
        rows.map((row) => {
            if (row.children && row.children.length > 0) {
                hasChildren = true;
            }
        });
        let list = this.handleCollapsedData();
        this.handleRowHeight(list);
        let topHeight = this.getTopHeight(list);
        let bottomHeight = this.getBottomHeight(list);
        let topHideNum = 0;
        for (let i = 0; i < list.length; i++) {
            if (!this.isRowShow(i)) {
                topHideNum++;
            } else {
                break;
            }
        }
        return <tbody ref="tbody">
        {
            topHeight > 0 ? <tr>
                {this.props.showCheckboxes ?
                    <td style={{height: topHeight, padding: 0}}></td> : null}
                {state.dataColumns.map((column, colIndex) => {
                    return <td key={colIndex}
                               style={{height: topHeight, padding: 0}}>
                    </td>
                })}
            </tr> : null
        }
        {
            topHeight > 0 && topHideNum % 2 == 0 ? <tr></tr> : null
        }
        {
            list.map((data, rowIndex) => {
                if (!this.isRowShow(rowIndex)) {
                    return null;
                }
                return <tr key={data[props.primaryKey] + '' + rowIndex}
                           data-key={data[props.primaryKey]}
                           className={`${props.iconEventsBehavior}`}
                           onClick={this.handleRowSelect(data)}
                >
                    {
                        props.showCheckboxes ?
                            <td className="td-checkbox">
                                {
                                    (!props.rowCheckboxEnabled || props.rowCheckboxEnabled(data)) ?
                                        <Checkbox checked={this.isChecked(data)}
                                                  onCheck={this.handleCheck(data)} {...props.checkboxStyle}/> :
                                        <div style={{
                                            display: 'inline-block',
                                            width: 16,
                                            height: 16,
                                            background: '#b9b9b9',
                                            opacity: 0.65,
                                            borderRadius: 2,
                                            cursor: 'not-allowed'
                                        }}></div>
                                }
                            </td> : null
                    }
                    {
                        state.dataColumns.map((column, colIndex) => {
                            let content = () => {
                                let value = _.get(data, column.dataKey || column.key);
                                if (column.groupKey) {
                                    let group = _.get(data, column.groupKey);
                                    return <div style={{width: '100%', overflow: 'hidden'}}>
                                        {group.map((row, index) => {
                                            if (rowIndex < this.state.showMinRows || rowIndex > this.state.showMaxRows) {
                                                return <div key={index} className="td" style={{height: props.bodyRowHeight, lineHeight: (props.bodyRowHeight - 12) + 'px'}}></div>;
                                            }
                                            return <div key={index} className="td" style={{height: props.bodyRowHeight, lineHeight: (props.bodyRowHeight - 12) + 'px'}}>
                                                {column.render ? column.render(row, column, this.context.Table) : this.context.cellRender(row, column)}
                                            </div>
                                        })}
                                    </div>
                                } else if (column.render) {
                                    return column.render(data, column, this.context.Table);
                                } else if (_.isObject(value)) {
                                    return value;
                                } else {
                                    return this.context.cellRender(data, column);
                                }
                            };
                            return <td key={colIndex} className={column.iconEvents ? 'icons-event-td' : ''}
                                       style={{
                                           textAlign: column.textAlign || 'left',
                                           height: props.bodyRowHeight,
                                           ...(column.groupKey ? {padding: 0} : {}),
                                           ...(_.isFunction(column.style) ? column.style(data) : column.style || {})
                                       }}>
                                {
                                    (() => {
                                        if (column.onClick) {
                                            return <span className='text-primary cursor-pointer'
                                                         onClick={column.onClick ? column.onClick.bind(this, data) : undefined}>
                                                {content()}
                                            </span>;
                                        } else if ((hasChildren && data[`${column.key}_indent`] !== undefined) || (!hasChildren && data[`${column.key}_indent`] > 0)) {
                                            let indent = data[`${column.key}_indent`];
                                            let text = <span style={{
                                                display: 'table-cell',
                                                verticalAlign: 'middle',
                                                lineHeight: 1
                                            }} onClick={column.onClick ? column.onClick.bind(this, data) : undefined}>
                                                        {content()}
                                            </span>;
                                            return <div
                                                className={`${column.onClick ? 'text-primary cursor-pointer' : ''}`}
                                                style={{paddingLeft: indent, lineHeight: 1}}>
                                                {
                                                    props.collapsible ? <div className="flex middle">
                                                        <div style={{opacity: data.children.length > 0 ? 1 : 0}}>
                                                            <Icon type="button"
                                                                  name={state.collapsed[data[props.primaryKey]] ? "plus-square" : "minus-square"}
                                                                  size={14}
                                                                  padding={4}
                                                                  onClick={this.handleCollapse(data)}
                                                            />
                                                        </div>
                                                        {text}
                                                    </div> : text
                                                }


                                            </div>;
                                        } else {
                                            return content();
                                        }
                                    })()
                                }
                                {
                                    (() => {
                                        if (column.iconEvents) {
                                            let label = {
                                                add: '新增',
                                                edit: '修改',
                                                delete: '删除',
                                                setting: '设置'
                                            };
                                            let events = [];
                                            if (_.isFunction(column.iconEvents)) {
                                                events = column.iconEvents(data, column);
                                            } else {
                                                events = column.iconEvents;
                                            }
                                            return <div className="icons-event">
                                                {
                                                    events.map((event, key) => {
                                                        return <Icon key={key}
                                                                     type="button"
                                                                     name={`icon-${event}`}
                                                                     title={label[event]}
                                                                     onClick={props.iconEvents[event].bind(this, data, column, this.context.Table)}/>
                                                    })
                                                }
                                            </div>
                                        } else {
                                            return null;
                                        }
                                    })()
                                }
                            </td>
                        })
                    }
                    {
                        state.extraColumnWidth > 0 ? <td className="extra"></td> : null
                    }
                </tr>
            })
        }
        {
            bottomHeight > 0 ? <tr>
                {props.showCheckboxes ?
                    <td style={{height: bottomHeight, padding: 0}}></td> : null}
                {state.dataColumns.map((column, colIndex) => {
                    return <td key={colIndex}
                               style={{height: bottomHeight, padding: 0}}>
                    </td>
                })}
            </tr> : null
        }
        </tbody>
    }
}

/**
 * 表体列宽度定义
 */
class TableBodyColGroup extends Component {

    static contextTypes = {
        state: PropTypes.object,
        props: PropTypes.object,
        setTableState: PropTypes.func
    };

    constructor(props) {
        super(props);
    }

    render() {
        let state = this.context.state;
        let props = this.context.props;
        let nodes = [];
        if (props.showCheckboxes) {
            nodes.push(
                <th span={1}
                    key={-1}
                    style={{width: props.checkboxColumnWidth, padding: 0, height: 0}}>
                </th>
            );
        }
        nodes = nodes.concat(state.dataColumns.map((column, index) => {
            let key = column.key;
            let width = state.columnWidths[key] || 'auto';
            return <th span={1}
                       key={index}
                       style={{
                           width: width,
                           maxWidth: width,
                           padding: 0,
                           height: 0
                       }}>
            </th>;
        }));
        if (state.extraColumnWidth > 0) {
            nodes.push(<th span={1}
                           key={state.dataColumns.length}
                           style={{width: 'auto', padding: 0, height: 0}}></th>);
        }
        return <thead>
        <tr>
            {nodes}
        </tr>
        </thead>
    };
}