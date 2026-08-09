import React, { useMemo } from "react";
import "./SharedDonorsTable.css";

const SharedDonorsTable = ({
    profile,
    profiles,
    campaignDonors,
    selectedDateRange
}) => {
    const sharedDonorData = useMemo(() => {
        if (!profile || !profiles?.length || !campaignDonors) {
            return [];
        }

        const currentDonors = campaignDonors[profile.id];

        if (!currentDonors || currentDonors.size === 0) {
            return [];
        }

        const results = [];

        profiles.forEach(candidate => {
            // Don't compare the candidate against themselves.
            if (candidate.id === profile.id) {
                return;
            }

            const otherDonors = campaignDonors[candidate.id];

            if (!otherDonors || otherDonors.size === 0) {
                return;
            }

            let sharedCount = 0;

            // Iterate over the smaller set for efficiency.
            const smallerSet =
                currentDonors.size <= otherDonors.size
                    ? currentDonors
                    : otherDonors;

            const largerSet =
                currentDonors.size <= otherDonors.size
                    ? otherDonors
                    : currentDonors;

            smallerSet.forEach(donor => {
                if (largerSet.has(donor)) {
                    sharedCount++;
                }
            });

            if (sharedCount === 0) {
                return;
            }

            const percentage =
                (sharedCount / currentDonors.size) * 100;

            results.push({
                id: candidate.id,
                name: candidate.name,
                district: candidate.district,
                headshot: candidate.path_to_headshot_photo,
                sharedCount,
                otherDonorCount: otherDonors.size,
                currentDonorCount: currentDonors.size,
                percentage
            });
        });

        return results.sort(
            (a, b) => b.percentage - a.percentage
        );
    }, [profile, profiles, campaignDonors, selectedDateRange]);

    const currentDonorCount =
        campaignDonors?.[profile?.id]?.size ?? 0;

    if (!profile) {
        return null;
    }

    return (
        <section className="shared-donors-table">
            <div className="shared-donors-header">
                <div>
                    <h2>Shared Donors</h2>

                    <p className="shared-donors-description">
                        Percentage of this campaign's unique donors
                        who also contributed to another council campaign.
                    </p>
                </div>

                <div className="shared-donors-summary">
                    {currentDonorCount.toLocaleString()} unique donors
                </div>
            </div>

            {sharedDonorData.length === 0 ? (
                <div className="shared-donors-empty">
                    No shared donors found for the selected election cycle.
                </div>
            ) : (
                <div className="shared-donors-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Councilman</th>
                                <th>Headshot</th>
                                <th>Shared Donors</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sharedDonorData.map(candidate => (
                                <tr key={candidate.id}>
                                    <td>
                                        <div className="shared-donor-candidate">
                                            <span className="shared-donor-name">
                                                {candidate.name}
                                            </span>

                                            {candidate.district && (
                                                <span className="shared-donor-district">
                                                    {candidate.district}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        {candidate.headshot ? (
                                            <img
                                                className="shared-donor-headshot"
                                                src={candidate.headshot}
                                                alt={`${candidate.name} headshot`}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div
                                                className="shared-donor-headshot-placeholder"
                                                aria-label={`No headshot available for ${candidate.name}`}
                                            >
                                                ?
                                            </div>
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className="shared-donor-percentage"
                                            title={`${candidate.sharedCount.toLocaleString()} shared donors out of ${candidate.currentDonorCount.toLocaleString()} donors`}
                                        >
                                            {candidate.percentage.toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default SharedDonorsTable;

