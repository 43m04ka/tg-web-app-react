import React, {useEffect} from 'react';

const ElementSlider = ({img}) => {
    const [width, setWidth] = React.useState((window.innerWidth-15)/3);
    const [status, setStatus] = React.useState(false);
    const elementRef = React.createRef();

    const delayedMessage = () => {
        setTimeout(() => {delayedMessage();}, 500);
    }
    useEffect(() => {
        delayedMessage()
    }, []);
    return (
        <div>
            <img src = {img} ref={elementRef} id={'box'} alt={''} style={{width: width, marginBottom:'15px'}}/>
        </div>
    );
};

export default ElementSlider;