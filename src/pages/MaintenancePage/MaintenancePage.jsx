import React, {useEffect, useState} from 'react';
import style from './MaintenancePage.module.scss';

const formatRemaining = (until) => {
  if (!until) return null;

  const target = new Date(until).getTime();
  if (Number.isNaN(target)) return null;

  const diffMs = target - Date.now();
  if (diffMs <= 0) return null;

  const totalMinutes = Math.round(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const dateLabel = new Date(until).toLocaleString('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });

  let remainingLabel = '';
  if (hours > 0) remainingLabel += `${hours} ч `;
  if (minutes > 0 || hours === 0) remainingLabel += `${minutes} мин`;

  return `Ожидаем завершения работ примерно к ${dateLabel} (осталось ~${remainingLabel.trim()})`;
};

export default function MaintenancePage({ until }) {
  const [remainingText, setRemainingText] = useState(() => formatRemaining(until));

  useEffect(() => {
    setRemainingText(formatRemaining(until));
    if (!until) return;

    const interval = setInterval(() => {
      setRemainingText(formatRemaining(until));
    }, 30000);

    return () => clearInterval(interval);
  }, [until]);

  return (
    <div className={style.maintenanceOverlay} style={{ height: String(window.innerHeight) + 'px' }}>
      <div className={style.card}>
        
        {/* Заголовок в левой ориентации с вашими фирменными акцентами */}
        <div className={style.headerText}>
          <h1 className={style.mainTitle}>
            Геймворд — ваш сервис для покупки игр и подписок для <span className={style.psText}>PlayStation</span> и <span className={style.xboxText}>Xbox</span>
          </h1>
          <p className={style.description}>
            Прямо сейчас мы улучшаем систему, чтобы ваши покупки обрабатывались еще быстрее.
          </p>
        </div>

        {/* Техническая инфо-плашка */}
        <div className={style.infoBlock}>
          <div className={style.iconWrapper}>
            🔧
          </div>
          <div className={style.infoText}>
            Производится техническое обслуживание. Все функции каталога станут доступны в ближайшее время.
            {remainingText ? <><br/>{remainingText}</> : ''}
          </div>
        </div>

        {/* Кнопка перехода в поддержку Telegram в стиле плашки пополнения Steam */}
        <div className={style.supportButtons}>
          <a 
            href="https://t.me" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={style.tgBtn}
          >
            <div className={style.btnContent}>
              <span className={style.btnTitle}>Поддержка магазина</span>
              <span className={style.btnSub}>Решим любой возникший вопрос</span>
            </div>
            <div className={style.tgIcon}>
              ✈️
            </div>
          </a>
        </div>

      </div>
    </div>
  );
}
