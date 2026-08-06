import yaml from 'js-yaml';
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";
import { getProfile, getProfiles } from './Profiles';


export async function getCities(query) {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/cities.yml`);
    const yamlText = await response.text();
    let cities = yaml.load(yamlText);
    if (!cities) cities = [];
    if (query) {
      cities = matchSorter(cities, query, { keys: ["name"] });
    }
  return cities.sort(sortBy("name"));
  } catch (error) {
    console.error('Error fetching or parsing YAML file:', error);
  }  
}

export async function getCityConfig(query) {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/cities.yml`);
    const yamlText = await response.text();

    let cities = yaml.load(yamlText);

    if (!cities) cities = [];

    if (query) {
      cities = matchSorter(cities, query, { keys: ["name"] });
    }

    return cities.sort(sortBy("name"))[0] || null;

  } catch (error) {
    console.error('Error fetching or parsing YAML file:', error);
    return null;
  }
}


export async function getCityProfiles(cityId) {
    const profiles = await getProfiles();

    const city_profiles = profiles.filter(
        profile => profile.city.replace(/\s+/g, '') === cityId
    );

    const bulk_data = await Promise.all(
        city_profiles.map(async (profile) => {
            try {
                const data = await getProfile(profile.id);

                return {
                    ...data,

                    // Preserve YAML profile
                    yaml_profile: profile
                };

            } catch (error) {
                console.error(`Failed to load data for ${profile.name}`);
                return null;
            }
        })
    );

    return bulk_data.filter(result => result !== null);
}

