import React from 'react'; 

export default class TextField extends React.Component {
    constructor (props) {
        super();
    }

    handleChange (e) {
        const id = this.props.id;
        this.props.onChange(id, e.target.value);
    }

    render () {
    	let {
    		id,
    		classNames,
            value
    	} = this.props;

    	let inputProps = {
    		id: id,
    		className: classNames,
            value: value
    	};

        return (
            <input {...inputProps} type="text" onChange={this.handleChange.bind(this)} />
        );
    }
}