import React, {useState} from 'react';
import '../styles/cube.css';

const Roulette = () => {
    return (
        <div>
            <input type='radio' name='faceopt' id='front' className='faceopt' checked/>
            <label htmlFor='front'>Front</label>
            <input type='radio' name='faceopt' id='left' className='faceopt'/>
            <label htmlFor='left'>Left</label>
            <input type='radio' name='faceopt' id='back' className='faceopt'/>
            <label htmlFor='back'>Back</label>
            <input type='radio' name='faceopt' id='right' className='faceopt'/>
            <label htmlFor='right'>Right</label>
            <div className='house'>
                <div className='face front'>Front</div>
                <div className='face back'>Back</div>
                <div className='face right'>Right</div>
                <div className='face left'>Left</div>
            </div>
        </div>
    );
};

export default Roulette;