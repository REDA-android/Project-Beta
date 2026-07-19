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
