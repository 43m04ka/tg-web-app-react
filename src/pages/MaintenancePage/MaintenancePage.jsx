import React from 'react';
import style from './MaintenancePage.module.scss';

export default function MaintenancePage() {
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
