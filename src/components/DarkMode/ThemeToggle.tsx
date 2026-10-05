"use client";

import Icons from "../Icon/Icons";
import { useTheme } from "next-themes";
import React from "react";

export default function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="cursor-pointer ">
      {theme === "light" ? (
        <Icons.SunMedium
          className=" text-orange-500 mr-1"
          onClick={() => setTheme("dark")}
          style={{ margin: "0 -3px" }}
        />
      ) : (
        <Icons.Moon className=" text-white  mr-1" onClick={() => setTheme("light")} style={{ margin: "0 -3px" }} />
      )}
    </div>
  );
}
