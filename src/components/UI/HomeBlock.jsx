import React, {useCallback} from 'react';
import HomeBlockElement from "./HomeBlockElement";
import {Link, useNavigate} from "react-router-dom";
import Button from "./Button";

const HomeBlock = ({path, data}) => {


    return (
        <div className={"homeBlock"}>
            <div className={"title"}>{data.name}</div>
            <div className={"scroll-container"}>
                {data.body.slice(0, 6).map(item => (
                        <HomeBlockElement key={item.id} path={data.path} data={item}/>
                    )
                )}
                <div className={'home-block-element'}></div>
                </div>
                <Link to={'/home/' + data.path} className={'link-element'}>
                <button className={'all-see-button'}>Открыть каталог</button>
            </Link>
        </div>
    );
};

export default HomeBlock;