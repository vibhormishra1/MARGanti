import { useMutation } from "@tanstack/react-query";
import { generateReport, ReportRequest, ReportResponse } from "../api";

export const useGenerateReport = () => {
  return useMutation<ReportResponse, Error, ReportRequest>({
    mutationFn: generateReport,
  });
};
