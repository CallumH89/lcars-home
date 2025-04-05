import { Dispatch, SetStateAction } from "react";

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

export interface AuthData {
  access_token: string;
  expires_in: number;
  token_type: string;
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

export const getGroupedAccessories = (
  accessories: AccessoryType[],
  accessoriesToDisplay: AccessoryInfoType[]
): RoomGroups => {
  const filteredAccessories = getFilteredAccessories(
    accessories,
    accessoriesToDisplay
  );
  const roomGroups: RoomGroups = {};
  const groupedByDefinition: GroupedDefinition = {};

  filteredAccessories.forEach((accessory) => {
    const info = getAccessoryInfo(accessory, accessoriesToDisplay);
    const groupKey = `${info.room}-${info.type}-${info.name}`;

    if (!groupedByDefinition[groupKey]) {
      groupedByDefinition[groupKey] = {
        info,
        accessories: [],
      };
    }

    groupedByDefinition[groupKey].accessories.push(accessory);
  });

  Object.values(groupedByDefinition).forEach(({ info, accessories }) => {
    const { room, type, name } = info;

    if (!roomGroups[room]) {
      roomGroups[room] = {};
    }

    if (!roomGroups[room][type]) {
      roomGroups[room][type] = [];
    }

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

export const authenticate = async (
  homebridgeServer: string,
  authEndpoint: string,
  username: string,
  password: string,
  setLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>,
  setAuthToken: Dispatch<SetStateAction<string | null>>,
  setTokenExpiry: Dispatch<SetStateAction<number | null>>,
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

    const authData: AuthData = await authResponse.json();
    console.log("Authentication successful:", authData);

    const token = authData.access_token;
    setAuthToken(token);

    const expiryTime = Date.now() + authData.expires_in * 1000;
    setTokenExpiry(expiryTime);
    console.log(
      `Token will expire at: ${new Date(expiryTime).toLocaleString()}`
    );

    await fetchAccessories(token);
  } catch (err) {
    console.error("Error:", err);
    setError(err instanceof Error ? err.message : "Unknown error");
    setLoading(false);
  }
};

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
    setAccessories(accessoriesData);
    setLoading(false);
  } catch (err) {
    console.error("Error fetching accessories:", err);
    setError(err instanceof Error ? err.message : "Unknown error");
    setLoading(false);
  }
};

export const handleAccessoryClick = async (
  accessory: AccessoryType,
  authToken: string | null,
  homebridgeServer: string,
  accessoriesEndpoint: string,
  setAccessories: Dispatch<SetStateAction<AccessoryType[]>>
): Promise<void> => {
  try {
    if (!authToken) {
      console.error("Missing auth token");
      return;
    }

    const accessories =
      accessory.isGroup && accessory.groupedAccessories
        ? accessory.groupedAccessories
        : [accessory];
    console.log(
      `Toggling ${accessories.length} accessories in group: ${accessory.nameInfo}`
    );

    const currentValue = accessory.values.On;
    const newValue = !currentValue;

    for (const acc of accessories) {
      if (!acc.uniqueId) {
        console.error(
          "Missing accessory ID for one of the accessories in group"
        );
        continue;
      }

      const updateBody = {
        characteristicType: "On",
        value: newValue,
      };

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

    setAccessories((prevAccessories) =>
      prevAccessories.map((item) => {
        if (accessories.some((acc) => acc.uniqueId === item.uniqueId)) {
          return { ...item, values: { ...item.values, On: newValue } };
        }
        return item;
      })
    );
  } catch (err) {
    console.error("Error toggling accessory:", err);
    alert(
      `Failed to toggle ${accessory.nameInfo}: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
};

export const refreshAccessoryState = async (
  uniqueId: string,
  authToken: string | null,
  homebridgeServer: string,
  accessoriesEndpoint: string,
  setAccessories: Dispatch<SetStateAction<AccessoryType[]>>
): Promise<void> => {
  if (!authToken) return;

  try {
    const response = await fetch(
      `${homebridgeServer}${accessoriesEndpoint}/${uniqueId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `Failed to refresh accessory ${uniqueId}: ${response.statusText}`
      );
      return;
    }

    const updatedAccessory = await response.json();

    setAccessories((prevAccessories) =>
      prevAccessories.map((acc) =>
        acc.uniqueId === updatedAccessory.uniqueId ? updatedAccessory : acc
      )
    );
  } catch (err) {
    console.error(`Error refreshing accessory ${uniqueId}:`, err);
  }
};

export const refreshRoomAccessories = (
  roomName: string,
  accessories: AccessoryType[],
  accessoriesToDisplay: AccessoryInfoType[],
  authToken: string | null,
  homebridgeServer: string,
  accessoriesEndpoint: string,
  setAccessories: Dispatch<SetStateAction<AccessoryType[]>>
): void => {
  if (!roomName || !authToken) return;

  console.log(`Refreshing accessories in room: ${roomName}`);

  const roomGroups = getGroupedAccessories(accessories, accessoriesToDisplay);
  const roomAccessories = roomGroups[roomName] || {};

  Object.values(roomAccessories).forEach((typeAccessories) => {
    typeAccessories.forEach((accessory) => {
      refreshAccessoryState(
        accessory.uniqueId,
        authToken,
        homebridgeServer,
        accessoriesEndpoint,
        setAccessories
      );
    });
  });
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

export const defaultAccessoriesToDisplay: AccessoryInfoType[] = [
  {
    serviceName: "0x7cc6b6fffe38d018",
    type: "Light",
    room: "Kitchen",
    name: "Light",
  },
  {
    serviceName: "0x60b647fffe93d290",
    type: "Light",
    room: "Kitchen",
    name: "Spotlight",
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
    serviceName: "Left",
    type: "Light",
    room: "Bedroom",
    name: "KJ Lamp",
  },
  {
    serviceName: "Right",
    type: "Light",
    room: "Bedroom",
    name: "Havok Lamp",
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
