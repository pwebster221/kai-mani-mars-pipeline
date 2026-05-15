import { useState } from "react";
import { Loader2, Zap } from "lucide-react";
import { ChartResult, ScoringResult } from "../types";

export default function MarsScoring({ 
  chartData, 
  onScoringComplete 
}: { 
  chartData: ChartResult;
  onScoringComplete: (data: ScoringResult) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScore = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create a textual summary of the chart to send to Mars Scoring engine
      const summaryParts = [];
      summaryParts.push(`Chart for ${chartData.meta?.name || 'Seeker'}.`);
      
      for (const [planet, pData] of Object.entries(chartData.planets).slice(0, 7)) {
        summaryParts.push(`The ${planet} is in ${Math.floor(pData.sign_degree)} degrees ${pData.sign} in House ${pData.house || 'N/A'}.`);
      }
      
      const chartSummary = summaryParts.join(' ');
      
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://scoring.dubtown-server.us/classify/text",
          method: "POST",
          body: {
            text: chartSummary,
            max_results: 5,
            confidence_threshold: 0.1,
            use_rubric_scoring: true
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const detail = data?.data?.detail ? JSON.stringify(data.data.detail) : JSON.stringify(data?.data);
        throw new Error(data.error || detail || `Failed to score chart. Status: ${res.status}`);
      }
      
      if (!data.data || !data.data.matches) {
        throw new Error("Invalid response format: " + JSON.stringify(data.data)); 
      }
      
      onScoringComplete(data.data as ScoringResult);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-stone-400 bg-stone-900 border border-stone-800 p-4 rounded-xl leading-relaxed">
        The Mars engine requires textual representation. We will condense the leading celestial placements into a semantic sequence and submit it for combinatorial Tarot archetype matching.
      </div>
      
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={handleScore}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
        <span>Extract Archetypes</span>
      </button>
    </div>
  );
}
