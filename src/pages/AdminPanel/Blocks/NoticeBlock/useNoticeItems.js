import {useCallback, useEffect, useRef, useState} from 'react';
import {API_BASE_URL} from '../../../../hooks/useServerRoutes/baseUrl';

const PARSING_API = `${API_BASE_URL}/api/parsing`;

/**
 * Уведомления — итоги завершённых задач.
 *
 * Процесс исчезает из processList, как только задача закончилась, и его итог пропадал
 * вместе с ним. Уведомление живёт до тех пор, пока его не закроют, поэтому опрашивать
 * его часто незачем: 5 секунд против секунды у процессов.
 *
 * Расширенная часть (список непрошедших позиций) в общий список не приходит — у парса
 * каталога это сотни строк. Она догружается по конкретному уведомлению при раскрытии.
 *
 * @param {object} [options]
 * @param {() => void} [options.onNewNotice] — появилось уведомление, которого раньше не было
 */
const useNoticeItems = (options = {}) => {
    const {onNewNotice} = options;
    const onNewNoticeRef = useRef(onNewNotice);
    useEffect(() => {
        onNewNoticeRef.current = onNewNotice;
    }, [onNewNotice]);

    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [details, setDetails] = useState({});
    const [detailsLoading, setDetailsLoading] = useState({});

    const prevIdsRef = useRef(null);

    const fetchNotices = useCallback(async () => {
        try {
            const response = await fetch(`${PARSING_API}/notices?time=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            setNotices(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotices();
        const intervalId = setInterval(fetchNotices, 5000);
        return () => clearInterval(intervalId);
    }, [fetchNotices]);

    // Сигнал о новом итоге. Первый ответ сервера за сигнал не считаем: иначе бы докобар
    // раскрывался на каждое открытие админки из-за уведомлений вчерашних парсов
    useEffect(() => {
        if (loading) return;

        const idSet = new Set(notices.map((notice) => notice.id));

        if (prevIdsRef.current === null) {
            prevIdsRef.current = idSet;
            return;
        }

        const hasNew = [...idSet].some((id) => !prevIdsRef.current.has(id));
        prevIdsRef.current = idSet;

        if (hasNew) onNewNoticeRef.current?.();
    }, [notices, loading]);

    /** Догружает расширенную информацию; повторно тот же блок не тянем */
    const loadDetails = useCallback(async (id) => {
        if (details[id] || detailsLoading[id]) return;

        setDetailsLoading((prev) => ({...prev, [id]: true}));

        try {
            const response = await fetch(`${PARSING_API}/notices/${id}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            setDetails((prev) => ({...prev, [id]: data.details || []}));
        } catch (err) {
            console.error('Ошибка при загрузке подробностей уведомления:', err);
            setDetails((prev) => ({...prev, [id]: []}));
        } finally {
            setDetailsLoading((prev) => ({...prev, [id]: false}));
        }
    }, [details, detailsLoading]);

    const dismissNotice = useCallback(async (id) => {
        // Убираем сразу: ответ сервера ничего не добавляет, а задержка в кадр выглядит залипанием
        setNotices((prev) => prev.filter((notice) => notice.id !== id));

        try {
            await fetch(`${PARSING_API}/notices/${id}/dismiss`, {method: 'POST'});
        } catch (err) {
            console.error('Ошибка при закрытии уведомления:', err);
            await fetchNotices();
        }
    }, [fetchNotices]);

    return {notices, loading, error, details, detailsLoading, loadDetails, dismissNotice};
};

export default useNoticeItems;
