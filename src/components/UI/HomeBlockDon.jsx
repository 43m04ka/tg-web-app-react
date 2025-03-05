import React, {useCallback} from 'react';
import {Link, useNavigate} from "react-router-dom";

const HomeBlock = ({data}) => {


    return (
        <div className={"homeBlock"}>
            <div className={"title"}>{data.name}</div>
            <div className={"scroll-container"}>
                {data.body.slice(0, 6).map(item => (
                        <div className={'home-block-element'}>
                            <Link to={'/home/' + item.path} className={'link-element'}>
                                <div className={'box-home-block-element'}>
                                    <div style={{
                                        backgroundImage: 'url("' + item.img + '+")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: 'cover',
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'end',
                                        justifyContent: 'space-between',
                                    }} className={'img-home'}>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default HomeBlock;