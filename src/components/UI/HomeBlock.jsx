import React, {useCallback} from 'react';
import {Link, useNavigate} from "react-router-dom";
import ProductItem from "./ProductItem";

const HomeBlock = ({data}) => {


    return (
        <div className={"homeBlock"} style={{background:data.backgroundColor, paddingBottom:'10px', paddingTop:'3px'}}>
            <div className={"title"}>{data.name}</div>
            <div className={"scroll-container"} style={{alignItems:'center'}}>
                <div style={{width:'10px'}}>
                    <div style={{width:'10px'}}/>
                </div>
                {data.body.slice(0, 6).map(item => (
                    <div style={{marginRight:'5px'}}>
                        <ProductItem key={item.id} product={item}/>
                    </div>
                    )
                )}
                <div className={'box-home-block-element home-block-element'}>
                    <div style={{marginLeft:'2px', marginRight:'7px',border:'0px solid #454545',
                        borderRadius:'7px', padding:'5px'}}>
                        <Link to={'/home/' + data.path} className={'link-element'} >
                            <div className={'background-arrow'} style={{
                                height: '25px',
                                width: '25px',
                                marginTop: '0',
                                fontSize:'12.5px',
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
};

export default HomeBlock;