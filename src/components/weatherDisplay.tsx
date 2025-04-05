import React, { useEffect, useState } from "react";
import { Box } from "theme-ui";
import { weatherConfig } from "../config.ts";
import { getWeather } from "../homebridge.helpers.ts";

interface WeatherDisplayProps {
  refreshTrigger?: number; // Optional prop to trigger a refresh
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ refreshTrigger }) => {
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    getWeather(weatherConfig.key, weatherConfig.postcode, setWeatherData);
  }, [refreshTrigger]); // Will re-run whenever refreshTrigger changes

  return (
    weatherData?.current && (
      <>
        <Box>{`Outside temp: ${weatherData.current[`temp_${weatherConfig.scale}`]}${weatherConfig.scale === "c" ? "°C" : "°F"}`}</Box>
        <Box>{`Feels like: ${weatherData.current[`feelslike_${weatherConfig.scale}`]}${weatherConfig.scale === "c" ? "°C" : "°F"}`}</Box>
        <Box>{`Condition: ${weatherData.current.condition?.text}`}</Box>
        <Box>{`Humidity: ${weatherData.current.humidity}%`}</Box>
      </>
    )
  );
};

export default WeatherDisplay;
