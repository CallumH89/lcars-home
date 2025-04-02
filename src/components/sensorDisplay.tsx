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

// Create a SensorDisplay component for sensor type accessories
export const SensorDisplay: React.FC<{ accessory: AccessoryType }> = ({
  accessory,
}) => {
  // Helper function to get the first value from an object
  const getFirstValueWithUnit = (values: Record<string, any> | undefined) => {
    if (!values || Object.keys(values).length === 0) return null;

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

  // Get the value and unit for display
  const valueData = getFirstValueWithUnit(accessory.values);

  // Determine how to display the value
  const displayValue = () => {
    if (!valueData) return "";

    let formattedValue = valueData.value;

    // Format values appropriately
    if (typeof formattedValue === "number") {
      // Use toFixed(1) for temperatures, otherwise whole numbers
      formattedValue = valueData.name.includes("Temperature")
        ? formattedValue.toFixed(1)
        : Math.round(formattedValue);
    }

    // Add appropriate unit symbols
    let unitSymbol = "";
    switch (valueData.unit) {
      case "celsius":
        unitSymbol = "°C";
        break;
      case "percentage":
        unitSymbol = "%";
        break;
      default:
        unitSymbol = valueData.unit ? ` ${valueData.unit}` : "";
    }

    return `${formattedValue}${unitSymbol}`;
  };

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

// Component to handle grouped sensor display
export const GroupedSensorDisplay: React.FC<{ accessory: AccessoryType }> = ({
  accessory,
}) => {
  if (
    !accessory.isGroup ||
    !accessory.groupedAccessories ||
    accessory.groupedAccessories.length === 0
  ) {
    // If it's not a group or has no grouped accessories, just render a single sensor display
    return <SensorDisplay accessory={accessory} />;
  }

  // Filter out battery accessories from the grouped accessories
  const filteredAccessories = accessory.groupedAccessories.filter(
    (groupedAccessory) => !isBatteryAccessory(groupedAccessory)
  );

  // If after filtering there are no accessories left, don't render anything
  if (filteredAccessories.length === 0) {
    return null;
  }

  return (
    <Flex
      sx={{
        flexDirection: "column",
        gap: 2,
        border: `1px solid ${theme?.colors?.lcarsYellow1}`,
        borderRadius: "4px",
        padding: 2,
        backgroundColor: theme?.colors?.lcarsBackground,
      }}
    >
      <Text
        sx={{
          fontWeight: "bold",
          color: theme?.colors?.lcarsYellow1,
          textAlign: "center",
        }}
      >
        {accessory.nameInfo || "Sensor Group"}
      </Text>

      <Flex sx={{ gap: 2, flexWrap: "wrap" }}>
        {filteredAccessories.map((groupedAccessory) => (
          <Box
            key={groupedAccessory.uniqueId}
            sx={{
              flex: "1 1 auto",
              minWidth: "120px",
              maxWidth: "200px",
            }}
          >
            <SensorDisplay accessory={groupedAccessory} />
          </Box>
        ))}
      </Flex>
    </Flex>
  );
};
