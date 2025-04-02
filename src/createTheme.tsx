import { link } from "fs";
import { NavLink, type Theme } from "theme-ui";

export const theme: Theme = {
  colors: {
    text: "#000",
    background: "#000",
    primary: "#fff",
    active: "#fff",
    inactive: "#bbb",
    lcarsRed1: "#c44",
    lcarsRed2: "#f55",
    lcarsOrange1: "#f80",
    lcarsOrange2: "#f96",
    lcarsPurple1: "#96f",
    lcarsPurple2: "#c9f",
    lcarsBlue1: "#89f",
    lcarsBlue2: "#45f",
    lcarsYellow1: "#fc8",
    lcarsYellow2: "#fa0",
    lcarsColourBlack: "#090909",
    lcarsBackground: "#090909",
  },
  fonts: {
    body: "Antonio, sans-serif",
    heading: "Antonio, sans-serif",
  },
  images: {
    avatar: {
      width: 200,
      height: "auto",
      backgroundColor: "muted",
      borderRadius: "100%",
      border: "3px solid",
      borderColor: "primary",
      marginX: "auto",
      display: "block",
    },
  },
  buttons: {
    primary: {
      fontFamily: "Antonio, sans-serif",
      fontSize: 3,
      minWidth: "200px",
      color: "background",
      paddingY: 3,
      bg: "primary",
      "&:hover": {
        cursor: "pointer",
        bg: "secondary",
      },
    },
    secondary: {
      color: "background",
      bg: "secondary",
    },
  },
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  text: {
    heading: {
      fontFamily: "Antonio, sans-serif",
      fontSize: 4,
    },
    NavLink: {
      fontFamily: "Antonio, sans-serif",
      fontSize: 3,
    },
  },
  links: {
    nav: {
      fontFamily: "Antonio, sans-serif",
      fontSize: 3,
      cursor: "pointer",
    },
  },
  space: [
    0,
    "5px",
    "10px",
    "16px",
    "10px",
    "24px",
    "36px",
    "50px",
    "100px",
    "185px",
    "215px",
  ],
  sizes: [
    0,
    "5px",
    "10px",
    "16px",
    "10px",
    "24px",
    "36px",
    "50px",
    "100px",
    "185px",
    "215px",
  ],
};
