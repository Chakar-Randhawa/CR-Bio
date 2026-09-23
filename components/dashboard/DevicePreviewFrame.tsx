"use client";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

export type DeviceKey = "mobile" | "tablet" | "desktop";
export const DEVICES: { key: DeviceKey; label: string; icon: typeof Smartphone }[] = [
  { key: "mobile", label: "Mobile", icon: Smartphone },
  { key: "tablet", label: "Tablet", icon: Tablet },
  { key: "desktop", label: "Desktop", icon: Laptop },
];

export function DeviceSwitcher({ device, onChange }: { device: DeviceKey; onChange: (d: DeviceKey) => void }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
      {DEVICES.map((d) => (
        <button key={d.key} type="button" onClick={() => onChange(d.key)} className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", device === d.key ? "bg-violet/20 text-white" : "text-mist hover:text-white")} aria-pressed={device === d.key}>
          <d.icon className="h-3.5 w-3.5" /><span className="hidden sm:inline">{d.label}</span>
        </button>
      ))}
    </div>
  );
}

export function DeviceFrame({ device, children }: { device: DeviceKey; children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className={cn("border-[6px] border-[#1A1A24] bg-[#1A1A24] shadow-2xl", device === "mobile" && "device-frame-mobile", device === "tablet" && "device-frame-tablet", device === "desktop" && "device-frame-desktop")}>
        <div className="device-browserbar items-center gap-1.5 rounded-t-lg bg-[#232330] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="device-notch mx-auto -mb-1 h-5 w-24 rounded-b-xl bg-[#1A1A24]" />
        <div className="device-screen h-full w-full overflow-y-auto bg-ink">{children}</div>
      </div>
    </div>
  );
}
