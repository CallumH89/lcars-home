import React, { useState, useEffect } from "react";
import { Container, Box, Flex, Heading, Text, Grid, NavLink } from "theme-ui";
import LcarsButton from "./components/button.tsx";
import { theme } from "./createTheme.tsx";
import { homebridgeConfig } from "./config.ts";
import {
  defaultAccessoriesToDisplay,
  getGroupedAccessories,
  authenticate,
  fetchAccessories as fetchAccessoriesHelper,
  handleAccessoryClick as handleAccessoryClickHelper,
  AccessoryType,
} from "./homebridge.helpers.ts";
import { GroupedSensorDisplay } from "./components/sensorDisplay.tsx";
import "./fonts.css"; // Import the custom font CSS file
import WeatherDisplay from "./components/weatherDisplay.tsx";

const App: React.FC = () => {
  const [accessories, setAccessories] = useState<AccessoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
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

  // Function to sort types to ensure sensors are displayed first
  const sortTypeEntries = (entries: [string, AccessoryType[]][]) => {
    return entries.sort((a, b) => {
      const [typeA] = a;
      const [typeB] = b;

      // If typeA is "sensor", it should come first
      if (typeA.toLowerCase() === "sensor") return -1;
      // If typeB is "sensor", it should come first
      if (typeB.toLowerCase() === "sensor") return 1;
      // Otherwise, sort alphabetically
      return typeA.localeCompare(typeB);
    });
  };

  return (
    <Container
      sx={{
        backgroundAttachment: "fixed",
        bg: theme?.colors?.lcarsBackground,
        color: theme?.colors?.lcarsPurple1,
        height: "100%",
        minHeight: "100vh",
        p: 2,
        fontFamily: "Antonio, sans-serif",
        display: "flex",
        flexDirection: "column",
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
                  minHeight: 5,
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
                  position: "relative",
                }}
              ></Box>
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
                <WeatherDisplay />
              </Flex>
              <Flex sx={{ flexDirection: "row", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 5,
                    backgroundColor: theme?.colors?.lcarsPurple1,
                  }}
                ></Box>
                <Box
                  sx={{
                    flex: 1,
                    height: 5,
                    backgroundColor: theme?.colors?.lcarsPurple2,
                  }}
                ></Box>
              </Flex>
            </Flex>
          </Grid>

          <Grid
            gap={0}
            columns={["182px 1fr"]}
            sx={{ position: "relative", flex: 1 }}
          >
            {/* Left sidebar with room navigation */}
            <Flex sx={{ flexDirection: "column", position: "relative" }}>
              <Box
                sx={{
                  height: "100px",
                  mb: 1,
                  backgroundColor: theme?.colors?.lcarsBlue1,
                  padding: 2,
                  borderRadius: "100px 0 0 0",
                }}
              ></Box>
              <Flex sx={{ flexDirection: "column" }}>
                {getRooms().map((roomName) => (
                  <NavLink
                    key={roomName}
                    onClick={() => setActiveRoom(roomName)}
                    sx={{
                      height: "auto",
                      mb: 1,
                      backgroundColor: theme?.colors?.lcarsYellow2,
                      padding: 2,
                      borderRadius: 0,
                      textAlign: "center",
                      alignContent: "center",
                      bg:
                        activeRoom === roomName
                          ? theme?.colors?.lcarsYellow3
                          : theme?.colors?.lcarsYellow1,
                      color: theme?.colors?.lcarsBackground,
                    }}
                  >
                    {roomName}
                  </NavLink>
                ))}
              </Flex>

              <Box
                sx={{
                  mb: 1,
                  height: 2,
                  backgroundColor: theme?.colors?.lcarsPurple1,
                  padding: 2,
                }}
              ></Box>
              <Box
                sx={{
                  mb: 1,
                  backgroundColor: theme?.colors?.lcarsRed1,
                  padding: 2,
                  flex: 1,
                }}
              ></Box>
            </Flex>

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
              <Flex sx={{ flexDirection: "row", gap: 1 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 5,
                    backgroundColor: theme?.colors?.lcarsBlue1,
                    alignSelf: "end",
                  }}
                ></Box>
                <Box
                  sx={{
                    flex: 1,
                    height: 5,
                    backgroundColor: theme?.colors?.lcarsBlue2,
                    alignSelf: "end",
                  }}
                ></Box>
              </Flex>
              {activeRoom ? (
                <Box sx={{ py: 6, px: 6, position: "relative", zIndex: 2 }}>
                  <Heading as="h2" mb={3}>
                    {activeRoom}
                  </Heading>

                  {Object.entries(getActiveRoomAccessories()).map(
                    ([roomName, typeGroups]) => (
                      <Box key={roomName}>
                        {/* Sort type entries to display sensors first */}
                        {sortTypeEntries(Object.entries(typeGroups)).map(
                          ([typeName, typeAccessories]) => (
                            <Box key={`${roomName}-${typeName}`} mb={5}>
                              {typeName.toLowerCase() !== "sensor" && (
                                <Heading as="h4" mb={2} sx={{ fontSize: 3 }}>
                                  {typeName}s
                                </Heading>
                              )}

                              <Flex
                                sx={{
                                  flexWrap: "wrap",
                                  justifyContent: "flex-start",
                                  gap: 3,
                                }}
                              >
                                {typeAccessories.map((accessory) =>
                                  // Check if the accessory type is "sensor" and render the GroupedSensorDisplay component instead
                                  typeName.toLowerCase() === "sensor" ? (
                                    <GroupedSensorDisplay
                                      key={accessory.uniqueId}
                                      accessory={accessory}
                                    />
                                  ) : (
                                    <LcarsButton
                                      key={accessory.uniqueId}
                                      handleAccessoryClick={
                                        handleAccessoryClick
                                      }
                                      accessory={accessory}
                                    />
                                  )
                                )}
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
