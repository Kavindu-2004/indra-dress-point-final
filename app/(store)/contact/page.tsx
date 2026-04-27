"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 1800);
    (e.currentTarget as HTMLFormElement).reset();
  }

  return (
    <div className="w-full">
      {/* ===== HERO STRIP (minimal) ===== */}
      <section className="border-b bg-white">
        <div className="max-w-[1280px] mx-auto px-6 pt-12 pb-10 anim-fade-up">
          <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-gray-500">
                Indra Dress Point
              </p>
              <h1 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
                Contact Us
              </h1>
              <p className="mt-4 text-gray-600 max-w-2xl">
                Questions about sizes, availability, delivery, or orders? Send us a message.
              </p>
            </div>

            <div className="rounded-2xl border bg-gray-50 px-5 py-4 w-full md:w-[360px] anim-fade-up anim-delay-1">
              <div className="text-sm font-semibold">Quick Support</div>
              <div className="mt-2 text-sm text-gray-600">
                Fastest reply via phone / WhatsApp during working hours.
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Mon–Sun 9:00 AM – 8:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORM + SUPPORT ===== */}
      <section className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT: FORM */}
          <div className="rounded-2xl border bg-white p-8 hover-card anim-fade-up anim-delay-1">
            <h2 className="text-2xl font-semibold">Get In Touch</h2>
            <p className="text-gray-600 text-sm mt-2">
              Fill the form and we will contact you back.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
                  Name
                </label>
                <input
                  required
                  name="name"
                  placeholder="Your name"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
                  Email *
                </label>
                <input
                  required
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
                  Message
                </label>
                <textarea
                  required
                  name="message"
                  placeholder="Type your message..."
                  rows={5}
                  className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <button
                type="submit"
                className="group w-full rounded-full bg-black text-white py-3 text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 group-hover:translate-x-[2px] transition" />
                {sent ? "SENT ✅" : "SEND MESSAGE"}
              </button>

              <p className="text-xs text-gray-500">
                * UI only for now (next: WhatsApp / Email / DB).
              </p>
            </form>
          </div>

          {/* RIGHT: SUPPORT + MAP */}
          <div className="rounded-2xl border bg-white p-8 hover-card anim-fade-up anim-delay-2">
            <h2 className="text-2xl font-semibold">Support</h2>
            <p className="text-gray-600 text-sm mt-2">
              You can reach us using the details below.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold">Phone</div>
                  <div className="text-gray-600 text-sm">+94 76 499 1200</div>
                </div>
              </div>

              <div className="border-t" />

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold">Email</div>
                  <div className="text-gray-600 text-sm">indradresspoint@gmail.com</div>
                </div>
              </div>

              <div className="border-t" />

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold">Address</div>
                  <div className="text-gray-600 text-sm">
                    Indra Dress Point, In Front Of The BOC, Maho, 60600, Sri Lanka
                  </div>
                </div>
              </div>

              <div className="border-t" />

              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 mt-0.5" />
                <div>
                  <div className="font-semibold">Working Hours</div>
                  <div className="text-gray-600 text-sm">Mon–Sun: 9:00 AM – 8:00 PM</div>
                </div>
              </div>
            </div>

            {/* MAP (zoom on hover) */}
            <div className="mt-8 rounded-2xl border zoom-wrap">
              <div className="zoom-media">
                <iframe
                  title="Indra Dress Point Map"
                  className="w-full h-[280px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps?q=Indra%20Dress%20Point%20In%20Front%20Of%20The%20BOC%20Maho%2060600%20Sri%20Lanka&output=embed"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STORE LOCATION CARD (premium) ===== */}
      <section className="w-full border-t bg-gray-50">
        <div className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="text-center anim-fade-up anim-delay-1">
            <h2 className="text-3xl font-bold">Our Store Location</h2>
            <p className="text-gray-600 mt-3">
              One branch — visit us anytime during working hours.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
            <div className="rounded-2xl border bg-white p-7 hover-card anim-fade-up anim-delay-2">
              <div className="text-lg font-semibold">Indra Dress Point — Maho</div>

              <div className="mt-5 space-y-3 text-sm text-gray-700">
                <div className="flex gap-3">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>In Front Of The BOC, Maho, 60600, Sri Lanka</span>
                </div>
                <div className="flex gap-3">
                  <Phone className="w-4 h-4 mt-0.5" />
                  <span>+94 76 499 1200</span>
                </div>
                <div className="flex gap-3">
                  <Mail className="w-4 h-4 mt-0.5" />
                  <span>indradresspoint@gmail.com</span>
                </div>
                <div className="flex gap-3">
                  <Clock className="w-4 h-4 mt-0.5" />
                  <span>Mon–Sun: 9:00 AM – 8:00 PM</span>
                </div>
              </div>

              <a
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-black text-white py-3 text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition"
                target="_blank"
                rel="noreferrer"
                href="https://www.google.com/maps?q=Indra%20Dress%20Point%20In%20Front%20Of%20The%20BOC%20Maho%2060600%20Sri%20Lanka"
              >
                Get Direction
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}