"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Mail, Phone, MapPin, Clock, CheckCircle, Building2 } from "lucide-react";
import { site } from "@/lib/data";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Došlo je do greške.");
      }

      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Došlo je do greške.");
    } finally {
      setSending(false);
    }
  };

  const contactItems = [
    { icon: Phone, label: "Telefon", value: site.contact.phoneDisplay, href: `tel:${site.contact.phoneDisplay.replace(/\s/g, "")}` },
    { icon: Mail, label: "E-mail", value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: MapPin, label: "Adresa", value: "Badalićeva 26b, 10000 Zagreb" },
    { icon: Clock, label: "Radno vrijeme", value: "Pon-Pet: 08:00 – 16:00\nSub: 08:00 – 12:00" },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <AnimatedSection>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Kontakt</h1>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600">
              Vaša su pitanja dobrodošla. Za sve upite i informacije slobodno nas kontaktirajte.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <AnimatedSection>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 text-xl font-semibold text-slate-900">Pošaljite nam poruku</h2>
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <CheckCircle className="mb-3 h-12 w-12 text-green-500" />
                    <p className="text-lg font-medium text-slate-900">Hvala na upitu!</p>
                    <p className="mt-1 text-sm text-slate-500">Odgovorit ćemo u najkraćem roku.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                        {error}
                      </div>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Ime i prezime</label>
                        <input
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none"
                          placeholder="Vaše ime"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
                        <input
                          type="email"
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none"
                          placeholder="vas@email.hr"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Predmet</label>
                      <input
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none"
                        placeholder="Na što se odnosi upit"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Poruka</label>
                      <textarea
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none"
                        rows={5}
                        placeholder="Napišite nam detalje upita..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" size="lg" isLoading={sending}>Pošalji upit</Button>
                  </form>
                )}
              </div>
            </AnimatedSection>
          </div>

          {/* Info cards */}
          <div className="lg:col-span-2">
            <AnimatedSection delay={0.1}>
              <div className="space-y-4">
                {/* B2B */}
                <div className="rounded-xl border border-[#0055a8]/20 bg-[#0055a8]/5 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#0055a8]" />
                    <h3 className="font-semibold text-[#0055a8]">Poslovni upiti (B2B)</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    Za veleprodajne upite i poslovnu suradnju kontaktirajte nas na{" "}
                    <span className="font-medium text-[#0055a8]">info@ro-tea.hr</span>{" "}
                    ili <span className="font-medium text-[#0055a8]">+385 1 3820 113</span>.
                  </p>
                </div>

                {/* Contact items */}
                {contactItems.map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <item.icon className="h-5 w-5 text-[#0055a8]" />
                      <h3 className="font-semibold text-slate-900">{item.label}</h3>
                    </div>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-[#0055a8] hover:underline">
                        {item.value}
                      </a>
                    ) : (
                      <p className="whitespace-pre-line text-sm text-slate-600">{item.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
