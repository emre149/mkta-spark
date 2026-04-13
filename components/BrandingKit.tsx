"use client";

import { useState } from "react";
import { MarketingProfile, BrandKit } from "@/lib/types";

interface BrandingKitProps {
  profile: MarketingProfile;
  brandKit: BrandKit | null;
  onSaveBrandKit: (kit: BrandKit) => void;
}

const COLOR_PALETTES = [
  { name: "Violet Night", primary: "#7C3AED", secondary: "#1E1B4B", accent: "#C084FC" },
  { name: "Ocean Blue", primary: "#2563EB", secondary: "#0F172A", accent: "#60A5FA" },
  { name: "Emerald", primary: "#059669", secondary: "#064E3B", accent: "#34D399" },
  { name: "Sunset", primary: "#EA580C", secondary: "#431407", accent: "#FB923C" },
  { name: "Rose", primary: "#E11D48", secondary: "#1C1917", accent: "#FB7185" },
  { name: "Amber", primary: "#D97706", secondary: "#1C1917", accent: "#FBBF24" },
];

const FONT_PAIRS = [
  { primary: "Inter", secondary: "Source Serif 4" },
  { primary: "Outfit", secondary: "Inter" },
  { primary: "Space Grotesk", secondary: "DM Sans" },
  { primary: "Sora", secondary: "Work Sans" },
];

function generateSimpleLogo(name: string, color: string): string {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color}88;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="28" fill="url(#grad)"/>
    <text x="60" y="68" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Inter, sans-serif" font-weight="700" font-size="${initials.length > 1 ? '38' : '48'}">${initials}</text>
  </svg>`;
}

function generateBannerSvg(
  name: string,
  tagline: string,
  primary: string,
  secondary: string,
  accent: string
): string {
  return `<svg viewBox="0 0 1500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${secondary};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${primary}30;stop-opacity:1" />
      </linearGradient>
      <radialGradient id="glow" cx="75%" cy="30%" r="50%">
        <stop offset="0%" style="stop-color:${primary};stop-opacity:0.15" />
        <stop offset="100%" style="stop-color:${primary};stop-opacity:0" />
      </radialGradient>
    </defs>
    <rect width="1500" height="500" fill="url(#bg)"/>
    <rect width="1500" height="500" fill="url(#glow)"/>
    <circle cx="1200" cy="100" r="200" fill="${accent}" opacity="0.06"/>
    <circle cx="300" cy="400" r="150" fill="${primary}" opacity="0.05"/>
    <text x="120" y="230" fill="white" font-family="Inter, sans-serif" font-weight="800" font-size="72">${name}</text>
    <text x="120" y="300" fill="${accent}" font-family="Inter, sans-serif" font-weight="400" font-size="28">${tagline}</text>
    <line x1="120" y1="330" x2="400" y2="330" stroke="${primary}" stroke-width="3" opacity="0.6"/>
  </svg>`;
}

export function BrandingKit({
  profile,
  brandKit,
  onSaveBrandKit,
}: BrandingKitProps) {
  const [tagline, setTagline] = useState(
    brandKit?.tagline || profile.valueProposition || ""
  );
  const [selectedPalette, setSelectedPalette] = useState(0);
  const [selectedFont, setSelectedFont] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(!!brandKit);

  const palette = COLOR_PALETTES[selectedPalette];
  const fonts = FONT_PAIRS[selectedFont];

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));

    const logoSvg = generateSimpleLogo(profile.projectName, palette.primary);
    const bannerSvg = generateBannerSvg(
      profile.projectName,
      tagline || profile.valueProposition || "Build. Ship. Grow.",
      palette.primary,
      palette.secondary,
      palette.accent
    );

    const kit: BrandKit = {
      projectName: profile.projectName,
      tagline: tagline || profile.valueProposition || "",
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
      fontPrimary: fonts.primary,
      fontSecondary: fonts.secondary,
      logoSvg,
      twitterBannerUrl: `data:image/svg+xml;base64,${btoa(bannerSvg)}`,
      generatedAt: new Date().toISOString(),
    };

    onSaveBrandKit(kit);
    setGenerated(true);
    setIsGenerating(false);
  };

  const logoSvg = generated
    ? brandKit?.logoSvg || generateSimpleLogo(profile.projectName, palette.primary)
    : null;
  const bannerUrl = generated ? brandKit?.twitterBannerUrl : null;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/20 shrink-0">
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            🎨 Branding Kit
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Generate your logo, banner, and color palette
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Configuration */}
          <div className="space-y-6">
            {/* Tagline */}
            <div className="animate-slide-in-up">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Brand Tagline
              </label>
              <input
                className="input-dark"
                placeholder="e.g. Build faster. Ship smarter."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            {/* Color palette */}
            <div className="animate-slide-in-up stagger-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Color Palette
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COLOR_PALETTES.map((p, i) => (
                  <button
                    key={p.name}
                    onClick={() => setSelectedPalette(i)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedPalette === i
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/20 hover:border-border/40"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: p.primary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: p.secondary }}
                      />
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: p.accent }}
                      />
                    </div>
                    <p className="text-[11px] font-medium text-foreground/70">
                      {p.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Font pair */}
            <div className="animate-slide-in-up stagger-2">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Font Pair
              </label>
              <div className="grid grid-cols-2 gap-2">
                {FONT_PAIRS.map((f, i) => (
                  <button
                    key={f.primary}
                    onClick={() => setSelectedFont(i)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedFont === i
                        ? "border-primary/40 bg-primary/5"
                        : "border-border/20 hover:border-border/40"
                    }`}
                  >
                    <p className="text-sm font-bold text-foreground/80">
                      {f.primary}
                    </p>
                    <p className="text-[11px] text-muted-foreground/60">
                      + {f.secondary}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full btn-primary py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50 animate-slide-in-up stagger-3"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin-slow">🎨</span> Crafting your brand...
                </span>
              ) : generated ? (
                "🔄 Regenerate Kit"
              ) : (
                "🚀 Generate Branding Kit"
              )}
            </button>
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            {/* Logo preview */}
            <div className="animate-slide-in-right">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Logo
              </label>
              <div className="brand-preview" style={{ backgroundColor: `${palette.secondary}40` }}>
                {logoSvg ? (
                  <div
                    className="w-28 h-28 animate-scale-in"
                    dangerouslySetInnerHTML={{ __html: logoSvg }}
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl block mb-2 opacity-30">🎨</span>
                    <p className="text-xs text-muted-foreground/40">
                      Generate to preview
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Twitter banner preview */}
            <div className="animate-slide-in-right stagger-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                X / Twitter Banner (1500×500)
              </label>
              <div
                className="brand-preview !p-0 overflow-hidden !min-h-[160px]"
                style={{ aspectRatio: "3/1" }}
              >
                {bannerUrl ? (
                  <img
                    src={bannerUrl}
                    alt="Twitter Banner"
                    className="w-full h-full object-cover animate-fade-in"
                  />
                ) : (
                  <div className="text-center">
                    <span className="text-3xl block mb-2 opacity-30">🖼️</span>
                    <p className="text-xs text-muted-foreground/40">
                      Generate to preview
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Color values */}
            {generated && (
              <div className="animate-slide-in-up stagger-2 p-4 rounded-xl border border-border/20 bg-surface/30">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Brand Colors
                </p>
                <div className="space-y-2">
                  {[
                    { label: "Primary", color: palette.primary },
                    { label: "Secondary", color: palette.secondary },
                    { label: "Accent", color: palette.accent },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-md"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-xs text-foreground/70 flex-1">
                        {c.label}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground/60">
                        {c.color}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
