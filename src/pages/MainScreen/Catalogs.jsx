import useGlobalData from "../../hooks/useGlobalData";
import CatalogListBody from "../MainScreen/CatalogListBody";
import CatalogListHead from "../MainScreen/CatalogListHead";

const Catalogs = () => {

    return (<>
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