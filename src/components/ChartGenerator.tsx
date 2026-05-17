import { useState } from "react";
import { format } from "date-fns";
import { Loader2, Play } from "lucide-react";
import { ChartResult } from "../types";

export default function ChartGenerator({ onChartGenerated }: { onChartGenerated: (data: ChartResult) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default values
  const [name, setName] = useState("paul webster");
  const [date, setDate] = useState("1989-01-06");
  const [time, setTime] = useState("15:10");
  const [lat, setLat] = useState("35.9969");
  const [lon, setLon] = useState("-78.899");
  const [tzOffset, setTzOffset] = useState("-5");
  const [selectedHouses, setSelectedHouses] = useState<string[]>(["whole_sign"]);

  const houseOptions = [
    { id: "placidus", label: "Placidus" },
    { id: "whole_sign", label: "Whole Sign" },
    { id: "koch", label: "Koch" },
    { id: "equal", label: "Equal" }
  ];

  const toggleHouse = (id: string) => {
    setSelectedHouses(prev => 
      prev.includes(id) 
        ? prev.filter(h => h !== id)
        : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const birthData = {
        name,
        date,
        time,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        city: "string",
        tz_offset: parseFloat(tzOffset)
      };

      const payload = {
        birth_data: birthData,
        house_system: selectedHouses.length > 0 ? selectedHouses[0] : "whole_sign",
        house_systems: selectedHouses,
        anonymous: true,
        persist: false
      };

      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://raw-charts.dubtown-server.us/api/v1/natal/full",
          method: "POST",
          body: payload
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const detail = data?.data?.detail ? JSON.stringify(data.data.detail) : JSON.stringify(data?.data);
        throw new Error(data.error || detail || `Failed to generate chart. Status: ${res.status}`);
      }
      
      // we check data.data because proxy wraps it
      const chartResult = data.data as ChartResult;
      if (!chartResult.planets) {
        throw new Error("Missing planets in response: " + JSON.stringify(data.data));
      }
      
      onChartGenerated(chartResult);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-stone-400 mb-1">Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Date</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Time</label>
          <input 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Latitude</label>
          <input 
            type="number" 
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Longitude</label>
          <input 
            type="number" 
            step="any"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-stone-400 mb-1">Timezone Offset</label>
          <input 
            type="number" 
            step="any"
            value={tzOffset}
            onChange={(e) => setTzOffset(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-sm"
          />
        </div>
      </div>
      
      <div className="col-span-2">
        <label className="block text-xs font-medium text-stone-400 mb-2">House Systems</label>
        <div className="grid grid-cols-2 gap-2">
          {houseOptions.map(option => (
            <label key={option.id} className="flex items-center space-x-2 cursor-pointer text-sm text-stone-300">
              <input
                type="checkbox"
                checked={selectedHouses.includes(option.id)}
                onChange={() => toggleHouse(option.id)}
                className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-800"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
        <span>Generate Natal Chart</span>
      </button>
    </div>
  );
}
