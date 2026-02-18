export const SAMPLE_DIAGRAM = `flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Process]
  B -->|No| D[Alternative]
  C --> E[Result]
  D --> E
  E --> F[End]`;
