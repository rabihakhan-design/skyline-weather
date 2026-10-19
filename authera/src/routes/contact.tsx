import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Skyline Weather" },
      { name: "description", content: "Send feedback or questions to the Skyline Weather team." },
      { property: "og:title", content: "Contact Skyline Weather" },
      { property: "og:description", content: "We'd love to hear your feedback." },
    ],
  }),
  component: Contact,
});

type Errors = Partial<Record<"name" | "email" | "message", string>>;

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", topic: "Feedback", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e: Errors = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Please enter a valid email.";
    if (form.message.trim().length < 10) e.message = "Message should be at least 10 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  if (sent)
    return (
      <div className="glass animate-rise mx-auto max-w-lg rounded-3xl p-10 text-center">
        <p className="text-5xl">✅</p>
        <h1 className="mt-3 font-display text-2xl font-bold">Thanks, {form.name}!</h1>
        <p className="mt-2 text-muted-foreground">Your message has been received.</p>
        <button className="btn-sun mt-6 rounded-full px-6 py-3 font-semibold" onClick={() => { setSent(false); setForm({ name: "", email: "", topic: "Feedback", message: "" }); }}>
          Send another
        </button>
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-4xl font-bold">Get in <span className="text-sun">touch</span></h1>
      <form
        noValidate
        className="glass space-y-4 rounded-3xl p-6"
        onSubmit={(e) => { e.preventDefault(); if (validate()) setSent(true); }}
      >
        <Field label="Name" error={errors.name}>
          <input className="field w-full" value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" className="field w-full" value={form.email} maxLength={120} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </Field>
        <Field label="Topic">
          <div className="flex flex-wrap gap-2">
            {["Feedback", "Bug report", "Feature idea", "Other"].map((t) => (
              <button key={t} type="button" onClick={() => setForm({ ...form, topic: t })} className={`chip rounded-full px-4 py-2 text-sm ${form.topic === t ? "is-on" : ""}`}>
                {t}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Message" error={errors.message}>
          <textarea rows={5} className="field w-full" value={form.message} maxLength={1000} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          <p className="mt-1 text-right text-xs text-muted-foreground">{form.message.length}/1000</p>
        </Field>
        <button type="submit" className="btn-sun w-full rounded-full px-6 py-3 font-semibold">Send message</button>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-destructive">{error}</span>}
    </label>
  );
}
