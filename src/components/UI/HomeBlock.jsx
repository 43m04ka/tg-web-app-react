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
                <div className={'box-home-block-element home-block-element'}>
                    <div style={{width: '160px', height: '157px'}}>
                        <Link to={'/home/' + data.path} className={'link-element'}>
                            <button className={'all-see-button'} style={{
                                height: '50px',
                                width: '100px',
                                marginTop: '85px',
                                background: '#232323',
                                border: '2px black solid'
                            }}>Смотреть больше
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
            <Link to={'/home/' + data.path} className={'link-element'}>
                <button className={'all-see-button'}>Открыть каталог</button>
            </Link>
        </div>
    );
};

export default HomeBlock;