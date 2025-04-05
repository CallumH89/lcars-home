import React, { useEffect } from "react";
import { Box, Flex, Text } from "theme-ui";
import { theme } from "../createTheme.tsx";

interface ErrorModalProps {
  error: string | null;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose }) => {
  useEffect(() => {
    // Close the modal when Escape key is pressed
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleEscapeKey);

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  if (!error) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(9, 9, 9, 0.8)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease-in-out",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          width: "600px",
          maxWidth: "90%",
          backgroundColor: theme?.colors?.lcarsBackground,
          borderRadius: "8px",
          overflow: "hidden",
          animation: "slideIn 0.3s ease-out",
          "@keyframes slideIn": {
            from: { transform: "translateY(-20px)", opacity: 0 },
            to: { transform: "translateY(0)", opacity: 1 },
          },
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box>
          <Flex sx={{ flexDirection: "column", position: "relative", gap: 0 }}>
            <Flex sx={{ flexDirection: "row", position: "relative", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 7,
                  minHeight: 7,
                  backgroundColor: theme?.colors?.lcarsRed2,
                  position: "relative",
                  borderRadius: "100vmax 0 0 0 ",
                  "::before": {
                    content: "''",
                    display: "block",
                    width: 6,
                    height: 6,
                    background: `linear-gradient(to bottom right, ${theme?.colors?.lcarsRed2} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                    position: "absolute",
                    left: 4,
                    top: 7,
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
                    top: 7,
                    zIndex: "1",
                  },
                }}
              ></Box>

              <Box
                sx={{
                  color: theme?.colors?.lcarsRed2,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontSize: 5,
                  height: 7,
                  alignContent: "center",
                }}
              >
                SYSTEM ALERT
              </Box>
              <Box
                sx={{
                  height: 7,
                  backgroundColor: theme?.colors?.lcarsRed2,
                  color: theme?.colors?.lcarsBackground,
                  py: 2,
                  position: "relative",
                  flex: 1,
                }}
              ></Box>
              <Box
                sx={{
                  height: 7,
                  backgroundColor: theme?.colors?.lcarsRed2,
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
                    background: `linear-gradient(to bottom left, ${theme?.colors?.lcarsRed2} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                    position: "absolute",
                    right: 4,
                    top: 7,
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
                    right: 4,
                    top: 7,
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
                  backgroundColor: theme?.colors?.lcarsRed2,
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
                <Box
                  sx={{
                    px: 7,
                    py: 6,
                  }}
                >
                  <Box
                    sx={{
                      color: theme?.colors?.lcarsRed1,
                      fontFamily: "Antonio, sans-serif",
                      textTransform: "uppercase",
                      fontSize: 3,
                      mb: 6,
                    }}
                  >
                    <Text>Error: {error}</Text>
                  </Box>

                  <Flex
                    sx={{
                      justifyContent: "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: theme?.colors?.lcarsRed2,
                        color: theme?.colors?.lcarsBackground,
                        fontFamily: "Antonio, sans-serif",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        fontWeight: "bold",
                        borderRadius: "100vmax",
                        alignContent: "center",
                        textAlign: "center",
                        height: 7,
                        py: 2,
                        transition: "background-color 0.2s",
                        minWidth: "200px",
                        fontSize: 3,
                        "&:hover": {
                          backgroundColor: theme?.colors?.lcarsRed2,
                        },
                      }}
                      onClick={onClose}
                    >
                      Acknowledge
                    </Box>
                  </Flex>
                </Box>
              </Box>
              <Box
                sx={{
                  width: 4,
                  backgroundColor: theme?.colors?.lcarsRed2,
                  position: "relative",
                }}
              ></Box>
            </Flex>
            <Flex sx={{ flexDirection: "row", position: "relative", gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 5,
                  backgroundColor: theme?.colors?.lcarsRed2,
                  position: "relative",
                  borderRadius: " 0 0 0 100vmax",
                  "::before": {
                    content: "''",
                    display: "block",
                    width: 6,
                    height: 6,
                    background: `linear-gradient(to top right, ${theme?.colors?.lcarsRed2} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
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
                  backgroundColor: theme?.colors?.lcarsRed2,
                  color: theme?.colors?.lcarsBackground,
                  position: "relative",
                  flex: 1,
                }}
              ></Box>
              <Box
                sx={{
                  height: 5,
                  backgroundColor: theme?.colors?.lcarsRed2,
                  color: theme?.colors?.lcarsBackground,
                  position: "relative",
                  borderRadius: "0 0 100vmax 0",
                  width: 9,
                  "::before": {
                    content: "''",
                    display: "block",
                    width: 6,
                    height: 6,
                    background: `linear-gradient(to top left, ${theme?.colors?.lcarsRed2} 50%, ${theme?.colors?.lcarsColourBlack} 50%)`,
                    position: "absolute",
                    right: 4,
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
                    right: 4,
                    bottom: 5,
                    zIndex: "1",
                  },
                }}
              ></Box>
            </Flex>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default ErrorModal;
