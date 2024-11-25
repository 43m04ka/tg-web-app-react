import React from 'react';

const HomeBlockElement = ({path, data}) => {
    return (
        <div className={'home-block-element'}>
            <img src={data.img} alt={data.name} className={'img'} />
        </div>
    );
};

export default HomeBlockElement;