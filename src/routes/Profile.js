import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from "react-router-dom";
import ProfileSnapshot from '../ProfileSnapshot';
import { getProfile, getProfiles } from '../Profiles';
import TimelineChart from '../TimelineChart';
import MembershipList from '../MembershipList';
import Highlights from '../Highlights';
import AggregatedDataTable from '../AggregatedDataTable';
import AggregatedExpendituresTable from '../AggregatedExpendituresTable';
import Header from '../Header';
import ContributionPieChart from '../ContributionPieChart';
import ElectionCycleDropdown from '../ElectionCycleDropdown';
import '../index.css';
import FoodExpenditureAnalysis from '../FoodExpenditureAnalysis';
import DonationList from '../DonationList';
import DonorVolunteerLineGraph from '../DonorVolunteerLineGraph';
import DonorOccupationPieChart from '../DonorOccupationPieChart';
import HeatmapMap from '../HeatmapMap';
import FinancialRecordsTable from '../FinancialRecordsTable';
import {getCityConfig} from '../Cities';

const aggregateDataByName = (data, profile) => {
    return data.reduce((acc, contribution) => {
        const normalizedName = contribution[profile.contribution_fields.Donor].toLowerCase();
        if (!acc[normalizedName]) {
            acc[normalizedName] = {
                Amount: 0,
                Campaign: contribution[profile.contribution_fields.Recipient],
                Name: contribution[normalizedName],
                Address: contribution[profile.contribution_fields.Address],
                children: []
            };
        }
        acc[normalizedName].Amount += contribution[profile.contribution_fields.Amount];
        acc[normalizedName].children.push({
            ...contribution
        });
        return acc;
    }, {});
};

const generateElectionCycles = (profile) => {
    const { first_election, next_election, election_date, election_cycle_years } = profile;

    const electionCycles = [];
    let year = parseInt(first_election, 10) - election_cycle_years;
    const nextElectionYear = parseInt(next_election, 10);
    const [month, day] = election_date.split('-').map(Number);

    while (year < nextElectionYear) {
        const startDate = new Date(year, month - 1, day);
        const endDate = new Date(year + election_cycle_years, month - 1, day - 1);
        electionCycles.push({
            start: startDate,
            end: endDate,
        });
        year += election_cycle_years;
    }

    return electionCycles;
};

function Profile() {
    const { profileId } = useParams();
    const [profile, setProfile] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [mapMinimized, setMapMinimized] = useState(false);

    
    const [districtGeoJSON, setDistrictGeoJSON] = useState(null);


    const [cityProfileData, setCityProfileData] = useState(null);

    // Fetch city profile data
    useEffect(() => {
        if (!profile) return;

        const fetchCityData = async () => {
            try {
                const data = await getCityConfig(profile.city);
                setCityProfileData(data);
            } catch (err) {
                setError("Failed to load city data.");
            }
        };

        fetchCityData();
    }, [profile]);

    useEffect(() => {
        if (!cityProfileData?.district_geojson) return;

        fetch(cityProfileData.district_geojson)
            .then(r => r.json())
            .then(setDistrictGeoJSON)
            .catch(console.error);
    }, [cityProfileData]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetchedProfile = await getProfile(profileId);
                const fetchedProfiles = await getProfiles();
                setProfile(fetchedProfile);
                setProfiles(fetchedProfiles);
            } catch (err) {
                setError("Failed to load profile data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [profileId]);

    const aggregatedData = useMemo(() => {
        return profile ? aggregateDataByName(profile.contributions, profile) : {};
    }, [profile]);

    const electionCycles = useMemo(() => {
        return profile ? generateElectionCycles(profile) : [];
    }, [profile]);

    const [selectedDateRange, setSelectedDateRange] = useState(null);

    useEffect(() => {
        if (electionCycles.length > 0) {
            setSelectedDateRange({
                start: electionCycles[0].start,
                end: electionCycles[electionCycles.length - 1].end,
            });
        }
    }, [electionCycles]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!profile || !electionCycles.length || !selectedDateRange) return <div>Preparing data...</div>;

    return (
        <div id="profile-page">

            <div
                id="profile-content"
                className={mapMinimized && isMobile ? "full-height" : ""}
                >

                <ElectionCycleDropdown 
                    electionCycles={electionCycles} 
                    selectedDateRange={selectedDateRange} 
                    setSelectedDateRange={setSelectedDateRange} />
                <Header 
                    city={profile.city} 
                    profile={profile} />

                <ProfileSnapshot 
                    profile={profile} />

                <Highlights 
                    profile={profile}
                    aggregated_data={aggregatedData}
                    contribution_data={profile.contributions}
                    selectedDateRange={selectedDateRange}
                    expenditure_data={profile.expenditures}/>

                {profile.contributions.some(contribution => contribution.Occupation) && (
                    <DonorOccupationPieChart contribution_data={profile.contributions} />
                )}

                <TimelineChart 
                    profile={profile}
                    contribution_data={profile.contributions}
                    expenditure_data={profile.expenditures}/>

                <AggregatedDataTable 
                    profile={profile} 
                    contribution_data={profile.contributions}
                    selectedDateRange={selectedDateRange} />

                <ContributionPieChart
                    profile={profile}
                    contribution_data={profile.contributions}
                    profiles={profiles} 
                    selectedDateRange={selectedDateRange} />

                <AggregatedExpendituresTable
                    profile={profile}
                    expenditure_data={profile.expenditures}
                    selectedDateRange={selectedDateRange}/>

                <DonorVolunteerLineGraph
                    expenditure_data={profile.expenditures} />

                <MembershipList 
                    expenditure_data={profile.expenditures}/>
                    
                <FoodExpenditureAnalysis
                    expenditure_data={profile.expenditures} />

                <DonationList
                    expenditure_data={profile.expenditures} />

                <FinancialRecordsTable
                    profile={profile}
                    selectedDateRange={selectedDateRange}
                    schedules={{
                        contributions: 
                            profile.contributions,
                        expenditures: 
                            profile.expenditures,
                        in_kind_contributions: 
                            profile.in_kind_contributions,
                        loans: 
                            profile.loans,
                        credit_card_expenditures: 
                            profile.credit_card_expenditures,
                        interest_gained: 
                            profile.interest_gained,
                        investment_purchases: 
                            profile.investment_purchases,
                        non_political_expenditures_made_from_political_contributions:
                            profile.non_political_expenditures_made_from_political_contributions,
                        payments_to_candidate_business:
                            profile.payments_to_candidate_business,
                        pledged_contributions:
                            profile.pledged_contributions,
                        unpaid_incurred_obligations:
                            profile.unpaid_incurred_obligations,
                    }}
                />
            </div>

            <div
                id="profile-map-container"
                className={mapMinimized && isMobile ? "minimized" : ""}
                >
                {isMobile && (
                    <button
                    id="map-toggle-btn"
                    onClick={() => setMapMinimized(prev => !prev)}
                    >
                    {mapMinimized ? "Expand Map" : "Minimize Map"}
                    </button>
                )}

                <HeatmapMap districtGeoJSON={districtGeoJSON} points={profile.contributions} highlightedDistrict={profile.district}/>
            </div>


        </div>
    );
}

export default Profile;
