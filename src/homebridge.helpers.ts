// Helper functions for processing and managing Homebridge accessories
import { Dispatch, SetStateAction } from "react";

// Types
export interface AccessoryValue {
  On: boolean;
  [key: string]: any;
}

export interface AccessoryInfoType {
  type: string;
  room: string;
  name: string;
  serviceName: string | string[];
}

export interface AccessoryType {
  uniqueId: string;
  serviceName: string;
  values: AccessoryValue;
  nameInfo?: string;
  roomInfo?: string;
  typeInfo?: string;
  isGroup?: boolean;
  groupedAccessories?: AccessoryType[];
  [key: string]: any;
}

interface GroupedDefinition {
  [key: string]: {
    info: AccessoryInfoType;
    accessories: AccessoryType[];
  };
}

interface RoomGroups {
  [room: string]: {
    [type: string]: AccessoryType[];
  };
}

// Get the filtered accessories that match our display list
export const getFilteredAccessories = (
  accessories: AccessoryType[],
  accessoriesToDisplay: AccessoryInfoType[]
): AccessoryType[] => {
  return accessories.filter((accessory) =>
    accessoriesToDisplay.some((item) =>
      Array.isArray(item.serviceName)
        ? item.serviceName.includes(accessory.serviceName)
        : item.serviceName === accessory.serviceName
    )
  );
};

// Get room and type information for an accessory
export const getAccessoryInfo = (
  accessory: AccessoryType,
  accessoriesToDisplay: AccessoryInfoType[]
): AccessoryInfoType => {
  const info = accessoriesToDisplay.find((item) =>
    Array.isArray(item.serviceName)
      ? item.serviceName.includes(accessory.serviceName)
      : item.serviceName === accessory.serviceName
  );
  return (
    info || { type: "Unknown", room: "Other", name: "Unknown", serviceName: "" }
  );
};

// Group accessories by room and then by type
export const getGroupedAccessories = (
  accessories: AccessoryType[],
  accessoriesToDisplay: AccessoryInfoType[]
): RoomGroups => {
  const filteredAccessories = getFilteredAccessories(
    accessories,
    accessoriesToDisplay
  );
  const roomGroups: RoomGroups = {};

  // Create a map to group accessories by their group definition
  const groupedByDefinition: GroupedDefinition = {};

  // First, organize accessories by their group definition
  filteredAccessories.forEach((accessory) => {
    const info = getAccessoryInfo(accessory, accessoriesToDisplay);
    // Create a unique key for this group
    const groupKey = `${info.room}-${info.type}-${info.name}`;

    if (!groupedByDefinition[groupKey]) {
      groupedByDefinition[groupKey] = {
        info,
        accessories: [],
      };
    }

    groupedByDefinition[groupKey].accessories.push(accessory);
  });

  // Now create the room/type hierarchy with grouped accessories
  Object.values(groupedByDefinition).forEach(({ info, accessories }) => {
    const { room, type, name } = info;

    if (!roomGroups[room]) {
      roomGroups[room] = {};
    }

    if (!roomGroups[room][type]) {
      roomGroups[room][type] = [];
    }

    // Create a "virtual" accessory that represents the group
    const primaryAccessory = accessories[0];
    roomGroups[room][type].push({
      ...primaryAccessory,
      roomInfo: room,
      typeInfo: type,
      nameInfo: name,
      isGroup: accessories.length > 1,
      groupedAccessories: accessories,
    });
  });

  return roomGroups;
};

// Authentication function
export const authenticate = async (
  homebridgeServer: string,
  authEndpoint: string,
  username: string,
  password: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setAuthToken: Dispatch<SetStateAction<string | null>>,
  fetchAccessories: (token: string) => Promise<void>
): Promise<void> => {
  try {
    setLoading(true);

    const authResponse = await fetch(`${homebridgeServer}${authEndpoint}`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    if (!authResponse.ok) {
      throw new Error(`Authentication failed! Status: ${authResponse.status}`);
    }

    const authData = await authResponse.json();
    console.log("Authentication successful:", authData);

    // Save the auth token
    const token = authData.access_token;
    setAuthToken(token);

    // Fetch accessories with the token
    await fetchAccessories(token);
  } catch (err) {
    console.error("Error:", err);
    setError(err instanceof Error ? err.message : "Unknown error");
    setLoading(false);
  }
};

// Function to fetch accessories
export const fetchAccessories = async (
  token: string,
  homebridgeServer: string,
  accessoriesEndpoint: string,
  setAccessories: Dispatch<SetStateAction<AccessoryType[]>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>
): Promise<void> => {
  try {
    const accessoriesResponse = await fetch(
      `${homebridgeServer}${accessoriesEndpoint}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!accessoriesResponse.ok) {
      throw new Error(
        `Failed to fetch accessories! Status: ${accessoriesResponse.status}`
      );
    }

    const accessoriesData = await accessoriesResponse.json();
    console.log("Accessories:", accessoriesData);
    setAccessories(accessoriesData);
    setLoading(false);
  } catch (err) {
    console.error("Error fetching accessories:", err);
    setError(err instanceof Error ? err.message : "Unknown error");
    setLoading(false);
  }
};

// Handle button click for an accessory - Toggle the On value
export const handleAccessoryClick = async (
  accessory: AccessoryType,
  authToken: string | null,
  homebridgeServer: string,
  accessoriesEndpoint: string,
  setAccessories: Dispatch<SetStateAction<AccessoryType[]>>
): Promise<void> => {
  console.log(accessory);
  try {
    if (!authToken) {
      console.error("Missing auth token");
      return;
    }

    // Check if this is a group of accessories
    const accessories =
      accessory.isGroup && accessory.groupedAccessories
        ? accessory.groupedAccessories
        : [accessory];
    console.log(
      `Toggling ${accessories.length} accessories in group: ${accessory.nameInfo}`
    );

    // Determine the new value (toggle the current state)
    const currentValue = accessory.values.On;
    const newValue = !currentValue;

    // Toggle each accessory in the group
    for (const acc of accessories) {
      if (!acc.uniqueId) {
        console.error(
          "Missing accessory ID for one of the accessories in group"
        );
        continue;
      }

      // Prepare the request body for updating the accessory
      const updateBody = {
        characteristicType: "On",
        value: newValue,
      };

      // Make the PUT request to toggle the accessory
      const updateResponse = await fetch(
        `${homebridgeServer}${accessoriesEndpoint}/${acc.uniqueId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateBody),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(
          `Failed to update accessory! Status: ${updateResponse.status}`
        );
      }

      console.log(`Accessory ${acc.serviceName} toggled to: ${newValue}`);
    }

    // Update the local state to reflect the change for all accessories in the group
    setAccessories((prevAccessories) =>
      prevAccessories.map((item) => {
        // Check if this item is part of the group we just toggled
        if (accessories.some((acc) => acc.uniqueId === item.uniqueId)) {
          return { ...item, values: { ...item.values, On: newValue } };
        }
        return item;
      })
    );
  } catch (err) {
    console.error("Error toggling accessory:", err);
    // Optionally show an error message to the user
    alert(
      `Failed to toggle ${accessory.nameInfo}: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
};

export const getWeather = async (
  key: string,
  q: string,
  setWeatherData: Dispatch<SetStateAction<object | null>>
): Promise<void> => {
  try {
    const weatherResponse = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${key}&q=${q}&days=1&aqi=no&alerts=no`,
      {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const weatherData = await weatherResponse.json();
    setWeatherData(weatherData);
    console.log("weatherData successful:", weatherData);
  } catch (err) {
    console.error("Error:", err);
  }
};

export function getCurrentDateTime(separator = "") {
  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let hours = newDate.getHours();
  let minutes = newDate.getMinutes();

  return `${year}${separator}${month < 10 ? `0${month}` : `${month}`}${separator}${date < 10 ? `0${date}` : `${date}`} ${hours < 10 ? `0${hours}` : `${hours}`}:${minutes < 10 ? `0${minutes}` : `${minutes}`}`;
}

// Export the accessory list for use in other files
export const defaultAccessoriesToDisplay: AccessoryInfoType[] = [
  {
    serviceName: "0x7cc6b6fffe38d018",
    type: "Light",
    room: "Kitchen",
    name: "Kitchen Light",
  },
  {
    serviceName: "0x6c5cb1fffe60d10b",
    type: "Light",
    room: "Living Room",
    name: "Globe Lamp",
  },
  {
    serviceName: "0xdc8e95fffe3f9f1e",
    type: "Light",
    room: "Living Room",
    name: "Sofa Lamp",
  },
  {
    serviceName: ["Right", "Left"],
    type: "Light",
    room: "Bedroom",
    name: "Bedside Lamp",
  },
  {
    serviceName: "0xa4c13892132d2083",
    type: "Sensor",
    room: "Bedroom",
    name: "Internal Sensor Status",
  },
  {
    serviceName: [
      "0xf082c0fffe25ac0c",
      "0xf082c0fffe6ef559",
      "0xf082c0fffe6f079a",
    ],
    type: "Light",
    room: "Hallway",
    name: "Light",
  },
  {
    serviceName: "0xa4c138d7f57d3b4c",
    type: "Sensor",
    room: "Office",
    name: "Temperature Sensor",
  },
];
