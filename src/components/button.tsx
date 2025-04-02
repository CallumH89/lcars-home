import React from "react";
import { Button, Text } from "theme-ui";
import { theme } from "../createTheme.tsx";

interface Props {
  accessory: any;
  handleAccessoryClick: (accessory: any) => void;
}

const LcarsButton: React.FC<Props> = ({ accessory, handleAccessoryClick }) => {
  // Check if this is a group of accessories
  const isGroup = accessory.isGroup;
  const accessoryCount = isGroup ? accessory.groupedAccessories.length : 1;

  return (
    <Button
      key={accessory.uniqueId}
      onClick={() => handleAccessoryClick(accessory)}
      sx={{
        bg: !!accessory.values.On
          ? theme?.colors?.lcarsGreen1
          : theme?.colors?.lcarsRed2,
        color: theme?.colors?.text,
        px: 3,
        py: 2,
        borderRadius: "4px",
        cursor: "pointer",
        transition: "background-color 0.2s",
        "&:hover": {
          bg: "secondary",
        },
        minWidth: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {accessory.nameInfo || `Accessory`}

      {/* If this is a group, add a small indicator */}
      {isGroup && (
        <Text
          as="div"
          sx={{
            position: "absolute",
            top: 1,
            right: 1,
            fontSize: "10px",
            backgroundColor: theme?.colors?.lcarsOrange2,
            color: "#000",
            borderRadius: "50%",
            width: "18px",
            height: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {accessoryCount}
        </Text>
      )}
    </Button>
  );
};

export default LcarsButton;
