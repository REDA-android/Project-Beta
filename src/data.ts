export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

export const remoteSensingTree: FileNode[] = [
  {
    name: 'fewshot',
    type: 'directory',
    path: 'remote_sensing/fewshot',
    children: [
      { name: 'algorithms.py', type: 'file', path: 'remote_sensing/fewshot/algorithms.py' },
      { name: 'fewshot_api.py', type: 'file', path: 'remote_sensing/fewshot/fewshot_api.py' },
      { name: 'fewshot_models.py', type: 'file', path: 'remote_sensing/fewshot/fewshot_models.py' },
      { name: 'sampling.py', type: 'file', path: 'remote_sensing/fewshot/sampling.py' },
      { name: 'utils.py', type: 'file', path: 'remote_sensing/fewshot/utils.py' },
    ]
  },
  {
    name: 'models',
    type: 'directory',
    path: 'remote_sensing/models',
    children: [
      { name: 'architectures.py', type: 'file', path: 'remote_sensing/models/architectures.py' },
      { name: 'vits.py', type: 'file', path: 'remote_sensing/models/vits.py' },
      { name: 'dense_prediction.py', type: 'file', path: 'remote_sensing/models/dense_prediction.py' },
      { name: 'positional_embeddings.py', type: 'file', path: 'remote_sensing/models/positional_embeddings.py' },
    ]
  },
  {
    name: 'vertex_ai',
    type: 'directory',
    path: 'remote_sensing/vertex_ai',
    children: [
      { name: 'utils.py', type: 'file', path: 'remote_sensing/vertex_ai/utils.py' },
    ]
  }
];

export const climateTree: FileNode[] = [
  {
    name: 'beam',
    type: 'directory',
    path: 'climate/beam',
    children: [
      { name: 'create_examples.py', type: 'file', path: 'climate/beam/create_examples.py' },
      { name: 'daily_climatology.py', type: 'file', path: 'climate/beam/daily_climatology.py' },
      { name: 'netcdf_to_zarr.py', type: 'file', path: 'climate/beam/netcdf_to_zarr.py' },
    ]
  },
  {
    name: 'metnet2',
    type: 'directory',
    path: 'climate/metnet2',
    children: [
      { name: 'colab.ipynb', type: 'file', path: 'climate/metnet2/colab.ipynb' },
    ]
  },
  {
    name: 'interpretability',
    type: 'directory',
    path: 'climate/interpretability',
    children: [
      { name: 'saliency_maps.py', type: 'file', path: 'climate/interpretability/saliency_maps.py' },
      { name: 'utils.py', type: 'file', path: 'climate/interpretability/utils.py' },
    ]
  }
];

export const timesfmTree: FileNode[] = [
  {
    name: 'flax',
    type: 'directory',
    path: 'timesfm/timesfm/flax',
    children: [
      { name: 'transformer.py', type: 'file', path: 'timesfm/timesfm/flax/transformer.py' },
      { name: 'normalization.py', type: 'file', path: 'timesfm/timesfm/flax/normalization.py' },
    ]
  },
  {
    name: 'torch',
    type: 'directory',
    path: 'timesfm/timesfm/torch',
    children: [
      { name: 'transformer.py', type: 'file', path: 'timesfm/timesfm/torch/transformer.py' },
      { name: 'normalization.py', type: 'file', path: 'timesfm/timesfm/torch/normalization.py' },
    ]
  },
  { name: 'configs.py', type: 'file', path: 'timesfm/timesfm/configs.py' },
];

export const agriVisionTree: FileNode[] = [
  {
    name: 'images',
    type: 'directory',
    path: 'agri_vision/images',
    children: [
      { name: 'metric.png', type: 'file', path: 'agri_vision/images/metric.png' },
      { name: 'sw.gif', type: 'file', path: 'agri_vision/images/sw.gif' },
    ]
  },
  { name: 'README.md', type: 'file', path: 'agri_vision/README.md' },
  { name: 'codalab_challenge_results.csv', type: 'file', path: 'agri_vision/codalab_challenge_results.csv' },
];

export const graphcastTree: FileNode[] = [
  { name: 'autoregressive.py', type: 'file', path: 'graphcast/autoregressive.py' },
  { name: 'graphcast.py', type: 'file', path: 'graphcast/graphcast.py' },
  { name: 'gencast.py', type: 'file', path: 'graphcast/gencast.py' },
  { name: 'icosahedral_mesh.py', type: 'file', path: 'graphcast/icosahedral_mesh.py' },
  { name: 'typed_graph_net.py', type: 'file', path: 'graphcast/typed_graph_net.py' },
  { name: 'transformer.py', type: 'file', path: 'graphcast/transformer.py' },
  { name: 'solar_radiation.py', type: 'file', path: 'graphcast/solar_radiation.py' },
  { name: 'data_utils.py', type: 'file', path: 'graphcast/data_utils.py' },
];

export const floodForecastingTree: FileNode[] = [
  { name: 'README.md', type: 'file', path: 'hydrology/flood_forecasting/README.md' },
  {
    name: 'models',
    type: 'directory',
    path: 'hydrology/flood_forecasting/models',
    children: [
      { name: 'lstm.py', type: 'file', path: 'hydrology/flood_forecasting/models/lstm.py' },
      { name: 'gru.py', type: 'file', path: 'hydrology/flood_forecasting/models/gru.py' },
    ]
  },
  {
    name: 'data_processing',
    type: 'directory',
    path: 'hydrology/flood_forecasting/data_processing',
    children: [
      { name: 'hydro_data.py', type: 'file', path: 'hydrology/flood_forecasting/data_processing/hydro_data.py' },
    ]
  }
];

export const globalStreamflowTree: FileNode[] = [
  { name: 'README.md', type: 'file', path: 'hydrology/global_streamflow/README.md' },
  { name: 'streamflow_prediction.py', type: 'file', path: 'hydrology/global_streamflow/streamflow_prediction.py' },
  { name: 'evaluation_metrics.py', type: 'file', path: 'hydrology/global_streamflow/evaluation_metrics.py' },
];

export const rusleTree: FileNode[] = [
  { name: 'README.md', type: 'file', path: 'hydrology/rusle/README.md' },
  { name: 'rusle_model.py', type: 'file', path: 'hydrology/rusle/rusle_model.py' },
  {
    name: 'factors',
    type: 'directory',
    path: 'hydrology/rusle/factors',
    children: [
      { name: 'r_factor.py', type: 'file', path: 'hydrology/rusle/factors/r_factor.py' },
      { name: 'k_factor.py', type: 'file', path: 'hydrology/rusle/factors/k_factor.py' },
      { name: 'ls_factor.py', type: 'file', path: 'hydrology/rusle/factors/ls_factor.py' },
    ]
  }
];

export const bulkDownload25dTree: FileNode[] = [
  { name: 'README.md', type: 'file', path: 'geotools/bulk_download_25d/README.md' },
  { name: 'download_mesh.py', type: 'file', path: 'geotools/bulk_download_25d/download_mesh.py' },
  { name: 'convert_formats.py', type: 'file', path: 'geotools/bulk_download_25d/convert_formats.py' },
];

export const geetilesTree: FileNode[] = [
  { name: 'README.md', type: 'file', path: 'geotools/geetiles/README.md' },
  { name: 'tile_downloader.py', type: 'file', path: 'geotools/geetiles/tile_downloader.py' },
  { name: 'dataset_preparation.py', type: 'file', path: 'geotools/geetiles/dataset_preparation.py' },
];

export const geemapTree: FileNode[] = [
  { name: 'README.md', type: 'file', path: 'geotools/geemap/README.md' },
  { name: 'interactive_map.py', type: 'file', path: 'geotools/geemap/interactive_map.py' },
  { name: 'geemap_utils.py', type: 'file', path: 'geotools/geemap/geemap_utils.py' },
];

export const mergedGEERepositories = [
  // 1. AGRICULTURE, VEGETATION & FORESTRY
  {
    id: 'eupassarinho/GoogleEarthEngine-sentinel1-vegetation-indices',
    title: 'Sentinel-1 Radar Vegetation Indices (RVI)',
    provider: 'eupassarinho',
    type: 'SAR Script Collection',
    tags: 'sentinel-1, sar, rvi, vegetation-index, radar',
    license: 'GPL-3.0',
    docs: 'https://github.com/eupassarinho/GoogleEarthEngine-sentinel1-vegetation-indices',
    sample_code: 'https://github.com/eupassarinho/GoogleEarthEngine-sentinel1-vegetation-indices',
    thematic_group: 'Agriculture, Vegetation & Forestry',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Agriculture, Vegetation & Forestry
// Script: Sentinel-1 Radar Vegetation Index (RVI)
// =========================================================

var poi = Map.getCenter();

// Filter Sentinel-1 SAR GRD Collection
var s1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filterBounds(poi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'));

var vh = s1.select('VH').mean();
var vv = s1.select('VV').mean();

// Calculate Radar Vegetation Index (RVI) = 4 * VH / (VV + VH)
var rvi = vh.multiply(4).divide(vv.add(vh)).rename('RVI');

Map.centerObject(poi, 10);
Map.addLayer(rvi, {min: 0, max: 1, palette: ['blue', 'yellow', 'darkgreen']}, 'Sentinel-1 RVI');`
  },
  {
    id: 'kr-stn/EarthEngine_scripts',
    title: 'Multi-Temporal Crop Phenology & Vegetation Dynamics',
    provider: 'kr-stn',
    type: 'Script Repository',
    tags: 'sentinel-2, landsat, vegetation, phenology, ndvi',
    license: 'MIT',
    docs: 'https://github.com/kr-stn/EarthEngine_scripts',
    sample_code: 'https://github.com/kr-stn/EarthEngine_scripts',
    thematic_group: 'Agriculture, Vegetation & Forestry',
    thumbnail: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Agriculture, Vegetation & Forestry
// Script: Sentinel-2 Crop Phenology Time-Series
// =========================================================

var point = Map.getCenter();

function addNDVI(img) {
  var ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI');
  return img.addBands(ndvi);
}

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(point)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(addNDVI);

var chart = ui.Chart.image.seriesByRegion({
  imageCollection: s2.select('NDVI'),
  regions: point,
  reducer: ee.Reducer.mean(),
  scale: 10,
  xProperty: 'system:time_start'
}).setOptions({
  title: 'Sentinel-2 NDVI Phenology Profile',
  hAxis: {title: 'Date'},
  vAxis: {title: 'NDVI Index'}
});

print(chart);
Map.addLayer(s2.select('NDVI').max(), {min: 0, max: 0.8, palette: ['white', 'green']}, 'Max NDVI 2023');`
  },

  // 2. FIRE & WILDFIRE ANALYSIS
  {
    id: 'gee-community/burn-severity-nbr',
    title: 'NBR & dNBR Wildfire Burn Severity Assessment',
    provider: 'GEE Community / UN-SPIDER',
    type: 'Wildfire Assessment Script',
    tags: 'wildfire, nbr, dnbr, burn-severity, sentinel-2',
    license: 'MIT',
    docs: 'https://github.com/gee-community/awesome-google-earth-engine',
    sample_code: 'https://code.earthengine.google.com/',
    thematic_group: 'Fire & Wildfire Analysis',
    thumbnail: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Fire & Wildfire Analysis
// Script: Normalized Burn Ratio (NBR) & dNBR Severity
// =========================================================

var area = Map.getCenter();

// Define pre-fire and post-fire dates
var preFire = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(area).filterDate('2023-05-01', '2023-06-01').median();
var postFire = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(area).filterDate('2023-08-01', '2023-09-01').median();

// NBR = (NIR - SWIR2) / (NIR + SWIR2) -> Bands B8 & B12
var nbrPre = preFire.normalizedDifference(['B8', 'B12']);
var nbrPost = postFire.normalizedDifference(['B8', 'B12']);
var dnbr = nbrPre.subtract(nbrPost).rename('dNBR');

var visPalette = ['#7a8732', '#61af46', '#e3f251', '#e8c15a', '#b40426'];
Map.centerObject(area, 10);
Map.addLayer(dnbr, {min: -0.1, max: 0.66, palette: visPalette}, 'Burn Severity (dNBR)');`
  },

  // 3. HYDROLOGY & WATER RESOURCES
  {
    id: 'srahman16/GEE_Scripts',
    title: 'Remote Sensing & Hydrology Surface Water Dynamics',
    provider: 'S. Rahman',
    type: 'Script Repository',
    tags: 'hydrology, land-cover, ndvi, ndwi, earth-engine',
    license: 'MIT',
    docs: 'https://github.com/srahman16/GEE_Scripts',
    sample_code: 'https://github.com/srahman16/GEE_Scripts',
    thematic_group: 'Hydrology & Water Resources',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Hydrology & Water Resources
// Script: MNDWI Surface Water Extraction (Sentinel-2)
// =========================================================

var location = Map.getCenter();

var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(location)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
  .median();

// Modified Normalized Difference Water Index (MNDWI) = (Green - SWIR1) / (Green + SWIR1)
var mndwi = s2.normalizedDifference(['B3', 'B11']).rename('MNDWI');
var waterMask = mndwi.gt(0.0);

Map.centerObject(location, 11);
Map.addLayer(s2, {bands: ['B4', 'B3', 'B2'], min: 0, max: 3000}, 'True Color');
Map.addLayer(waterMask.selfMask(), {palette: ['0000ff']}, 'Extracted Water Bodies');`
  },

  // 4. WEATHER, CLIMATE & SURFACE TEMP
  {
    id: 'sofiaermida/Landsat_SMW_LST',
    title: 'Landsat SMW Land Surface Temperature (LST)',
    provider: 'Sofia Ermida',
    type: 'Algorithm & Dataset',
    tags: 'lst, landsat, thermal, statistical-mono-window, surface-temperature',
    license: 'MIT',
    docs: 'https://github.com/sofiaermida/Landsat_SMW_LST',
    sample_code: 'https://code.earthengine.google.com/2a860714f346d034a7edef1108d4b3b2',
    thematic_group: 'Weather, Climate & Surface Temp',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Weather, Climate & Surface Temp
// Script: Landsat Statistical Mono-Window LST Module
// =========================================================

var LST = require('users/sofiaermida/landsat_smw:landsat_LST');
var geometry = Map.getCenter();

// Extract Landsat 8 LST collection
var landsat8 = LST.collection('L8', '2023-01-01', '2023-12-31', geometry);
var lstMean = landsat8.select('LST').mean();

Map.centerObject(geometry, 9);
Map.addLayer(lstMean, {
  min: 285, 
  max: 315, 
  palette: ['blue', 'cyan', 'green', 'yellow', 'red']
}, 'Land Surface Temp (Kelvin)');`
  },
  {
    id: 'rugilandavyi/Google-Earth-Engine-for-Monitoring-Climate-and-LULC-change',
    title: 'Climate & Land Use / Land Cover (LULC) Monitoring',
    provider: 'Rugilanda Davyi',
    type: 'Climate & LULC Suite',
    tags: 'lulc, climate-change, ndvi, trend-analysis, earth-engine',
    license: 'MIT',
    docs: 'https://github.com/rugilandavyi/Google-Earth-Engine-for-Monitoring-Climate-and-LULC-change',
    sample_code: 'https://github.com/rugilandavyi/Google-Earth-Engine-for-Monitoring-Climate-and-LULC-change',
    thematic_group: 'Weather, Climate & Surface Temp',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop'
  },

  // 5. LAND COVER, USE & SOIL
  {
    id: 'gee-community/esa-worldcover-analytics',
    title: 'ESA WorldCover 10m Global Land Cover Classification',
    provider: 'ESA / VITO / GEE Catalog',
    type: 'Global LULC Dataset & Script',
    tags: 'worldcover, lulc, land-use, sentinel, classification',
    license: 'CC-BY-4.0',
    docs: 'https://github.com/gee-community/awesome-google-earth-engine',
    sample_code: 'https://code.earthengine.google.com/',
    thematic_group: 'Land Cover, Use & Soil',
    thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Land Cover, Use & Soil
// Script: ESA WorldCover 10m Visualization & Class Area Stats
// =========================================================

var area = Map.getCenter();

var dataset = ee.ImageCollection('ESA/WorldCover/v200').first();

Map.centerObject(area, 10);
Map.addLayer(dataset, {}, 'ESA WorldCover 10m 2021');`
  },

  // 6. ELEVATION & TOPOGRAPHY
  {
    id: 'gee-community/copernicus-dem-30m',
    title: 'Copernicus DEM 30m Slope, Aspect & Hillshade Pipeline',
    provider: 'Copernicus / GEE Community',
    type: 'Topography Analysis',
    tags: 'dem, copernicus, elevation, slope, hillshade, terrain',
    license: 'Open Access',
    docs: 'https://github.com/gee-community/awesome-google-earth-engine',
    sample_code: 'https://code.earthengine.google.com/',
    thematic_group: 'Elevation & Topography',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Elevation & Topography
// Script: Copernicus DEM 30m Slope & Terrain Visualizer
// =========================================================

var region = Map.getCenter();

var dem = ee.Image('COPERNICUS/DEM/GLO30').select('DEM');
var slope = ee.Terrain.slope(dem);
var hillshade = ee.Terrain.hillshade(dem);

Map.centerObject(region, 9);
Map.addLayer(hillshade, {min: 0, max: 255}, 'Hillshade');
Map.addLayer(dem, {min: 0, max: 3000, palette: ['0000ff', '00ffff', 'ffff00', 'ff0000', 'ffffff']}, 'Elevation (m)', true, 0.6);`
  },

  // 7. POPULATION & SOCIOECONOMICS
  {
    id: 'gee-community/viirs-nighttime-lights',
    title: 'VIIRS Nighttime Lights & Economic Activity Dynamics',
    provider: 'NOAA / GEE Community',
    type: 'Socioeconomic Dataset',
    tags: 'nighttime-lights, viirs, urban, economics, population',
    license: 'Public Domain',
    docs: 'https://github.com/gee-community/awesome-google-earth-engine',
    sample_code: 'https://code.earthengine.google.com/',
    thematic_group: 'Population & Socioeconomics',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Population & Socioeconomics
// Script: VIIRS Nighttime Radiance & Urban Expansion
// =========================================================

var city = Map.getCenter();

var viirs = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
  .filterDate('2023-01-01', '2023-12-31')
  .select('avg_rad')
  .median();

Map.centerObject(city, 8);
Map.addLayer(viirs, {min: 0, max: 60, palette: ['black', 'purple', 'red', 'yellow', 'white']}, 'Nighttime Radiance');`
  },

  // 8. LIBRARIES, TOOLS & FRAMEWORKS
  {
    id: 'opengeos/geemap',
    title: 'geemap: Interactive Mapping with Google Earth Engine',
    provider: 'OpenGeos / Qiusheng Wu',
    type: 'Python Package',
    tags: 'geemap, ipyleaflet, folium, python, mapping, timelapses',
    license: 'MIT',
    docs: 'https://github.com/opengeos/geemap',
    sample_code: 'https://github.com/opengeos/geemap',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'fitoprincipe/geetools-code-editor',
    title: 'geetools Code Editor Extension',
    provider: 'Felipe Carlos (fitoprincipe)',
    type: 'GEE JS Extension / Library',
    tags: 'geetools, code-editor, javascript, earth-engine',
    license: 'MIT',
    docs: 'https://github.com/fitoprincipe/geetools-code-editor',
    sample_code: 'https://github.com/fitoprincipe/geetools-code-editor',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'opengeos/Awesome-GEE',
    title: 'Awesome Google Earth Engine (OpenGeos)',
    provider: 'OpenGeos / Qiusheng Wu',
    type: 'Curated Awesome List',
    tags: 'awesome-list, geemap, python, earthengine, geospatial',
    license: 'MIT',
    docs: 'https://github.com/opengeos/Awesome-GEE',
    sample_code: 'https://github.com/opengeos/Awesome-GEE',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'gee-community/awesome-google-earth-engine',
    title: 'GEE Community Awesome List',
    provider: 'GEE Community',
    type: 'Curated Awesome List',
    tags: 'community, earth-engine, tutorials, datasets, scripts',
    license: 'CC-BY-4.0',
    docs: 'https://github.com/gee-community/awesome-google-earth-engine',
    sample_code: 'https://github.com/gee-community/awesome-google-earth-engine',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'jdbcode/Snazzy-EE-TS-GIF',
    title: 'Snazzy Earth Engine Time-Series Animated GIF Creator',
    provider: 'Justin Braaten (jdbcode)',
    type: 'Visualization Tool',
    tags: 'gif, timelapse, visualization, time-series, snazzy-maps',
    license: 'Apache-2.0',
    docs: 'https://github.com/jdbcode/Snazzy-EE-TS-GIF',
    sample_code: 'https://code.earthengine.google.com/83e87834bc6be818e61e0f06e6bf1eb9',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=400&auto=format&fit=crop',
    code_snippet: `// =========================================================
// Category: Libraries & Tools
// Script: Snazzy Maps Custom Styling for GEE
// =========================================================

var snazzy = require('users/aaronkollasch/snazzy-maps:style');
snazzy.addStyle('https://snazzymaps.com/style/8097/wy', 'Dark Gray');

var col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2023-05-01', '2023-09-30')
  .filterBounds(Map.getCenter());

Map.addLayer(col.median(), {bands: ['B8', 'B4', 'B3'], min: 0, max: 3000}, 'False Color Composite');`
  },
  {
    id: 'google/earthengine-api',
    title: 'Official Google Earth Engine Python Client API',
    provider: 'Google',
    type: 'Official SDK',
    tags: 'python, official-sdk, earthengine-api, google-cloud',
    license: 'Apache-2.0',
    docs: 'https://github.com/google/earthengine-api',
    sample_code: 'https://github.com/google/earthengine-api',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'gee-community/gee-blend',
    title: 'GEE Blend Modes for Image Collections',
    provider: 'GEE Community',
    type: 'Blending Library',
    tags: 'blend-modes, opacity, overlay, visualization, javascript',
    license: 'Apache-2.0',
    docs: 'https://github.com/gee-community/gee-blend',
    sample_code: 'https://github.com/gee-community/gee-blend',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'ibtissem-hamani/Hyperparameters_Optimization_APP',
    title: 'GEE ML Hyperparameter Optimization App',
    provider: 'Ibtissem Hamani',
    type: 'Interactive Web App',
    tags: 'random-forest, hyperparameter-tuning, machine-learning, gee-app',
    license: 'MIT',
    docs: 'https://github.com/ibtissem-hamani/Hyperparameters_Optimization_APP',
    sample_code: 'https://github.com/ibtissem-hamani/Hyperparameters_Optimization_APP',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop'
  },
  {
    id: 'imildositoe/mastering_google_earth_engine',
    title: 'Mastering Google Earth Engine Course & Scripts',
    provider: 'Imildo Sitoe',
    type: 'Educational Repository',
    tags: 'tutorials, machine-learning, classification, javascript, python',
    license: 'MIT',
    docs: 'https://github.com/imildositoe/mastering_google_earth_engine',
    sample_code: 'https://github.com/imildositoe/mastering_google_earth_engine',
    thematic_group: 'Libraries & Tools',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=400&auto=format&fit=crop'
  }
];


