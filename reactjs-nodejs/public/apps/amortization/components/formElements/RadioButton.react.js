import React from 'react'; 

export default class RadioButton extends React.Component {
    handleClick (e) {
        this.props.onClick(e);
    }

    render () {
    	let {
            id,
            name,
            classNames,
            label,
            defaultChecked
        } = this.props;

        let inputProps = {
            id: id,
            name: name,
            className: classNames
        };

        return (
            <span>
                <input {...inputProps} type="radio" defaultChecked={defaultChecked} />
                <label className="radio__label" htmlFor={inputProps.id}>{label}</label>
            </span>
        );
    }
}