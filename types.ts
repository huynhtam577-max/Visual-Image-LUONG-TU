export enum AppStep {
  SCRIPT_INPUT = 0,
  TEMPLATE_INPUT = 1,
  THEME_INPUT = 2,
  PROCESSING = 3,
  RESULT_AND_CONTINUE = 4,
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isError?: boolean;
}

export interface GenerationConfig {
  theme: string;
  script: string;
  template: string;
}
