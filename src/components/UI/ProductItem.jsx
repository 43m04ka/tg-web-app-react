import React, {useState} from 'react';
import Button from "./Button";
import '../styles/style.css';
import {Link} from "react-router-dom";

const ProductItem = ({product, className, onAdd}) => {
    const onAddHandler = () => {
        onAdd(product);
    }

    const [hovered, setHovered] = useState(false);

    const boxStyle = {
        backgroundColor: hovered ? 'rgb(74,76,81)' : '#1e1f22',
        transition: 'background-color 0.5s ease',
    }

    return (
        <div style={{padding: '5px'}}>
            <div className={'product ' + className}>

                <Link to={String(product.id)}>
                    <div className={''}>{product.title}</div>
                    <div className={''}>{product.price}</div>
                    <div className={'img-box'}>
                        <img src={product.img} className={'img'} alt="Product Image"/>
                    </div>

                </Link>
                {/*<button className={'add-btn'}*/}
                {/*        onClick={onAddHandler}*/}
                {/*        style={boxStyle}*/}
                {/*        onMouseEnter={() => setHovered(true)}*/}
                {/*        onMouseLeave={() => setHovered(false)}>*/}
                {/*    Добавить в корзину*/}
                {/*</button>*/}
            </div>
        </div>
    )
        ;
};

export default ProductItem;