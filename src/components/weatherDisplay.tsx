import React, { useEffect, useState } from "react";
import { Box } from "theme-ui";
import { weatherConfig } from "../config.ts";
import { getWeather } from "../homebridge.helpers.ts";

interface WeatherDisplayProps {
  refreshTrigger?: number; // Optional prop to trigger a refresh
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ refreshTrigger, setError }) => {
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    getWeather(weatherConfig.key, weatherConfig.postcode, setWeatherData, setError);
  }, [refreshTrigger, setError]); // Will re-run whenever refreshTrigger changes

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
