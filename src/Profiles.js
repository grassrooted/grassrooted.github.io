import yaml from 'js-yaml';
import axios from 'axios';
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export async function getProfiles(query) {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/profiles.yml`);
    const yamlText = await response.text();
    let profiles = yaml.load(yamlText);
    if (!profiles) profiles = [];
    if (query) {
      profiles = matchSorter(profiles, query, { keys: ["name", "city", "district"] });
    }
  return profiles.sort(sortBy("city", "district"));
  } catch (error) {
    console.error('Error fetching or parsing YAML file:', error);
  }  
}

export async function getProfile(id) {
    const profiles = await getProfiles();
    const profile = profiles.find(profile => profile.id === id);

    if (!profile) {
        return null;
    }

    const aggregate = {
        contributions: [],
        expenditures: [],
        personal_funds_expenditures: [],
        in_kind_contributions: [],
        loans: [],
        credit_card_expenditures: [],
        interest_gained: [],
        investment_purchases: [],
        non_political_expenditures_made_from_political_contributions: [],
        payments_to_candidate_business: [],
        pledged_contributions: [],
        unpaid_incurred_obligations: [],
    };

    let latestReport = null;

    const processSource = (data) => {

        // Aggregate schedule data
        Object.keys(aggregate).forEach(field => {
            if (Array.isArray(data[field])) {
                aggregate[field].push(...data[field]);
            }
        });

        // Track latest report by period_end
        const periodEnd = data?.candidate_info?.period_end;

        if (periodEnd) {
            if (
                !latestReport ||
                new Date(periodEnd) > 
                new Date(latestReport.candidate_info.period_end)
            ) {
                latestReport = data;
            }
        }
    };


    try {

        //
        // NEW FORMAT
        // Folder containing multiple JSON reports
        //
        if (profile.sourceNames?.length > 0) {

            const requests = profile.sourceNames.map(file =>
                axios.get(
                    `${process.env.PUBLIC_URL}${profile.path_to_contributions_data}/${file}`
                )
            );

            const responses = await Promise.all(requests);

            responses.forEach(({ data }) => {
                processSource(data);
            });

        }

        //
        // ORIGINAL FORMAT
        // Single JSON file
        //
        else {

            const jsonFilePath =
                `${process.env.PUBLIC_URL}${profile.path_to_contributions_data}`;

            const { data } = await axios.get(jsonFilePath);

            processSource(data);
        }


        //
        // Remove duplicates
        //
        Object.keys(aggregate).forEach(field => {
            aggregate[field] = Array.from(
                new Set(
                    aggregate[field].map(JSON.stringify)
                )
            ).map(JSON.parse);
        });


        //
        // Attach aggregated data
        //
        Object.assign(profile, aggregate);


        //
        // Attach latest report totals
        //
        if (latestReport?.candidate_info?.report_totals) {

            const totals = latestReport.candidate_info.report_totals;

            profile.report_totals = {
                ...totals,

                "Contribution Balance":
                    totals["Contribution Balance"] ?? 0,

                "Outstanding Loan Totals":
                    totals["Outstanding Loan Totals"] ?? 0
            };

            //
            // Preserve which report generated these totals
            //
            profile.latest_report_period_end =
                latestReport.candidate_info.period_end;
        }


    } catch (error) {
        console.error("Error fetching profile data:", error);
    }

    return profile;
}