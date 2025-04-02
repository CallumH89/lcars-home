import React, { useState, useEffect } from "react";
import { Container, Box, Flex, Heading, Text, Grid, NavLink } from "theme-ui";
import LcarsButton from "./components/button.tsx";
import { theme } from "./createTheme.tsx";
import { homebridgeConfig, weatherConfig } from "./config.ts";
import {
  defaultAccessoriesToDisplay,
  getGroupedAccessories,
  authenticate,
  fetchAccessories as fetchAccessoriesHelper,
  handleAccessoryClick as handleAccessoryClickHelper,
  AccessoryType,
  getWeather,
} from "./homebridge.helpers.ts";
import "./fonts.css"; // Import the custom font CSS file
const App: React.FC = () => {
  const [accessories, setAccessories] = useState<AccessoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  // Configuration
  const accessoriesToDisplay = defaultAccessoriesToDisplay;

  // Function to fetch accessories - wrapper for the helper
  const fetchAccessories = async (token: string): Promise<void> => {
    await fetchAccessoriesHelper(
      token,
      homebridgeConfig.server,
      homebridgeConfig.accessoriesEndpoint,
      setAccessories,
      setLoading,
      setError
    );
  };

  // Handle button click - wrapper for the helper
  const handleAccessoryClick = (accessory: AccessoryType): void => {
    handleAccessoryClickHelper(
      accessory,
      authToken,
      homebridgeConfig.server,
      homebridgeConfig.accessoriesEndpoint,
      setAccessories
    );
  };

  useEffect(() => {
    // Call the authenticate helper
    authenticate(
      homebridgeConfig.server,
      homebridgeConfig.authEndpoint,
      homebridgeConfig.username,
      homebridgeConfig.password,
      setLoading,
      setError,
      setAuthToken,
      fetchAccessories
    );
    getWeather(weatherConfig.key, weatherConfig.postcode, setWeatherData);
  }, []); // Empty dependency array means this runs once on component mount

  // Get all unique room names from accessories
  const getRooms = (): string[] => {
    if (loading || accessories.length === 0) return [];

    const roomGroups = getGroupedAccessories(accessories, accessoriesToDisplay);
    return Object.keys(roomGroups);
  };

  // Set the first room as active when data is loaded
  useEffect(() => {
    if (!loading && accessories.length > 0 && activeRoom === null) {
      const rooms = getRooms();
      if (rooms.length > 0) {
        setActiveRoom(rooms[0]);
      }
    }
  }, [loading, accessories, activeRoom]);

  // Get the grouped accessories for the active room
  const getActiveRoomAccessories = () => {
    if (!activeRoom) return {};

    const roomGroups = getGroupedAccessories(accessories, accessoriesToDisplay);
    return { [activeRoom]: roomGroups[activeRoom] || {} };
  };

  return (
    <Container
      sx={{
        backgroundAttachment: "fixed",
        bg: theme?.colors?.lcarsBackground,
        color: theme?.colors?.lcarsOrange1,
        height: "100%",
        minHeight: "100vh",
        p: 2,
        fontFamily: "Antonio, sans-serif",
      }}
    >
      {loading ? (
        <Text sx={{ textAlign: "center" }}>Loading accessories...</Text>
      ) : error ? (
        <Text sx={{ textAlign: "center", color: "red" }}>Error: {error}</Text>
      ) : (
        <>
          <Grid gap={0} columns={["182px 1fr"]}>
            {/* Left sidebar with room navigation */}
            <Flex
              sx={{
                flexDirection: "column",
                position: "relative",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: 5,
                  backgroundColor: theme?.colors?.lcarsOrange1,
                  mb: 1,
                  flex: 1,
                }}
              ></Box>
              <Box
                sx={{
                  height: 8,
                  mb: 2,
                  backgroundColor: theme?.colors?.lcarsPurple1,
                  color: theme?.colors?.lcarsBackground,
                  py: 2,
                  borderRadius: "0 0 0 100px",
                  textAlign: "right",
                  alignContent: "end",
                  position: "relative",
                }}
              >
                <Heading as="h3">Home</Heading>
              </Box>
            </Flex>
            <Flex
              sx={{
                flexDirection: "column",
                position: "relative",
                mb: 2,
                "::before": {
                  content: "''",
                  display: "block",
                  width: "60px",
                  height: "60px",
                  background: `linear-gradient(to top right, ${theme?.colors?.lcarsPurple1} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                  position: "absolute",
                  left: 0,
                  bottom: "24px",
                  zIndex: "1",
                },
                "::after": {
                  content: "''",
                  display: "block",
                  width: "60px",
                  height: "60px",
                  backgroundColor: theme?.colors?.lcarsBackground,
                  borderRadius: "0 0 0 60px",
                  position: "absolute",
                  left: 0,
                  bottom: "24px",
                  zIndex: "1",
                },
              }}
            >
              <Flex sx={{ flex: 1, pb: 6, px: 6, gap: 3, zIndex: 2 }}>
                <Box>{`Outside temp: ${weatherData.current?.[`temp_${weatherConfig.scale}`]}${weatherConfig.scale === "c" ? "°C" : "°F"}`}</Box>
                <Box>{`Feels like: ${weatherData.current?.[`feelslike_${weatherConfig.scale}`]}${weatherConfig.scale === "c" ? "°C" : "°F"}`}</Box>
                <Box>{`Condition: ${weatherData.current?.condition?.text}`}</Box>
                <Box>{`Humidity: ${weatherData.current?.humidity}`}</Box>
              </Flex>
              <Box
                sx={{
                  width: "100%",
                  height: 5,
                  backgroundColor: theme?.colors?.lcarsPurple1,
                  alignSelf: "end",
                }}
              ></Box>
            </Flex>
          </Grid>

          <Grid gap={0} columns={["182px 1fr"]}>
            {/* Left sidebar with room navigation */}
            <Box>
              <Box
                sx={{
                  height: "100px",
                  mb: 1,
                  backgroundColor: theme?.colors?.lcarsBlue1,
                  color: theme?.colors?.lcarsBackground,
                  padding: 2,
                  borderRadius: "100px 0 0 0",
                  textAlign: "right",
                  alignContent: "end",
                }}
              >
                <Heading as="h3">Rooms</Heading>
              </Box>
              <Flex sx={{ flexDirection: "column" }}>
                {getRooms().map((roomName) => (
                  <NavLink
                    key={roomName}
                    onClick={() => setActiveRoom(roomName)}
                    sx={{
                      height: 8,
                      mb: 1,
                      backgroundColor: theme?.colors?.lcarsYellow2,
                      padding: 2,
                      borderRadius: 0,
                      textAlign: "right",
                      alignContent: "end",
                      bg:
                        activeRoom === roomName
                          ? theme?.colors?.lcarsYellow1
                          : theme?.colors?.lcarsYellow2,
                      color: theme?.colors?.lcarsBackground,
                    }}
                  >
                    {roomName}
                  </NavLink>
                ))}
              </Flex>
            </Box>

            {/* Right content area showing the active room's accessories */}
            <Box
              sx={{
                position: "relative",
                "::before": {
                  content: "''",
                  display: "block",
                  width: "60px",
                  height: "60px",
                  background: `linear-gradient(to bottom right, ${theme?.colors?.lcarsBlue1} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                  position: "absolute",
                  left: 0,
                  top: "24px",
                  zIndex: "1",
                },
                "::after": {
                  content: "''",
                  display: "block",
                  width: "60px",
                  height: "60px",
                  backgroundColor: theme?.colors?.lcarsColourBlack,
                  borderRadius: "60px 0 0 0",
                  position: "absolute",
                  left: 0,
                  top: "24px",
                  zIndex: "1",
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: 5,
                  backgroundColor: theme?.colors?.lcarsBlue1,
                }}
              ></Box>
              {activeRoom ? (
                <Box sx={{ py: 6, px: 6, position: "relative", zIndex: 2 }}>
                  <Heading as="h2" mb={3}>
                    {activeRoom}
                  </Heading>

                  {Object.entries(getActiveRoomAccessories()).map(
                    ([roomName, typeGroups]) => (
                      <Box key={roomName}>
                        {Object.entries(typeGroups).map(
                          ([typeName, typeAccessories]) => (
                            <Box key={`${roomName}-${typeName}`} mb={4}>
                              <Heading as="h4" mb={2} sx={{ fontSize: 3 }}>
                                {typeName}s ({typeAccessories.length})
                              </Heading>

                              <Flex
                                sx={{
                                  flexWrap: "wrap",
                                  justifyContent: "flex-start",
                                  gap: 3,
                                }}
                              >
                                {typeAccessories.map((accessory) => (
                                  <LcarsButton
                                    key={accessory.uniqueId}
                                    handleAccessoryClick={handleAccessoryClick}
                                    accessory={accessory}
                                  />
                                ))}
                              </Flex>
                            </Box>
                          )
                        )}
                      </Box>
                    )
                  )}
                </Box>
              ) : (
                <Text>Select a room to see accessories</Text>
              )}
            </Box>
          </Grid>
        </>
      )}
    </Container>
  );
};

export default App;
