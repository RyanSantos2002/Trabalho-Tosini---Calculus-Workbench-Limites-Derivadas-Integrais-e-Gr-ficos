declare module "react-plotly.js" {
  import * as React from "react";

  export interface PlotParams {
    data: Partial<Plotly.Data>[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
  }

  const Plot: React.FC<PlotParams>;

  export default Plot;
}
