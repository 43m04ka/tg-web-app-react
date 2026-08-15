import {productRoute} from "./useServerRoutes/productRoute";
import {structureRoute} from "./useServerRoutes/structureRoute";
import {searchRoute} from "./useServerRoutes/searchRoute";
import {favoriteRoute} from "./useServerRoutes/favoriteRoute";
import {basketRoute} from "./useServerRoutes/basketRoute";
import {catalogRoute} from "./useServerRoutes/catalogRoute";
import {orderRoute} from "./useServerRoutes/orderRoute";
import {steamRoute} from "./useServerRoutes/steamRoute";

const {getCard, getRecommendationsGames, prepareShareMessage} = productRoute()
const {getSearch, getClueList} = searchRoute()
const {getPageList, getPreviewCardList, getStructureCatalogList, getInfoBlocks, syncUser, getStartPageList} = structureRoute()
const {getCatalogList, getCardList, findCardsByCatalog} = catalogRoute()
const {getPreviewFavoriteList, deleteCardToFavorite, addCardToFavorite, getFavoriteList} = favoriteRoute()
const {getBasketList, addCardToBasket, setBasketPositionCount, deleteCardToBasket, usePromo} = basketRoute()
const {createOrder, getHistoryList, checkPaymentStatus, cancelPayment} = orderRoute()
const {getSteamQuote, createSteamOrder} = steamRoute()

export function useServerUser() {
    return {
        getPageList,
        getPreviewCardList,
        getStructureCatalogList,
        getCatalogList,
        getCard,
        getSearch,
        getPreviewFavoriteList,
        getBasketList,
        getRecommendationsGames,
        addCardToFavorite,
        deleteCardToFavorite,
        getClueList,
        addCardToBasket,
        setBasketPositionCount,
        deleteCardToBasket,
        getCardList,
        createOrder,
        getHistoryList,
        checkPaymentStatus,
        cancelPayment,
        getSteamQuote,
        createSteamOrder,
        getFavoriteList,
        getInfoBlocks,
        prepareShareMessage,
        findCardsByCatalog,
        usePromo,
        syncUser,
        getStartPageList
    }
}
