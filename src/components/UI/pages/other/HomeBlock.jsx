import React from 'react';
import {Link, useNavigate} from "react-router-dom";
import CatalogItem from "../Catalog/CatalogItem";

const HomeBlock = ({data}) => {

    const navigate = useNavigate();

    let styleBlock = {}
    if (data.type.includes('banner')) {
        if (data.backgroundColor !== 'none' && typeof data.backgroundColor !== 'undefined') {
            styleBlock = {
                background: data.backgroundColor,
                paddingBottom: '15px',
                borderTopLeftRadius: data.isRoundedBorderTop ? '6vw' : 0,
                borderTopRightRadius: data.isRoundedBorderTop ? '6vw' : 0,
                borderBottomLeftRadius: data.isRoundedBorderBottom ? '6vw' : 0,
                borderBottomRightRadius: data.isRoundedBorderBottom ? '6vw' : 0,
                overflow: 'hidden',
            }
        } else {
            styleBlock = {
                paddingTop: '5px',
                paddingBottom: '15px',
                marginTop: '10px',
                borderTopLeftRadius: data.isRoundedBorderTop ? '6vw' : 0,
                borderTopRightRadius: data.isRoundedBorderTop ? '6vw' : 0,
                borderBottomLeftRadius: data.isRoundedBorderBottom ? '6vw' : 0,
                borderBottomRightRadius: data.isRoundedBorderBottom ? '6vw' : 0,
            }
        }
    } else {
        if (data.backgroundColor !== 'none') {
            if (data.name !== '') {
                styleBlock = {
                    background: data.backgroundColor,
                    paddingBottom: '10px',
                    paddingTop: '10px',
                    marginTop: '0px',
                    paddingLeft: '7px',
                    marginBottom: '10px',
                    borderTopLeftRadius: data.isRoundedBorderTop ? '6vw' : 0,
                    borderTopRightRadius: data.isRoundedBorderTop ? '6vw' : 0,
                    borderBottomLeftRadius: data.isRoundedBorderBottom ? '6vw' : 0,
                    borderBottomRightRadius: data.isRoundedBorderBottom ? '6vw' : 0,
                }
            } else {
                styleBlock = {
                    background: data.backgroundColor,
                    paddingBottom: '10px',
                    paddingTop: '0',
                    marginTop: '-15px',
                    paddingLeft: '7px',
                    marginBottom: '10px',
                    borderTopLeftRadius: data.isRoundedBorderTop ? '6vw' : 0,
                    borderTopRightRadius: data.isRoundedBorderTop ? '6vw' : 0,
                    borderBottomLeftRadius: data.isRoundedBorderBottom ? '6vw' : 0,
                    borderBottomRightRadius: data.isRoundedBorderBottom ? '6vw' : 0,
                }
            }
        } else {
            styleBlock = {
                paddingBottom: '0px', paddingTop: '3px', paddingLeft: '7px', marginTop: '0px', marginBottom: '10px'
            };
        }
    }

    let link = '/catalog/'
    if (data.type === 'ordinary-choice') {
        link = '/choice-catalog/'
    }

    if (!data.type.includes('banner')) {
        return (<div style={styleBlock}>
            <div style={{display: 'flex', flexDirection: 'row'}}>
                {typeof data.imageIcon !== 'undefined' && data.imageIcon !== null ? (<div style={{
                    height: '9vw',
                    width: '9vw',
                    marginLeft: '0.5vw',
                    backgroundSize: 'cover',
                    backgroundImage: 'url(' + data.imageIcon + ')'
                }}/>) : ''}
                <div style={{
                    fontSize: '6vw',
                    lineHeight: '9vw',
                    fontWeight: 'normal',
                    fontFamily: "'SF PRO Display', sans-serif",
                    color: 'white',
                    marginLeft: '1vw',
                    overflow: 'hidden',
                    width: 'auto',
                    letterSpacing: '0.1vw',
                }}>{data.name}</div>
            </div>
            <div className={"scroll-container"} style={{alignItems: 'center'}}>
                {data.body.slice(0, 6).map(item => (<div style={{marginRight: '5px', marginTop: '1vw'}}>
                    <CatalogItem key={item.id} product={item}/>
                </div>))}
            </div>
            <div style={{width: '100%'}}>
                <button onClick={() => navigate(link + data.path)}
                        style={{
                            fontWeight: 'normal',
                            fontFamily: "'SF PRO Display', sans-serif",
                            color: 'white',
                            borderRadius: '1.5vw',
                            backgroundColor: '#222222',
                            padding: '10px 12px',
                            width: 'max-content',
                            fontSize: '3.6vw',
                            justifyItems: 'center',
                            margin: '0 auto',
                            marginTop: '10px',
                        }}>
                    Открыть каталог
                </button>
            </div>
        </div>);
    } else if (data.type.includes('banner')) {
        return (<div className={"homeBlock"}
                     style={styleBlock}>
            <Link to={data.path} className={'link-element'}>
                <div className={'img'} style={{
                    height: String((window.innerWidth) / 5 * 2) + 'px',
                    backgroundImage: "url('" + data.url + "')",
                    backgroundSize: 'cover',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'end',
                    justifyContent: 'space-between',
                }}></div>
            </Link>
        </div>)
    }


};

export default HomeBlock;