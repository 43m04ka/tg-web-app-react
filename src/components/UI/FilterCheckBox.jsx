import React, {useEffect, useRef, useState} from 'react';
import {calculateNewValue} from "@testing-library/user-event/dist/utils";
import {isElementOfType} from "react-dom/test-utils";

const FilterCheckBox = ({param, data, json, preview, setJson}) => {
    if(json === null){
        json = {platform: [], price: {min: 0, max: 50000, sort: null}, category:[]}
    }
    const [isVisible, setIsVisible] = useState(true);
    const [filterHeight, setFilterHeight] = useState(null);
    let oldHeight = data.length * 30
    const filterRef = useRef();
    const [localJson, setLocalJson] = useState(json)
    const [signElement, setSignElement] = useState(
        <div className={'background-arrow'}
             style={{
                 width: '20px',
                 height: '20px',
                 rotate: '90deg',
                 transitionProperty: 'rotate',
                 transitionDuration: '0.3s'
             }}/>
    );

    useEffect(() => {
        const height = filterRef.current.getBoundingClientRect().height;
        oldHeight = height + 5
        setFilterHeight(0)
    }, [filterRef, setFilterHeight]);

    const onResize = () => {
        if (isVisible) {
            setSignElement(
                <div className={'background-arrow'}
                     style={{
                             width: '20px',
                             height: '20px',
                             rotate: '-90deg',
                             transitionProperty: 'rotate',
                             transitionDuration: '0.3s'
                         }}/>
                )
                setIsVisible(false)
            } else {
                setSignElement(
                    <div className={'background-arrow'}
                         style={{
                             width: '20px',
                             height: '20px',
                             rotate: '90deg',
                             transitionProperty: 'rotate',
                             transitionDuration: '0.3s'
                         }}/>
                )
                setIsVisible(true)
            }
    }


    return (
        <div style={{marginTop:'4px', overflow:'hidden', width: String(window.innerWidth / 2) + 'px',}}>
            <div className={'text-element'}
                 style={{fontSize: '19px', lineHeight: '20px', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between'}} onClick={() => {
                onResize()
                if (filterHeight === oldHeight) {
                    setFilterHeight(0)
                } else {
                    setFilterHeight(oldHeight)
                }
            }}>
               <div> {preview}</div>
               <div> {signElement}</div>
            </div>
            <div ref={filterRef}
                 style={{
                     transitionProperty: 'height',
                     transitionDuration: '0.3s',
                     height: String(filterHeight) + 'px',
                     overflow: 'hidden',
                     marginTop: '5px',
                 }}>
                {data.map(el => {
                    const [isCheck, setIsCheck] = useState(false);
                    if(((!localJson.price.sort && el === 'По возрастанию') || (localJson.price.sort && el === 'По убыванию')) && localJson.price.sort !== null && isCheck){
                        setIsCheck(false)
                    }
                    return(<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'left', marginLeft: '15px', marginTop:'5px', alignItems:'center'}}
                                onClick={() => {
                                    setIsCheck(!isCheck)
                                    const status = !isCheck
                                    let jsonNew = json
                                    if (param === 'platform') {
                                        if (status) {
                                            jsonNew.platform = [...jsonNew.platform, el]
                                            setJson(jsonNew);
                                            setLocalJson(jsonNew)
                                        } else {
                                            jsonNew.platform.splice(jsonNew.platform.indexOf(el), 1)
                                            if(jsonNew.platform.length === 0 && jsonNew.price.sort===null && jsonNew.category.length===0) {
                                                setJson(null)
                                                setLocalJson(null);
                                            }else {
                                                setJson(jsonNew);
                                                setLocalJson(jsonNew)
                                            }
                                        }
                                    }if (param === 'category') {
                                        if (status) {
                                            jsonNew.category = [...jsonNew.category, el]
                                            setJson(jsonNew);
                                            setLocalJson(jsonNew)
                                        } else {
                                            jsonNew.category.splice(jsonNew.category.indexOf(el), 1)
                                            if(jsonNew.platform.length === 0 && jsonNew.price.sort===null&& jsonNew.category.length===0) {
                                                setJson(null)
                                                setLocalJson(null);
                                            }else {
                                                setJson(jsonNew);
                                                setLocalJson(jsonNew)
                                            }
                                        }
                                    }if (param === 'languageSelector') {
                                        if (status) {
                                            jsonNew.languageSelector = [...jsonNew.languageSelector, el]
                                            setJson(jsonNew);
                                            setLocalJson(jsonNew)
                                        } else {
                                            jsonNew.languageSelector.splice(jsonNew.languageSelector.indexOf(el), 1)
                                            if(jsonNew.platform.length === 0 && jsonNew.price.sort===null&& jsonNew.category.length===0) {
                                                setJson(null)
                                                setLocalJson(null);
                                            }else {
                                                setJson(jsonNew);
                                                setLocalJson(jsonNew)
                                            }
                                        }
                                    }if (param === 'price') {
                                        if (status) {
                                            jsonNew.price.sort = el === 'По возрастанию';
                                            setJson(jsonNew);
                                            setLocalJson(jsonNew)
                                        }
                                    }
                                }}>
                        <input type={'radio'} checked={isCheck} style={{transform: 'scale(1.4)', borderRadius:'50%'}} />
                        <div className={'text-element'} style={{marginLeft: '7px', fontSize: '15px'}}>{el}</div>
                    </div>)})}
            </div>
        </div>
    );
};

export default FilterCheckBox;