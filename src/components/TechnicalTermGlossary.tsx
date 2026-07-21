import React, { useState } from 'react';
import { BookOpen, Sparkles, Tag, HelpCircle, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface TermDefinition {
  term: string;
  category: 'Remote Sensing' | 'AI & ML' | 'Climate & Weather' | 'Hydrology' | 'Data Formats';
  definition: string;
  simpleExplanation: string;
  example: string;
}

export const TECHNICAL_GLOSSARY: Record<string, TermDefinition> = {
  'Hyper-resolution': {
    term: 'Hyper-resolution',
    category: 'Remote Sensing',
    definition: 'Spatial imagery or environmental modeling at fine scales (typically < 10 meters to 100 meters).',
    simpleExplanation: 'Extremely detailed zoom that allows pinpointing individual crop rows, urban buildings, or small streams instead of broad blur.',
    example: 'Used in satellite modeling to monitor field-level crop stress and micro-climate patterns.'
  },
  'Autoregressive': {
    term: 'Autoregressive',
    category: 'AI & ML',
    definition: 'A statistical or neural network model that predicts future values based on past observations in a sequence.',
    simpleExplanation: 'An AI model that predicts step 2 based on step 1, step 3 based on step 2, similar to auto-complete for weather or time-series.',
    example: 'GraphCast uses autoregressive rollouts to forecast weather hour-by-hour up to 10 days ahead.'
  },
  'Spectral Indices': {
    term: 'Spectral Indices',
    category: 'Remote Sensing',
    definition: 'Mathematical formulas combining different light wavelengths (like infrared and red) captured by satellite sensors.',
    simpleExplanation: 'Color combination math formulas that highlight hidden features like plant health, water levels, or wildfire burn areas.',
    example: 'NDVI combines Near-Infrared and Red light to measure vegetation vigor.'
  },
  'Spatial Resolution': {
    term: 'Spatial Resolution',
    category: 'Remote Sensing',
    definition: 'The physical area on the Earth surface represented by a single pixel in a raster image.',
    simpleExplanation: 'Pixel clarity — a 10m resolution means each pixel on screen equals a 10m x 10m square on the ground.',
    example: 'Sentinel-2 provides 10m spatial resolution for optical bands.'
  },
  'Reanalysis': {
    term: 'Reanalysis',
    category: 'Climate & Weather',
    definition: 'Combining historical weather observations with modern physics models to create a continuous atmospheric dataset.',
    simpleExplanation: 'A super-accurate historical weather record produced by blending weather station readings with physics simulations.',
    example: 'ERA5 is ECMWF\'s flagship reanalysis dataset covering global weather from 1940 to present.'
  },
  'NDVI': {
    term: 'NDVI',
    category: 'Remote Sensing',
    definition: 'Normalized Difference Vegetation Index — measures live green vegetation density using NIR and Red light reflectance.',
    simpleExplanation: 'A vegetation health score from -1 to +1, where higher numbers indicate dense, healthy green leaves.',
    example: 'Farmers use NDVI to detect drought stress before leaves visibly turn brown.'
  },
  'GraphCast': {
    term: 'GraphCast',
    category: 'AI & ML',
    definition: 'Google DeepMind\'s Graph Neural Network AI model for medium-range global weather forecasting.',
    simpleExplanation: 'An ultra-fast AI model that generates 10-day global weather forecasts in under a minute.',
    example: 'Outperforms traditional physics supercomputers in 90% of atmospheric variables.'
  },
  'ERA5': {
    term: 'ERA5',
    category: 'Climate & Weather',
    definition: 'ECMWF fifth-generation global atmospheric reanalysis providing hourly climate variables.',
    simpleExplanation: 'The gold-standard historical weather dataset used globally for climate research and AI model training.',
    example: 'Used to train AI weather models on temperature, wind vectors, and surface pressure.'
  },
  'Zarr': {
    term: 'Zarr',
    category: 'Data Formats',
    definition: 'Format for chunked, compressed, multi-dimensional numerical arrays designed for cloud storage.',
    simpleExplanation: 'A cloud dataset format that lets you quickly read tiny slices of huge climate data without downloading gigabytes.',
    example: 'Stores petabyte-scale global weather grid predictions efficiently in cloud buckets.'
  },
  'GeoTIFF': {
    term: 'GeoTIFF',
    category: 'Data Formats',
    definition: 'A standard TIFF image file embedded with geographic metadata (latitude, longitude, map projection).',
    simpleExplanation: 'A map image file that knows exactly where on Earth every single pixel is located.',
    example: 'Exported from Earth Engine to render satellite imagery overlays in GIS software.'
  },
  'Earth Engine': {
    term: 'Earth Engine',
    category: 'Remote Sensing',
    definition: 'Google\'s cloud platform for petabyte-scale planetary satellite data analysis and planetary science.',
    simpleExplanation: 'Google\'s cloud supercomputer for analyzing multi-decade satellite imagery instantly.',
    example: 'Runs Python and JavaScript scripts over decades of Landsat and Sentinel data.'
  },
  'Raster': {
    term: 'Raster',
    category: 'Data Formats',
    definition: 'Spatial data formatted as a regular grid of rows and columns (pixels), where each cell holds a value.',
    simpleExplanation: 'A grid-based digital image map where every square pixel holds a measurement (e.g. temperature or elevation).',
    example: 'Elevation models and satellite thermal bands are stored as raster grids.'
  },
  'Sentinel-2': {
    term: 'Sentinel-2',
    category: 'Remote Sensing',
    definition: 'ESA multi-spectral optical satellite constellation providing 10m to 60m resolution imagery every 5 days.',
    simpleExplanation: 'European satellites taking high-definition optical photos of Earth\'s land surface every few days for free.',
    example: 'Used for crop classification, forest monitoring, and disaster management.'
  },
  'JAX': {
    term: 'JAX',
    category: 'AI & ML',
    definition: 'Google\'s high-performance Python framework for automatic differentiation and GPU/TPU array computing.',
    simpleExplanation: 'A lightning-fast math library built by Google for running heavy AI models on GPUs and TPUs.',
    example: 'Powers GraphCast, TimesFM, and modern DeepMind climate research models.'
  },
  'Transformer': {
    term: 'Transformer',
    category: 'AI & ML',
    definition: 'A neural network architecture using self-attention mechanisms to model relationships across sequential data.',
    simpleExplanation: 'The AI brain design behind ChatGPT and modern vision/weather models that connects patterns across time and space.',
    example: 'TimesFM uses transformer architectures to forecast multi-step time-series trends.'
  },
  'TimesFM': {
    term: 'TimesFM',
    category: 'AI & ML',
    definition: 'Google\'s foundation model for time-series forecasting pretrained on 100B real-world data points.',
    simpleExplanation: 'An AI foundation model specialized in predicting future trends for finance, streamflow, and climate.',
    example: 'Zero-shot forecasts streamflow and temperature trends without requiring custom re-training.'
  },
  'RUSLE': {
    term: 'RUSLE',
    category: 'Hydrology',
    definition: 'Revised Universal Soil Loss Equation — models soil erosion from rainfall, topography, and cover.',
    simpleExplanation: 'A mathematical formula that predicts how much topsoil will wash away from farmlands during rainstorms.',
    example: 'Combines satellite NDVI vegetation data with rainfall intensity to assess erosion risk.'
  },
  'LSTM': {
    term: 'LSTM',
    category: 'AI & ML',
    definition: 'Long Short-Term Memory — recurrent neural network architecture designed to retain temporal memory.',
    simpleExplanation: 'A neural network that remembers past events (like rain 3 days ago) to predict river flood levels today.',
    example: 'Widely used in hydrological streamflow prediction models.'
  },
  'MetNet': {
    term: 'MetNet',
    category: 'Climate & Weather',
    definition: 'Google Research deep learning architecture for high-resolution precipitation nowcasting.',
    simpleExplanation: 'An AI weather model that predicts rain clouds up to 8 hours ahead with minute-by-minute accuracy.',
    example: 'Generates precipitation maps at 1km spatial resolution every 2 minutes.'
  }
};

interface TechnicalTermGlossaryProps {
  text: string;
  className?: string;
}

export function GlossaryText({ text, className = '' }: TechnicalTermGlossaryProps) {
  const [hoveredTerm, setHoveredTerm] = useState<TermDefinition | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!text) return null;

  // Find matching terms sorted by length descending to avoid partial replacements
  const termKeys = Object.keys(TECHNICAL_GLOSSARY).sort((a, b) => b.length - a.length);

  // Build regex pattern matching word boundaries
  const escapedTerms = termKeys.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|');
  const regex = new RegExp(`\\b(${escapedTerms})\\b`, 'gi');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchText = match[0];
    const startIndex = match.index;

    // Add preceding non-matched text
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Find official term definition (case-insensitive)
    const officialKey = termKeys.find(k => k.toLowerCase() === matchText.toLowerCase()) || matchText;
    const termDef = TECHNICAL_GLOSSARY[officialKey];

    parts.push(
      <span
        key={`term-${startIndex}`}
        className="relative inline-block group"
        onMouseEnter={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPopoverPos({
            x: Math.min(Math.max(rect.left + rect.width / 2, 160), window.innerWidth - 180),
            y: rect.top - 10
          });
          setHoveredTerm(termDef);
        }}
        onMouseLeave={() => setHoveredTerm(null)}
      >
        <span className="border-b-2 border-dotted border-amber-400/80 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 px-1 py-0.5 rounded cursor-help font-medium transition-colors">
          {matchText}
        </span>
      </span>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  const categoryColor: Record<string, string> = {
    'Remote Sensing': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'AI & ML': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    'Climate & Weather': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    'Hydrology': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    'Data Formats': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  };

  return (
    <span className={`relative inline ${className}`}>
      {parts}

      <AnimatePresence>
        {hoveredTerm && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              left: `${popoverPos.x}px`,
              top: `${popoverPos.y}px`,
              transform: 'translate(-50%, -100%)',
              zIndex: 9999
            }}
            className="w-80 p-4 bg-slate-900/95 backdrop-blur-md border border-amber-500/30 shadow-2xl rounded-xl text-slate-100 pointer-events-none"
          >
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-sm">
                <BookOpen size={15} />
                <span>{hoveredTerm.term}</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${categoryColor[hoveredTerm.category] || 'bg-slate-800 text-slate-300'}`}>
                {hoveredTerm.category}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-2.5">
              {hoveredTerm.definition}
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 mb-2">
              <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 mb-0.5">
                <Sparkles size={11} />
                <span>Plain Language Summary</span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-normal">
                {hoveredTerm.simpleExplanation}
              </p>
            </div>

            <div className="text-[10px] text-slate-400 italic flex items-start gap-1">
              <span className="font-semibold text-slate-300 not-italic">Usage:</span>
              <span>"{hoveredTerm.example}"</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
