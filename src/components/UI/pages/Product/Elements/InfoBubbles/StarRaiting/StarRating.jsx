import React, { useState, useEffect } from 'react';
import './StarRating.css';

const StarRating = ({ data }) => {
    const { averageRating, totalRatingsCount } = data;
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const formatCount = (count) => {
        return count >= 1000 ? (count / 1000).toFixed(0) + 'k' : count;
    };

    const renderStars = () => {
        return [...Array(5)].map((_, index) => {
            const targetFill = Math.min(Math.max(averageRating - index, 0), 1) * 100;

            return (
                <div key={index} className="star-container">
                    <span className="star-empty">★</span>
                    <span
                        className="star-filled"
                        style={{
                            width: `${isLoaded ? targetFill : 0}%`,
                            transitionDelay: `${index * 0.2}s`
                        }}
                    >★</span>
                </div>
            );
        });
    };

    return (
        <div className="rating-wrapper">
            <span className="rating-value">{averageRating}</span>
            <div className="stars-row">
                {renderStars()}
            </div>
            <span className="rating-count">({formatCount(totalRatingsCount)})</span>
        </div>
    );
};

export default StarRating;
