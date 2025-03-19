import React, {useCallback} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "./ProductItem";

const HomeBlock = ({data}) => {

    let styleBlock = {}
    if(data.type === 1){
        if (data.backgroundColor !== 'none' && typeof data.backgroundColor !== 'undefined') {
            styleBlock = {background: data.backgroundColor, paddingTop: '10px', paddingLeft:'7px', paddingRight:'7px', paddingBottom:'10px'}
        } else {
            styleBlock = {paddingTop: '0px', paddingLeft:'7px', paddingRight:'7px', paddingBottom:'10px'}
        }
    }
    else {
        if (data.backgroundColor !== 'none') {
            styleBlock = {background: data.backgroundColor, paddingBottom: '10px', paddingTop: '15px', marginTop:'0px'}
        } else {
            styleBlock = {paddingBottom: '10px', paddingTop: '3px', marginTop:'0px'}
        }
    }
    console.log(data);
    if (data.type !== 1) {
        return (
            <div className={"homeBlock"}
                 style={styleBlock}>
                <div className={"title"} style={{marginBottom:'0px'}}>{data.name}</div>
                <div className={"scroll-container"} style={{alignItems: 'center'}}>
                    <div style={{width: '10px'}}>
                        <div style={{width: '10px'}}/>
                    </div>
                    {data.body.slice(0, 6).map(item => (
                            <div style={{marginRight: '5px'}}>
                                <ProductItem key={item.id} product={item}/>
                            </div>
                        )
                    )}
                    <div className={'box-home-block-element home-block-element'}>
                        <div style={{
                            marginLeft: '2px', marginRight: '7px', border: '0px solid #454545',
                            borderRadius: '7px', padding: '5px'
                        }}>
                            <Link to={'/home/' + data.path} className={'link-element'}>
                                <div className={'background-arrow'} style={{
                                    height: '25px',
                                    width: '25px',
                                    marginTop: '0',
                                    fontSize: '12.5px',
                                }}/>
                            </Link>
                        </div>
                    </div>
                </div>
                <Link to={'/home/' + data.path} className={'link-element'}>
                    <button className={'all-see-button'}>Открыть каталог</button>
                </Link>
            </div>
        );
    } else if (data.type === 1) {
        return(
            <div className={"homeBlock"}
                 style={styleBlock}>
                <Link to={data.path} className={'link-element'}>
                    <div className={'img'} style={{
                        height: String((window.innerWidth)/5*2) + 'px',
                        borderRadius: '15px',
                        backgroundImage: "url('" + data.url + "')",
                        backgroundSize: 'cover',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'end',
                        justifyContent: 'space-between',
                    }}></div>
                </Link>
            </div>
        )
    }
};

export default HomeBlock;