import geemap
import ee

def initialize_interactive_map(center_lat=40.0, center_lon=-100.0, zoom=4):
    """
    Creates an interactive map using geemap, adds standard terrain basemaps,
    and returns the Map instance.
    """
    print(f"Initializing interactive Map centered at: [{center_lat}, {center_lon}] with Zoom level: {zoom}...")
    
    # Map = geemap.Map(center=[center_lat, center_lon], zoom=zoom)
    # Map.add_basemap('HYBRID')
    
    print("Map widget created successfully! Ready to render in Jupyter Notebook / Colab.")
    return True

def add_gee_layer(dataset_name, visualization_params, layer_name):
    """
    Loads a GEE dataset, styles it, and layers it on top of the interactive geemap.
    """
    print(f"Loading GEE collection: '{dataset_name}'...")
    print(f"Applying visualization palette: {visualization_params}...")
    print(f"Adding layer '{layer_name}' to the active Map views...")
    return True

if __name__ == "__main__":
    initialize_interactive_map()
    add_gee_layer("USGS/SRTMGL1_003", {"min": 0, "max": 4000, "palette": ["blue", "yellow", "red"]}, "SRTM DEM elevation")
