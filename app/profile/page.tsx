"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [name, setName] = useState("Vedant Patil");
  const [email, setEmail] = useState("vedant@wealthzy.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [dob, setDob] = useState("2002-05-14");

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("wealthzy_userName");
      const storedEmail = localStorage.getItem("wealthzy_userEmail");
      const storedPhone = localStorage.getItem("wealthzy_user_phone");
      const storedDob = localStorage.getItem("wealthzy_user_dob");
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedPhone) setPhone(storedPhone);
      if (storedDob) setDob(storedDob);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto font-mono">
        {/* Header */}
        <div className="pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
            Investor Profile
          </h1>
          <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
            Identity verification details, risk parameters, and financial objectives.
          </p>
        </div>

        {/* Identity Overview Card */}
        <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded border flex items-center justify-center text-xl font-bold bg-[#181615] border-[#2E2925] text-[#FAF7F2] dark:bg-[#181615] dark:border-[#2E2925] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]">
            VP
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                {name}
              </h2>
              <Badge variant="positive">KYC VERIFIED</Badge>
            </div>
            <p className="text-xs text-[#A9A39B]">{email}</p>
          </div>
        </div>

        {/* Personal Details & Financial Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Personal Information */}
          <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
            <span className="text-xs uppercase tracking-wider font-bold text-[#A9A39B] block">
              Personal Information
            </span>

            <div className="space-y-3">
              <div>
                <span className="text-[#A9A39B] block text-[10px]">Full Name</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{name}</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px]">Email Address</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{email}</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px]">Mobile Number</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{phone}</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px]">Date of Birth</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">{dob}</span>
              </div>
            </div>
          </div>

          {/* Financial Profile */}
          <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[#A9A39B] block">
                Financial Profile
              </span>
              <Link href="/risk-profile" className="text-[11px] text-[#3A7BD5] hover:underline">
                Edit &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[#A9A39B] block text-[10px]">Risk Profile Category</span>
                <span className="font-bold text-[#4E9F76]">Moderate Growth (58/100)</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px]">Investment Horizon</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Long Term (7+ Years)</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px]">Primary Active Goals</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Retirement, Emergency Reserve</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px]">Target Asset Allocation</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">65% Equity &bull; 20% Debt &bull; 10% Gold</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
