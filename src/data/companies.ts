export type Category =
  | "MNC IT Services"
  | "Product / R&D"
  | "Startup"
  | "Cloud & Cybersecurity"
  | "BFSI"
  | "Consulting"
  | "Manufacturing"
  | "Infrastructure & Energy";

export type Company = {
  id: string;
  name: string;
  address: string;
  category: Category;
  lng?: number;
  lat?: number;
};
