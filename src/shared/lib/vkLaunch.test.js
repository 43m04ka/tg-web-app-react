import {parseVkLaunch, vkGroupOf} from './platform';
import {withVkGroup} from './vkOrder';

test('параметры запуска ВК берутся из адреса только при vk_app_id и vk_user_id', () => {
    expect(parseVkLaunch('?vk_app_id=54475556&vk_user_id=7&sign=abc&utm=1'))
        .toEqual({vk_app_id: '54475556', vk_user_id: '7', sign: 'abc'});
    expect(parseVkLaunch('?vk_app_id=54475556')).toBeNull();
    expect(parseVkLaunch('')).toBeNull();
});

test('группа берётся из vk_group_id, иначе по приложению', () => {
    expect(vkGroupOf({vk_app_id: '54475556', vk_group_id: '85243268'})).toBe(85243268);
    expect(vkGroupOf({vk_app_id: '54475556', vk_group_id: '1'})).toBe(217049080);
    expect(vkGroupOf({vk_app_id: '54475564'})).toBe(85243268);
    expect(vkGroupOf(null)).toBe(85243268);
});

test('заказ из ВК получает группу, остальные не трогаются', () => {
    const group = () => 217049080;
    expect(withVkGroup({platform: 'vk', amount: 1}, group, () => false)).toEqual({platform: 'vk', amount: 1, vkGroupId: 217049080, vkClient: 'web'});
    expect(withVkGroup({platform: 'vk', vkGroupId: 85243268}, group, () => true)).toEqual({platform: 'vk', vkGroupId: 85243268, vkClient: 'app'});
    expect(withVkGroup({platform: 'tg'}, group)).toEqual({platform: 'tg'});
});
