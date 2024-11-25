import React from 'react';

const HomeBlock = ({path, data}) => {
    return (
        <div className={"homeBlock"}>
            <div className={"titleBlock"}>{data.name}</div>
        </div>
    );
};

export default HomeBlock;