import React, {useCallback} from 'react';
import HomeBlockElement from "./HomeBlockElement";
import {Link, useNavigate} from "react-router-dom";

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
                    <div style={{width: '160px', height: '210px'}}>
                        <Link to={'/home/' + data.path} className={'link-element'}>
                            <button className={'all-see-button'} style={{
                                height: '100%',
                                width: '100%',
                                marginTop: '0',
                                background: '#464646',
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