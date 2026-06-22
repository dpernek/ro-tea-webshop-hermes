"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Mail, Phone, MapPin, Clock, CheckCircle, Building2 } from "lucide-react";
import { site } from "@/lib/data";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactItems = [
    { icon: Phone, label: "Telefon", value: site.contact.phoneDisplay, href: `tel:${site.contact.phoneDisplay.replace(/\s/g, "")}` },
    { icon: Mail, label: "E-mail", value: site.contact.email, href: `mailto:${site.contact.email}` },
    { icon: MapPin, label: "Adresa", value: "Badalićeva 26b, 10000 Zagreb" },
    { icon: Clock, label: "Radno vrijeme", value: "Pon-Pet: 08:00 - 16:00\nSub: 08:00 - 12:00" },
  ];

  return (
    <div className="bg-slate-950">
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <AnimatedSection>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Kontakt</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-400">
              Vaša su pitanja dobrodošla. Za sve upite i informacije slobodno nas kontaktirajte.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Form */}
            <AnimatedSection delay={0.1} className="lg:col-span-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
                {submitted ? (
                  <div className="flex flex-col items-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0055a8]/20">
                      <CheckCircle className="h-8 w-8 text-[#0055a8]" />
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-white">Poruka poslana</h2>
                    <p className="mt-2 text-slate-400">Hvala vam na upitu. Odgovorit ćemo vam u najkraćem mogućem roku.</p>
                    <Button variant="outline" className="mt-6 border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white" onClick={() => setSubmitted(false)}>
                      Pošalji novu poruku
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-300">Ime i prezime</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Vaše ime"
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none" />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-300">E-mail</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="vas@email.hr"
                          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Predmet</label>
                      <input type="text" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Na što se odnosi upit"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-300">Poruka</label>
                      <textarea required rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Napišite nam detalje upita..."
                        className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#0055a8] focus:ring-2 focus:ring-[#0055a8]/20 focus:outline-none resize-none" />
                    </div>
                    <Button type="submit" size="lg" className="w-full sm:w-auto">Pošalji upit</Button>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* Contact info */}
            <AnimatedSection delay={0.2}>
              <div className="space-y-4">
                {contactItems.map((item) => (
                  <div key={item.label} className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8]" />
                    <div>
                      <h3 className="font-semibold text-white">{item.label}</h3>
                      {item.href ? (
                        <a href={item.href} className="mt-1 block text-sm text-slate-400 hover:text-[#0055a8] transition-colors whitespace-pre-line">
                          {item.value}
                        </a>
                      ) : (
                        <p className="mt-1 text-sm text-slate-400 whitespace-pre-line">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                  <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-[#0055a8]" />
                  <div>
                    <h3 className="font-semibold text-white">RO-TEA d.o.o.</h3>
                    <div className="mt-1 space-y-0.5 text-sm text-slate-400">
                      <p>OIB: {site.contact.oib}</p>
                      {site.contact.iban && <p>IBAN: {site.contact.iban}</p>}
                      {site.contact.pdvId && <p>PDV ID: {site.contact.pdvId}</p>}
                      {site.contact.sudUpisa && <p>{site.contact.sudUpisa}</p>}
                      {site.contact.temeljniKapital && <p>{site.contact.temeljniKapital}</p>}
                      {site.contact.uprava && <p>Uprava: {site.contact.uprava}</p>}
                      {site.contact.osnivac && <p>Osnivač: {site.contact.osnivac}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
