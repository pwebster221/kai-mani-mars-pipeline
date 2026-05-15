export interface PlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  speed: number;
  sign: string;
  sign_degree: number;
  house?: number | null;
  retrograde: boolean;
}

export interface ChartResult {
  meta: any;
  planets: Record<string, PlanetPosition>;
  houses: any;
  aspects: any[];
  tiers?: Record<string, any>;
  deep_analysis?: Record<string, any>;
  errors?: any[];
}

export interface ArchetypeScore {
  name: string;
  card_type: string;
  suit: string;
  vector_similarity: number;
  rubric_base_score: number;
  rubric_multiplier: number;
  final_score: number;
  confidence: number;
}

export interface ScoringResult {
  input_text: string;
  input_length: number;
  matches: ArchetypeScore[];
  dominant_archetype: string | null;
}
