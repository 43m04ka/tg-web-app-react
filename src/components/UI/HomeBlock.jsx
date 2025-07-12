import React, {useCallback} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "./ProductItem";

const HomeBlock = ({data}) => {

    let styleBlock = {}
    if (data.type.includes('banner')) {
        if (data.backgroundColor !== 'none' && typeof data.backgroundColor !== 'undefined') {
            styleBlock = {
                background: data.backgroundColor,
                paddingTop: '10px',
                paddingLeft: '7px',
                paddingRight: '7px',
                paddingBottom: '15px'
            }
        } else {
            styleBlock = {
                paddingTop: '5px',
                paddingLeft: '7px',
                paddingRight: '7px',
                paddingBottom: '15px',
                marginTop: '10px'
            }
        }
    } else {
        if (data.backgroundColor !== 'none') {
            styleBlock = {
                background: data.backgroundColor,
                paddingBottom: '10px',
                paddingTop: '0px',
                marginTop: '0px',
                paddingLeft: '7px',
                marginBottom: '20px'
            }
        } else {
            styleBlock = {
                paddingBottom: '0px',
                paddingTop: '3px',
                paddingLeft: '7px',
                marginTop: '0px',
                marginBottom: '20px'
            };
        }
    }

    let link = '/home/'
    if (data.type === 'ordinary-choice') {
        link = '/choice-catalog/'
    }

    if (!data.type.includes('banner')) {
        return (
            <div style={styleBlock}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{
                        fontSize: '18px',
                        fontFamily: "'Montserrat', sans-serif",
                        color: 'white',
                        marginLeft: '5px',
                        width: String(window.innerWidth - 150) + 'px',
                        overflow: 'hidden',
                    }}>{data.name}</div>
                    <Link to={link + data.path} className={'link-element'} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#373737',
                        height: '22px',
                        borderRadius: '5px',
                        marginRight: '7px',
                    }} to={link + data.path}>
                        <div className={'text-element'} style={{
                            fontSize: '11px',
                            marginRight: '3px',
                            marginTop: '0',
                            lineHeight: '16px'
                        }}>СМОТРЕТЬ ВСЕ
                        </div>
                        <div className={'background-arrow'}
                             style={{width: '10px', height: '10px', marginRight: '5px'}}/>
                    </Link>
                </div>
                <div className={"scroll-container"} style={{alignItems: 'center'}}>
                    {data.body.slice(0, 6).map(item => (
                            <div style={{marginRight: '5px'}}>
                                <ProductItem key={item.id} product={item}/>
                            </div>
                        )
                    )}
                    <div className={'box-home-block-element home-block-element'} >
                        <div style={{
                            width: '177px',
                        }}>
                            <Link to={link + data.path} className={'link-element'}
                                  style={{width: '170px', display: 'flex', alignItems: 'center', borderRadius: '10px', border: '1px solid white', height:'33px', marginRight: '7px'}}>
                                <div className={'text-element'} style={{fontSize: '18px', width: '170px'}}>
                                    Смотреть ещё
                                </div>
                                <div className={'background-arrow'} style={{
                                    height: '18px',
                                    width: '18px',
                                    marginTop: '0',
                                    fontSize: '12.5px',
                                    marginRight:'7px'
                                }}/>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else if (data.type.includes('banner')) {
        return (
            <div className={"homeBlock"}
                 style={styleBlock}>
                <Link to={data.path} className={'link-element'}>
                    <div className={'img'} style={{
                        height: String((window.innerWidth) / 5 * 2) + 'px',
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