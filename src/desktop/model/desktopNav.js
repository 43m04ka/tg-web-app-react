import {STANDALONE_PAGES, standaloneRoute} from '../../shared/lib/pageRoutes';
import {fallbackBotType} from '../../shared/lib/platform';
import {regionIcon, regionLabel, regionTitle} from '../../shared/lib/region';

const SECTION_TITLES = {
    steam: 'Пополнение Стим',
    services: 'Коды пополнения'
};

const SECTION_ORDER = Object.keys(STANDALONE_PAGES);

const bySerial = (a, b) => (a.serialNumber ?? 0) - (b.serialNumber ?? 0);

const pageEntries = (startPages, platform) => (startPages || [])
    .filter((item) => item.platform === platform && item.type === 'page' && item.structurePageId !== null)
    .sort(bySerial);

export const resolveBotType = (startPages, botType) => {
    if (pageEntries(startPages, botType).length) return botType;

    const fallback = fallbackBotType(botType);
    return fallback && pageEntries(startPages, fallback).length ? fallback : botType;
};

const entriesOf = (startPages, botType) => pageEntries(startPages, resolveBotType(startPages, botType));

const decorate = (entry, pages) => {
    const page = (pages || []).find((candidate) => candidate.id === entry.structurePageId) || null;

    return {
        id: entry.structurePageId,
        type: page?.type || null,
        label: regionLabel(page, entry),
        title: regionTitle(page, entry),
        icon: regionIcon(page, entry),
        color: entry.color || null
    };
};

export const storefrontList = (startPages, pages, botType) =>
    entriesOf(startPages, botType)
        .map((entry) => decorate(entry, pages))
        .filter((item) => item.id !== null && !standaloneRoute(item.type));

const sectionFromPages = (pages, type) => {
    const page = (pages || []).find((candidate) => candidate.type === type && candidate.id != null);
    return page ? decorate({structurePageId: page.id}, pages) : null;
};

export const sectionList = (startPages, pages, botType) => {
    const decorated = entriesOf(startPages, botType).map((entry) => decorate(entry, pages));

    return SECTION_ORDER
        .map((type) => {
            const item = decorated.find((candidate) => candidate.type === type)
                || sectionFromPages(pages, type);

            if (!item) return null;

            return {
                key: type,
                pageId: item.id,
                route: standaloneRoute(type),
                label: SECTION_TITLES[type] || item.label,
                note: item.label,
                icon: item.icon
            };
        })
        .filter(Boolean);
};

export const originIndex = (startPages, pages, botType) => new Map(
    entriesOf(startPages, botType)
        .map((entry) => decorate(entry, pages))
        .filter((item) => item.id !== null)
        .map((item) => [item.id, {...item, pageId: item.id}])
);

export const defaultStorefrontId = (startPages, pages, botType) =>
    storefrontList(startPages, pages, botType)[0]?.id ?? null;

export const pageIdOfType = (pages, type) =>
    (pages || []).find((page) => page.type === type)?.id ?? null;
