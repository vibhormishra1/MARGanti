"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowForward, LocationOn, MyLocation, Security } from "@mui/icons-material";
import { coordinateFallback, resolveLocation, reverseGeocode, ResolvedLocation } from "@/lib/location";

export default function LandingPage() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [resolved, setResolved] = useState<ResolvedLocation | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const openEmergency = (result: ResolvedLocation) => router.push(`/emergency?display=${encodeURIComponent(result.displayName)}&lat=${result.latitude}&lng=${result.longitude}`);
  const resolve = async (value = location) => {
    setBusy(true); setMessage(""); setResolved(null);
    try {
      const result = await resolveLocation(value);
      setLocation(result.displayName.split(",")[0]); setResolved(result); return result;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn't find that location. Try a city or recognizable place.");
      return null;
    } finally { setBusy(false); }
  };

  const continueToEmergency = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const result = resolved || await resolve();
    if (result) openEmergency(result);
  };

  const useCurrentLocation = () => {
    setMessage(""); setBusy(true); setResolved(null);
    if (!navigator.geolocation) { setMessage("This browser does not support location services. Enter a city instead."); setBusy(false); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const result = await reverseGeocode(coords.latitude, coords.longitude);
        setLocation(result.displayName.split(",")[0]); setResolved(result); openEmergency(result);
      } catch {
        // Coordinates are still safe and useful even when the naming provider is unavailable.
        const result = coordinateFallback(coords.latitude, coords.longitude);
        setLocation("Current location"); setResolved(result); openEmergency(result);
      } finally { setBusy(false); }
    }, (error) => {
      const messages: Record<number, string> = { 1: "Location permission was denied. You can enter a city instead.", 2: "Your position is currently unavailable. Try entering a city.", 3: "Location detection timed out. Try again or enter a city." };
      setMessage(messages[error.code] || "We couldn't detect your location. Try entering a city."); setBusy(false);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  };

  return <main className="min-h-screen overflow-hidden bg-[#f4f7f5] text-slate-800">
    <div className="pointer-events-none absolute -left-24 -top-28 h-80 w-80 rounded-full bg-[#dcece5] opacity-70 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-[#e2edf2] opacity-80 blur-3xl" />
    <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-16">
      <header className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700 text-lg font-black text-white shadow-sm">M</div><div><div className="text-xl font-black tracking-tight text-slate-900">MARG</div><div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Crisis management</div></div></div><div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Available when you need us</div></header>
      <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <section className="animate-[rise-in_700ms_ease-out_both]"><div className="mb-8 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-teal-800 shadow-sm"><span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" /> A calmer way through an emergency</div><h1 className="max-w-xl text-5xl font-black leading-[1.05] tracking-[-0.04em] text-slate-900 sm:text-6xl">Help starts with knowing <span className="text-teal-700">where you are.</span></h1><p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">MARG brings together local context, nearby help, and clear next steps when every moment matters.</p><div className="mt-10 flex flex-wrap gap-5 text-sm text-slate-600"><span className="flex items-center gap-2"><span className="rounded-full bg-teal-100 p-1.5 text-teal-700">✓</span> Local context</span><span className="flex items-center gap-2"><span className="rounded-full bg-teal-100 p-1.5 text-teal-700">✓</span> Clear guidance</span><span className="flex items-center gap-2"><span className="rounded-full bg-teal-100 p-1.5 text-teal-700">✓</span> Human-first</span></div></section>
        <section className="animate-[rise-in_700ms_120ms_ease-out_both] rounded-[2rem] border border-white bg-white/90 p-6 shadow-[0_24px_70px_rgba(47,76,73,0.12)] sm:p-9"><div className="mb-7"><p className="text-sm font-semibold text-teal-700">Let’s begin</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Where are you right now?</h2><p className="mt-2 text-sm leading-6 text-slate-500">We’ll use your area to show relevant emergency information.</p></div><form onSubmit={continueToEmergency} className="space-y-4"><label htmlFor="location" className="sr-only">City or location</label><div className={`flex items-center rounded-2xl border bg-[#f7faf9] px-4 transition-all duration-300 focus-within:border-teal-500 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(13,148,136,0.10)] ${message ? "border-rose-300" : "border-slate-200"}`}><LocationOn className="mr-3 text-slate-400" /><input id="location" value={location} onChange={(event) => { setLocation(event.target.value); setResolved(null); setMessage(""); }} onBlur={() => location.trim() && !resolved && resolve()} placeholder="Enter a city or recognizable place" className="min-w-0 flex-1 bg-transparent py-4 text-base text-slate-800 outline-none placeholder:text-slate-400" autoComplete="address-level2" /></div><button type="button" onClick={useCurrentLocation} disabled={busy} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-wait disabled:opacity-60"><MyLocation className={busy ? "animate-spin text-teal-600" : "text-teal-700"} fontSize="small" />{busy ? "Finding your area…" : "Use my current location"}</button>{message && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm leading-5 text-rose-700">{message}</p>}{resolved && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm leading-5 text-emerald-800">Location ready · {resolved.latitude.toFixed(4)}° N, {resolved.longitude.toFixed(4)}° E</p>}<button type="submit" disabled={busy || !location.trim()} className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-teal-700 px-5 text-base font-bold text-white shadow-lg shadow-teal-700/20 transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">Continue <ArrowForward className="transition-transform group-hover:translate-x-1" /></button></form></section>
      </div>
      <footer className="flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-6 text-sm text-slate-500 sm:flex-row"><span>For immediate danger, contact your local emergency services.</span><button onClick={() => router.push("/admin")} className="flex items-center gap-2 rounded-lg px-3 py-2 font-semibold transition hover:bg-white hover:text-slate-800"><Security fontSize="small" /> Command Center</button></footer>
    </div>
  </main>;
}
