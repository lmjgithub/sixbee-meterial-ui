/**
 * Created by zhengzhaowei on 2018/5/21.
 */

import React, {Component} from 'react';
import RaisedButton from 'material-ui/RaisedButton';


/**
 * props:
 * label 标题
 * defaultValue 默认值
 * icon 图标类
 * errorText 错误信息
 * fullWidth 宽度是否100%显示
 * options 选项
 * onChange 事件
 */
export default class File extends Component {

    static defaultProps = {
        label: '选择上传文件'
    };

    state = {
        file: {}
    };

    constructor(props) {
        super(props);
        this.initData(props);
    }

    componentWillReceiveProps(nextProps) {
        this.initData(nextProps);
    }

    initData(props) {
        if(props.value !== undefined) {
            this.state.value = props.value;
        }
    }

    /**
     * 获取文件扩展名
     * @param name
     * @returns {string}
     */
    getFileExtName(name = this.state.file.name) {
        return name.substring(name.lastIndexOf(".") + 1, name.length);
    }

    handleChange = (event) => {
        let file = this.refs.file.files[0];
        let extName = this.getFileExtName(file.name);
        if(this.props.accept && this.props.accept.indexOf('.' + extName) == -1) {
            alert('请选择正确的文件类型：' + this.props.accept);
            return false;
        }
        this.setState({file: file});
        if (this.props.onChange) {
            this.props.onChange(file, this);
        }
    };

    render() {
        return <div style={{padding: '8px 0'}}>
            <RaisedButton
                label={this.props.label}
                labelPosition="before"
                containerElement="label"
                style={{position: 'relative'}} buttonStyle={this.props.buttonStyle} labelStyle={this.props.labelStyle}
            >
                <input key="file"
                       ref="file"
                       type="file"
                       style={{
                           position: 'absolute',
                           left: 0,
                           right: 0,
                           top: 0,
                           bottom: 0,
                           opacity: 0,
                           zIndex: 1,
                           cursor: 'pointer'
                       }}
                       accept={this.props.accept}
                       onChange={this.handleChange}/>
            </RaisedButton>
            <div style={{padding: 4}}>{this.state.file.name}</div>
            <div className="text-danger">{this.props.errorText}</div>
        </div>
    }

}
