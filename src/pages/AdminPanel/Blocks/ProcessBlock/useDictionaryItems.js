import {useCallback, useEffect, useRef, useState} from 'react';
import {API_BASE_URL} from '../../legacy/baseUrl';

const PARSING_API = `${API_BASE_URL}/api/parsing`;

/**
 * @param {object} [options]
 * @param {() => void} [options.onNewProcess] — новая запись в processList (новый id)
 */
const useDictionaryItems = (options = {}) => {
    const {onNewProcess} = options;
    const onNewProcessRef = useRef(onNewProcess);
    useEffect(() => {
        onNewProcessRef.current = onNewProcess;
    }, [onNewProcess]);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const prevIdsRef = useRef(null);
    const initializedRef = useRef(false);

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`${PARSING_API}/processList?time=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            // Оценку оставшегося времени считает сервер: у него есть момент старта
            // и очередь источника, а история в памяти вкладки терялась при каждой
            // перезагрузке страницы и не знала про ждущие запуска задачи.
            setError(null);
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 1000);
        return () => clearInterval(intervalId);
    }, [fetchData]);

    useEffect(() => {
        if (loading || !Array.isArray(items)) return;
        const idSet = new Set(items.map((i) => i.id));
        if (!initializedRef.current) {
            initializedRef.current = true;
            prevIdsRef.current = idSet;
            return;
        }
        let hasNew = false;
        for (const id of idSet) {
            if (!prevIdsRef.current.has(id)) {
                hasNew = true;
                break;
            }
        }
        prevIdsRef.current = idSet;
        if (hasNew) onNewProcessRef.current?.();
    }, [items, loading]);

    const updateNotificationStatus = async (id, notification) => {
        try {
            const response = await fetch(`${PARSING_API}/setNotificationProcess/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({notification: notification}),
            });

            if (!response.ok) throw new Error(`Failed to update status`);
        } catch (err) {
            console.error('Ошибка при обновлении статуса нотификации:', err);
        }
    };

    const cancelProcess = async (id) => {
        try {
            const response = await fetch(`${PARSING_API}/cancelProcess/${id}`, {
                method: 'POST',
            });

            if (!response.ok) throw new Error(`Failed to cancel process`);
            await fetchData();
        } catch (err) {
            console.error('Ошибка при отмене процесса:', err);
        }
    };

    return {items, loading, error, updateNotificationStatus, cancelProcess};
};

export default useDictionaryItems;
