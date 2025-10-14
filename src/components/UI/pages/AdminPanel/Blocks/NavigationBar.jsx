import React from 'react';
import styles from './NavigationBar.module.scss';
import {useNavigate} from "react-router-dom";
import ButtonLabel from "../Elements/ButtonLabel";
import {useServer} from "../useServer";
import useData from "../useData";

const NavigationBar = ({routeData}) => {
    const navigator = useNavigate();
    const {updateAssociations} = useServer()
    const {authenticationData} = useData()

    return (
        <div className={styles['main-division']}>
            <div>
            <div className={styles['headerTitle'] + ' ' + styles['title']}>
                Панель
            </div>
            <div>
                {routeData.map(routeList => (
                    <div>
                        {routeList.map((label) =>
                            (<div onClick={() => navigator(label.path)} key={label.path} className={`${styles['label']}
                           ${styles[window.location.pathname.replace('/admin-panel/', '') === label.path ? 'active' : '']}`}>
                                {label.name}</div>)
                        )}
                    </div>
                ))}
            </div>
            </div>
            <button className={styles['buttonUpdate']} onClick={() => {
                updateAssociations(authenticationData).then()
            }}>Обновить асоциации</button>
        </div>
    );
};

export default NavigationBar;