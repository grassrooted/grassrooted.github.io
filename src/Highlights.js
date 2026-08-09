import React, { useMemo } from 'react';
import "./Highlights.css";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";

function calculateExcessContributions(contributions, startDate, endDate, limitNonPAC, limitPAC) {
    let excessSum = 0;
    Object.keys(contributions).forEach(true_name => {
        let total_contributed = 0
        const name = true_name;
        const limit = name.includes('pac') ? limitPAC : limitNonPAC;

        contributions[true_name].children.forEach(child => {
            const isodatestring = child.Transaction_Date.replace(" ","T")
            const transactionDate = new Date(isodatestring);
            const donorName = child.Name;
            const transactionType = (child.Transaction_Type || "").toLowerCase();
            if (transactionDate >= startDate && transactionDate <= endDate && !donorName.includes("City of Austin") && !(transactionType.includes("officeholder"))) {
                const amount = child.Amount;
                total_contributed += amount
            }
        });

        if (total_contributed > limit) {
            excessSum += (total_contributed - limit);
        }
    });

    return excessSum;
}

function Highlights({profile, aggregated_data, contribution_data, selectedDateRange, expenditure_data, districtGeoJSON, highlightedDistrict }) {
    const contributions = useMemo(() => {
        if (selectedDateRange === 'all') {
            return contribution_data;
        }
        const { start, end } = selectedDateRange;
        return contribution_data.filter(record => {
            const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
            return transactionDate >= start && transactionDate <= end;
        });
    }, [contribution_data, profile, selectedDateRange]);

    const expenditures = useMemo(() => {
        if (selectedDateRange === 'all') {
            return expenditure_data;
        }
        const { start, end } = selectedDateRange;
        return expenditure_data.filter(record => {
            const transactionDate = new Date(record[profile.contribution_fields.Transaction_Date]);
            return transactionDate >= start && transactionDate <= end;
        });
    }, [expenditure_data, profile, selectedDateRange]);

    let total_contributions = 0
    contributions.forEach(record => {
        total_contributions += record.Amount
    });
    total_contributions=Math.round(total_contributions)

    const avg_contribution = total_contributions/contributions.length
    console.log(profile)
    let totalExcessContributions = calculateExcessContributions(
            aggregated_data,
            selectedDateRange.start,
            selectedDateRange.end,
            profile.individual_limit,
            profile.pac_limit
        )

    totalExcessContributions = Math.round(totalExcessContributions)
    
    const self_payments = Math.round(expenditures
        .filter(item => (item.Name.toLowerCase().includes(profile.name.toLowerCase())))
        .reduce((total, item) => total + item.Amount, 0));

    const contributionBalance = Math.round(profile.report_totals["Contribution Balance"])

    const districtFeature = useMemo(() => {
        if (!districtGeoJSON || highlightedDistrict == null) {
            return null;
        }

        return districtGeoJSON.features.find(
            feature =>
                Number(feature.properties.DISTRICT) ===
                Number(highlightedDistrict)
        );
    }, [districtGeoJSON, highlightedDistrict]);

    const districtContributions = useMemo(() => {
        if (!districtFeature || !contributions.length) {
            return {
                inside: 0,
                outside: 0,
                insidePercent: 0,
                outsidePercent: 0,
                missingLocationAmount: 0,
            };
        }

        let inside = 0;
        let outside = 0;
        let missingLocationAmount = 0;

        contributions.forEach(record => {
            const amount = Number(record.Amount) || 0;

            // Check the raw values BEFORE converting them with Number()
            const rawLatitude = record.latitude;
            const rawLongitude = record.longitude;

            const latitude = Number(rawLatitude);
            const longitude = Number(rawLongitude);

            const missingLatitude =
                rawLatitude === null ||
                rawLatitude === undefined ||
                rawLatitude === "" ||
                !Number.isFinite(latitude);

            const missingLongitude =
                rawLongitude === null ||
                rawLongitude === undefined ||
                rawLongitude === "" ||
                !Number.isFinite(longitude);

            if (missingLatitude || missingLongitude) {
                missingLocationAmount += amount;
                return;
            }

            const donorPoint = point([longitude, latitude]);

            if (booleanPointInPolygon(donorPoint, districtFeature)) {
                inside += amount;
            } else {
                outside += amount;
            }
        });

        const total = inside + outside;

        return {
            inside,
            outside,
            insidePercent: total ? (inside / total) * 100 : 0,
            outsidePercent: total ? (outside / total) * 100 : 0,
            missingLocationAmount,
        };
    }, [contributions, districtFeature]);

    return (
        <div className="section" id="highlights">
            <h2>Highlights</h2>
            <h4><i>Showing contributions from {selectedDateRange.start.toLocaleDateString()} to {selectedDateRange.end.toLocaleDateString()}</i></h4>
            <div className="box-container">

                <div className="box-wrapper">
                    <div id="TotalContributions">${total_contributions.toLocaleString()}</div>
                    <div className="box-title">TOTAL DONATIONS</div>
                </div>

                <div className="box-wrapper">
                    <div id="AverageContributions">{avg_contribution.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',})}
                    </div>
                    <div className="box-title">AVERAGE CONTRIBUTION</div>
                </div>

                <div className="box-wrapper">
                    <div id="ContributionBalance">{contributionBalance.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',})}
                    </div>
                    <div className="box-title">REPORTED CASH ON HAND</div>
                </div>

                <div className="box-wrapper">
                    <div id="AboveLimitSupport">${totalExcessContributions.toLocaleString()}</div>
                    <div className="box-title">ABOVE-LIMIT DONATIONS</div>
                    <div className="box-subtitle">${profile.individual_limit} Limit for Individuals <br></br> ${profile.pac_limit} Limit for PACs</div>
                </div>

                <div className="box-wrapper">
                    <div id="SelfPayments">${self_payments.toLocaleString()}</div>
                    <div className="box-title">Campaign Funds Sent to {profile.name}</div>
                </div>


                <div className="box-wrapper geographic-support-box">
                    <div className="box-title">GEOGRAPHIC SUPPORT</div>

                    <div className="geographic-support">

                        <div className="geographic-stat">
                            <div className="geographic-stat-value">
                                ${districtContributions.inside.toLocaleString()}
                            </div>

                            <div className="geographic-stat-percent">
                                {districtContributions.insidePercent.toFixed(1)}%
                            </div>

                            <div className="geographic-stat-label">
                                FROM INSIDE DISTRICT
                            </div>
                        </div>

                        <div className="geographic-divider"></div>

                        <div className="geographic-stat">
                            <div className="geographic-stat-value">
                                ${districtContributions.outside.toLocaleString()}
                            </div>

                            <div className="geographic-stat-percent">
                                {districtContributions.outsidePercent.toFixed(1)}%
                            </div>

                            <div className="geographic-stat-label">
                                FROM OUTSIDE DISTRICT
                            </div>
                        </div>

                        <div className="geographic-divider"></div>

                        <div className="geographic-stat geographic-unavailable">
                            <div className="geographic-stat-value">
                                ${districtContributions.missingLocationAmount.toLocaleString()}
                            </div>

                            <div className="geographic-stat-label">
                                LOCATION UNAVAILABLE
                            </div>
                        </div>

                    </div>

                    <div className="box-subtitle">
                        Percentages based on geocoded contributions
                    </div>
                </div>


            </div>
        </div>
    );
  }
  
  export default Highlights;
  
  
  