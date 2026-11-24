import React, { useMemo } from 'react';
import "./Highlights.css";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";


/*
    Calculates the total amount of contributions that exceed the limit (pac or individual) for a campaign.
    Considers:
        - Multiple donations from the same donor
        - Multiple election cycles
        - Officeholder vs. Campaign Accounts (Officeholder transactions excluded)
*/
function calculateExcessContributions(
    contributions,
    startDate,
    endDate,
    limitNonPAC,
    limitPAC,
    electionCycles
) {
    let excessSum = 0;

    electionCycles.forEach(cycle => {
        const cycleStart = new Date(Math.max(
            startDate.getTime(),
            cycle.start.getTime()
        ));

        const cycleEnd = new Date(Math.min(
            endDate.getTime(),
            cycle.end.getTime()
        ));

        if (cycleStart > cycleEnd) return;

        Object.keys(contributions).forEach(true_name => {
            const donor = contributions[true_name];

            let total_contributed = 0;

            const limit = true_name.includes('pac')
                ? limitPAC
                : limitNonPAC;

            donor.children.forEach(child => {
                const transactionDate = new Date(
                    child.Transaction_Date.replace(" ", "T")
                );

                const donorName = child.Name;
                const transactionType =
                    (child.Transaction_Type || "").toLowerCase();

                if (
                    transactionDate >= cycleStart &&
                    transactionDate <= cycleEnd &&
                    !donorName.includes("City of Austin") &&
                    !transactionType.includes("officeholder")
                ) {
                    total_contributed += Number(child.Amount) || 0;
                }
            });

            if (total_contributed > limit) {
                excessSum += total_contributed - limit;
            }
        });
    });

    return excessSum;
}


function Highlights({profile, electionCycles, aggregated_data, contribution_data, selectedDateRange, expenditure_data, districtGeoJSON, highlightedDistrict }) {
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
    console.log(electionCycles)
    let totalExcessContributions = calculateExcessContributions(
        aggregated_data,
        selectedDateRange.start,
        selectedDateRange.end,
        profile.individual_limit,
        profile.pac_limit,
        electionCycles
    );

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
  
  
  