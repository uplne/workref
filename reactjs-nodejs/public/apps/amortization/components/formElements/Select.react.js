import React from 'react'; 

export default class Select extends React.Component {
    handleClick (e) {
        this.props.onClick(e);
    }

    render () {
    	let {
            classNames,
            options,
            activeOption
        } = this.props;

        let inputProps = {
            className: classNames
        };

        return (
            <select {...inputProps} value={activeOption}>
                {options.map((option, i) => {
                    return (
                        <option key={i} value={i}>{option}</option>
                    )
                })}
            </select>
        );
    }
}