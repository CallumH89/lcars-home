import React, { useState, useEffect, useCallback, useRef } from "react";
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
  refreshAccessoryState,
  refreshRoomAccessories,
  AccessoryType,
  getCurrentDateTime,
} from "./homebridge.helpers.ts";
import { GroupedSensorDisplay } from "./components/sensorDisplay.tsx";
import "./fonts.css";
import WeatherDisplay from "./components/weatherDisplay.tsx";

const App: React.FC = () => {
  const [accessories, setAccessories] = useState<AccessoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<number | null>(null);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState<string>(
    getCurrentDateTime("-")
  );
  const [weatherRefreshTrigger, setWeatherRefreshTrigger] = useState<number>(0);

  const accessoriesRef = useRef<AccessoryType[]>([]);
  const authTokenRef = useRef<string | null>(null);
  const activeRoomRef = useRef<string | null>(null);
  const tokenExpiryRef = useRef<number | null>(null);

  useEffect(() => {
    accessoriesRef.current = accessories;
  }, [accessories]);

  useEffect(() => {
    authTokenRef.current = authToken;
  }, [authToken]);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    tokenExpiryRef.current = tokenExpiry;
  }, [tokenExpiry]);

  const accessoriesToDisplay = defaultAccessoriesToDisplay;

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

  const handleAuthentication = useCallback(async () => {
    await authenticate(
      homebridgeConfig.server,
      homebridgeConfig.authEndpoint,
      homebridgeConfig.username,
      homebridgeConfig.password,
      setLoading,
      setError,
      setAuthToken,
      setTokenExpiry,
      fetchAccessories
    );
  }, []);

  const checkAndRefreshToken = useCallback(async () => {
    const currentExpiry = tokenExpiryRef.current;
    if (!currentExpiry) return;

    const timeUntilExpiry = currentExpiry - Date.now();

    if (timeUntilExpiry < 600000) {
      console.log("Token expiring soon, refreshing authentication...");
      await handleAuthentication();
    } else {
      console.log(
        `Token valid for ${Math.floor(timeUntilExpiry / 60000)} more minutes`
      );
    }
  }, [handleAuthentication]);

  const handleAccessoryClick = (accessory: AccessoryType): void => {
    handleAccessoryClickHelper(
      accessory,
      authTokenRef.current,
      homebridgeConfig.server,
      homebridgeConfig.accessoriesEndpoint,
      setAccessories
    );
  };

  const refreshActiveRoomAccessories = useCallback(() => {
    const currentActiveRoom = activeRoomRef.current;
    if (!currentActiveRoom) return;

    console.log(`Refreshing accessories in room: ${currentActiveRoom}`);

    refreshRoomAccessories(
      currentActiveRoom,
      accessoriesRef.current,
      accessoriesToDisplay,
      authTokenRef.current,
      homebridgeConfig.server,
      homebridgeConfig.accessoriesEndpoint,
      setAccessories
    );
  }, []);

  useEffect(() => {
    setCurrentDateTime(getCurrentDateTime("-"));

    const timeInterval = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime("-"));
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    setWeatherRefreshTrigger((prev) => prev + 1);

    const weatherInterval = setInterval(() => {
      console.log("Refreshing weather data...");
      setWeatherRefreshTrigger((prev) => prev + 1);
    }, 1800000);

    return () => clearInterval(weatherInterval);
  }, []);

  useEffect(() => {
    if (!activeRoom) return;

    refreshActiveRoomAccessories();

    const accessoryRefreshInterval = setInterval(async () => {
      console.log(`Scheduled refresh for room: ${activeRoom}`);

      await checkAndRefreshToken();

      refreshActiveRoomAccessories();
    }, 300000);

    return () => clearInterval(accessoryRefreshInterval);
  }, [activeRoom, checkAndRefreshToken, refreshActiveRoomAccessories]);

  useEffect(() => {
    if (!tokenExpiry) return;

    const tokenCheckInterval = setInterval(async () => {
      await checkAndRefreshToken();
    }, 3600000);

    return () => clearInterval(tokenCheckInterval);
  }, [tokenExpiry, checkAndRefreshToken]);

  useEffect(() => {
    handleAuthentication();
  }, [handleAuthentication]);

  const getRooms = (): string[] => {
    if (loading || accessories.length === 0) return [];

    const roomGroups = getGroupedAccessories(accessories, accessoriesToDisplay);
    return Object.keys(roomGroups);
  };

  useEffect(() => {
    if (!loading && accessories.length > 0 && activeRoom === null) {
      const rooms = getRooms();
      if (rooms.length > 0) {
        setActiveRoom(rooms[0]);
      }
    }
  }, [loading, accessories, activeRoom]);

  const getActiveRoomAccessories = () => {
    if (!activeRoom) return {};

    const roomGroups = getGroupedAccessories(accessories, accessoriesToDisplay);
    return { [activeRoom]: roomGroups[activeRoom] || {} };
  };

  const sortTypeEntries = (entries: [string, AccessoryType[]][]) => {
    return entries.sort((a, b) => {
      const [typeA] = a;
      const [typeB] = b;

      if (typeA.toLowerCase() === "sensor") return -1;
      if (typeB.toLowerCase() === "sensor") return 1;
      return typeA.localeCompare(typeB);
    });
  };

  const handleRoomSelect = (roomName: string) => {
    setActiveRoom(roomName);
  };

  return (
    <Container
      sx={{
        backgroundAttachment: "fixed",
        bg: theme?.colors?.lcarsBackground,
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
          <Grid
            gap={0}
            columns={["182px 1fr"]}
            sx={{ color: theme?.colors?.lcarsPurple1 }}
          >
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
                  backgroundColor: theme?.colors?.lcarsPurple1,
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
                <WeatherDisplay refreshTrigger={weatherRefreshTrigger} />
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
                    backgroundColor: theme?.colors?.lcarsPurple1,
                  }}
                ></Box>
                <Box
                  sx={{
                    height: 5,
                    alignItems: "center",
                    justifyContent: "center",
                    display: "flex",
                    fontSize: 3,
                  }}
                >
                  {currentDateTime}
                </Box>
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    backgroundColor: theme?.colors?.lcarsPurple1,
                  }}
                ></Box>
              </Flex>
            </Flex>
          </Grid>

          <Grid
            gap={0}
            columns={["182px 1fr"]}
            sx={{
              position: "relative",
              flex: 1,
              color: theme?.colors?.lcarsYellow3,
            }}
          >
            <Flex sx={{ flexDirection: "column", position: "relative" }}>
              <Box
                sx={{
                  height: "100px",
                  mb: 1,
                  backgroundColor: theme?.colors?.lcarsYellow3,
                  padding: 2,
                  borderRadius: "100px 0 0 0",
                }}
              ></Box>
              <Flex sx={{ flexDirection: "column" }}>
                {getRooms().map((roomName) => (
                  <NavLink
                    key={roomName}
                    onClick={() => handleRoomSelect(roomName)}
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
                  backgroundColor: theme?.colors?.lcarsYellow3,
                  padding: 2,
                }}
              ></Box>
              <Box
                sx={{
                  mb: 1,
                  backgroundColor: theme?.colors?.lcarsYellow3,
                  padding: 2,
                  flex: 1,
                }}
              ></Box>
            </Flex>

            <Box
              sx={{
                position: "relative",
                "::before": {
                  content: "''",
                  display: "block",
                  width: "60px",
                  height: "60px",
                  background: `linear-gradient(to bottom right, ${theme?.colors?.lcarsYellow3} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
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
                    backgroundColor: theme?.colors?.lcarsYellow3,
                    alignSelf: "end",
                  }}
                ></Box>
                <Box
                  sx={{
                    flex: 1,
                    height: 5,
                    backgroundColor: theme?.colors?.lcarsYellow3,
                    alignSelf: "end",
                  }}
                ></Box>
              </Flex>
              {activeRoom ? (
                <Box sx={{ py: 6, px: 6, position: "relative", zIndex: 2 }}>
                  {Object.entries(getActiveRoomAccessories()).map(
                    ([roomName, typeGroups]) => (
                      <Box key={roomName}>
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
