import React from 'react';
import HomeBlockElement from "../HomeBlockElement";

const HomeBlock = ({path, data}) => {
    return (
        <div className={"homeBlock"}>
            <div className={"titleBlock"}>{data.name}</div>
            <div className={"scroll-container"}>
                {data.body.map(item => (
                        <HomeBlockElement key={item.id} path={data.path} data={item} />
                    ))}
            </div>
        </div>
    );
};

export default HomeBlock;