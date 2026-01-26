import axios from 'axios';
import config from '../config/config.js';

const getWeather = async (lat, lon) => {
  if (!config.WEATHER_API_KEY) {
    throw new Error('Weather API key is not configured.');
  }

  try {
    // Reverse geocode
    const geoResponse = await axios.get('http://api.openweathermap.org/geo/1.0/reverse', {
      params: {
        lat,
        lon,
        limit: 1,
        appid: config.WEATHER_API_KEY,
      },
    });
    const locationName = geoResponse.data[0] ? geoResponse.data[0].name : 'Unknown Location';

    // Weather data
    const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: config.WEATHER_API_KEY,
        units: 'metric', // for temperature in Celsius
      },
    });

    const data = weatherResponse.data;
    const tempCelsius = data.main.temp;
    const tempFahrenheit = (tempCelsius * 9/5) + 32;

    // Map the response to the desired format
    const weatherData = {
      location: locationName,
      condition: data.weather[0] ? data.weather[0].main : 'N/A',
      temperature_celsius: tempCelsius,
      temperature_fahrenheit: tempFahrenheit,
    };

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data from API:', error.response ? error.response.data : error.message);
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid Weather API key.');
    }
    if (error.response && error.response.status === 404) {
      throw new Error('Could not find weather data for the provided coordinates.');
    }
    throw new Error('Could not fetch weather data.');
  }
};

export const WeatherService = {
  getWeather,
};
