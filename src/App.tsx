/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Search, ExternalLink, Database, Activity, ArrowLeft, Sparkles, MessageSquare, Cloud, Clock, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { GEEDataset, SpectralIndex } from "./types";
import { RepoExplorer } from "./components/RepoExplorer";
import { remoteSensingTree, graphcastTree, climateTree, timesfmTree, agriVisionTree } from "./data";

export default function App() {
  const [view, setView] = useState<"home" | "spectral" | "gee" | "research" | "graphcast" | "climate" | "timesfm" | "agri_vision">("home");
  const [activeTab, setActiveTab] = useState<"overview" | "explorer" | "ai">("overview");
  const [spectralIndices, setSpectralIndices] = useState<SpectralIndex[]>([]);
  const [geeDatasets, setGeeDatasets] = useState<GEEDataset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

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

        let geeData;
        try {
          const geeResponse = await fetch("/community_datasets.json");
          if (!geeResponse.ok) throw new Error("Local GEE data not found");
          geeData = await geeResponse.json();
        } catch (e) {
          console.warn("Falling back to remote community datasets");
          // Fallback to a known working version or empty array if not available
          try {
            const geeResponse = await fetch("https://raw.githubusercontent.com/samapriya/awesome-gee-community-datasets/master/community_datasets.json");
            geeData = await geeResponse.json();
          } catch (err) {
            geeData = [];
          }
        }
        setGeeDatasets(geeData);
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

  const filteredGee = geeDatasets.filter(
    (dataset) =>
      dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataset.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGee.map((item: GEEDataset, idx: number) => (
                <GEECard key={`${item.id}-${idx}`} item={item} />
              ))}
            </div>
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
      </main>
    </div>
  );
}

function ResearchCard({ title, description, tags, onClick, color = "amber" }: any) {
  return (
    <button 
      onClick={onClick}
      className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all text-left group w-full"
    >
      <h3 className={`font-bold text-lg mb-2 transition-colors ${color === 'amber' ? 'text-amber-600 group-hover:text-amber-700' : 'text-blue-600 group-hover:text-blue-700'}`}>
        {title}
      </h3>
      <p className="text-sm text-slate-600 mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag: string) => (
          <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
            {tag}
          </span>
        ))}
      </div>
    </button>
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
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`text-left p-6 bg-white border border-slate-200 rounded-2xl shadow-sm transition-all ${colors[color]}`}
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
      <p className="text-slate-500 text-sm">{description}</p>
    </motion.button>
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
      <p className="text-sm text-slate-700 font-medium mb-4 line-clamp-2">{item.long_name}</p>
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

function GEECard({ item }: { item: GEEDataset; key?: any }) {
  return (
    <div className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="aspect-video bg-slate-100 relative overflow-hidden border-b border-slate-100">
        <img 
          src={item.thumbnail} 
          alt={item.title} 
          className="w-full h-full object-cover"
          onError={(e: any) => { e.target.src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop"; }}
        />
        <div className="absolute top-2 right-2">
          <span className="text-[10px] px-2 py-1 bg-white/90 backdrop-blur rounded-full font-bold text-slate-600 shadow-sm">
            {item.type}
          </span>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-sm text-slate-900 mb-1 line-clamp-2 min-h-[40px]">{item.title}</h3>
        <p className="text-[10px] text-slate-400 font-medium mb-3 uppercase tracking-wider">{item.provider}</p>
        
        <div className="flex-1">
          <div className="flex flex-wrap gap-1 mb-4">
            {item.tags.split(",").slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full">
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <a 
            href={item.docs} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Documentation
          </a>
          <a 
            href={item.sample_code} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            title="Open in GEE"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
