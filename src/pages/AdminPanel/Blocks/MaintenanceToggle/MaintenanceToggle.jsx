import React, {useEffect, useState} from 'react';
import {useServer} from '../../useServer';
import styles from './MaintenanceToggle.module.scss';

// datetime-local ожидает "YYYY-MM-DDTHH:mm" в локальном времени, без таймзоны
const isoToLocalInputValue = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const localInputValueToIso = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
};

export default function MaintenanceToggle({ authenticationData }) {
  const { getSystemSettings, updateSystemSetting } = useServer();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceUntil, setMaintenanceUntil] = useState('');
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
        setMaintenanceUntil(loadResult?.settings?.maintenance_mode_until?.value || '');
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

  const handleUntilChange = (event) => {
    setMaintenanceUntil(localInputValueToIso(event.target.value));
  };

  const handleUntilBlur = () => {
    setError(null);
    updateSystemSetting(() => {}, authenticationData, 'maintenance_mode_until', maintenanceUntil, 'string');
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

      <div className={styles.untilRow}>
        <span className={styles.untilLabel}>Окончание работ:</span>
        <input
          type="datetime-local"
          className={styles.untilInput}
          value={isoToLocalInputValue(maintenanceUntil)}
          onChange={handleUntilChange}
          onBlur={handleUntilBlur}
        />
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
