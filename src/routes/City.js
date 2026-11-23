import React, { useEffect, useState, useMemo } from 'react';
import '../index.css';
import { useOutletContext, useParams } from "react-router-dom";
import ProfileStream from '../ProfileStream';
import Header from '../Header';
import { getCityProfiles } from "../Cities";
import CumulativeContributionsTimeline from '../CumulativeContributionsTimeline';
import PACFundingBarChart from '../PACFundingBarChart';
import FinancialRecordsTable from '../FinancialRecordsTable';
import CrossCampaignDonors from '../CrossCampaignDonors';
import NearLimitFundingChart from '../NearLimitFundingChart';

function City() {
    const { cityId } = useParams();
    const { city_config } = useOutletContext();

    const [cityProfileData, setCityProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCityData = async () => {
            try {
                const data = await getCityProfiles(cityId);
                setCityProfileData(data);
            } catch (err) {
                setError("Failed to load city profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchCityData();
    }, [cityId]);

    const flattenSchedule = (profiles, scheduleName) =>
        (profiles ?? []).flatMap(profile =>
            (profile[scheduleName] ?? []).map(record => ({
                ...record,
                Campaign: profile.name,
                campaign_id: profile.id,
            }))
        );


    const citySchedules = useMemo(() => ({
        contributions: flattenSchedule(cityProfileData, "contributions"),
        expenditures: flattenSchedule(cityProfileData, "expenditures"),
        loans: flattenSchedule(cityProfileData, "loans"),
        in_kind_contributions: flattenSchedule(cityProfileData, "in_kind_contributions"),
        credit_card_expenditures: flattenSchedule(cityProfileData, "credit_card_expenditures"),
        investment_purchases: flattenSchedule(cityProfileData, "investment_purchases"),
        personal_funds_expenditures: flattenSchedule(cityProfileData, "personal_funds_expenditures"),
        interest_gained: flattenSchedule(cityProfileData, "interest_gained"),
        non_political_expenditures_made_from_political_contributions: flattenSchedule(cityProfileData, "non_political_expenditures_made_from_political_contributions"),
        payments_to_candidate_business: flattenSchedule(cityProfileData, "payments_to_candidate_business"),
        pledged_contributions: flattenSchedule(cityProfileData, "pledged_contributions"),
        unpaid_incurred_obligations: flattenSchedule(cityProfileData, "unpaid_incurred_obligations"),
    }), [cityProfileData]);
          

    // Handle loading and error states
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    
    return (
        <div>
            <div id="city-header">
                <Header city={city_config.name} profile={city_config} />
            </div>
            
            <CumulativeContributionsTimeline
                cityProfileData={cityProfileData} />

            <PACFundingBarChart 
                allContributions={citySchedules.contributions} />

            <NearLimitFundingChart
                contributions={citySchedules.contributions}
            />

            <CrossCampaignDonors
                contributions={citySchedules.contributions}
            />

            <ProfileStream 
                cityId={cityId}
                cityProfileData={cityProfileData} />

            <FinancialRecordsTable
                profile={cityProfileData?.[0]?.yaml_profile}
                schedules={citySchedules}
            />
        </div>
    );
}

export default City;
