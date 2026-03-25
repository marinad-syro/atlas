import { Type } from "@google/genai";

export const TRIP_TOOL_DEFINITION = {
  functionDeclarations: [
    {
      name: "show_trip_section",
      description: "Displays a specific section of the trip plan to the user. Call this as you gather information.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          section: {
            type: Type.STRING,
            enum: ["destination", "flights", "hotels", "activities"],
            description: "The section to display."
          },
          data: {
            type: Type.OBJECT,
            description: "The data for the section.",
            properties: {
              // Destination
              placeName: { type: Type.STRING },
              summary: { type: Type.STRING },
              readMoreUrl: { type: Type.STRING },
              
              // Flights
              route: { type: Type.STRING },
              dates: { type: Type.STRING },
              flightNote: { type: Type.STRING },
              skyscannerUrl: { type: Type.STRING },

              // Hotels
              hotels: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    price: { type: Type.STRING },
                    bookingUrl: { type: Type.STRING }
                  }
                }
              },
              bookingMainUrl: { type: Type.STRING },

              // Activities
              activities: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    infoUrl: { type: Type.STRING }
                  }
                }
              }
            }
          }
        },
        required: ["section", "data"]
      }
    }
  ]
};

export interface TripData {
  destination?: {
    placeName: string;
    summary: string;
    readMoreUrl: string;
  };
  flights?: {
    route: string;
    dates: string;
    flightNote: string;
    skyscannerUrl: string;
  };
  hotels?: {
    hotels: Array<{ name: string; price: string; bookingUrl: string }>;
    bookingMainUrl: string;
  };
  activities?: {
    activities: Array<{ title: string; description: string; infoUrl: string }>;
  };
}
