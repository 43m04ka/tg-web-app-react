import React from 'react';

const CardProduct = (mainData) => {
    const itemData = mainData.mainData
    console.log(itemData)
    return (
        <div>
            <span>{'Page '+itemData.title}</span>
        </div>
    );
};

export default CardProduct;