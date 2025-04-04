import React from "react";
import { Box, Button, Flex, Text } from "theme-ui";
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
    <Flex>
      <Box
        sx={{
          bg: !!accessory.values.On
            ? theme?.colors?.lcarsYellow3
            : theme?.colors?.lcarsInactive,
          color: theme?.colors?.text,
          mr: 1,
          borderRadius: "100vmax 0 0 100vmax",
          cursor: "pointer",
          transition: "background-color 0.2s",
          "&:hover": {
            bg: "secondary",
          },
          width: "40px",
          position: "relative",
        }}
      ></Box>
      <Button
        key={accessory.uniqueId}
        onClick={() => handleAccessoryClick(accessory)}
        sx={{
          bg: theme?.colors?.lcarsYellow1,
          color: theme?.colors?.text,
          height: 7,
          py: 2,
          borderRadius: "0 100vmax 100vmax 0",
          cursor: "pointer",
          transition: "background-color 0.2s",
          "&:hover": {
            bg: "secondary",
          },
          minWidth: "200px",
          position: "relative",
          textTransform: "uppercase",
          fontWeight: "bold",
          textAlign: "left",
        }}
      >
        {accessory.nameInfo || `Accessory`}

        {/* If this is a group, add a small indicator */}
        {/*isGroup && (
          <Text
            as="div"
            sx={{
              position: "absolute",
              top: 1,
              right: 2,
              fontSize: "10px",
              backgroundColor: theme?.colors?.lcarsInactive,
              color: theme?.colors?.lcarsWhite,
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
        )*/}
      </Button>
    </Flex>
  );
};

export default LcarsButton;
