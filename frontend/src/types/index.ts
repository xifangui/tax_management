export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'GENERAL';
  status: string;
  companyName?: string;
}

export interface Customer {
  id: number;
  customer_name: string;
  industry_type?: string;
  company_type?: string;
  registration_number?: string;
  contact_info?: string;
  status: string;
}

export interface FileItem {
  id: number;
  original_filename: string;
  upload_status: string;
}

export interface OcrResult {
  id: number;
  file_id: number;
  merchant_name?: string;
  company_name?: string;
  registration_number?: string;
  total_amount?: number;
  tax_amount?: number;
  tax_rate?: number;
  transaction_date?: string;
  review_status?: string;
  classified_subject_id?: number;
  account_category?: string;
  raw_text?: string;
  image_url?: string;
}
