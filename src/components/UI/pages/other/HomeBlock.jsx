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
                paddingTop: '10px',
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

    let link = '/catalog/'
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
                        marginLeft: '15px',
                        overflow: 'hidden',
                        width: 'auto',
                        fontWeight: 'bold',
                    }}>{data.name}</div>
                </div>
                <div className={"scroll-container"} style={{alignItems: 'center'}}>
                    {data.body.slice(0, 6).map(item => (
                            <div style={{marginRight: '5px'}}>
                                <ProductItem key={item.id} product={item}/>
                            </div>
                        )
                    )}
                </div>
                <div style={{width: '100%'}}>
                    <div //to={link + data.path}
                        style={{
                            fontFamily: "'Montserrat', sans-serif",
                            color: 'white',
                            borderRadius: '50px',
                            backgroundColor: '#222222',
                            padding: '10px 12px',
                            width: 'max-content',
                            fontWeight: '500',
                            fontSize: '15px',
                            lineHeight: '15px',
                            justifyItems: 'center',
                            margin:'0 auto',
                        }}>
                        Открыть каталог
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