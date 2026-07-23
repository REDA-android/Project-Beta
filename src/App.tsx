/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Search, ExternalLink, Database, Activity, ArrowLeft, Sparkles, MessageSquare, Cloud, Clock, Eye, Droplets, Download, Compass, Map as MapIcon, Layers, Code, Copy, Check, X, HelpCircle, Terminal, Info, ChevronRight, FileCode, Play, Folder, FolderOpen, LayoutGrid } from "lucide-react";
import { useState, useEffect } from "react";
import { GEEDataset, SpectralIndex } from "./types";
import { RepoExplorer } from "./components/RepoExplorer";
import { GlossaryText } from "./components/TechnicalTermGlossary";
import { VisualFlowchart } from "./components/VisualFlowchart";
import { remoteSensingTree, graphcastTree, climateTree, timesfmTree, agriVisionTree, floodForecastingTree, globalStreamflowTree, rusleTree, bulkDownload25dTree, geetilesTree, geemapTree, mergedGEERepositories } from "./data";
import { getGEESnippet, GEE_CATEGORIES } from "./utils/geeScripts";

export default function App() {
  const [view, setView] = useState<"home" | "spectral" | "gee" | "research" | "graphcast" | "climate" | "timesfm" | "agri_vision" | "flood_forecasting" | "global_streamflow" | "rusle" | "bulk_download_25d" | "geetiles" | "geemap">("home");
  const [activeTab, setActiveTab] = useState<"overview" | "explorer" | "ai">("overview");
  const [spectralIndices, setSpectralIndices] = useState<SpectralIndex[]>([]);
  const [geeDatasets, setGeeDatasets] = useState<GEEDataset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [geeCategory, setGeeCategory] = useState<string>("All");
  const [removedCategories, setRemovedCategories] = useState<string[]>([]);

  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem("geoawesome_search_history");
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveSearchToHistory = (query: string) => {
    if (!query.trim()) return;
    const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem("geoawesome_search_history", JSON.stringify(newHistory));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveSearchToHistory(searchQuery);
      setShowHistory(false);
    }
  };

  const selectHistoryItem = (query: string) => {
    setSearchQuery(query);
    saveSearchToHistory(query);
    setShowHistory(false);
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem("geoawesome_search_history");
  };

  useEffect(() => {
    // Load data
    const loadData = async () => {
      try {
        // Try local first, then fallback to remote
        let spectralData;
        try {
          const spectralResponse = await fetch("/output/spectral-indices-dict.json");
          if (!spectralResponse.ok) throw new Error("Local spectral data not found");
          spectralData = await spectralResponse.json();
        } catch (e) {
          console.warn("Falling back to remote spectral indices");
          const spectralResponse = await fetch("https://raw.githubusercontent.com/awesome-spectral-indices/awesome-spectral-indices/main/output/spectral-indices-dict.json");
          spectralData = await spectralResponse.json();
        }

        const indices = Object.entries(spectralData.SpectralIndices).map(([key, value]) => ({
          ...(value as any),
          short_name: key,
        })) as SpectralIndex[];
        setSpectralIndices(indices);

        const combinedMap = new Map<string, GEEDataset>();

        // 1. Add static exported mergedGEERepositories
        mergedGEERepositories.forEach(item => combinedMap.set(item.id, item as GEEDataset));

        // 2. Fetch local community_datasets.json
        try {
          const geeResponse = await fetch("/community_datasets.json");
          if (geeResponse.ok) {
            const localData = await geeResponse.json();
            if (Array.isArray(localData)) {
              localData.forEach((item: GEEDataset) => {
                if (item && item.id && !combinedMap.has(item.id)) {
                  combinedMap.set(item.id, item);
                }
              });
            }
          }
        } catch (e) {
          console.warn("Local GEE data load notice:", e);
        }

        // 3. Try remote community datasets fallback if available
        try {
          const remoteResponse = await fetch("https://raw.githubusercontent.com/samapriya/awesome-gee-community-datasets/master/community_datasets.json");
          if (remoteResponse.ok) {
            const remoteData = await remoteResponse.json();
            if (Array.isArray(remoteData)) {
              remoteData.forEach((item: GEEDataset) => {
                if (item && item.id && !combinedMap.has(item.id)) {
                  combinedMap.set(item.id, item);
                }
              });
            }
          }
        } catch (err) {
          // ignore remote fallback error
        }

        setGeeDatasets(Array.from(combinedMap.values()));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  const filteredSpectral = spectralIndices.filter(
    (index) =>
      index.short_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      index.long_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      index.application_domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGee = geeDatasets.filter((dataset) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      dataset.title.toLowerCase().includes(q) ||
      dataset.tags.toLowerCase().includes(q) ||
      dataset.provider.toLowerCase().includes(q) ||
      dataset.id.toLowerCase().includes(q) ||
      (dataset.type && dataset.type.toLowerCase().includes(q));

    const cat = geeCategory.toLowerCase();
    const matchesCategory =
      geeCategory === "All" ||
      (dataset.thematic_group && dataset.thematic_group.toLowerCase().includes(cat)) ||
      (dataset.type && dataset.type.toLowerCase().includes(cat)) ||
      dataset.tags.toLowerCase().includes(cat);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => { setView("home"); setSearchQuery(""); }}
          >
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Database size={18} />
            </div>
            <h1 className="font-bold text-xl tracking-tight group-hover:text-slate-600 transition-colors">
              GeoAwesome <span className="text-slate-400 font-normal">Catalog</span>
            </h1>
          </div>
          
          {view !== "home" && (
            <div className="relative w-full max-w-md ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder={`Search ${view === "spectral" ? "spectral indices" : view === "gee" ? "GEE datasets" : view === "research" ? "research models" : "GraphCast tools"}...`}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
              />
              {showHistory && searchHistory.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="flex justify-between items-center px-4 py-2 bg-slate-50 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Searches</span>
                    <button 
                      onClick={clearHistory}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <ul>
                    {searchHistory.map((query, index) => (
                      <li key={index}>
                        <button
                          onClick={() => selectHistoryItem(query)}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Clock size={14} className="text-slate-400" />
                          {query}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === "home" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-8 pt-12"
          >
            <div className="space-y-6">
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                The Ultimate Open Source <br />
                <span className="text-indigo-600">Geospatial Explorer</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-md">
                Browse through curated collections of spectral indices and community-driven Earth Engine datasets.
              </p>
            </div>

            <div className="grid gap-4">
              <CollectionCard
                icon={<Activity className="text-indigo-600" />}
                title="Spectral Indices"
                description="Curated list of spectral indices for remote sensing applications."
                count={spectralIndices.length}
                onClick={() => setView("spectral")}
                color="indigo"
              />
              <CollectionCard
                icon={<Database className="text-emerald-600" />}
                title="GEE Community Datasets"
                description="Comprehensive catalog of community datasets for Google Earth Engine."
                count={geeDatasets.length}
                onClick={() => setView("gee")}
                color="emerald"
              />
              <CollectionCard
                icon={<Search className="text-amber-600" />}
                title="Google Research: Remote Sensing"
                description="State-of-the-art ML models and few-shot learning for remote sensing."
                count={4}
                onClick={() => setView("research")}
                color="amber"
              />
              <CollectionCard
                icon={<Activity className="text-blue-600" />}
                title="Google DeepMind: GraphCast"
                description="High-resolution AI weather forecasting based on graph neural networks."
                count={3}
                onClick={() => setView("graphcast")}
                color="blue"
              />
              <CollectionCard
                icon={<Cloud className="text-cyan-600" />}
                title="AI Weather & Climate"
                description="Analysis and tools for climate data using AI and Beam."
                count={3}
                onClick={() => setView("climate")}
                color="cyan"
              />
              <CollectionCard
                icon={<Clock className="text-purple-600" />}
                title="TimesFM"
                description="Foundation model for time-series forecasting."
                count={2}
                onClick={() => setView("timesfm")}
                color="purple"
              />
              <CollectionCard
                icon={<Eye className="text-green-600" />}
                title="Agriculture-Vision"
                description="Large-scale aerial agricultural image analysis."
                count={2}
                onClick={() => setView("agri_vision")}
                color="emerald"
              />
              <CollectionCard
                icon={<Droplets className="text-blue-600" />}
                title="Flood Forecasting"
                description="LSTM-based river discharge and flood forecasting model by Google Research."
                count={3}
                onClick={() => { setView("flood_forecasting"); setActiveTab("overview"); }}
                color="blue"
              />
              <CollectionCard
                icon={<Activity className="text-sky-600" />}
                title="Global Daily Streamflow"
                description="Global daily river flow prediction model paper and NeuralHydrology scripts."
                count={3}
                onClick={() => { setView("global_streamflow"); setActiveTab("overview"); }}
                color="cyan"
              />
              <CollectionCard
                icon={<Layers className="text-amber-600" />}
                title="RUSLE Soil Loss"
                description="Revised Universal Soil Loss Equation implementation using GEE dataset."
                count={3}
                onClick={() => { setView("rusle"); setActiveTab("overview"); }}
                color="amber"
              />
              <CollectionCard
                icon={<Download className="text-indigo-600" />}
                title="Google 2.5D Downloader"
                description="Bulk downloader and parser for Google's 2.5D building mesh data."
                count={3}
                onClick={() => { setView("bulk_download_25d"); setActiveTab("overview"); }}
                color="indigo"
              />
              <CollectionCard
                icon={<Compass className="text-emerald-600" />}
                title="GEETiles Downloader"
                description="Download and partition GEE imagery into regular ML patches."
                count={3}
                onClick={() => { setView("geetiles"); setActiveTab("overview"); }}
                color="emerald"
              />
              <CollectionCard
                icon={<MapIcon className="text-purple-600" />}
                title="Geemap Interactive"
                description="Interactive GEE mapping, timelapses, and plots using ipyleaflet."
                count={3}
                onClick={() => { setView("geemap"); setActiveTab("overview"); }}
                color="purple"
              />
            </div>
          </motion.div>
        )}

        {view === "spectral" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpectral.map((item: SpectralIndex) => (
                <SpectralCard key={item.short_name} item={item} />
              ))}
            </div>
          </motion.div>
        )}

        {view === "gee" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Database size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                      <span>Google Earth Engine Hub</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        {geeDatasets.length} Repositories & Datasets
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Unified collection of open-source GEE tools, libraries, awesome lists, script collections, and datasets.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Showing {filteredGee.length} of {geeDatasets.length} items
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
                {GEE_CATEGORIES.filter(cat => !removedCategories.includes(cat)).map((cat) => {
                  const count = cat === "All" 
                    ? geeDatasets.length 
                    : geeDatasets.filter(d => d.thematic_group === cat).length;
                  if (cat !== "All" && count === 0) return null;
                  return (
                    <button
                      key={cat}
                      onClick={() => setGeeCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 group ${
                        geeCategory === cat
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        geeCategory === cat ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        {count}
                      </span>
                      {cat !== "All" && (
                        <span
                          role="button"
                          title="Supprimer cette catégorie"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRemovedCategories((prev) => [...prev, cat]);
                            if (geeCategory === cat) setGeeCategory("All");
                          }}
                          className={`p-0.5 rounded-full hover:bg-slate-300/50 transition-colors ${
                            geeCategory === cat 
                              ? "hover:bg-emerald-700 text-emerald-100 hover:text-white" 
                              : "text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          <X size={12} />
                        </span>
                      )}
                    </button>
                  );
                })}
                {removedCategories.length > 0 && (
                  <button
                    onClick={() => setRemovedCategories([])}
                    className="text-xs text-slate-400 hover:text-emerald-600 underline font-medium whitespace-nowrap px-2"
                  >
                    Restaurer ({removedCategories.length})
                  </button>
                )}
              </div>
            </div>

            {filteredGee.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <p className="text-slate-500 font-medium">No Earth Engine repositories or datasets match your search.</p>
                <button
                  onClick={() => { setSearchQuery(""); setGeeCategory("All"); }}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-all"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGee.map((item: GEEDataset, idx: number) => (
                  <GEECard key={`${item.id}-${idx}`} item={item} />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {view === "research" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Google Research: Remote Sensing</h3>
                  <p className="text-slate-600">
                    State-of-the-art Vision Transformers (ViTs) and few-shot learning algorithms.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-amber-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-amber-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-amber-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Few-Shot Learning"
                    description="Algorithms for training models with very few labeled examples, specifically designed for satellite imagery."
                    tags={["ML", "Few-Shot", "Algorithms"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("fewshot");
                    }}
                    color="amber"
                  />
                  <ResearchCard 
                    title="Vision Transformers (ViTs)"
                    description="Pre-trained ViT models optimized for remote sensing tasks like land cover classification."
                    tags={["Deep Learning", "ViT", "Models"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("vit");
                    }}
                    color="amber"
                  />
                  <ResearchCard 
                    title="Vertex AI Integration"
                    description="Notebooks and scripts for deploying remote sensing models on Google Cloud Vertex AI."
                    tags={["GCP", "Deployment", "Notebooks"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("vertex");
                    }}
                    color="amber"
                  />
                  <ResearchCard 
                    title="Dense Prediction"
                    description="Models for pixel-level tasks such as segmentation and change detection in satellite imagery."
                    tags={["Segmentation", "Remote Sensing"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("dense");
                    }}
                    color="amber"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="remote-sensing" rootPath="remote_sensing" files={remoteSensingTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-amber-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    This repository focuses on overcoming the data scarcity challenge in remote sensing using <b>Few-Shot Learning</b> and <b>Self-Supervised Pre-training</b>.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><b>ViT Architectures:</b> Uses Vision Transformers for better global context compared to traditional CNNs.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><b>Adapter Modules:</b> Includes efficient parameter-tuning techniques like Low-Rank Adaptation (LoRA).</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "graphcast" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Activity className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Google DeepMind: GraphCast</h3>
                    <p className="text-slate-600">High-resolution global weather forecasting with Graph Neural Networks.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Graph Neural Networks"
                    description="Core forecasting architecture using message passing on hierarchical meshes."
                    tags={["Deep Learning", "GNN", "Weather"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("graph");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="Global Weather Data"
                    description="Input data handling for ERA5 reanalysis and high-resolution atmospheric variables."
                    tags={["Datasets", "Meteorology"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("data");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="Model Checkpoints"
                    description="Pre-trained weights for medium-range global weather forecasting."
                    tags={["Pre-trained", "Checkpoints"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("checkpoint");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="graphcast" rootPath="graphcast" files={graphcastTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    <b>GraphCast</b> represents a paradigm shift in weather forecasting, outperforming traditional numerical weather prediction (NWP) models like HRES.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><b>Multi-mesh Representation:</b> Projects the globe onto an icosahedral mesh to avoid distortion at the poles.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><b>Autoregressive Rollout:</b> Predicts the next state based on the current and previous states, recursively.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "climate" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 rounded-xl">
                    <Cloud className="text-cyan-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">AI Weather & Climate</h3>
                    <p className="text-slate-600">Tools for processing and analyzing weather/climate data at scale.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-cyan-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-cyan-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-cyan-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Apache Beam Pipelines"
                    description="Scalable pipelines for processing NetCDF and Zarr weather data."
                    tags={["Beam", "Data Eng", "ETL"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("beam");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="Interpretability"
                    description="Generating saliency maps for understanding AI weather model predictions."
                    tags={["XAI", "Saliency", "Insights"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("interpret");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="ai-weather-climate" rootPath="climate" files={climateTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-cyan-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    This repository bridges the gap between raw meteorological data and machine learning by providing <b>Beam-based pipelines</b> for high-throughput processing.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-cyan-500 font-bold">•</span>
                      <span><b>Format Conversion:</b> Handles NetCDF to Zarr conversions optimized for cloud-native AI workflows.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-cyan-500 font-bold">•</span>
                      <span><b>Interpretability:</b> Includes state-of-the-art tools for visualizing why models predict specific weather events.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "timesfm" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <Clock className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">TimesFM</h3>
                    <p className="text-slate-600">A foundation model for time-series forecasting by Google Research.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-purple-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-purple-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-purple-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Flax Implementation"
                    description="Core transformer architecture implemented in JAX/Flax."
                    tags={["JAX", "Flax", "Deep Learning"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("flax");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="PyTorch Implementation"
                    description="Reference implementation in PyTorch for broader compatibility."
                    tags={["PyTorch", "ML"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("torch");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="timesfm" rootPath="timesfm" files={timesfmTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-purple-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    <b>TimesFM</b> is a revolutionary foundation model for time-series forecasting, pre-trained on massive amounts of real-world time-series data.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span><b>Zero-Shot Performance:</b> Capable of accurate forecasting on new datasets without any fine-tuning.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span><b>Multi-Framework:</b> Provides both JAX/Flax and PyTorch implementations for researchers and practitioners.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "agri_vision" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Eye className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Agriculture-Vision</h3>
                    <p className="text-slate-600">Large-scale aerial agricultural image dataset and challenge.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Challenge Metadata"
                    description="Results and metrics from the Agriculture-Vision benchmark challenge."
                    tags={["Benchmark", "Dataset"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("results");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="Sample Imagery"
                    description="Visual samples of patterns detected in aerial agricultural imagery."
                    tags={["Imagery", "Computer Vision"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("images");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="Agriculture-Vision" rootPath="agri_vision" files={agriVisionTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    The <b>Agriculture-Vision</b> dataset is a landmark in the field of agricultural remote sensing, featuring millions of high-resolution aerial images.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span><b>Semantic Segmentation:</b> Specifically designed for pixel-level recognition of agricultural patterns (weeds, nutrient deficiency, etc).</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span><b>Multi-modal Potential:</b> Features multiple spectral bands beyond just RGB, enabling deep biological insights.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "flood_forecasting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Droplets className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Google Research: Flood Forecasting</h3>
                    <p className="text-slate-600">Advanced machine learning models for forecasting river streamflow and floods.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-blue-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="LSTM Forecasting"
                    description="Deep recurrent network targeting long-term sequence dependencies of river flow."
                    tags={["LSTM", "Deep Learning", "Hydrology"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("lstm");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="GRU Model variant"
                    description="Lightweight gated recurrent unit model optimized for faster prediction speeds."
                    tags={["GRU", "ML", "Optimization"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("gru");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="flood-forecasting" rootPath="hydrology/flood_forecasting" files={floodForecastingTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    This repository implements high-fidelity hydrological forecasting using deep sequential models. It processes precipitation, temperature, and watershed attributes to forecast gauge-level river discharge.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><b>Physical Grounding:</b> Bridges physics-based hydrology with sequential data networks.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span><b>Extreme Event Sensitivity:</b> Incorporates custom loss functions to accurately model high-flow peaks.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "global_streamflow" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-50 rounded-xl">
                    <Activity className="text-sky-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Global Streamflow Model Paper</h3>
                    <p className="text-slate-600">Model implementation details and daily global discharge forecasting scripts.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-sky-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-sky-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-sky-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Streamflow Prediction"
                    description="Run daily global streamflow inference on a specific catchment basin."
                    tags={["Inference", "LSTM", "NeuralHydrology"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("prediction");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="Evaluation Metrics"
                    description="Nash-Sutcliffe Efficiency (NSE) and Kling-Gupta Efficiency (KGE) indicators."
                    tags={["Metrics", "Hydrology", "Statistics"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("metrics");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="global-streamflow" rootPath="hydrology/global_streamflow" files={globalStreamflowTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-sky-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    This repository exposes the scientific implementation details behind a global multi-basin streamflow forecasting network. Built on top of NeuralHydrology, it offers standardized daily projections across continents.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-sky-500 font-bold">•</span>
                      <span><b>Ungauged Basin Generalization:</b> Demonstrates how transfer learning models streamflow in regions lacking gauges.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-sky-500 font-bold">•</span>
                      <span><b>Standardized Evaluation:</b> Utilizes NSE and KGE benchmarks to align predictions with scientific observations.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "rusle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <Layers className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">RUSLE Soil Loss Modeling</h3>
                    <p className="text-slate-600">Estimate soil water erosion loss using Revised Universal Soil Loss Equation on GEE.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-amber-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-amber-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-amber-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="RUSLE Model Engine"
                    description="Assembles factor layers (R, K, LS, C) in Google Earth Engine to compute soil loss."
                    tags={["GEE", "Erosion", "Model"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("model");
                    }}
                    color="amber"
                  />
                  <ResearchCard 
                    title="Erosivity & Erodibility"
                    description="Calculate rainfall erosivity (R Factor) and soil erodibility (K Factor) from environmental data."
                    tags={["R-Factor", "K-Factor", "Environment"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("factor");
                    }}
                    color="amber"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="rusle" rootPath="hydrology/rusle" files={rusleTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-amber-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    The Revised Universal Soil Loss Equation (RUSLE) is the primary mathematical model used worldwide to estimate soil erosion. This Google Earth Engine implementation enables planetary-scale soil risk modeling.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><b>Multi-source Integration:</b> Combines CHIRPS, SoilGrids, and Copernicus DEM under a unified spatial coordinate grid.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span><b>C-factor Dynamics:</b> Uses Sentinel-2 multispectral NDVI values to model crop cover variations seasonally.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "bulk_download_25d" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Download className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Google 2.5D Bulk Downloader</h3>
                    <p className="text-slate-600">Efficiently download Google's 2.5D structural meshes and building dimensions in bulk.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-indigo-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Mesh Downloader"
                    description="Bulk requests parallel mesh blocks for custom geospatial bounding boxes."
                    tags={["Downloader", "API", "Parallel"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("download");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="Format Converter"
                    description="Converts proprietary building segment meshes to open glTF formats."
                    tags={["glTF", "Mesh", "WebGL"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("convert");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="google-2.5d-bulk-download" rootPath="geotools/bulk_download_25d" files={bulkDownload25dTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    This utility automates parallel tile discovery and high-volume HTTP retrieval of Google's 2.5D building mesh data. It compiles multi-file fragments into singular, structured geospatial files.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span><b>High Throughput:</b> Multi-threaded downloader bypasses traditional individual request bottlenecks.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span><b>3D Pipelines:</b> Formulates the basis for integrating satellite elevation geometry directly into three-dimensional rendering layers.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "geetiles" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Compass className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">GEETiles Patch Downloader</h3>
                    <p className="text-slate-600">Download Earth Engine images in gridded blocks and compile deep-learning-ready image patches.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Tile Downloader"
                    description="Partitions large GEE image collections into uniform, smaller grid tile boundaries."
                    tags={["GEE", "Grids", "Export"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("tile");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="Dataset Preparation"
                    description="Extracts sub-patches from geotiffs with configurable window sizes and strides."
                    tags={["Patches", "ML-Ready", "Computer Vision"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("preparation");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="geetiles" rootPath="geotools/geetiles" files={geetilesTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    GEETiles solves the Earth Engine payload limit issue by chopping extensive geospatial imagery into discrete grid items, making it straightforward to build training matrices for model architectures.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span><b>Limit Bypass:</b> Automatically schedules batch export requests beneath GEE's system capacity boundaries.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span><b>ML Integration:</b> Outputs arrays pre-shaped for direct ingest into PyTorch or TensorFlow tensors.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === "geemap" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <button 
              onClick={() => setView("home")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-4"
            >
              <ArrowLeft size={16} /> Back to collections
            </button>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <MapIcon className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Geemap Interactive Mapping</h3>
                    <p className="text-slate-600">A community-driven Python package for interactive mapping with Google Earth Engine.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "overview" ? "bg-purple-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Overview
                  </button>
                  <button 
                    onClick={() => setActiveTab("explorer")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "explorer" ? "bg-purple-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    Code Explorer
                  </button>
                  <button 
                    onClick={() => setActiveTab("ai")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === "ai" ? "bg-purple-600 text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Sparkles size={14} className="inline mr-1" /> AI Insights
                  </button>
                </div>
              </div>

              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  <ResearchCard 
                    title="Interactive Map"
                    description="Initialize custom interactive map layouts with GEE overlays and widgets."
                    tags={["ipyleaflet", "Visualizer", "Interactive"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("interactive");
                    }}
                    color="blue"
                  />
                  <ResearchCard 
                    title="Geemap Utils"
                    description="High-level workflows for creating Sentinel timelapses and plotting datasets."
                    tags={["Timelapse", "GIF", "Export"]}
                    onClick={() => {
                      setActiveTab("explorer");
                      setSearchQuery("utils");
                    }}
                    color="blue"
                  />
                </div>
              )}

              {activeTab === "explorer" && (
                <RepoExplorer repoName="geemap" rootPath="geotools/geemap" files={geemapTree} />
              )}

              {activeTab === "ai" && (
                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-6 text-slate-700">
                  <div className="flex items-center gap-2 text-purple-700 font-bold mb-4">
                    <Sparkles size={18} />
                    <h4>AI Repository Analysis</h4>
                  </div>
                  <p className="text-sm leading-relaxed mb-4">
                    <b>Geemap</b> is the gold standard for pythonic interactive visual analytics on Earth Engine data. It bridges complex ee.Image and ee.FeatureCollections with front-end Jupyter maps seamlessly.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span><b>Interactive Queries:</b> Click anywhere on the map to query dynamic values across multitemporal bands.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-purple-500 font-bold">•</span>
                      <span><b>Rapid Prototyping:</b> Integrates with ipywidgets, allowing users to build complex geospatial dashboards in minutes.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function ResearchCard({ title, description, tags, onClick, color = "amber" }: any) {
  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={onClick}
      className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group w-full cursor-pointer"
    >
      <h3 className={`font-bold text-lg mb-2 transition-colors ${color === 'amber' ? 'text-amber-600 group-hover:text-amber-700' : 'text-blue-600 group-hover:text-blue-700'}`}>
        {title}
      </h3>
      <div className="text-sm text-slate-600 mb-4">
        <GlossaryText text={description} />
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function CollectionCard({ icon, title, description, count, onClick, color }: any) {
  const colors: any = {
    indigo: "hover:border-indigo-200 hover:bg-indigo-50/50",
    emerald: "hover:border-emerald-200 hover:bg-emerald-50/50",
    amber: "hover:border-amber-200 hover:bg-amber-50/50",
    blue: "hover:border-blue-200 hover:bg-blue-50/50",
    cyan: "hover:border-cyan-200 hover:bg-cyan-50/50",
    purple: "hover:border-purple-200 hover:bg-purple-50/50",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`text-left p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all cursor-pointer ${colors[color]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-xl">
          {icon}
        </div>
        <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
          {count} Items
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <div className="text-slate-500 text-sm">
        <GlossaryText text={description} />
      </div>
    </motion.div>
  );
}

function SpectralCard({ item }: { item: SpectralIndex; key?: any }) {
  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-indigo-600">{item.short_name}</h3>
        <span className="text-[10px] px-2 py-1 bg-slate-100 rounded-full font-bold uppercase text-slate-500 tracking-wider">
          {item.application_domain}
        </span>
      </div>
      <div className="text-sm text-slate-700 font-medium mb-4 line-clamp-2">
        <GlossaryText text={item.long_name} />
      </div>
      <div className="bg-slate-50 p-3 rounded-lg mb-4">
        <code className="text-xs font-mono text-slate-600 break-all">{item.formula}</code>
      </div>
      <div className="flex flex-wrap gap-1 mb-4">
        {item.platforms.slice(0, 3).map((p) => (
          <span key={p} className="text-[10px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
            {p}
          </span>
        ))}
        {item.platforms.length > 3 && (
          <span className="text-[10px] text-slate-400 px-1.5 py-0.5">+{item.platforms.length - 3} more</span>
        )}
      </div>
      <a 
        href={item.reference} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
      >
        <ExternalLink size={12} /> View Reference
      </a>
    </div>
  );
}

// getGEESnippet is imported from ./utils/geeScripts

function GEECard({ item }: { item: GEEDataset; key?: any }) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const isDirectScript = item.sample_code && item.sample_code.startsWith("https://code.earthengine.google.com");
  const geeEditorUrl = isDirectScript ? item.sample_code : "https://code.earthengine.google.com/";
  const githubUrl = item.docs && item.docs.startsWith("https://github.com") 
    ? item.docs 
    : item.sample_code && item.sample_code.startsWith("https://github.com")
    ? item.sample_code
    : `https://github.com/${item.id}`;

  const snippet = getGEESnippet(item);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col group">
        <div className="aspect-video bg-slate-100 relative overflow-hidden border-b border-slate-100">
          <img 
            src={item.thumbnail} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop"; }}
          />
          <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
            <span className="text-[10px] px-2 py-0.5 bg-slate-950/85 text-emerald-300 backdrop-blur rounded-full font-bold shadow-sm border border-slate-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isDirectScript ? "GEE Script Direct" : "Dépôt Code GEE"}
            </span>
            {item.license && (
              <span className="text-[9px] px-1.5 py-0.2 bg-slate-900/80 text-slate-300 backdrop-blur rounded font-mono border border-slate-700/50">
                {item.license}
              </span>
            )}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <h3 className="font-bold text-sm text-slate-900 mb-1 line-clamp-2 min-h-[40px]">{item.title}</h3>
          <p className="text-[10px] text-slate-400 font-medium mb-3 uppercase tracking-wider">{item.provider}</p>
          
          <div className="flex-1">
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.split(",").slice(0, 4).map((tag) => (
                <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-emerald-200/60"
            >
              <Code size={14} />
              <span>Voir le Code & Guide GEE</span>
            </button>

            <div className="flex items-center justify-between gap-2">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-lg transition-colors"
                title="Consulter le code source et les scripts sur GitHub"
              >
                <span>GitHub</span>
                <ExternalLink size={12} />
              </a>
              <a 
                href={geeEditorUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                title="Ouvrir Google Earth Engine Code Editor"
              >
                <span>{isDirectScript ? "Ouvrir Script" : "GEE Editor"}</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL VIEW / CODE INSPECTOR */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                  <Terminal size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{item.provider}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-mono">{item.license || "Open Source"}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Instructions Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <Info size={16} className="text-amber-600 shrink-0" />
                  <span>Comment exécuter ce script dans Google Earth Engine ?</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-amber-800/90 pl-1 leading-relaxed">
                  <li>Cliquez sur le bouton <strong>"Copier le Code JavaScript"</strong> ci-dessous.</li>
                  <li>Cliquez sur <strong>"Lancer dans GEE Code Editor"</strong> pour ouvrir l'éditeur Google Earth Engine.</li>
                  <li>Collez le code (<kbd className="px-1 py-0.5 bg-amber-200/60 rounded text-[10px] font-mono">Ctrl + V</kbd>) dans l'éditeur et cliquez sur <strong>Run</strong>.</li>
                </ol>
              </div>

              {/* Code Snippet */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCode size={14} className="text-emerald-600" />
                    Code JavaScript pour Earth Engine (.js)
                  </span>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm ${
                      copied 
                        ? "bg-emerald-600 text-white" 
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        <span>Copié dans le presse-papier !</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copier le Code JavaScript</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300 leading-relaxed shadow-inner max-h-72 overflow-y-auto">
                  <pre className="whitespace-pre-wrap break-words">{snippet}</pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                <span>Dépôt GitHub Complexe</span>
                <ExternalLink size={13} />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Fermer
                </button>
                <a
                  href={geeEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Lancer dans GEE Code Editor</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
