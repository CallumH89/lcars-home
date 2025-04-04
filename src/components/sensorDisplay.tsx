import React from "react";
import { Box, Flex, Text } from "theme-ui";
import { theme } from "../createTheme.tsx";

// Define type for accessory to avoid any issues
export interface AccessoryType {
  aid?: number;
  iid?: number;
  uuid?: string;
  type?: string;
  humanType?: string;
  serviceName?: string;
  serviceCharacteristics?: Array<{
    aid?: number;
    iid?: number;
    uuid?: string;
    type?: string;
    serviceType?: string;
    serviceName?: string;
    description?: string;
    value?: any;
    format?: string;
    perms?: string[];
    unit?: string;
    maxValue?: number;
    minValue?: number;
    minStep?: number;
    canRead?: boolean;
    canWrite?: boolean;
    ev?: boolean;
  }>;
  accessoryInformation?: Record<string, any>;
  values?: Record<string, any>;
  instance?: {
    name?: string;
    username?: string;
    ipAddress?: string;
    port?: number;
    services?: any[];
    connectionFailedCount?: number;
  };
  uniqueId: string;
  roomInfo?: string;
  typeInfo?: string;
  nameInfo?: string;
  isGroup?: boolean;
  groupedAccessories?: AccessoryType[];
  displayName?: string;
}

// Helper function to check if an accessory is battery-related
const isBatteryAccessory = (accessory: AccessoryType): boolean => {
  // Check if type includes "Battery"
  if (accessory.type?.includes("Battery")) return true;

  // Check if humanType includes "Battery"
  if (accessory.humanType?.includes("Battery")) return true;

  // Check if nameInfo includes "Battery"
  if (accessory.nameInfo?.includes("Battery")) return true;

  // Check if it has BatteryLevel or StatusLowBattery values
  if (
    accessory.values &&
    (Object.keys(accessory.values).includes("BatteryLevel") ||
      Object.keys(accessory.values).includes("StatusLowBattery") ||
      Object.keys(accessory.values).includes("ChargingState"))
  ) {
    return true;
  }

  return false;
};

// Create a SensorBar component for individual sensors in LCARS style
export const SensorBar: React.FC<{
  accessory: AccessoryType;
  label: string;
}> = ({ accessory, label }) => {
  // Helper function to get the value and unit
  const getValueWithUnit = (values: Record<string, any> | undefined) => {
    if (!values || Object.keys(values).length === 0)
      return { value: 0, unit: "", name: "" };

    const key = Object.keys(values)[0];
    const value = values[key];

    // Find the matching characteristic to get the unit
    let unit = "";
    if (accessory.serviceCharacteristics) {
      const characteristic = accessory.serviceCharacteristics.find(
        (c) => c.type === key
      );
      if (characteristic && characteristic.unit) {
        unit = characteristic.unit;
      }
    }

    return { value, unit, name: key };
  };

  const valueData = getValueWithUnit(accessory.values);

  // Format the value for display
  const getFormattedValue = () => {
    if (!valueData) return "0";

    let formattedValue = valueData.value;

    // Format values appropriately
    if (typeof formattedValue === "number") {
      // Use toFixed(1) for temperatures, otherwise whole numbers
      formattedValue = valueData.name.includes("Temperature")
        ? formattedValue.toFixed(1)
        : Math.round(formattedValue);
    }

    // Add appropriate unit symbols
    let unitDisplay = "";
    switch (valueData.unit) {
      case "celsius":
        unitDisplay = "DEGREES";
        break;
      case "percentage":
        unitDisplay = "%";
        break;
      default:
        unitDisplay = valueData.unit ? valueData.unit.toUpperCase() : "";
    }

    return `${formattedValue} ${unitDisplay}`;
  };

  // Calculate the percentage for the bar
  const calculateBarPercentage = () => {
    if (!valueData || typeof valueData.value !== "number") return 0;

    // For temperature sensors
    if (valueData.name.includes("Temperature")) {
      // Assuming temp range from -10 to 40°C
      const min = -20;
      const max = 50;
      const percentage = Math.min(
        100,
        Math.max(0, ((valueData.value - min) / (max - min)) * 100)
      );
      return percentage;
    }

    // For humidity and other percentage-based sensors
    if (valueData.unit === "percentage") {
      return valueData.value;
    }

    // Default for other types
    return 50; // Default to 50% if we can't determine
  };
  // Calculate the percentage for the bar
  const calculateBarColor = (barPercentage: number) => {
    if (barPercentage < 15) {
      return theme?.colors?.lcarsBlue3;
    } else if (barPercentage < 30) {
      return theme?.colors?.lcarsBlue2;
    } else if (barPercentage < 40) {
      return theme?.colors?.lcarsGreen1;
    } else if (barPercentage < 50) {
      return theme?.colors?.lcarsGreen2;
    } else if (barPercentage < 60) {
      return theme?.colors?.lcarsGreen3;
    } else if (barPercentage < 70) {
      return theme?.colors?.lcarsOrange1;
    } else if (barPercentage < 80) {
      return theme?.colors?.lcarsRed1;
    } else if (barPercentage < 90) {
      return theme?.colors?.lcarsRed2;
    } else {
      return theme?.colors?.lcarsRed3;
    }
  };
  const barPercentage = calculateBarPercentage();

  const barColor = calculateBarColor(barPercentage);
  return (
    <Flex
      sx={{
        alignItems: "center",
        width: "100%",
        mb: 3,
        ":last-of-type": { mb: 0 },
      }}
    >
      {/* Left label */}
      <Box
        sx={{
          width: 8,
          mr: 0,
          textAlign: "left",
          color: theme.colors?.lcarsYellow1,
          px: 0,
          fontWeight: "bold",
          height: 6,
          alignContent: "center",
          fontSize: 2,
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {label}
      </Box>

      {/* Progress bar */}
      <Box
        sx={{
          flex: 1,
          height: 6,
          backgroundColor: theme?.colors?.lcarsYellow1,
          border: `2px solid ${theme?.colors?.lcarsYellow1}`,
          position: "relative",
          mr: 2,
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${barPercentage}%`,
            backgroundColor: barColor,
            borderRight: `2px solid ${barColor}`,
          }}
        >
          {/* Vertical lines pattern */}
          <Flex
            sx={{
              height: "100%",
              width: "100%",
              alignItems: "stretch",
              justifyContent: "space-between",
            }}
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <Box
                key={i}
                sx={{
                  width: "1px",
                  height: "100%",
                  backgroundColor: theme?.colors?.lcarsBackground,
                  opacity: 0.7,
                }}
              />
            ))}
          </Flex>
        </Box>
      </Box>

      {/* Right value display */}
      <Box
        sx={{
          width: "100px",
          height: 6,
          p: 0,
          fontWeight: "bold",
          fontSize: 3,
          color: barColor,
          textAlign: "left",
          alignContent: "center",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        {getFormattedValue()}
      </Box>
    </Flex>
  );
};

// Component to handle grouped sensor display in LCARS style
export const GroupedSensorDisplay: React.FC<{ accessory: AccessoryType }> = ({
  accessory,
}) => {
  if (
    !accessory.isGroup ||
    !accessory.groupedAccessories ||
    accessory.groupedAccessories.length === 0
  ) {
    // If it's not a group or has no grouped accessories, fall back to simple display
    return <SingleSensorDisplay accessory={accessory} />;
  }

  // Filter out battery accessories from the grouped accessories
  const filteredAccessories = accessory.groupedAccessories.filter(
    (groupedAccessory) => !isBatteryAccessory(groupedAccessory)
  );

  // If after filtering there are no accessories left, don't render anything
  if (filteredAccessories.length === 0) {
    return null;
  }

  // Get the group name
  const getGroupName = () => {
    return accessory.nameInfo?.replace(/\s*Sensor\s*$/i, "") || "SENSOR STATUS";
  };

  // Function to get the appropriate label for a sensor
  const getSensorLabel = (sensor: AccessoryType) => {
    if (sensor.type?.includes("Temperature")) {
      return sensor.roomInfo?.toUpperCase() || "TEMPERATURE";
    }
    if (sensor.type?.includes("Humidity")) {
      return "HUMIDITY";
    }
    // Add more sensor types as needed
    return (
      sensor.humanType?.replace(/\s*Sensor\s*$/i, "").toUpperCase() || "SENSOR"
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "800px",
        backgroundColor: theme?.colors?.lcarsBackground,
        overflow: "hidden",
        mb: 4,
      }}
    >
      {/* Header */}
      <Box>
        <Flex sx={{ flexDirection: "column", position: "relative", gap: 0 }}>
          <Flex sx={{ flexDirection: "row", position: "relative", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 5,
                minHeight: 5,
                backgroundColor: theme?.colors?.lcarsYellow1,
                position: "relative",
                borderRadius: "100vmax 0 0 0 ",
                "::before": {
                  content: "''",
                  display: "block",
                  width: 6,
                  height: 6,
                  background: `linear-gradient(to bottom right, ${theme?.colors?.lcarsYellow1} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                  position: "absolute",
                  left: 4,
                  top: 5,
                  zIndex: "1",
                },
                "::after": {
                  content: "''",
                  display: "block",
                  width: 6,
                  height: 6,
                  backgroundColor: theme?.colors?.lcarsBackground,
                  borderRadius: "100vmax 0 0 0 ",
                  position: "absolute",
                  left: 4,
                  top: 5,
                  zIndex: "1",
                },
              }}
            ></Box>

            <Box
              sx={{
                color: theme?.colors?.lcarsYellow1,
                fontWeight: "bold",
                textAlign: "center",
                fontSize: 2,
                height: 5,
              }}
            >
              {getGroupName()}
            </Box>
            <Box
              sx={{
                height: 5,
                backgroundColor: theme?.colors?.lcarsYellow1,
                color: theme?.colors?.lcarsBackground,
                py: 2,
                position: "relative",
                flex: 1,
              }}
            ></Box>
            <Box
              sx={{
                height: 5,
                backgroundColor: theme?.colors?.lcarsYellow1,
                color: theme?.colors?.lcarsBackground,
                py: 2,
                position: "relative",
                borderRadius: " 0 100vmax 0 0 ",
                width: 9,
                "::before": {
                  content: "''",
                  display: "block",
                  width: 6,
                  height: 6,
                  background: `linear-gradient(to bottom left, ${theme?.colors?.lcarsYellow1} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                  position: "absolute",
                  right: 7,
                  top: 5,
                  zIndex: "1",
                },
                "::after": {
                  content: "''",
                  display: "block",
                  width: 6,
                  height: 6,
                  backgroundColor: theme?.colors?.lcarsBackground,
                  borderRadius: " 0 100vmax 0 0 ",
                  position: "absolute",
                  right: 7,
                  top: 5,
                  zIndex: "1",
                },
              }}
            ></Box>
          </Flex>
          <Flex>
            <Box
              sx={{
                width: 4,
                minHeight: 8,
                backgroundColor: theme?.colors?.lcarsYellow1,
                position: "relative",
              }}
            ></Box>
            <Box
              sx={{
                flex: 1,
                flexDirection: "column",
                position: "relative",
                zIndex: 2,
              }}
            >
              <Box sx={{ p: 3 }}>
                {filteredAccessories.map((sensor, index) => {
                  return (
                    <SensorBar
                      key={sensor.uniqueId}
                      accessory={sensor}
                      label={getSensorLabel(sensor)}
                    />
                  );
                })}
              </Box>
            </Box>
            <Box
              sx={{
                width: 7,
                backgroundColor: theme?.colors?.lcarsYellow1,
                position: "relative",
              }}
            ></Box>
          </Flex>
          <Flex sx={{ flexDirection: "row", position: "relative", gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 5,
                backgroundColor: theme?.colors?.lcarsYellow1,
                position: "relative",
                borderRadius: " 0 0 0 100vmax",
                "::before": {
                  content: "''",
                  display: "block",
                  width: 6,
                  height: 6,
                  background: `linear-gradient(to top right, ${theme?.colors?.lcarsYellow1} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                  position: "absolute",
                  left: 4,
                  bottom: 5,
                  zIndex: "1",
                },
                "::after": {
                  content: "''",
                  display: "block",
                  width: 6,
                  height: 6,
                  backgroundColor: theme?.colors?.lcarsBackground,
                  borderRadius: "0 0 0 100vmax",
                  position: "absolute",
                  left: 4,
                  bottom: 5,
                  zIndex: "1",
                },
              }}
            ></Box>

            <Box
              sx={{
                height: 5,
                backgroundColor: theme?.colors?.lcarsYellow1,
                color: theme?.colors?.lcarsBackground,
                position: "relative",
                flex: 1,
              }}
            ></Box>
            <Box
              sx={{
                height: 5,
                backgroundColor: theme?.colors?.lcarsYellow1,
                color: theme?.colors?.lcarsBackground,
                position: "relative",
                borderRadius: "0 0 100vmax 0",
                width: 9,
                "::before": {
                  content: "''",
                  display: "block",
                  width: 6,
                  height: 6,
                  background: `linear-gradient(to top left, ${theme?.colors?.lcarsYellow1} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                  position: "absolute",
                  right: 7,
                  bottom: 5,
                  zIndex: "1",
                },
                "::after": {
                  content: "''",
                  display: "block",
                  width: 6,
                  height: 6,
                  backgroundColor: theme?.colors?.lcarsBackground,
                  borderRadius: " 0  0  100vmax 0 ",
                  position: "absolute",
                  right: 7,
                  bottom: 5,
                  zIndex: "1",
                },
              }}
            ></Box>
          </Flex>
          {/* Sensor bars */}
        </Flex>
      </Box>
    </Box>
  );
};

// Fallback for single sensors
export const SingleSensorDisplay: React.FC<{ accessory: AccessoryType }> = ({
  accessory,
}) => {
  // Get human-readable name
  const getDisplayName = () => {
    // If nameInfo is available, use it
    if (accessory.nameInfo) {
      return accessory.nameInfo.replace(/\s*Sensor\s*$/i, "");
    }

    // If humanType is available, use it but remove "Sensor" if present
    if (accessory.humanType) {
      return accessory.humanType.replace(/\s*Sensor\s*$/i, "");
    }

    // If type is available, convert camelCase to normal text and remove "Sensor"
    if (accessory.type) {
      // Convert camelCase to normal text (e.g., "TemperatureSensor" to "Temperature Sensor")
      const formattedType = accessory.type.replace(/([A-Z])/g, " $1").trim();
      // Remove "Sensor" word if present
      return formattedType.replace(/\s*Sensor\s*$/i, "");
    }

    return "Device";
  };

  // Determine how to display the value
  const displayValue = () => {
    if (!accessory.values || Object.keys(accessory.values).length === 0)
      return "";

    const key = Object.keys(accessory.values)[0];
    const value = accessory.values[key];

    // Find the matching characteristic to get the unit
    let unit = "";
    if (accessory.serviceCharacteristics) {
      const characteristic = accessory.serviceCharacteristics.find(
        (c) => c.type === key
      );
      if (characteristic && characteristic.unit) {
        unit = characteristic.unit;
      }
    }

    let formattedValue = value;

    // Format values appropriately
    if (typeof formattedValue === "number") {
      // Use toFixed(1) for temperatures, otherwise whole numbers
      formattedValue = key.includes("Temperature")
        ? formattedValue.toFixed(1)
        : Math.round(formattedValue);
    }

    // Add appropriate unit symbols
    let unitSymbol = "";
    switch (unit) {
      case "celsius":
        unitSymbol = "°C";
        break;
      case "percentage":
        unitSymbol = "%";
        break;
      default:
        unitSymbol = unit ? ` ${unit}` : "";
    }

    return `${formattedValue}${unitSymbol}`;
  };

  return (
    <Box
      sx={{
        backgroundColor: theme?.colors?.lcarsYellow1,
        color: theme?.colors?.lcarsBackground,
        padding: 2,
        borderRadius: "4px",
        minWidth: "120px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text sx={{ textAlign: "center" }}>{getDisplayName()}</Text>
      <Text sx={{ fontWeight: "bold", mt: 1, fontSize: 3 }}>
        {displayValue()}
      </Text>
    </Box>
  );
};
