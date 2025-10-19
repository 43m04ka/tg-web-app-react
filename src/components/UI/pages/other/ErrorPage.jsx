import React from 'react';
import {Link} from "react-router-dom";

const ErrorPage = () => {
    return (
        <div>
            <div className={'title price-element'}>Страница не найдена</div>
            <Link to={'/'} className={'link-element'}>
                <button className={'all-see-button'}>На главную</button>
            </Link>
        </div>
    );
};

export default ErrorPage;