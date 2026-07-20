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

