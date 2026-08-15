import React from 'react';
import './AnimatedGradientBackground.css';
import useGlobalData from '../hooks/useGlobalData';

const AnimatedGradientBackground = () => {
    const { startPageList, pageId, pageList } = useGlobalData();

    // Find color for current page
    const getGradientColor = () => {
        // First try to find color in startPageList for current page
        if (startPageList && startPageList.length > 0 && pageId !== -1) {
            const currentPageStartPage = startPageList.find(page => page.structurePageId === pageId);
            if (currentPageStartPage && currentPageStartPage.color) {
                return currentPageStartPage.color;
            }
        }
        
        // If not found in startPageList, try pageList
        if (pageList && pageList.length > 0 && pageId !== -1) {
            const currentPage = pageList.find(page => page.id === pageId);
            if (currentPage && currentPage.color) {
                return currentPage.color;
            }
        }
        
        return '#2d55ff'; // Default blue color
    };

    const gradientColor = getGradientColor();

    // Convert hex to rgba for gradient
    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const color1 = hexToRgba(gradientColor, 0.16);
    const color2 = hexToRgba(gradientColor, 0.10);
    const color3 = hexToRgba(gradientColor, 0.01);

    return (
        <div className="veins-bg">
            <div 
                className="vein vein-1" 
                style={{
                    background: `radial-gradient(
                        ellipse 50% 50% at 50% 50%,
                        ${color1} 0%,
                        ${color2} 40%,
                        ${color3} 75%,
                        transparent 100%
                    )`
                }}
            />
            <div 
                className="vein vein-2" 
                style={{
                    background: `radial-gradient(
                        ellipse 50% 50% at 50% 50%,
                        ${color1} 0%,
                        ${color2} 45%,
                        ${color3} 80%,
                        transparent 100%
                    )`
                }}
            />
        </div>
    );
};

export default AnimatedGradientBackground;
