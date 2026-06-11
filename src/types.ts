export interface ModelComparison {
  name: string;
  tagline: string;
  type: string;
  latencyCPU: string; // RTF (Real-Time Factor) on standard Windows i5 CPU
  latencyGPU: string; // RTF on RTX 3060
  mosScore: number;   // Mean Opinion Score (1-5 scale)
  memoryFootprint: string;
  voiceCloning: string;
  multilingualHindiTeluguKannada: string;
  pros: string[];
  cons: string[];
  license: string;
  bestUse: string;
}

export interface ArchNode {
  id: string;
  label: string;
  category: "input" | "pipeline" | "acoustic" | "vocoder" | "output";
  description: string;
  detailedExplanation: string;
  winConfig: string;
}

export interface LinguisticRule {
  lang: string;
  ruleName: string;
  exampleGrapheme: string;
  examplePhoneme: string;
  explanation: string;
}

export interface CodeFile {
  filename: string;
  filepath: string;
  description: string;
  language: string;
  code: string;
}
