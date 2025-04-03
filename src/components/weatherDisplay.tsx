import React, { useEffect, useState } from "react";
import { Box } from "theme-ui";
import { theme } from "../createTheme.tsx";
import { weatherConfig } from "../config.ts";
import { getWeather } from "../homebridge.helpers.ts";

const WeatherDisplay: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  useEffect(() => {
    getWeather(weatherConfig.key, weatherConfig.postcode, setWeatherData);
  }, []); // Empty dependency array means this runs once on component mount
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
