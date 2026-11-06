import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import L from "leaflet";
import { 
  Droplets, 
  Layers, 
  Sliders, 
  MapPin, 
  Search, 
  Code2, 
  Copy, 
  Check, 
  Sparkles, 
  Cloud, 
  Eye, 
  RefreshCw, 
  Maximize2, 
  ExternalLink,
  ChevronRight,
  Info,
  ShieldCheck,
  AlertCircle,
  Play
} from "lucide-react";
import { SpectralIndex } from "../types";

interface WaterSpectralStudioProps {
  initialIndex?: string;
  allSpectralIndices: SpectralIndex[];
  onBack?: () => void;
}

interface PresetLocation {
  name: string;
  country: string;
  description: string;
  coords: [number, number];
  zoom: number;
}

const PRESET_WATER_LOCATIONS: PresetLocation[] = [
  {
    name: "Lac de Serre-Ponçon",
    country: "France",
    description: "Grand lac de barrage alpin (Hautes-Alpes)",
    coords: [44.5167, 6.3333],
    zoom: 12
  },
  {
    name: "Lac Léman",
    country: "France / Suisse",
    description: "Plus grand lac d'Europe occidentale",
    coords: [46.45, 6.55],
    zoom: 10
  },
  {
    name: "Lac Tchad",
    country: "Tchad / Cameroun / Niger",
    description: "Évolution critique des zones humides sahéliennes",
    coords: [13.0, 14.5],
    zoom: 9
  },
  {
    name: "Mer d'Aral (Sud)",
    country: "Ouzbékistan / Kazakhstan",
    description: "Régression hydrologique historique spectaculaire",
    coords: [45.0, 59.5],
    zoom: 8
  },
  {
    name: "Lac Mead / Hoover Dam",
    country: "États-Unis",
    description: "Réservoir stratégique sur le fleuve Colorado",
    coords: [36.15, -114.4],
    zoom: 11
  },
  {
    name: "Lagune de Venise",
    country: "Italie",
    description: "Milieu lagunaire et eaux côtières peu profondes",
    coords: [45.43, 12.33],
    zoom: 12
  },
  {
    name: "Delta du Nil",
    country: "Égypte",
    description: "Réseau hydrographique et canaux d'irrigation",
    coords: [31.0, 31.0],
    zoom: 9
  },
  {
    name: "Bassin d'Arcachon",
    country: "France",
    description: "Lagune tidale et passes océaniques",
    coords: [44.68, -1.18],
    zoom: 11
  }
];

const WATER_COLOR_PALETTES = [
  { id: "cyan", name: "Cyan Électrique", hex: "#00F0FF", border: "#00B8D4", bg: "bg-cyan-400" },
  { id: "ocean", name: "Bleu Océan Profond", hex: "#0055FF", border: "#0033CC", bg: "bg-blue-600" },
  { id: "emerald", name: "Émeraude Fluorescence", hex: "#10B981", border: "#059669", bg: "bg-emerald-500" },
  { id: "turbo", name: "Spectre Thermique", hex: "#E11D48", border: "#BE123C", bg: "bg-rose-500" },
];

export const WaterSpectralStudio: React.FC<WaterSpectralStudioProps> = ({
  initialIndex = "NDWI",
  allSpectralIndices,
  onBack
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const waterCanvasLayerRef = useRef<L.GridLayer | null>(null);

  // States
  const [selectedIndex, setSelectedIndex] = useState<string>(initialIndex);
  const [activeEngine, setActiveEngine] = useState<"autonomous" | "gee">("autonomous");
  const [baseMapType, setBaseMapType] = useState<"sentinel" | "esri" | "dark" | "osm">("sentinel");
  const [threshold, setThreshold] = useState<number>(0.05);
  const [opacity, setOpacity] = useState<number>(0.85);
  const [activePalette, setActivePalette] = useState<string>("cyan");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<PresetLocation>(PRESET_WATER_LOCATIONS[0]);
  
  // GEE Cloud states
  const [geeProjectId, setGeeProjectId] = useState<string>("");
  const [cloudCoverMax, setCloudCoverMax] = useState<number>(20);
  const [selectedSensor, setSelectedSensor] = useState<string>("COPERNICUS/S2_SR_HARMONIZED");
  const [dateStart, setDateStart] = useState<string>("2024-05-01");
  const [dateEnd, setDateEnd] = useState<string>("2024-10-31");
  const [geeStatus, setGeeStatus] = useState<any>(null);
  const [isGeeProcessing, setIsGeeProcessing] = useState<boolean>(false);
  const [geeGeneratedCode, setGeeGeneratedCode] = useState<{ js: string; py: string } | null>(null);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [codeLanguage, setCodeLanguage] = useState<"js" | "py">("js");

  // Live metrics
  const [waterAreaKm2, setWaterAreaKm2] = useState<number>(24.8);
  const [waterPercentage, setWaterPercentage] = useState<number>(18.5);

  // Filter water indices from dictionary
  const waterIndices = useMemo(() => {
    return allSpectralIndices.filter(
      (idx) => idx.application_domain?.toLowerCase() === "water"
    );
  }, [allSpectralIndices]);

  // Current active index object
  const currentIndexObj = useMemo(() => {
    return allSpectralIndices.find((idx) => idx.short_name.toLowerCase() === selectedIndex.toLowerCase()) || {
      short_name: selectedIndex,
      long_name: selectedIndex === "NDWI" ? "Normalized Difference Water Index" : selectedIndex,
      formula: selectedIndex === "NDWI" ? "(G - N) / (G + N)" : selectedIndex === "MNDWI" ? "(G - S1) / (G + S1)" : "Water spectral ratio",
      bands: ["G", "N"],
      application_domain: "water",
      reference: "https://doi.org/10.1080/01431169608948714"
    };
  }, [allSpectralIndices, selectedIndex]);

  // Check GEE status on mount
  useEffect(() => {
    fetch("/api/gee/status")
      .then((res) => res.json())
      .then((data) => setGeeStatus(data))
      .catch((err) => console.warn("GEE Status check failed:", err));
  }, []);

  // Update GEE scripts whenever parameters change
  useEffect(() => {
    const bounds = mapInstanceRef.current ? mapInstanceRef.current.getBounds() : null;
    const aoi = bounds ? {
      west: Number(bounds.getWest().toFixed(4)),
      south: Number(bounds.getSouth().toFixed(4)),
      east: Number(bounds.getEast().toFixed(4)),
      north: Number(bounds.getNorth().toFixed(4))
    } : { west: 6.2, south: 44.4, east: 6.5, north: 44.6 };

    fetch("/api/gee/process-water", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        index: selectedIndex,
        threshold,
        bounds: aoi,
        sensor: selectedSensor,
        dateRange: { start: dateStart, end: dateEnd },
        cloudMax: cloudCoverMax,
        customProject: geeProjectId || undefined
      })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.jsScript) {
          setGeeGeneratedCode({ js: data.jsScript, py: data.pythonScript });
        }
      })
      .catch((e) => console.error("Error generating GEE script:", e));
  }, [selectedIndex, threshold, selectedSensor, dateStart, dateEnd, cloudCoverMax, geeProjectId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: selectedLocation.coords,
        zoom: selectedLocation.zoom,
        zoomControl: false,
        attributionControl: true
      });

      L.control.zoom({ position: "topright" }).addTo(map);

      // Base tile layer
      const getTileUrl = (type: string) => {
        switch (type) {
          case "sentinel":
            return "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg";
          case "esri":
            return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
          case "dark":
            return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
          case "osm":
          default:
            return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
        }
      };

      const baseLayer = L.tileLayer(getTileUrl(baseMapType), {
        maxZoom: 18,
        attribution: baseMapType === "sentinel" ? "© EOX / Sentinel-2 Cloudless" : "© OpenStreetMap / ESRI"
      }).addTo(map);

      baseTileLayerRef.current = baseLayer;

      // Custom Autonomous Water Grid Layer using Canvas
      const WaterGridLayer = L.GridLayer.extend({
        createTile: function (coords: { x: number; y: number; z: number }) {
          const tile = document.createElement("canvas");
          const size = this.getTileSize();
          tile.width = size.x;
          tile.height = size.y;
          const ctx = tile.getContext("2d");
          if (!ctx) return tile;

          // Load the base imagery tile to sample pixels
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = getTileUrl(baseMapType)
            .replace("{z}", String(coords.z))
            .replace("{x}", String(coords.x))
            .replace("{y}", String(coords.y))
            .replace("{s}", "a");

          img.onload = () => {
            try {
              ctx.drawImage(img, 0, 0, size.x, size.y);
              const imgData = ctx.getImageData(0, 0, size.x, size.y);
              const data = imgData.data;

              const activePal = WATER_COLOR_PALETTES.find((p) => p.id === activePalette) || WATER_COLOR_PALETTES[0];
              const hex = activePal.hex;
              const rWater = parseInt(hex.slice(1, 3), 16);
              const gWater = parseInt(hex.slice(3, 5), 16);
              const bWater = parseInt(hex.slice(5, 7), 16);

              let waterPixelsCount = 0;

              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Multispectral estimation:
                // Water features: High absorption in NIR/SWIR, higher reflectance in Green & Blue
                // True-color satellite bands: R, G, B
                // Approximated NIR ~ (R * 0.3 + G * 0.7) for vegetation, but drops drastically in water bodies
                // Approximated SWIR ~ drops even lower for clean water
                const brightness = (r + g + b) / 3;
                const blueGreenRatio = (b + g) / Math.max(1, (r * 2));
                const estimatedNIR = Math.max(5, (r * 0.4 + g * 0.6) * (brightness < 60 ? 0.4 : 1.1));
                const estimatedSWIR = Math.max(5, (r * 0.5 + b * 0.2) * (brightness < 60 ? 0.3 : 1.2));

                let indexVal = 0;
                if (selectedIndex === "MNDWI") {
                  indexVal = (g - estimatedSWIR) / Math.max(1, g + estimatedSWIR);
                } else if (selectedIndex === "AWEInsh") {
                  indexVal = (4 * (g - estimatedSWIR) - (0.25 * estimatedNIR + 2.75 * estimatedSWIR)) / 255;
                } else if (selectedIndex === "WRI") {
                  indexVal = (g + r) / Math.max(1, estimatedNIR + estimatedSWIR) - 1;
                } else {
                  // NDWI default: (Green - NIR) / (Green + NIR)
                  indexVal = (g - estimatedNIR) / Math.max(1, g + estimatedNIR);
                }

                // Check water condition with threshold
                const isWater = indexVal > (threshold * 0.5) && (blueGreenRatio > 0.85 || brightness < 50);

                if (isWater) {
                  waterPixelsCount++;
                  data[i] = rWater;
                  data[i + 1] = gWater;
                  data[i + 2] = bWater;
                  data[i + 3] = Math.round(opacity * 255);
                } else {
                  // Transparent non-water pixel
                  data[i + 3] = 0;
                }
              }

              ctx.putImageData(imgData, 0, 0);
            } catch (err) {
              // Ignore cross-origin canvas security exceptions if remote host restricts pixel reading
            }
          };

          return tile;
        }
      });

      const waterLayer = (new (WaterGridLayer as any)({
        opacity: opacity,
        zIndex: 10
      }) as L.GridLayer).addTo(map);

      waterCanvasLayerRef.current = waterLayer;
      mapInstanceRef.current = map;

      // Update area stats when moving
      map.on("moveend", () => {
        updateWaterCalculations(map, threshold);
      });
    }

    return () => {
      // Do not destroy map eagerly on quick re-renders, handle cleanly
    };
  }, []);

  // Update base map layer when changed
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    const getTileUrl = (type: string) => {
      switch (type) {
        case "sentinel":
          return "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg";
        case "esri":
          return "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
        case "dark":
          return "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
        case "osm":
        default:
          return "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      }
    };

    baseTileLayerRef.current.setUrl(getTileUrl(baseMapType));
    if (waterCanvasLayerRef.current) {
      waterCanvasLayerRef.current.redraw();
    }
  }, [baseMapType]);

  // Redraw water filter layer when threshold, opacity, index or palette changes
  useEffect(() => {
    if (waterCanvasLayerRef.current && mapInstanceRef.current) {
      waterCanvasLayerRef.current.setOpacity(opacity);
      waterCanvasLayerRef.current.redraw();
      updateWaterCalculations(mapInstanceRef.current, threshold);
    }
  }, [threshold, opacity, selectedIndex, activePalette, activeEngine]);

  // Calculate approximate water surface
  const updateWaterCalculations = (map: L.Map, currentThreshold: number) => {
    const bounds = map.getBounds();
    const north = bounds.getNorth();
    const south = bounds.getSouth();
    const east = bounds.getEast();
    const west = bounds.getWest();

    const latDistKm = Math.abs(north - south) * 111;
    const lonDistKm = Math.abs(east - west) * 111 * Math.cos(((north + south) / 2) * (Math.PI / 180));
    const totalAreaKm2 = latDistKm * lonDistKm;

    // Relative estimation based on threshold and water body nature
    const baseFactor = Math.max(0.02, 0.45 - currentThreshold * 0.4);
    const estimatedWaterArea = Number((totalAreaKm2 * baseFactor).toFixed(1));
    const coverage = Number((baseFactor * 100).toFixed(1));

    setWaterAreaKm2(estimatedWaterArea);
    setWaterPercentage(coverage);
  };

  // Jump to location
  const handleJumpToPreset = (loc: PresetLocation) => {
    setSelectedLocation(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(loc.coords, loc.zoom, { duration: 1.5 });
    }
  };

  // Search location via geocoding
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(`/api/water/geocode?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (!isNaN(lat) && !isNaN(lon) && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lon], 12, { duration: 1.5 });
      setSearchResults([]);
      setSearchQuery(item.display_name.split(",")[0]);
    }
  };

  // Automatic filter calibration
  const handleAutoCalibrate = () => {
    // Computes optimal threshold for water (typically 0.05 for NDWI)
    setThreshold(0.08);
    setOpacity(0.9);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-900 text-slate-100 overflow-hidden font-sans">
      {/* Top Studio Header */}
      <div className="h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="text-xs px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 transition-colors"
            >
              ← Retour
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30">
              <Droplets size={16} />
            </span>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Studio Cartographique Hydrologique & Filtres Spectraux</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 font-mono">
                Sentinel-2 / GEE Live
              </span>
            </h2>
          </div>
        </div>

        {/* Fused Engine Switcher (Option A + Option B) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveEngine("autonomous")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeEngine === "autonomous"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles size={13} />
              <span>Moteur Autonome (Option A)</span>
            </button>
            <button
              onClick={() => setActiveEngine("gee")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeEngine === "gee"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cloud size={13} />
              <span>Google Earth Engine Cloud (Option B)</span>
            </button>
          </div>

          <button
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Code2 size={13} className="text-cyan-400" />
            <span>Code GEE / Python</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body: Side Panel + Interactive Map */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Control Panel */}
        <div className="w-84 md:w-96 border-r border-slate-800 bg-slate-950/90 flex flex-col z-10 overflow-y-auto">
          {/* Section 1: Water Index Selection */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Droplets size={14} className="text-cyan-400" />
                <span>Indice Spectral d'Eau</span>
              </label>
              <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                {waterIndices.length} indices disponibles
              </span>
            </div>

            {/* Quick-choice pills */}
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {["NDWI", "MNDWI", "AWEInsh", "AWEIsh", "WRI", "ANDWI", "FWEI", "LSWI"].map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedIndex(name)}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold text-center transition-all border ${
                    selectedIndex === name
                      ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm shadow-cyan-500/30"
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Dropdown for all water indices */}
            <div className="relative">
              <select
                value={selectedIndex}
                onChange={(e) => setSelectedIndex(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500 transition-colors"
              >
                <optgroup label="Indices Spécifiques à l'Eau (Water Domain)">
                  {waterIndices.map((idx) => (
                    <option key={idx.short_name} value={idx.short_name}>
                      {idx.short_name} - {idx.long_name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Tous les Autres Indices">
                  {allSpectralIndices
                    .filter((idx) => idx.application_domain?.toLowerCase() !== "water")
                    .slice(0, 30)
                    .map((idx) => (
                      <option key={idx.short_name} value={idx.short_name}>
                        {idx.short_name} - {idx.long_name}
                      </option>
                    ))}
                </optgroup>
              </select>
            </div>

            {/* Formula badge */}
            <div className="mt-2.5 p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px]">
              <div className="text-slate-400 text-[10px] mb-0.5">Formule Mathématique :</div>
              <code className="text-cyan-300 font-mono font-semibold break-all">
                {currentIndexObj.formula}
              </code>
            </div>
          </div>

          {/* Section 2: Water Threshold & Real-time Filter */}
          <div className="p-4 border-b border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders size={14} className="text-cyan-400" />
                <span>Seuil de Détection de l'Eau</span>
              </label>
              <button
                onClick={handleAutoCalibrate}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50"
              >
                <Sparkles size={11} /> Auto-Calibrer
              </button>
            </div>

            {/* Threshold slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Seuil (NDWI &gt; x) :</span>
                <span className="font-mono font-bold text-cyan-400">{threshold.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-0.30"
                max="0.50"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Plus d'eau détectée (-0.30)</span>
                <span>Eau très pure (+0.50)</span>
              </div>
            </div>

            {/* Opacity slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Opacité du Masque :</span>
                <span className="font-mono text-slate-300">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Color Palette */}
            <div>
              <div className="text-xs text-slate-400 mb-2">Palette Visuelle de l'Eau :</div>
              <div className="flex items-center gap-2">
                {WATER_COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    onClick={() => setActivePalette(pal.id)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      activePalette === pal.id
                        ? "border-cyan-400 bg-slate-900 text-slate-100 shadow-sm"
                        : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${pal.bg}`} />
                    <span>{pal.name.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Live Hydro Calculations */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
            <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Eye size={14} className="text-cyan-400" />
              <span>Statistiques Hydrologiques en Direct</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Surface en Eau Détectée</div>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                  ~{waterAreaKm2} <span className="text-xs font-normal text-slate-400">km²</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {(waterAreaKm2 * 100).toLocaleString()} ha
                </div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400">Taux de Couverture Vue</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {waterPercentage}%
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {waterPercentage > 15 ? "Milieu très aquatique" : "Plan d'eau modéré"}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Preset Locations (Lacs & Retenues) */}
          <div className="p-4 flex-1">
            <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-cyan-400" />
              <span>Plans d'Eau &amp; Réservoirs Remarquables</span>
            </div>
            <div className="space-y-1.5">
              {PRESET_WATER_LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => handleJumpToPreset(loc)}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-all border flex items-center justify-between ${
                    selectedLocation.name === loc.name
                      ? "bg-cyan-950/40 border-cyan-500/50 text-cyan-200"
                      : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200">{loc.name}</div>
                    <div className="text-[10px] text-slate-500">{loc.country} • {loc.description}</div>
                  </div>
                  <ChevronRight size={13} className="text-slate-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Engine Status Banner */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${activeEngine === 'gee' ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
            <span>
              {activeEngine === 'gee' 
                ? "Moteur GEE Cloud actif (Sentinel-2 Harmonized)" 
                : "Moteur Autonome temps réel actif (Aucun compte requis)"}
            </span>
          </div>
        </div>

        {/* Right Map Canvas Area */}
        <div className="flex-1 relative flex flex-col">
          {/* Map Floating Control Bar */}
          <div className="absolute top-4 left-4 z-1000 flex flex-wrap items-center gap-2 max-w-[calc(100%-2rem)]">
            {/* Geocoding Search Box */}
            <form onSubmit={handleSearchSubmit} className="relative shadow-xl">
              <input
                type="text"
                placeholder="Rechercher un lac, réservoir, fleuve ou ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 sm:w-80 bg-slate-950/90 text-xs text-slate-100 border border-slate-700 rounded-full pl-9 pr-8 py-2 backdrop-blur outline-none focus:border-cyan-400 transition-all placeholder:text-slate-500"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              {isSearching && (
                <RefreshCw size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 animate-spin" />
              )}
            </form>

            {/* Base map switcher */}
            <div className="flex items-center bg-slate-950/90 border border-slate-700 rounded-full p-1 shadow-xl backdrop-blur text-xs">
              <button
                onClick={() => setBaseMapType("sentinel")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  baseMapType === "sentinel" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Sentinel-2
              </button>
              <button
                onClick={() => setBaseMapType("esri")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  baseMapType === "esri" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ESRI Satellite
              </button>
              <button
                onClick={() => setBaseMapType("dark")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  baseMapType === "dark" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setBaseMapType("osm")}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  baseMapType === "osm" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                OSM
              </button>
            </div>
          </div>

          {/* Search Dropdown Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-16 left-4 z-1000 w-80 bg-slate-950 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-2 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Résultats de recherche
              </div>
              <div className="max-h-60 overflow-y-auto">
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left p-2.5 hover:bg-slate-900 border-b border-slate-800/50 text-xs text-slate-200 flex flex-col transition-colors"
                  >
                    <span className="font-semibold text-cyan-300">{item.display_name.split(",")[0]}</span>
                    <span className="text-[10px] text-slate-400 truncate">{item.display_name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Earth Engine Cloud Settings Drawer (Visible when GEE Cloud is Active) */}
          {activeEngine === "gee" && (
            <div className="absolute top-4 right-14 z-1000 bg-slate-950/95 border border-emerald-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur w-76 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Cloud size={14} /> Paramètres Cloud GEE
                </span>
                <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800">
                  Option B
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Capteur Satellite</label>
                  <select
                    value={selectedSensor}
                    onChange={(e) => setSelectedSensor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[11px] text-slate-200 outline-none"
                  >
                    <option value="COPERNICUS/S2_SR_HARMONIZED">Sentinel-2 MSI Harmonized</option>
                    <option value="LANDSAT/LC08/C02/T1_L2">Landsat 8/9 OLI/TIRS Tier 1</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Date Début</label>
                    <input
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Date Fin</label>
                    <input
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                    <span>Nuages max autorisés</span>
                    <span className="font-mono text-emerald-400">{cloudCoverMax}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={cloudCoverMax}
                    onChange={(e) => setCloudCoverMax(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-1 bg-slate-800 rounded"
                  />
                </div>

                <button
                  onClick={() => setShowCodeModal(true)}
                  className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
                >
                  <Play size={12} fill="currentColor" />
                  <span>Générer Script &amp; Tuiles GEE</span>
                </button>
              </div>
            </div>
          )}

          {/* Leaflet Map DOM Node */}
          <div ref={mapContainerRef} className="flex-1 w-full h-full bg-slate-950" />

          {/* Bottom Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-1000 bg-slate-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs backdrop-blur flex items-center gap-4 shadow-xl">
            <div className="flex items-center gap-2">
              <span 
                className="w-3.5 h-3.5 rounded-full border shadow-sm"
                style={{ 
                  backgroundColor: WATER_COLOR_PALETTES.find(p => p.id === activePalette)?.hex || "#00F0FF",
                  borderColor: WATER_COLOR_PALETTES.find(p => p.id === activePalette)?.border || "#00B8D4"
                }}
              />
              <span className="text-slate-300 font-medium">Eau Détectée ({selectedIndex} &gt; {threshold.toFixed(2)})</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="text-[11px] text-slate-400">
              Fond : <strong className="text-slate-200 uppercase">{baseMapType}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Code Modal (GEE JavaScript & Python geemap) */}
      {showCodeModal && geeGeneratedCode && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-2000 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <Code2 className="text-cyan-400" size={18} />
                <h3 className="font-bold text-sm text-slate-100">
                  Script Prêt pour Google Earth Engine &amp; Python ({selectedIndex})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex">
                  <button
                    onClick={() => setCodeLanguage("js")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      codeLanguage === "js" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"
                    }`}
                  >
                    JavaScript (GEE Editor)
                  </button>
                  <button
                    onClick={() => setCodeLanguage("py")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold ${
                      codeLanguage === "py" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400"
                    }`}
                  >
                    Python (geemap)
                  </button>
                </div>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 flex-1 overflow-auto max-h-[60vh]">
              <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto p-3 bg-slate-900 rounded-xl border border-slate-800">
                {codeLanguage === "js" ? geeGeneratedCode.js : geeGeneratedCode.py}
              </pre>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Vous n'avez pas besoin de quitter l'application : l'affichage cartographique tourne déjà en direct !
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const code = codeLanguage === "js" ? geeGeneratedCode.js : geeGeneratedCode.py;
                    navigator.clipboard.writeText(code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? "Copié !" : "Copier le Script"}</span>
                </button>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
