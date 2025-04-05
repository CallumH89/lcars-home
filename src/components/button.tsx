import React from "react";
import { Box, Button, Flex } from "theme-ui";
import { theme } from "../createTheme.tsx";

interface Props {
  accessory: any;
  handleAccessoryClick: (accessory: any) => void;
}

const LcarsButton: React.FC<Props> = ({ accessory, handleAccessoryClick }) => {
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
          minWidth: "200px",
          position: "relative",
          textTransform: "uppercase",
          fontWeight: "bold",
          textAlign: "left",
        }}
      >
        {accessory.nameInfo || `Accessory`}
      </Button>
    </Flex>
  );
};

export default LcarsButton;
