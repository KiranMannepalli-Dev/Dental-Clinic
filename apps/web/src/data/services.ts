import * as LucideIcons from "lucide-react";
import data from "./website-data.json";

// Map the string icon names back to Lucide React components
export const services = data.services.map((service) => {
  // @ts-ignore
  const IconComponent = LucideIcons[service.icon] || LucideIcons.Smile;
  
  return {
    ...service,
    icon: IconComponent
  };
});
