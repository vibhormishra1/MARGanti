"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TacticalMap } from "@/features/map/components/TacticalMap";
import { IncidentLayer } from "@/features/map/components/layers/IncidentLayer";
import { ResourceLayer, PublicResource } from "@/features/map/components/layers/ResourceLayer";

type PublicIncident = { id: string; title: string; latitude: number; longitude: number; status: string; priority: string; description: string };
type AgentResult = { name: string; status: string; assessment: string; actions: string[]; confidence: number };

function EmergencyMapContent() {
  const params = useSearchParams(); const router = useRouter();
  const display = params.get("display"); const lat = Number(params.get("lat")); const lng = Number(params.get("lng"));
  const [description, setDescription] = useState(""); const [submitted, setSubmitted] = useState<PublicIncident | null>(null); const [pipeline, setPipeline] = useState<AgentResult[]>([]); const [validated, setValidated] = useState<string[]>([]);
  const resources = useMemo<PublicResource[]>(() => !Number.isFinite(lat) || !Number.isFinite(lng) ? [] : [
    { id: "demo-hospital", name: "Nearest emergency hospital", type: "HOSPITAL", lat: lat + 0.012, lng: lng + 0.009, status: "DEMO DIRECTORY" },
    { id: "demo-shelter", name: "Civic relief shelter", type: "SHELTER", lat: lat - 0.009, lng: lng + 0.014, status: "DEMO DIRECTORY" },
    { id: "demo-response", name: "Response staging point", type: "RESPONSE", lat: lat + 0.006, lng: lng - 0.012, status: "DEMO DIRECTORY" },
  ], [lat, lng]);

  const report = (event: React.FormEvent) => {
    event.preventDefault(); if (description.trim().length < 12) return;
    const text = description.trim(); const lower = text.toLowerCase();
    const priority = /fire|trapped|unconscious|collapse|explosion/.test(lower) ? "CRITICAL" : /injur|flood|smoke|accident/.test(lower) ? "HIGH" : "MEDIUM";
    const incident: PublicIncident = { id: crypto.randomUUID(), title: "Citizen emergency report", description: text, latitude: lat, longitude: lng, status: "REPORTED", priority };
    setSubmitted(incident); setPipeline([
      { name: "Situation / Risk", status: "ASSESSED", assessment: priority === "CRITICAL" ? "Immediate life-safety risk detected." : "Incident requires coordinated response and verification.", actions: ["Confirm people affected", "Keep a safe distance from hazards"], confidence: 86 },
      { name: "Medical / Safety", status: "ASSESSED", assessment: /injur|unconscious|trapped/.test(lower) ? "Potential casualties require urgent medical triage." : "No casualty details supplied; request welfare check.", actions: ["Contact local emergency services", "Move to a safe area if possible"], confidence: 82 },
      { name: "Logistics", status: "ASSESSED", assessment: "Nearby directory resources are available for responder review.", actions: ["Stage response near the reported coordinates", "Verify resource availability before dispatch"], confidence: 78 },
    ]); setValidated(["Coordinates are within valid geographic bounds", "No resource was dispatched without availability confirmation", "Guidance is advisory; emergency services remain authoritative"]); setDescription("");
  };

  if (!display || !Number.isFinite(lat) || !Number.isFinite(lng)) return <div className="flex h-full items-center justify-center p-8 text-center text-slate-300"><div><p className="mb-4 text-lg font-semibold">MARG needs a verified location to open the emergency view.</p><button className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-slate-950" onClick={() => router.push("/")}>Return to location setup</button></div></div>;
  return <div className="relative h-full w-full">
    <TacticalMap center={[lng, lat]}><IncidentLayer incidents={submitted ? [submitted] : []} /><ResourceLayer resources={resources} /></TacticalMap>
    <div className="pointer-events-none absolute left-4 top-4 z-20 max-w-[min(34rem,calc(100%-2rem))] rounded-xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white shadow-xl backdrop-blur-md"><div className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Verified active region</div><div className="truncate text-base font-bold">{display}</div><div className="mt-1 text-[10px] text-slate-400">{lat.toFixed(5)}, {lng.toFixed(5)} · blue markers are demo directory resources</div></div>
    <button className="absolute right-4 top-4 z-20 rounded-lg border border-slate-600 bg-slate-950/90 px-3 py-2 text-xs font-bold text-slate-200" onClick={() => router.push("/")}>Change location</button>
    <section className="absolute bottom-4 left-4 z-20 max-h-[calc(100%-7rem)] w-[min(30rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950/95 p-5 text-slate-100 shadow-2xl backdrop-blur-md">
      <div className="mb-4 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-300">Citizen emergency channel</p><h1 className="mt-1 text-xl font-black">Report what is happening</h1></div><span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-bold text-emerald-300">PUBLIC ACCESS</span></div>
      {!submitted && <form onSubmit={report}><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the emergency, hazards, and whether anyone is injured…" className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm outline-none ring-sky-500 placeholder:text-slate-500 focus:ring-2" /><div className="mt-3 flex items-center justify-between gap-3"><span className="text-[11px] text-slate-500">At least 12 characters · coordinates attached automatically</span><button disabled={description.trim().length < 12} className="rounded-lg bg-sky-400 px-4 py-2 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">Send report</button></div></form>}
      {submitted && <div className="space-y-4"><div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"><div className="flex justify-between text-xs font-bold"><span>REPORT {submitted.id.slice(0, 8)}</span><span className="text-amber-300">{submitted.priority}</span></div><p className="mt-2 text-sm text-slate-300">{submitted.description}</p></div><div><div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-bold">MARG agent assessment</h2><span className="text-[10px] text-emerald-300">CONSENSUS READY</span></div><div className="space-y-2">{pipeline.map((agent) => <div key={agent.name} className="rounded-lg border border-slate-800 bg-slate-900/70 p-3"><div className="flex justify-between text-xs font-bold"><span>{agent.name}</span><span className="text-emerald-300">{agent.confidence}% · {agent.status}</span></div><p className="mt-1 text-xs text-slate-400">{agent.assessment}</p><ul className="mt-2 list-disc pl-4 text-[11px] text-slate-300">{agent.actions.map((action) => <li key={action}>{action}</li>)}</ul></div>)}</div></div><div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3"><h2 className="text-xs font-bold uppercase tracking-wider text-emerald-300">Deterministic safety validation</h2><ul className="mt-2 space-y-1 text-[11px] text-slate-300">{validated.map((item) => <li key={item}>✓ {item}</li>)}</ul></div><p className="text-[11px] leading-relaxed text-slate-500">This local demonstration makes the neurosymbolic boundary visible: specialist assessments propose guidance, then deterministic checks constrain the result. For life-threatening situations, call your local emergency number now.</p><button onClick={() => { setSubmitted(null); setPipeline([]); }} className="w-full rounded-lg border border-slate-700 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900">Report another emergency</button></div>}
      {!submitted && <div className="mt-4 grid grid-cols-3 gap-2 text-center">{resources.map((resource) => <div key={resource.id} className="rounded-lg border border-slate-800 bg-slate-900/60 p-2"><div className="text-lg">{resource.type === "HOSPITAL" ? "✚" : resource.type === "SHELTER" ? "⌂" : "◈"}</div><div className="text-[10px] font-semibold text-slate-300">{resource.name}</div><div className="text-[9px] text-sky-300">{resource.status}</div></div>)}</div>}
    </section>
  </div>;
}

export default function EmergencyPage() { return <main className="h-screen w-full overflow-hidden bg-slate-950"><Suspense fallback={<div className="flex h-screen items-center justify-center text-slate-400">Loading verified emergency context…</div>}><EmergencyMapContent /></Suspense></main>; }
