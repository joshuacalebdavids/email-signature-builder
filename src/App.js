import React, { useEffect, useMemo, useRef, useState } from "react";
import "./index.css";

const STORAGE_KEY = "vrtks-email-signature-builder-v2";

const DEFAULT_SIGNATURE = {
  fullName: "John Doe",
  title: "Founder",
  company: "Company ipsum",
  phone: "021 100 3209",
  mobile: "",
  email: "info@email.com",
  website: "www.company.com",
  address: "Somewhere, Out There",
  logoUrl: "",
  profileUrl: "",
  bannerText: "Smart websites. Better marketing. Measurable growth.",
  disclaimer:
    "This email and any attachments are confidential and intended only for the recipient. If you received this in error, please delete it and notify the sender.",
  linkedin: "",
  facebook: "",
  instagram: "",
};

const ACCENTS = [
  { id: "gold", label: "Pillar 1", name: "Gold", hex: "#facc15", soft: "rgba(250, 204, 21, .12)", border: "rgba(250, 204, 21, .45)" },
  { id: "blue", label: "Pillar 2", name: "Blue", hex: "#60a5fa", soft: "rgba(96, 165, 250, .12)", border: "rgba(96, 165, 250, .45)" },
  { id: "red", label: "Pillar 3", name: "Red", hex: "#f87171", soft: "rgba(248, 113, 113, .12)", border: "rgba(248, 113, 113, .45)" },
  { id: "green", label: "Pillar 4", name: "Green", hex: "#4ade80", soft: "rgba(74, 222, 128, .12)", border: "rgba(74, 222, 128, .45)" },
  { id: "purple", label: "Pillar 5", name: "Purple", hex: "#c084fc", soft: "rgba(192, 132, 252, .12)", border: "rgba(192, 132, 252, .45)" },
];

const TEMPLATES = [
  { id: "classic", label: "CLASSIC", description: "Logo left, details right" },
  { id: "compact", label: "COMPACT", description: "Text-first simple signature" },
  { id: "banner", label: "BANNER", description: "Signature with branded CTA bar" },
];

const FIELD_GROUPS = [
  {
    title: "Identity",
    color: "#facc15",
    fields: [
      ["fullName", "Full name", "Joshua Davids"],
      ["title", "Job title", "Web Developer"],
      ["company", "Company", "Enovation Digital Marketing Agency"],
    ],
  },
  {
    title: "Contact",
    color: "#60a5fa",
    fields: [
      ["phone", "Phone", "021 100 3209"],
      ["mobile", "Mobile / WhatsApp", "062 000 0000"],
      ["email", "Email", "info@enovation.co.za"],
      ["website", "Website", "www.enovation.co.za"],
      ["address", "Address", "Cape Town, South Africa"],
    ],
  },
  {
    title: "Brand assets",
    color: "#4ade80",
    fields: [
      ["logoUrl", "Logo URL", "https://example.com/logo.png"],
      ["profileUrl", "Profile image URL", "https://example.com/profile.jpg"],
      ["bannerText", "Banner / CTA line", "Smart websites. Better marketing."],
    ],
  },
  {
    title: "Social links",
    color: "#c084fc",
    fields: [
      ["linkedin", "LinkedIn URL", "https://linkedin.com/company/example"],
      ["facebook", "Facebook URL", "https://facebook.com/example"],
      ["instagram", "Instagram URL", "https://instagram.com/example"],
    ],
  },
];

const THEMES = {
  dark: {
    name: "Dark",
    icon: "☾",
    page: "bg-[#0d0d0d] text-zinc-200 selection:bg-white selection:text-black",
    border: "border-white/10",
    panel: "border-white/10 bg-[#151515]",
    panelSoft: "border-white/10 bg-[#101010]",
    input: "border-white/10 bg-[#0f0f0f] text-zinc-100 placeholder:text-zinc-700 focus:border-white/25 focus:bg-[#151515]",
    textStrong: "text-white",
    text: "text-zinc-300",
    muted: "text-zinc-500",
    mutedSoft: "text-zinc-600",
    topInactive: "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white",
    topActive: "border-white bg-white text-black",
    buttonGhost: "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:text-white",
    previewShell: "border-white/10 bg-[#151515]",
    emailStage: "border-white/10 bg-zinc-100",
    htmlBox: "border-white/10 bg-[#111] text-zinc-300",
    modalOverlay: "bg-black/70",
    toast: "border-white/10 bg-white text-black",
  },
  light: {
    name: "Light",
    icon: "☀",
    page: "bg-[#f4f1ea] text-zinc-900 selection:bg-black selection:text-white",
    border: "border-black/10",
    panel: "border-black/10 bg-white/80 shadow-sm",
    panelSoft: "border-black/10 bg-[#fbfaf7]",
    input: "border-black/10 bg-white text-zinc-900 placeholder:text-zinc-400 focus:border-black/25 focus:bg-white",
    textStrong: "text-zinc-950",
    text: "text-zinc-700",
    muted: "text-zinc-500",
    mutedSoft: "text-zinc-400",
    topInactive: "border-black/10 bg-black/[0.03] text-zinc-600 hover:border-black/20 hover:text-black",
    topActive: "border-black bg-black text-white",
    buttonGhost: "border-black/10 bg-black/[0.03] text-zinc-600 hover:border-black/20 hover:text-black",
    previewShell: "border-black/10 bg-white/80 shadow-sm",
    emailStage: "border-black/10 bg-zinc-100",
    htmlBox: "border-black/10 bg-white text-zinc-800",
    modalOverlay: "bg-black/35",
    toast: "border-black/10 bg-black text-white",
  },
};

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normaliseUrl(value) {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("mailto:") || value.startsWith("tel:")) return value;
  return `https://${value}`;
}

function safe(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildSignatureHtml(data, accent, template) {
  const websiteUrl = normaliseUrl(data.website);
  const socialLinks = [
    data.linkedin && { label: "LinkedIn", url: data.linkedin },
    data.facebook && { label: "Facebook", url: data.facebook },
    data.instagram && { label: "Instagram", url: data.instagram },
  ].filter(Boolean);

  const contactRows = [
    data.phone && `T: <a href="tel:${safe(data.phone.replaceAll(" ", ""))}" style="color:#404040;text-decoration:none;">${safe(data.phone)}</a>`,
    data.mobile && `M: <a href="tel:${safe(data.mobile.replaceAll(" ", ""))}" style="color:#404040;text-decoration:none;">${safe(data.mobile)}</a>`,
    data.email && `E: <a href="mailto:${safe(data.email)}" style="color:#404040;text-decoration:none;">${safe(data.email)}</a>`,
    data.website && `W: <a href="${safe(websiteUrl)}" style="color:${accent.hex};text-decoration:none;font-weight:700;">${safe(data.website)}</a>`,
    data.address && `A: <span style="color:#404040;">${safe(data.address)}</span>`,
  ].filter(Boolean);

  const socials = socialLinks
    .map(
      (item) =>
        `<a href="${safe(normaliseUrl(item.url))}" style="font-size:11px;color:${accent.hex};text-decoration:none;font-weight:700;margin-right:10px;">${safe(item.label)}</a>`
    )
    .join("");

  const logo = data.logoUrl
    ? `<img src="${safe(data.logoUrl)}" width="112" style="display:block;max-width:112px;height:auto;border:0;outline:none;text-decoration:none;" alt="${safe(data.company)} logo" />`
    : `<div style="width:112px;height:48px;background:${accent.hex};color:#111111;font-family:Arial,sans-serif;font-weight:800;font-size:13px;letter-spacing:1px;text-align:center;line-height:48px;">LOGO</div>`;

  const profile = data.profileUrl
    ? `<img src="${safe(data.profileUrl)}" width="76" height="76" style="display:block;width:76px;height:76px;border-radius:50%;object-fit:cover;border:2px solid ${accent.hex};" alt="${safe(data.fullName)}" />`
    : "";

  const disclaimer = data.disclaimer
    ? `<tr><td colspan="3" style="padding-top:12px;font-family:Arial,sans-serif;font-size:9px;line-height:1.45;color:#888888;max-width:620px;">${safe(data.disclaimer)}</td></tr>`
    : "";

  if (template === "compact") {
    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial,sans-serif;border-collapse:collapse;width:100%;max-width:560px;">
  <tr>
    <td style="padding:0 0 10px 0;border-bottom:2px solid ${accent.hex};">
      <div style="font-size:18px;line-height:1.2;font-weight:800;color:#111111;">${safe(data.fullName)}</div>
      <div style="font-size:12px;line-height:1.4;color:#555555;">${safe(data.title)}${data.company ? ` | ${safe(data.company)}` : ""}</div>
    </td>
  </tr>
  <tr>
    <td style="padding-top:10px;font-size:11px;line-height:1.7;color:#404040;">${contactRows.join("<br />")}</td>
  </tr>
  ${socials ? `<tr><td style="padding-top:8px;">${socials}</td></tr>` : ""}
  ${data.disclaimer ? `<tr><td style="padding-top:12px;font-size:9px;line-height:1.45;color:#888888;">${safe(data.disclaimer)}</td></tr>` : ""}
</table>`.trim();
  }

  if (template === "banner") {
    return `
<table cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial,sans-serif;border-collapse:collapse;width:100%;max-width:650px;">
  <tr>
    <td width="135" valign="top" style="padding:0 18px 0 0;border-right:2px solid ${accent.hex};">${logo}</td>
    <td valign="top" style="padding:0 0 0 18px;">
      <div style="font-size:19px;line-height:1.2;font-weight:800;color:#111111;">${safe(data.fullName)}</div>
      <div style="font-size:12px;line-height:1.5;color:#555555;font-weight:600;">${safe(data.title)}</div>
      <div style="font-size:12px;line-height:1.5;color:#222222;font-weight:700;">${safe(data.company)}</div>
      <div style="font-size:11px;line-height:1.7;color:#404040;margin-top:8px;">${contactRows.join("<br />")}</div>
      ${socials ? `<div style="padding-top:8px;">${socials}</div>` : ""}
    </td>
  </tr>
  ${data.bannerText ? `<tr><td colspan="2" style="padding-top:14px;"><div style="background:${accent.hex};color:#111111;font-size:12px;font-weight:800;letter-spacing:.3px;padding:9px 12px;">${safe(data.bannerText)}</div></td></tr>` : ""}
  ${data.disclaimer ? `<tr><td colspan="2" style="padding-top:12px;font-size:9px;line-height:1.45;color:#888888;">${safe(data.disclaimer)}</td></tr>` : ""}
</table>`.trim();
  }

  return `
<table cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial,sans-serif;border-collapse:collapse;width:100%;max-width:650px;">
  <tr>
    <td width="120" valign="top" style="padding-right:18px;">${profile || logo}</td>
    <td width="1" style="background:${accent.hex};font-size:1px;line-height:1px;">&nbsp;</td>
    <td valign="top" style="padding-left:18px;">
      <div style="font-size:19px;line-height:1.2;font-weight:800;color:#111111;">${safe(data.fullName)}</div>
      <div style="font-size:12px;line-height:1.5;color:#555555;font-weight:600;">${safe(data.title)}</div>
      <div style="font-size:12px;line-height:1.5;color:#222222;font-weight:700;">${safe(data.company)}</div>
      <div style="font-size:11px;line-height:1.7;color:#404040;margin-top:8px;">${contactRows.join("<br />")}</div>
      ${socials ? `<div style="padding-top:8px;">${socials}</div>` : ""}
    </td>
  </tr>
  ${disclaimer}
</table>`.trim();
}

function Field({ label, value, placeholder, onChange, textarea = false, ui }) {
  const baseClass = cx(
    "w-full rounded border px-3 py-2 text-[12px] outline-none transition",
    "focus:ring-2 focus:ring-black/5",
    ui.input
  );

  return (
    <label className="block">
      <span className={cx("mb-1.5 block text-[10px] font-bold uppercase tracking-[0.2em]", ui.muted)}>{label}</span>
      {textarea ? (
        <textarea className={cx(baseClass, "min-h-[86px] resize-y leading-relaxed")} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={baseClass} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function TopButton({ children, active, onClick, ui }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "rounded border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition",
        active ? ui.topActive : ui.topInactive
      )}
    >
      {children}
    </button>
  );
}

function Pill({ children, active, color, onClick, mode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        color,
        borderColor: active ? color : mode === "dark" ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.14)",
        background: active ? `${color}1f` : mode === "dark" ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.03)",
      }}
      className="rounded border px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] transition hover:brightness-110"
    >
      {children}
    </button>
  );
}

function SignaturePreview({ html }) {
  return (
    <div className="rounded border border-black/10 bg-white p-6 shadow-2xl shadow-black/10">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default function App() {
  const importRef = useRef(null);
  const [data, setData] = useState(DEFAULT_SIGNATURE);
  const [accentId, setAccentId] = useState("gold");
  const [template, setTemplate] = useState("classic");
  const [view, setView] = useState("builder");
  const [mode, setMode] = useState("dark");
  const [toast, setToast] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const ui = THEMES[mode];
  const accent = useMemo(() => ACCENTS.find((item) => item.id === accentId) || ACCENTS[0], [accentId]);
  const signatureHtml = useMemo(() => buildSignatureHtml(data, accent, template), [data, accent, template]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setData({ ...DEFAULT_SIGNATURE, ...(parsed.data || {}) });
      setAccentId(parsed.accentId || "gold");
      setTemplate(parsed.template || "classic");
      setMode(parsed.mode || "dark");
    } catch (error) {
      console.warn("Could not load saved signature", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, accentId, template, mode }));
  }, [data, accentId, template, mode]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const updateField = (key, value) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const toggleMode = () => {
    setMode((current) => (current === "dark" ? "light" : "dark"));
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(signatureHtml);
    setToast("HTML copied");
  };

  const copyRendered = async () => {
    const blob = new Blob([signatureHtml], { type: "text/html" });
    const text = new Blob([signatureHtml], { type: "text/plain" });
    await navigator.clipboard.write([new ClipboardItem({ "text/html": blob, "text/plain": text })]);
    setToast("Signature copied");
  };

  const exportJson = () => {
    const file = new Blob([JSON.stringify({ data, accentId, template, mode }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.fullName || "email-signature"}`.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".json";
    link.click();
    URL.revokeObjectURL(url);
    setToast("Export started");
  };

  const importJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setData({ ...DEFAULT_SIGNATURE, ...(parsed.data || parsed || {}) });
      setAccentId(parsed.accentId || "gold");
      setTemplate(parsed.template || "classic");
      setMode(parsed.mode || "dark");
      setToast("Import complete");
    } catch (error) {
      setToast("Import failed");
    } finally {
      event.target.value = "";
    }
  };

  const resetBuilder = () => {
    setData(DEFAULT_SIGNATURE);
    setAccentId("gold");
    setTemplate("classic");
    setMode("dark");
    setToast("Reset complete");
  };

  return (
    <main className={cx("min-h-screen font-mono transition-colors duration-300", ui.page)}>
      <header className={cx("border-b px-5 py-5", ui.border)}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className={cx("text-2xl font-black uppercase tracking-[0.22em]", ui.textStrong)}>VRTKS SIGN</h1>
            <p className={cx("mt-1 text-[12px] font-bold uppercase tracking-[0.35em]", ui.muted)}>Email Signature Builder · HTML + Preview + Export</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <TopButton ui={ui} onClick={toggleMode}>{mode === "dark" ? "☀ Light" : "☾ Dark"}</TopButton>
            <TopButton ui={ui} onClick={() => setView("builder")} active={view === "builder"}>Builder</TopButton>
            <TopButton ui={ui} onClick={() => setShowSettings(true)}>Settings</TopButton>
            <TopButton ui={ui} onClick={exportJson}>Export</TopButton>
            <TopButton ui={ui} onClick={() => importRef.current?.click()}>Import</TopButton>
            <TopButton ui={ui} onClick={() => setView("html")} active={view === "html"}>HTML</TopButton>
            <TopButton ui={ui} onClick={() => setView("preview")} active={view === "preview"}>Preview</TopButton>
          </div>
        </div>
      </header>

      <input ref={importRef} type="file" accept="application/json" className="hidden" onChange={importJson} />

      <section className={cx("border-b px-5 py-5", ui.border)}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={cx("mr-1 text-[11px] font-black uppercase tracking-[0.28em]", ui.mutedSoft)}>Template</span>
          {TEMPLATES.map((item) => (
            <Pill key={item.id} mode={mode} active={template === item.id} color={item.id === "classic" ? "#f87171" : item.id === "compact" ? "#60a5fa" : "#4ade80"} onClick={() => setTemplate(item.id)}>
              {item.label}
            </Pill>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={cx("mr-1 text-[11px] font-black uppercase tracking-[0.28em]", ui.mutedSoft)}>Accent</span>
          {ACCENTS.map((item) => (
            <Pill key={item.id} mode={mode} active={accentId === item.id} color={item.hex} onClick={() => setAccentId(item.id)}>
              {item.label}
            </Pill>
          ))}
        </div>
      </section>

      <section className="px-5 py-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button type="button" onClick={copyRendered} className={cx("rounded border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition", ui.topActive)}>
            Copy Signature
          </button>
          <button type="button" onClick={copyHtml} className={cx("rounded border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition", ui.buttonGhost)}>
            Copy HTML
          </button>
          <button type="button" onClick={resetBuilder} className="rounded border border-red-400/30 bg-red-400/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-red-400 transition hover:bg-red-400/20">
            Reset
          </button>
          <span className={cx("ml-1 text-[11px] font-bold uppercase tracking-[0.24em]", ui.mutedSoft)}>All content is saved locally in your browser</span>
        </div>

        <div className={cx("mb-3 text-[11px] font-bold uppercase tracking-[0.24em]", ui.mutedSoft)}>Edit cards · Build once · Copy into Gmail, Outlook, Apple Mail or CRM</div>

        {view === "html" ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_440px]">
            <textarea value={signatureHtml} readOnly className={cx("min-h-[620px] rounded border p-4 text-[12px] leading-relaxed outline-none", ui.htmlBox)} />
            <div>
              <div className={cx("mb-2 rounded border px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.22em]", ui.panel)} style={{ color: accent.hex }}>
                Live Preview
              </div>
              <SignaturePreview html={signatureHtml} />
            </div>
          </div>
        ) : view === "preview" ? (
          <div className={cx("mx-auto max-w-4xl rounded border p-5", ui.previewShell)}>
            <div className={cx("mb-3 rounded border px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.22em]", ui.panelSoft)} style={{ color: accent.hex }}>
              Email Client Preview
            </div>
            <div className={cx("rounded border p-8", ui.emailStage)}>
              <p className="mb-5 max-w-2xl font-sans text-[14px] leading-relaxed text-zinc-700">
                Hi there,<br /><br />Please see the requested information below. My email signature will appear under this message.
              </p>
              <SignaturePreview html={signatureHtml} />
            </div>
          </div>
        ) : (
          <div className="grid min-h-[640px] gap-1 xl:grid-cols-[1.1fr_.9fr_1.25fr]">
            <section className={cx("rounded border", ui.panel)}>
              <div className={cx("border-b px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.22em] text-yellow-400", ui.border)}>Details</div>
              <div className="space-y-5 p-4">
                {FIELD_GROUPS.slice(0, 2).map((group) => (
                  <div key={group.title} className={cx("rounded border p-4", ui.panelSoft)}>
                    <div className="mb-4 flex items-center justify-between">
                      <span style={{ color: group.color }} className="text-[11px] font-black uppercase tracking-[0.22em]">{group.title}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    </div>
                    <div className="grid gap-3">
                      {group.fields.map(([key, label, placeholder]) => (
                        <Field key={key} ui={ui} label={label} value={data[key]} placeholder={placeholder} onChange={(value) => updateField(key, value)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={cx("rounded border", ui.panel)}>
              <div className={cx("border-b px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.22em] text-blue-400", ui.border)}>Assets</div>
              <div className="space-y-5 p-4">
                {FIELD_GROUPS.slice(2).map((group) => (
                  <div key={group.title} className={cx("rounded border p-4", ui.panelSoft)}>
                    <div className="mb-4 flex items-center justify-between">
                      <span style={{ color: group.color }} className="text-[11px] font-black uppercase tracking-[0.22em]">{group.title}</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                    </div>
                    <div className="grid gap-3">
                      {group.fields.map(([key, label, placeholder]) => (
                        <Field key={key} ui={ui} label={label} value={data[key]} placeholder={placeholder} onChange={(value) => updateField(key, value)} />
                      ))}
                    </div>
                  </div>
                ))}

                <div className={cx("rounded border p-4", ui.panelSoft)}>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.22em] text-red-400">Legal</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  </div>
                  <Field ui={ui} label="Disclaimer" value={data.disclaimer} placeholder="Add a legal disclaimer" onChange={(value) => updateField("disclaimer", value)} textarea />
                </div>
              </div>
            </section>

            <section className={cx("rounded border", ui.panel)}>
              <div className={cx("border-b px-3 py-2 text-center text-[11px] font-black uppercase tracking-[0.22em]", ui.border)} style={{ color: accent.hex }}>
                Signature Preview
              </div>
              <div className="p-4">
                <div className="mb-4 grid gap-2 md:grid-cols-3">
                  {TEMPLATES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTemplate(item.id)}
                      className={cx(
                        "rounded border p-3 text-left transition",
                        template === item.id ? (mode === "dark" ? "border-white/30 bg-white/[0.08]" : "border-black/20 bg-black/[0.04]") : cx(ui.panelSoft, mode === "dark" ? "hover:border-white/20" : "hover:border-black/20")
                      )}
                    >
                      <div className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: template === item.id ? accent.hex : mode === "dark" ? "#a1a1aa" : "#52525b" }}>{item.label}</div>
                      <div className={cx("mt-1 text-[11px] leading-relaxed", ui.mutedSoft)}>{item.description}</div>
                    </button>
                  ))}
                </div>

                <div className={cx("rounded border p-4", ui.panelSoft)}>
                  <div className="mb-3 flex items-center justify-between">
                    <span className={cx("text-[11px] font-black uppercase tracking-[0.22em]", ui.muted)}>Output</span>
                    <span className="rounded border px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: accent.hex, borderColor: accent.border, background: accent.soft }}>
                      {accent.name}
                    </span>
                  </div>
                  <SignaturePreview html={signatureHtml} />
                </div>
              </div>
            </section>
          </div>
        )}
      </section>

      {showSettings && (
        <div className={cx("fixed inset-0 z-50 grid place-items-center p-5 backdrop-blur-sm", ui.modalOverlay)} onClick={() => setShowSettings(false)}>
          <div className={cx("w-full max-w-xl rounded border p-5 shadow-2xl", ui.panel)} onClick={(event) => event.stopPropagation()}>
            <div className={cx("mb-4 flex items-center justify-between border-b pb-4", ui.border)}>
              <div>
                <h2 className={cx("text-lg font-black uppercase tracking-[0.22em]", ui.textStrong)}>Settings</h2>
                <p className={cx("mt-1 text-[11px] font-bold uppercase tracking-[0.24em]", ui.mutedSoft)}>Signature build controls</p>
              </div>
              <button type="button" onClick={() => setShowSettings(false)} className={cx("rounded border px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em]", ui.buttonGhost)}>
                Close
              </button>
            </div>
            <div className="grid gap-4">
              <div className={cx("rounded border p-4", ui.panelSoft)}>
                <div className={cx("mb-3 text-[11px] font-black uppercase tracking-[0.22em]", ui.muted)}>Appearance</div>
                <button type="button" onClick={toggleMode} className={cx("rounded border px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition", ui.topActive)}>
                  {ui.icon} {mode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </button>
              </div>
              <div className={cx("rounded border p-4", ui.panelSoft)}>
                <div className={cx("mb-3 text-[11px] font-black uppercase tracking-[0.22em]", ui.muted)}>Usage note</div>
                <p className={cx("text-[12px] leading-relaxed", ui.text)}>
                  Use hosted image URLs for logos and profile images. Most email clients block local images, so upload assets to your website media library first and paste the full image URL here.
                </p>
              </div>
              <div className={cx("rounded border p-4", ui.panelSoft)}>
                <div className={cx("mb-3 text-[11px] font-black uppercase tracking-[0.22em]", ui.muted)}>Install flow</div>
                <ol className={cx("list-decimal space-y-2 pl-4 text-[12px] leading-relaxed", ui.text)}>
                  <li>Fill in the details and brand fields.</li>
                  <li>Click Copy Signature for Gmail or Apple Mail.</li>
                  <li>Click Copy HTML for platforms that accept raw HTML.</li>
                  <li>Export a JSON backup before clearing browser data.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={cx("fixed bottom-5 right-5 rounded border px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] shadow-2xl", ui.toast)}>
          {toast}
        </div>
      )}
    </main>
  );
}
