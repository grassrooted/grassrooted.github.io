import React, { useState, useRef } from "react";
import "./FoodExpenditureAnalysis.css";

const FoodExpenditureAnalysis = ({ expenditure_data }) => {
    const [expanded, setExpanded] = useState(false);
    const listRef = useRef(null);

    const foodKeywords = [
        "meals",
        "food",
        "beverage",
        "drinks"
    ];

    const foodExpenditureData = expenditure_data.filter((record) =>
        foodKeywords.some((keyword) =>
            record.Category?.toLowerCase().includes(keyword) ||
            record.Description?.toLowerCase().includes(keyword)
        )
    );

    const vendorStats = foodExpenditureData.reduce((acc, record) => {
        if (!record.Name) return acc;

        if (!acc[record.Name]) {
            acc[record.Name] = {
                count: 0,
                totalAmount: 0
            };
        }

        acc[record.Name].count += 1;
        acc[record.Name].totalAmount += Number(record.Amount) || 0;

        return acc;
    }, {});

    const frequentVendors = Object.entries(vendorStats)
        .filter(([_, stats]) => stats.count > 1)
        .sort((a, b) => b[1].totalAmount - a[1].totalAmount);

    const displayedVendors = expanded
        ? frequentVendors
        : frequentVendors.slice(0, 10);

    const toggleExpand = () => {
        if (expanded) {
            listRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        setExpanded(!expanded);
    };

    return (
        <section
            className="food-expenditure"
            ref={listRef}
        >
            <h2 className="food-expenditure__title">
                Food & Beverage Expenditures
            </h2>

            <h3 className="food-expenditure__subtitle">
                Frequently Visited Vendors
            </h3>

            {displayedVendors.length > 0 ? (
                <>
                    <ul className="food-expenditure__vendors">
                        {displayedVendors.map(([vendor, stats]) => (
                            <li
                                key={vendor}
                                className="food-expenditure__vendor"
                            >
                                <span className="food-expenditure__vendor-name">
                                    {vendor}
                                </span>

                                <span className="food-expenditure__vendor-amount">
                                    ${stats.totalAmount.toFixed(2)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {frequentVendors.length > 10 && (
                        <button
                            type="button"
                            className="food-expenditure__toggle"
                            onClick={toggleExpand}
                        >
                            {expanded ? "Show Less" : "Show More"}
                        </button>
                    )}
                </>
            ) : (
                <p className="food-expenditure__empty">
                    No frequently visited food or beverage vendors found.
                </p>
            )}
        </section>
    );
};

export default FoodExpenditureAnalysis;