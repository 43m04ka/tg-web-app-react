import React, {useEffect} from 'react';

const ElementSlider = ({img, height}) => {

    return (
        <div>
            <img src = {img} id={'box'} alt={''} style={{width: String(height)+'px',   marginBottom:'15px', transitionProperty:'width', transitionDuration:'0.2s'}}/>
        </div>
    );
};

export default ElementSlider;