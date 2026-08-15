import CatalogListBody from "../MainScreen/CatalogListBody";
import CatalogListHead from "../MainScreen/CatalogListHead";
import SteamAccount from "../MainPage/SteamCatalogs/SteamCatalogs";
import useGlobalData from "../../hooks/useGlobalData";
import AnimatedGradientBackground from "../../components/AnimatedGradientBackground";

const Catalogs = () => {
    const {pageId, pageList} = useGlobalData();

    const getCurrentPageType = () => {
        if (!pageList || pageId === -1) return null;
        const currentPage = pageList.find(p => p.id === pageId);
        return currentPage?.type || null;
    }

    const pageType = getCurrentPageType();

    if (pageType === 'steam') {
        return (<>
            <AnimatedGradientBackground />
            <SteamAccount />
        </>);
    }

    return (<>
        <AnimatedGradientBackground />
        <CatalogListHead/>
        <CatalogListBody/>
    </>)

};

export default Catalogs;


// <div
//             style={{zIndex: 100, paddingBottom: String(contentSafeAreaInset.bottom + safeAreaInset.bottom + 0.1 * window.innerWidth) + 'px'}}
//             onScroll={(event) => {
//                 lastScroll = (event.target.scrollTop);
//             }}
//             ref={scrollRef}></div>