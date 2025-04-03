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
  highlightColor?: any;
}> = ({ accessory, label, highlightColor = theme?.colors?.lcarsYellow1 }) => {
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
      const max = 40;
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

  const barPercentage = calculateBarPercentage();

  return (
    <Flex sx={{ alignItems: "center", width: "100%", mb: 3 }}>
      {/* Left label */}
      <Box
        sx={{
          width: 8,
          mr: 0,
          textAlign: "left",
          color: highlightColor,
          px: 0,
          fontWeight: "bold",
          height: 6,
          alignContent: "center",
        }}
      >
        {label}
      </Box>

      {/* Progress bar */}
      <Box
        sx={{
          flex: 1,
          height: 6,
          backgroundColor: theme?.colors?.lcarsBackground,
          border: `1px solid ${highlightColor}`,
          position: "relative",
          mr: 2,
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${barPercentage}%`,
            backgroundColor: highlightColor,
            borderRight: `2px solid ${theme?.colors?.lcarsBackground}`,
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
          p: 0,
          fontWeight: "bold",
          color: highlightColor,
          textAlign: "right",
          alignContent: "center",
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
        borderRadius: "8px",
        overflow: "hidden",
        mb: 4,
        border: `1px solid ${theme?.colors?.lcarsYellow1}`,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor: theme?.colors?.lcarsYellow1,
          color: theme?.colors?.lcarsBackground,
          fontWeight: "bold",
          textAlign: "left",
          pl: 3,
          fontSize: 2,
          height: 5,
        }}
      >
        {getGroupName()}
      </Box>

      {/* Sensor bars */}
      <Box sx={{ p: 3 }}>
        {filteredAccessories.map((sensor, index) => {
          // Alternate colors for different sensor types
          const highlightColor = sensor.type?.includes("Temperature")
            ? theme?.colors?.lcarsOrange1
            : theme?.colors?.lcarsYellow1;

          return (
            <SensorBar
              key={sensor.uniqueId}
              accessory={sensor}
              label={getSensorLabel(sensor)}
              highlightColor={highlightColor}
            />
          );
        })}
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
