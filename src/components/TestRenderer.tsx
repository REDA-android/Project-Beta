import React from 'react';
import { IpynbRenderer } from "react-ipynb-renderer";

export function TestRenderer({ content }: { content: string }) {
  return <IpynbRenderer ipynb={JSON.parse(content)} />;
}
