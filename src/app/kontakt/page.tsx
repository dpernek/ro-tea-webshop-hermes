"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Mail, Phone, MapPin, Clock, CheckCircle } from "lucide-react";
import { site } from "@/lib/data";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const phoneHref = `tel:${site.contact.phoneDisplay.replace(/\s/g, "")}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <SectionTitle
            title="Kontakt"
            subtitle="Imate pitanje o proizvodima, dostavi ili velikoj narudžbi? Javite nam se."
          />
        </AnimatedSection>

        <div className="grid gap-12 lg:grid-cols-3">
          <AnimatedSection delay={0.1} className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">
                    Poruka poslana
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Hvala vam na upitu. Odgovorit ćemo vam u najkraćem mogućem
                    roku.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setSubmitted(false)}
                  >
                    Pošalji novu poruku
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input
                      label="Ime i prezime"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Vaše ime"
                    />
                    <Input
                      label="E-mail"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="vas@email.hr"
                    />
                  </div>
                  <Input
                    label="Predmet"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Na što se odnosi upit"
                  />
                  <Textarea
                    label="Poruka"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Napišite nam detalje upita..."
                  />
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    Pošalji upit
                  </Button>
                </form>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="space-y-6">
              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <Phone className="text-brand mt-1 h-5 w-5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Telefon</h3>
                  <a
                    href={phoneHref}
                    className="hover:text-brand mt-1 block text-slate-600"
                  >
                    {site.contact.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <Mail className="text-brand mt-1 h-5 w-5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">E-mail</h3>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="hover:text-brand mt-1 block text-slate-600"
                  >
                    {site.contact.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <MapPin className="text-brand mt-1 h-5 w-5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">Adresa</h3>
                  <p className="mt-1 text-slate-600">{site.contact.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6">
                <Clock className="text-brand mt-1 h-5 w-5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-slate-900">
                    Radno vrijeme
                  </h3>
                  <p className="mt-1 text-slate-600">
                    Pon-Pet: 08:00 - 16:00
                    <br />
                    Sub: 08:00 - 12:00
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
