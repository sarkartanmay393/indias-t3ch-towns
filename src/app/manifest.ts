import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TechCities — Pune Tech Office Map",
    short_name: "TechCities",
    description: "Tech company offices across India's biggest cities, on a map.",
    start_url: "/",
    display: "standalone",
    background_color: "#f0eee6",
    theme_color: "#cc785c",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
