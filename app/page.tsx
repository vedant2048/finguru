"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import TrustStrip from "@/components/trust-strip";
import HowItWorks from "@/components/how-it-works";
import Features from "@/components/features";
import DashboardSplit from "@/components/dashboard-split";
import MiniVisuals from "@/components/mini-visuals";
import WhyWealthzy from "@/components/why-wealthzy";
import Testimonials from "@/components/testimonials";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";
import DemoModal from "@/components/demo-modal";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const [demoOpen, setDemoOpen] = useState(false);

  const handleGetStarted = () => {
    router.push("/login");
  };

  const handleOpenDemo = () => {
    setDemoOpen(true);
  };

  const handleCloseDemo = () => {
    setDemoOpen(false);
  };

  return (
    <main className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] relative">
      {/* Sticky Navigation */}
      <Navbar
        onOpenDemo={handleOpenDemo}
        onGetStarted={handleGetStarted}
      />

      {/* Hero Section */}
      <Hero
        onOpenDemo={handleOpenDemo}
        onGetStarted={handleGetStarted}
      />

      {/* Trust & Value Strip */}
      <TrustStrip />

      {/* How Wealthzy Works (3 Steps) */}
      <HowItWorks />

      {/* 6 Feature Grid */}
      <Features />

      {/* Feature Interactive Split Dashboard */}
      <DashboardSplit
        onExplore={handleGetStarted}
      />

      {/* Mini Data Visualization Floating Cards */}
      <MiniVisuals />

      {/* Why Wealthzy (3 Pillars: Understand, Plan, Grow) */}
      <WhyWealthzy />

      {/* Real People Testimonials */}
      <Testimonials />

      {/* High-Impact Final CTA */}
      <CTASection
        onGetStarted={handleGetStarted}
      />

      {/* Full Footer */}
      <Footer />

      {/* Interactive Demo Walkthrough Modal */}
      <DemoModal
        isOpen={demoOpen}
        onClose={handleCloseDemo}
      />
    </main>
  );
}