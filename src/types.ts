/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SpectralIndex {
  short_name: string;
  long_name: string;
  formula: string;
  bands: string[];
  platforms: string[];
  reference: string;
  application_domain: string;
  date_of_addition: string;
  contributor: string;
}

export interface GEEDataset {
  title: string;
  sample_code: string;
  type: string;
  id: string;
  provider: string;
  tags: string;
  license: string;
  docs: string;
  thematic_group: string;
  thumbnail: string;
  code_snippet?: string;
}
