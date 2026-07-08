import React, { useState, useEffect } from 'react';
import { useServer } from '../../useServer';
import styles from './MaintenanceToggle.module.scss';


export default function MaintenanceToggle({ authenticationData }) {
  const { getSystemSettings, updateSystemSetting } = useServer();
  
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [loadResult, setLoadResult] = useState(null);
  const [updateResult, setUpdateResult] = useState(null);


  useEffect(() => {
    getSystemSettings(setLoadResult);
  }, []);


  useEffect(() => {
    if (loadResult) {
      if (loadResult.error) {
        setError(loadResult.error);
      } else {
        const status = loadResult?.settings?.maintenance_mode?.value ?? false;
        setMaintenanceMode(status);
      }
      setLoading(false);
    }
  }, [loadResult]);


  const handleToggle = () => {
    const nextState = !maintenanceMode;
    setLoading(true);
    setError(null);

    updateSystemSetting(setUpdateResult, authenticationData, 'maintenance_mode', nextState, 'boolean');
  };


  useEffect(() => {
    if (updateResult) {
      if (updateResult.error) {
        setError(updateResult.error);
      } else if (updateResult.success) {
      
        setMaintenanceMode(prev => !prev);
      }
      setLoading(false);
    }
  }, [updateResult]);

  return (
    <div className={styles.maintenanceContainer}>
      <div className={styles.toggleRow}>
        <div className={styles.labelBlock}>
          <span className={styles.title}>Тех. обслуживание</span>
          {error && <span className={styles.errorMsg}>{error}</span>}
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`${styles.switchBtn} ${maintenanceMode ? styles.active : ''} ${loading ? styles.disabled : ''}`}
        >
          <span className={`${styles.switchDot} ${maintenanceMode ? styles.active : ''}`} />
        </button>
      </div>
      
      <div className={styles.statusRow}>
        <span className={`${styles.indicatorDot} ${maintenanceMode ? styles.active : ''}`} />
        <span className={`${styles.statusText} ${maintenanceMode ? styles.active : ''}`}>
          {maintenanceMode ? 'Режим тех. работ активен' : 'Сайт работает штатно'}
        </span>
      </div>
    </div>
  );
}
