import { tool } from "ai";
import { z } from "zod/v4";

const inputSchema = z.object({
  location: z.string(),
});
export type WeatherToolInput = z.infer<typeof inputSchema>;

export function weatherTool() {
  return tool({
    description: "Get the weather for a given location",
    inputSchema,
    execute: async ({ location }) => {
      // Fake weather data for demonstration purposes
      const fakeWeatherData = {
        "New York": { temperature: 22, condition: "Sunny" },
        "San Francisco": { temperature: 16, condition: "Foggy" },
        London: { temperature: 18, condition: "Cloudy" },
        Tokyo: { temperature: 25, condition: "Clear" },
      };

      const weather = fakeWeatherData[location as keyof typeof fakeWeatherData] || {
        temperature: Math.floor(Math.random() * 15) + 10,
        condition: "Partly Cloudy",
      };

      return {
        status: "success",
        location,
        weather: {
          temperature: weather.temperature,
          condition: weather.condition,
        },
      };
    },
  });
}
