export type Category =
  | "MNC IT Services"
  | "Product / R&D"
  | "Startup"
  | "Cloud & Cybersecurity"
  | "BFSI"
  | "Consulting"
  | "Manufacturing"
  | "Infrastructure & Energy"
  | "Discovered";

export type Company = {
  id: string;
  name: string;
  address: string;
  category: Category;
  /** Coordinates are filled in by `npm run geocode`; left empty until then. */
  lng?: number;
  lat?: number;
};

// Draft list of well-known tech company offices in Pune.
// Addresses are best-effort from public knowledge — verify before relying
// on them for anything beyond a demo map. Edit freely, then re-run geocode.
export const companies: Company[] = [
  {
    id: "infosys-hinjewadi",
    name: "Infosys",
    address: "Infosys Ltd, Hinjewadi Phase 2, Rajiv Gandhi Infotech Park, Pune, Maharashtra 411057",
    category: "MNC IT Services",
  },
  {
    id: "tcs-synergy-park",
    name: "TCS Synergy Park",
    address: "Tata Consultancy Services, Synergy Park, Hinjewadi Phase 3, Rajiv Gandhi Infotech Park, Pune, Maharashtra 411057",
    category: "MNC IT Services",
  },
  {
    id: "wipro-hinjewadi",
    name: "Wipro",
    address: "Wipro Ltd, Hinjewadi Phase 1, Rajiv Gandhi Infotech Park, Pune, Maharashtra 411057",
    category: "MNC IT Services",
  },
  {
    id: "cognizant-hinjewadi",
    name: "Cognizant",
    address: "Cognizant Technology Solutions, Hinjewadi Phase 3, Rajiv Gandhi Infotech Park, Pune, Maharashtra 411057",
    category: "MNC IT Services",
  },
  {
    id: "tech-mahindra-hinjewadi",
    name: "Tech Mahindra",
    address: "Tech Mahindra Ltd, Hinjewadi Phase 3, Pune, Maharashtra 411057",
    category: "MNC IT Services",
  },
  {
    id: "persistent-hq",
    name: "Persistent Systems (HQ)",
    address: "Persistent Systems Ltd, Bhageerath, Senapati Bapat Road, Pune, Maharashtra 411016",
    category: "Product / R&D",
  },
  {
    id: "mphasis-magarpatta",
    name: "Mphasis",
    address: "Mphasis Ltd, Magarpatta City, Hadapsar, Pune, Maharashtra 411013",
    category: "MNC IT Services",
  },
  {
    id: "eaton-magarpatta",
    name: "Eaton Technologies",
    address: "Eaton Technologies Pvt Ltd, Magarpatta City, Hadapsar, Pune, Maharashtra 411028",
    category: "Product / R&D",
  },
  {
    id: "john-deere-magarpatta",
    name: "John Deere Technology Center",
    address: "John Deere India Technology Center, Magarpatta City, Hadapsar, Pune, Maharashtra 411028",
    category: "Product / R&D",
  },
  {
    id: "amdocs-kharadi",
    name: "Amdocs",
    address: "Amdocs, EON Free Zone, Kharadi, Pune, Maharashtra 411014",
    category: "Product / R&D",
  },
  {
    id: "zensar-kharadi",
    name: "Zensar Technologies",
    address: "Zensar Technologies, Kharadi, Pune, Maharashtra 411014",
    category: "MNC IT Services",
  },
  {
    id: "bmc-baner",
    name: "BMC Software",
    address: "BMC Software, Baner Road, Baner, Pune, Maharashtra 411045",
    category: "Product / R&D",
  },
  {
    id: "zycus-baner",
    name: "Zycus",
    address: "Zycus Infotech Pvt Ltd, Baner, Pune, Maharashtra 411045",
    category: "Startup",
  },
  {
    id: "citrix-kalyani-nagar",
    name: "Citrix R&D India",
    address: "Citrix R&D India Pvt Ltd, Kalyani Nagar, Pune, Maharashtra 411006",
    category: "Product / R&D",
  },
  {
    id: "veritas-kalyani-nagar",
    name: "Veritas Technologies",
    address: "Veritas Technologies, Kalyani Nagar, Pune, Maharashtra 411006",
    category: "Product / R&D",
  },
  {
    id: "retwin-energy-baner",
    name: "Re-twin Energy",
    address: "33/1, Pan Card Club Road, Baner High Street, Baner, Pune, Maharashtra 411045",
    category: "Startup",
  },
];
