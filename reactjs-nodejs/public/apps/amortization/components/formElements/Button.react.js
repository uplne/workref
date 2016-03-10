import React from 'react'; 

export default class Button extends React.Component {
    handleClick (e) {
        this.props.onClick(e);
    }

    render () {
    	let {
    		title,
    		classNames,
            type
    	} = this.props;

        return (
            (this.props.onClick) ?
                <button className={classNames} type={type} onClick={this.handleClick.bind(this)}>{title}</button> :
                <button className={classNames} type={type}>{title}</button>
        );
    }
}