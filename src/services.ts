export interface EcosystemService {
  id: string;
  name: string;
  hostname: string;
  port: number;
  url: string;
  description: string;
  callers: string;
}

export const ECOSYSTEM_SERVICES: EcosystemService[] = [
  {
    id: "kairos",
    name: "Kairos REST",
    hostname: "raw-charts.dubtown-server.us",
    port: 8060,
    url: "https://raw-charts.dubtown-server.us",
    description: "Raw charts service",
    callers: "Alder, Mercury cron, you",
  },
  {
    id: "mars",
    name: "Mars Scoring",
    hostname: "scoring.dubtown-server.us",
    port: 8001,
    url: "https://scoring.dubtown-server.us",
    description: "Scoring service",
    callers: "Alder, you",
  },
  {
    id: "neo4j",
    name: "KG Management API",
    hostname: "neo4j.dubtown-server.us",
    port: 8200,
    url: "https://neo4j.dubtown-server.us",
    description: "Knowledge Graph Management via Neo4j",
    callers: "Alder, you",
  },
  {
    id: "solar",
    name: "Solar REST",
    hostname: "solar.sacredjourney.io",
    port: 8100,
    url: "https://solar.sacredjourney.io",
    description: "Solar REST service",
    callers: "Alder, possibly frontends",
  },
  {
    id: "ephemeris",
    name: "Swiss Ephemeris",
    hostname: "ephemeris.dubtown-server.us",
    port: 8040,
    url: "https://ephemeris.dubtown-server.us",
    description: "Ephemeris microservice",
    callers: "Alder, Mercury cron",
  },
  {
    id: "mercury",
    name: "DailyAPICall (Mercury)",
    hostname: "mercury.dubtown-server.us",
    port: 8000,
    url: "https://mercury.dubtown-server.us",
    description: "Daily API Call Cron",
    callers: "Internal cron, you",
  },
  {
    id: "repository",
    name: "Sacred Journey API",
    hostname: "repository.dubtown-server.us",
    port: 8300,
    url: "https://repository.dubtown-server.us",
    description: "Primary Repository API",
    callers: "Hub UI (CT 501), Alder",
  },
];
