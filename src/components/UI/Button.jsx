import React from 'react';
import '../styles/style.css';

const Button = (props) => {
    return (
        <button {...props} className={'button' + props.className} />
    );
};

export default Button;