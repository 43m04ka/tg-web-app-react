import React, {useEffect} from 'react';
import styles from './NavigationBar.module.scss';
import {useNavigate} from "react-router-dom";
import {useServer} from "../useServer";
import useData from "../useData";

const NavigationBar = ({routeData}) => {
    const navigator = useNavigate();
    const {updateAssociations, getAssociationsStatus} = useServer()
    const {authenticationData} = useData()
    const [status, setStatus] = React.useState(false);
    const [percent, setPercent] = React.useState(0);

    const updateStatus = (res, percent) => {
        if(res){
            setPercent(percent);
            setStatus(true)
            setTimeout(()=>{
                getAssociationsStatus(updateStatus)
            }, 1000)
        }else{
            setStatus(false);
        }
    }

    useEffect(() => {
        getAssociationsStatus(updateStatus).then()
    }, []);

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
                setStatus(true);
                updateStatus(true);
            }}>{status ? `Ожидайте, обновление ${(percent * 100).toFixed(0)}%` : 'Обновить асоциации'}</button>
        </div>
    );
};

export default NavigationBar;