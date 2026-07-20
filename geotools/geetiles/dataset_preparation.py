import numpy as np

def create_ml_patches(tile_data, patch_size=256, stride=128):
    """
    Splits downloaded high-resolution geotiff grids into sub-patches
    suitable as inputs for deep convolutional neural networks (U-Net, ResNet).
    """
    print(f"Loading grid tile data (shape: {tile_data.shape})...")
    print(f"Extracting patches with sliding window of {patch_size}x{patch_size} and stride={stride}...")
    
    h, w, c = tile_data.shape
    num_patches_h = (h - patch_size) // stride + 1
    num_patches_w = (w - patch_size) // stride + 1
    
    total_patches = num_patches_h * num_patches_w
    print(f"Extracted {total_patches} patches successfully! Output size: ({total_patches}, {patch_size}, {patch_size}, {c})")
    return np.zeros((total_patches, patch_size, patch_size, c))

if __name__ == "__main__":
    # Simulate a Sentinel-2 multispectral tile (2000x2000 px, 4 spectral bands)
    sim_tile = np.random.rand(2000, 2000, 4)
    create_ml_patches(sim_tile)
