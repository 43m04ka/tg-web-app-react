import React from 'react';
import {membershipBadge} from '../../lib/membership';
import style from './MembershipBadge.module.scss';

export default function MembershipBadge({product, className = ''}) {
    const badge = membershipBadge(product);
    if (!badge) return null;

    return (
        <span className={`${style.badge} ${style[badge.brand] || ''} ${className}`} title={badge.label}>
            <span className={style.mark} aria-hidden="true"/>
            {badge.label}
        </span>
    );
}
