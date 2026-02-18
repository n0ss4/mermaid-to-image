export interface ExportOptions {
  svgHtml: string;
  scale: number;
  transparent?: boolean;
}

export interface Exporter {
  name: string;
  extension?: string;
  export(options: ExportOptions): Promise<void>;
}
