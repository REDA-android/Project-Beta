import { GEEDataset } from '../types';

/**
 * Categories matching Google Earth Engine catalog structure
 */
export const GEE_CATEGORIES = [
  "All",
  "Agriculture, Vegetation & Forestry",
  "Fire & Wildfire Analysis",
  "Hydrology & Water Resources",
  "Weather, Climate & Surface Temp",
  "Land Cover, Use & Soil",
  "Elevation & Topography",
  "Population & Socioeconomics",
  "Libraries & Tools"
] as const;

export type GEECategory = typeof GEE_CATEGORIES[number];

/**
 * Returns a high-quality executable Earth Engine JavaScript code snippet
 * for a given dataset/repository item.
 */
export function getGEESnippet(item: GEEDataset): string {
  // 1. If explicit snippet defined on the dataset object, return it directly
  if (item.code_snippet) {
    return item.code_snippet;
  }

  // 2. Specific Repository Handler: geetools / Code Editor Extensions
  if (item.id.includes("geetools")) {
    return `// =========================================================
// Title: ${item.title}
// Author: ${item.provider} | License: ${item.license}
// Category: Libraries & Tools
// =========================================================

// 1. Defined area of interest in Earth Engine
var poi = Map.getCenter();

// 2. Load Sentinel-2 Surface Reflectance Collection
var s2 = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(poi)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

var image = s2.median();

// 3. Visualization Parameters
var vis = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000
};

Map.centerObject(poi, 10);
Map.addLayer(image, vis, 'Sentinel-2 True Color');
print('Images count in collection:', s2.size());`;
  }

  // 3. Specific Repository Handler: Landsat SMW LST
  if (item.id.includes("Landsat_SMW_LST")) {
    return `// =========================================================
// Title: ${item.title}
// Author: ${item.provider}
// Category: Weather, Climate & Surface Temp
// Direct Share Link: https://code.earthengine.google.com/2a860714f346d034a7edef1108d4b3b2
// =========================================================

// Require Landsat SMW LST module
var LST = require('users/sofiaermida/landsat_smw:landsat_LST');

// Define region of interest
var geometry = Map.getCenter();

// Extract Landsat 8 LST collection
var landsat8 = LST.collection('L8', '2023-01-01', '2023-12-31', geometry);
var lstMean = landsat8.select('LST').mean();

// Render map
Map.centerObject(geometry, 9);
Map.addLayer(lstMean, {
  min: 285, 
  max: 315, 
  palette: ['blue', 'cyan', 'green', 'yellow', 'red']
}, 'Land Surface Temp (K)');`;
  }

  // 4. Specific Repository Handler: SAR Radar / Sentinel-1
  if (item.id.includes("sentinel1") || item.tags.includes("radar") || item.tags.includes("sar")) {
    return `// =========================================================
// Title: ${item.title}
// Provider: ${item.provider}
// Category: Agriculture, Vegetation & Forestry
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

// Calculate Radar Vegetation Index (RVI)
var rvi = vh.multiply(4).divide(vv.add(vh)).rename('RVI');

Map.centerObject(poi, 10);
Map.addLayer(rvi, {min: 0, max: 1, palette: ['blue', 'yellow', 'darkgreen']}, 'Sentinel-1 RVI');`;
  }

  // 5. Specific Repository Handler: Snazzy Maps
  if (item.id.includes("Snazzy") || item.id.includes("snazzy")) {
    return `// =========================================================
// Title: ${item.title}
// Author: Justin Braaten (jdbcode)
// Category: Libraries & Tools
// Direct GEE Share: https://code.earthengine.google.com/83e87834bc6be818e61e0f06e6bf1eb9
// =========================================================

var snazzy = require('users/aaronkollasch/snazzy-maps:style');
snazzy.addStyle('https://snazzymaps.com/style/8097/wy', 'Dark Gray');

var col = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterDate('2023-05-01', '2023-09-30')
  .filterBounds(Map.getCenter());

Map.addLayer(col.median(), {bands: ['B8', 'B4', 'B3'], min: 0, max: 3000}, 'False Color');`;
  }

  // 6. Generic Default GEE Script Fallback
  return `// =========================================================
// Title: ${item.title}
// Provider: ${item.provider}
// Thematic Category: ${item.thematic_group || 'General Remote Sensing'}
// Repository: https://github.com/${item.id}
// =========================================================

// 1. Define region centered on viewport
var area = Map.getCenter();

// 2. Load Sentinel-2 SR Harmonized collection
var collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(area)
  .filterDate('2023-01-01', '2023-12-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));

// 3. Compute Vegetation Index (NDVI)
var ndvi = collection.median().normalizedDifference(['B8', 'B4']);

// 4. Render layers on Earth Engine map canvas
Map.centerObject(area, 10);
Map.addLayer(ndvi, {
  min: 0.0, 
  max: 0.8, 
  palette: ['#0000ff', '#ffffff', '#00aa00']
}, 'NDVI (2023 Median)');

print('Repository script loaded for ${item.title}');`;
}
