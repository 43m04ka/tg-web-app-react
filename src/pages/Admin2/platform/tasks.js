import {useEffect, useState} from 'react';
import {http} from './http';
import {openEventStream} from './eventStream';
import {getToken} from './token';

const TICK_MS = 3000;
const SAFETY_TICK_MS = 30000;

const EMPTY = {
    processes: [],
    notices: [],
    queue: {},
    error: null,
    loadedAt: 0,
};

const listeners = new Set();

let state = EMPTY;
let timerId = null;
let inFlight = false;
let closeStream = null;

const emit = () => listeners.forEach((listener) => listener(state));

const asArray = (value) => (Array.isArray(value) ? value : []);

export const loadTasks = async () => {
    if (inFlight || !getToken()) return state;

    inFlight = true;

    try {
        const [processes, notices, queue] = await Promise.all([
            http('/processList'),
            http('/notices'),
            http('/parse-queue', {area: 'parsing'}),
        ]);

        state = {
            processes: asArray(processes),
            notices: asArray(notices),
            queue: queue && typeof queue === 'object' ? queue : {},
            error: null,
            loadedAt: Date.now(),
        };
    } catch (error) {
        state = {...state, error};
    } finally {
        inFlight = false;
        emit();
    }

    return state;
};

const applyState = (snapshot) => {
    state = {
        processes: asArray(snapshot?.processes),
        notices: asArray(snapshot?.notices),
        queue: snapshot?.queue && typeof snapshot.queue === 'object' ? snapshot.queue : {},
        error: null,
        loadedAt: Date.now(),
    };

    emit();
};

const stopPolling = () => {
    if (timerId) clearInterval(timerId);
    timerId = null;
};

const startPolling = (tick) => {
    stopPolling();
    if (!listeners.size) return;

    timerId = setInterval(() => {
        if (!document.hidden) loadTasks();
    }, tick);
};

const stop = () => {
    stopPolling();

    if (closeStream) closeStream();
    closeStream = null;
};

const start = () => {
    stop();
    if (!listeners.size) return;

    loadTasks();

    closeStream = openEventStream({
        onState: applyState,
        onOpen: () => startPolling(SAFETY_TICK_MS),
        onClose: () => startPolling(TICK_MS),
    });

    startPolling(TICK_MS);
};

const onVisibility = () => {
    if (document.hidden) stop();
    else start();
};

export const subscribeTasks = (listener) => {
    listeners.add(listener);
    listener(state);

    if (listeners.size === 1) {
        document.addEventListener('visibilitychange', onVisibility);
        start();
    }

    return () => {
        listeners.delete(listener);

        if (!listeners.size) {
            document.removeEventListener('visibilitychange', onVisibility);
            stop();
        }
    };
};

export const pokeTasks = () => {
    loadTasks();
};

export const cancelProcess = async (id) => {
    await http(`/cancelProcess/${id}`, {method: 'POST'});
    await loadTasks();
};

export const cancelWaiting = async (queueId) => {
    await http(`/parse-queue/${queueId}/cancel`, {area: 'parsing', method: 'POST'});
    await loadTasks();
};

export const setProcessNotification = async (id, notification) => {
    await http(`/setNotificationProcess/${id}`, {method: 'POST', body: {notification}});
    await loadTasks();
};

export const dismissNotice = async (id) => {
    await http(`/notices/${id}/dismiss`, {method: 'POST'});
    await loadTasks();
};

export const loadNotice = (id) => http(`/notices/${id}`);

export const useTasks = () => {
    const [value, setValue] = useState(state);

    useEffect(() => subscribeTasks(setValue), []);

    return value;
};

export const summarize = ({processes, notices}) => {
    const running = processes.filter((item) => item.state !== 'waiting');
    const waiting = processes.filter((item) => item.state === 'waiting');
    const leader = running.slice().sort((a, b) => (b.progress || 0) - (a.progress || 0))[0] || null;

    return {
        running,
        waiting,
        leader,
        total: processes.length,
        noticeCount: notices.length,
        alarming: notices.some((notice) => notice.level === 'error'),
    };
};
