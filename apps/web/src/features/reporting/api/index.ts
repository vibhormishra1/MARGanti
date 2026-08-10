import { httpClient } from "@/lib/http-client";

export interface ReportRequest {
  report_type: string;
  start_date?: string;
  end_date?: string;
  organization_id?: string;
  status_filter?: string[];
}

export interface ReportSection {
  title: string;
  data: any;
}

export interface ReportResponse {
  id: string;
  generated_at: string;
  report_type: string;
  sections: ReportSection[];
  metadata: Record<string, any>;
}

export const generateReport = async (request: ReportRequest): Promise<ReportResponse> => {
  const { data } = await httpClient.post<ReportResponse>("/api/v1/reports/generate", request);
  return data;
};
