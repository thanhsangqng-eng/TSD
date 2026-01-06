
export enum ScanStatus {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR'
}

export interface VerificationResult {
  idNumber: string;
  fullName?: string;
  isValid: boolean;
  message: string;
}

export interface ExtractedData {
  idNumber: string;
  fullName?: string;
}
