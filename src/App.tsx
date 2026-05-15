import { useState } from "react";
import { Moon, Sun, Stars, Flame, Hexagon, MessageSquare, Menu, BookOpen, Layers } from "lucide-react";
import ChartGenerator from "./components/ChartGenerator";
import MarsScoring from "./components/MarsScoring";
import AiChat from "./components/AiChat";
import { ChartResult, ScoringResult } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai">("dashboard");
  const [chartData, setChartData] = useState<ChartResult | null>(null);
  const [scoringData, setScoringData] = useState<ScoringResult | null>(null);
  
  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-800 bg-stone-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Hexagon className="w-5 h-5 text-stone-900" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">Paths of Reverence</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Ecosystem Dashboard</p>
            </div>
          </div>
          
          <nav className="flex space-x-1 p-1 bg-stone-800/50 rounded-lg border border-stone-700/50">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === "dashboard" ? "bg-stone-700 text-white shadow-sm" : "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center space-x-2 ${
                activeTab === "ai" ? "bg-stone-700 text-white shadow-sm" : "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              }`}
            >
              <span>Mani Assistant</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-8">
              <section className="bg-stone-800/40 border border-stone-800 p-6 rounded-2xl">
                <div className="flex items-center space-x-2 mb-6">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-medium">Kairos Engine</h2>
                </div>
                <ChartGenerator onChartGenerated={setChartData} />
              </section>
              
              {chartData && (
                <section className="bg-stone-800/40 border border-stone-800 p-6 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-6">
                    <Flame className="w-5 h-5 text-rose-500" />
                    <h2 className="text-xl font-medium">Mars Scoring</h2>
                  </div>
                  <MarsScoring chartData={chartData} onScoringComplete={setScoringData} />
                </section>
              )}
            </div>
            
            <div className="lg:col-span-7">
              <div className="bg-stone-800/20 border border-stone-800 rounded-2xl h-[calc(100vh-10rem)] p-6 overflow-y-auto">
                {!chartData && !scoringData && (
                  <div className="h-full flex flex-col items-center justify-center text-stone-500 space-y-4">
                    <Stars className="w-12 h-12 opacity-20" />
                    <p>Initialize a natal chart to reveal correspondences.</p>
                  </div>
                )}
                
                {chartData && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium text-stone-200 mb-4 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-stone-400" />
                        Astrological Signature
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(chartData.planets).slice(0, 10).map(([planet, details]) => (
                          <div key={planet} className="bg-stone-800/50 p-3 rounded-xl border border-stone-700/50 flex flex-col">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">{planet}</span>
                            <span className="text-sm text-stone-200 font-medium">
                              {Math.floor(details.sign_degree)}° {details.sign}
                            </span>
                            {details.house && (
                              <span className="text-[10px] text-stone-500 mt-1">House {details.house}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {chartData.deep_analysis && (
                      <div>
                        <h3 className="text-lg font-medium text-stone-200 mb-4 flex items-center">
                          <Layers className="w-4 h-4 mr-2 text-stone-400" />
                          Deep Analysis Synthesis
                        </h3>
                        <div className="bg-stone-800/50 p-5 rounded-xl border border-stone-700/50">
                           {typeof chartData.deep_analysis === 'object' ? (
                             <pre className="text-xs text-stone-300 font-mono whitespace-pre-wrap">
                               {JSON.stringify(chartData.deep_analysis, null, 2)}
                             </pre>
                           ) : (
                             <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-wrap">{String(chartData.deep_analysis)}</p>
                           )}
                        </div>
                      </div>
                    )}
                    
                    {chartData.tiers && Object.keys(chartData.tiers).length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-stone-200 mb-4 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-stone-400" />
                          Analysis Tiers
                        </h3>
                        <div className="space-y-4">
                          {Object.entries(chartData.tiers).slice(0, 5).map(([tierId, tierData]) => (
                            <div key={tierId} className="bg-stone-800/50 p-4 rounded-xl border border-stone-700/50">
                              <h4 className="text-md font-medium text-amber-500 mb-2 capitalize">{tierId.replace(/_/g, ' ')}</h4>
                              <div className="text-sm text-stone-300">
                                {typeof tierData === 'object' && tierData !== null ? (
                                   Object.entries(tierData as any).map(([k, v]) => (
                                     <div key={k} className="mb-2">
                                       <span className="font-semibold text-stone-400 capitalize">{k.replace(/_/g, ' ')}:</span>{' '}
                                       <span>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                     </div>
                                   ))
                                ) : (
                                  <p>{String(tierData)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {scoringData && (
                      <div>
                        <h3 className="text-lg font-medium text-stone-200 mb-4 flex items-center">
                          <Hexagon className="w-4 h-4 mr-2 text-stone-400" />
                          Tarot Archetype Correspondences
                        </h3>
                        <div className="space-y-3">
                          {scoringData.matches.map((match, i) => (
                            <div key={i} className="bg-stone-800/50 p-4 rounded-xl border border-stone-700/50 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-sm font-bold text-stone-300">
                                  #{i + 1}
                                </div>
                                <div>
                                  <h4 className="text-stone-200 font-medium">{match.name}</h4>
                                  <p className="text-xs text-stone-400">
                                    {match.suit ? `${match.card_type} • ${match.suit}` : match.card_type}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-light text-rose-400">
                                  {(match.final_score * 100).toFixed(1)}<span className="text-sm opacity-50">%</span>
                                </div>
                                <div className="text-[10px] text-stone-500 uppercase tracking-widest">Match</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-8rem)] bg-stone-800/40 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <AiChat chartData={chartData} scoringData={scoringData} />
          </div>
        )}
      </main>
    </div>
  );
}

