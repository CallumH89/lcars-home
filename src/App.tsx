import React from "react";
import { Container, Box, Button, Flex, Heading } from "theme-ui";

import { theme } from "./createTheme.tsx";
import { Image } from "theme-ui";

function App() {
  const links = [
  {link:'', title:'Lcars'},
  ];


  const title = "Lcars";

  function openLink(url: string) {
    window.open(url, "_blank");
  }
  return (
    <Container
      sx={{
        backgroundAttachment: "fixed",
        height: "100%",
        minHeight: "100vh",
        pt: 4,
      }}
    >
      <Heading sx={{ textAlign: "center" }} mb={3}>
        {title}
      </Heading>

      <Flex
        sx={{
          maxWidth: "300px",
          marginX: "auto",
          justifyContent: "center",
          flexDirection: "column",
          mt: 4,
        }}
      >
        {links.map((x, i) => {
          return (
            <Button
              key={i}
              sx={{
                mt: 3,
                "&:first-of-type": {
                  mt: 0,
                },
              }}
              onClick={() => openLink(x.link)}
            >
              {x.title}
            </Button>
          );
        })}
      </Flex>
     
    </Container>
  );
}

export default App;
