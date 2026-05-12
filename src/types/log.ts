export type Level = "INFO" | "WARN" | "ERROR" | "DEBUG";

export type LogLine = {
  readonly id: string;
  readonly timestamp: number;
  readonly instance: string;
  readonly requestId?: string;
  readonly level: Level;
  readonly message: string;
};

export type DerivedLogLine = LogLine & {
  readonly isVisible: boolean;
  readonly isDimmed: boolean;
};
