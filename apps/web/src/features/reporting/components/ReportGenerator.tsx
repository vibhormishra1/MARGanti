"use client";

import React, { useState } from "react";
import { useGenerateReport } from "../hooks/useReporting";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const ReportGenerator = () => {
  const { mutate: generate, data: reportData, isPending, error } = useGenerateReport();
  const [reportType, setReportType] = useState<string>("INCIDENT_SUMMARY");

  const handleGenerate = () => {
    generate({
      report_type: reportType,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Operational Reports</CardTitle>
          <CardDescription>Generate and export operational summaries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Report Type</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="INCIDENT_SUMMARY">Incident Summary</option>
                <option value="MISSION_PERFORMANCE">Mission Performance</option>
              </select>
            </div>
            <Button onClick={handleGenerate} disabled={isPending}>
              {isPending ? "Generating..." : "Generate Report"}
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm mb-4">
              Failed to generate report: {String(error)}
            </div>
          )}

          {reportData && (
            <div className="border border-slate-800 rounded-md p-4 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-semibold text-lg">{reportData.report_type.replace("_", " ")}</h3>
                  <p className="text-xs text-slate-500">
                    Generated at: {new Date(reportData.generated_at).toLocaleString()}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  Print / Save PDF
                </Button>
              </div>
              
              <div className="space-y-6">
                {reportData.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-medium text-slate-300">{section.title}</h4>
                    {Array.isArray(section.data) ? (
                      <div className="overflow-x-auto border border-slate-800 rounded">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-900 border-b border-slate-800">
                            <tr>
                              {section.data.length > 0 && Object.keys(section.data[0]).map((key) => (
                                <th key={key} className="px-4 py-2 capitalize">{key.replace("_", " ")}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {section.data.map((row, i) => (
                              <tr key={i} className="border-b border-slate-800 hover:bg-slate-900/50">
                                {Object.values(row).map((val: any, j) => (
                                  <td key={j} className="px-4 py-2 truncate max-w-xs">{String(val)}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {section.data.length === 0 && (
                          <div className="p-4 text-center text-slate-500">No data found for this section.</div>
                        )}
                      </div>
                    ) : (
                      <pre className="bg-slate-900 p-4 rounded text-sm overflow-x-auto border border-slate-800 text-slate-300">
                        {JSON.stringify(section.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
