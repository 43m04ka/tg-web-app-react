import React from 'react';
import {Link} from "react-router-dom";

const ErrorPage = () => {
    return (
        <div>
            <div className={'title price-element'}>Страница не найдена</div>
            <Link to={'/home0'} className={'link-element'}>
                <button className={'all-see-button'}>На главную</button>
            </Link>
        </div>
    );
};

export default ErrorPage;