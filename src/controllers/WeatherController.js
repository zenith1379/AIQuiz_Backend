import { WeatherService } from '../services/WeatherService.js';

const getWeatherData = async (req, res, next) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ message: 'Latitude (lat) and Longitude (lon) query parameters are required.' });
  }

  try {
    const weatherData = await WeatherService.getWeather(lat, lon);
    res.status(200).json(weatherData);
  } catch (error) {
    // Forward the error to the centralized error handler
    next(error);
  }
};

export const WeatherController = {
  getWeatherData,
};
