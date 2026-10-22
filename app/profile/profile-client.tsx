"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { User, Phone, Calendar, Mail, Edit3, CheckCircle2, AlertTriangle } from "lucide-react";

export interface ProfileData {
  id?: number | string;
  userId?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  phoneNo: string;
  dob: string;
  hasPortfolio?: boolean | null;
}

interface ProfileClientProps {
  initialProfile: ProfileData;
}

export function ProfileClient({ initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState(initialProfile.fullName);
  const [editPhone, setEditPhone] = useState(initialProfile.phoneNo);
  const [editDob, setEditDob] = useState(initialProfile.dob);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const isProfileComplete = Boolean(
    profile.fullName.trim() &&
    profile.phoneNo.trim() &&
    profile.dob.trim()
  );

  const handleOpenEdit = () => {
    setEditName(profile.fullName);
    setEditPhone(profile.phoneNo);
    setEditDob(profile.dob);
    setSaveError(null);
    setSaveSuccess(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          phone_no: editPhone.trim(),
          dob: editDob.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      const updatedName = data.profile?.name || editName.trim();
      const updatedPhone = data.profile?.phone_no || editPhone.trim();
      const updatedDob = data.profile?.dob || editDob.trim();

      setProfile((prev) => ({
        ...prev,
        fullName: updatedName,
        phoneNo: updatedPhone,
        dob: updatedDob,
      }));

      // Sync localStorage for legacy/offline usage
      try {
        localStorage.setItem("wealthzy_userName", updatedName);
        if (updatedPhone) localStorage.setItem("wealthzy_user_phone", updatedPhone);
        if (updatedDob) localStorage.setItem("wealthzy_user_dob", updatedDob);
      } catch {
        // Ignore localStorage errors
      }

      setSaveSuccess("Profile saved successfully to database!");
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(null);
      }, 1000);
    } catch (err: any) {
      setSaveError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-4xl mx-auto font-mono">
        {/* Header */}
        <div className="pb-2 border-b border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight font-sans">
              Investor Profile
            </h1>
            <p className="text-xs text-[#A9A39B] dark:text-[#A9A39B] light:text-[#6F6A64]">
              Identity verification details, risk parameters, and financial objectives.
            </p>
          </div>
          <button
            onClick={handleOpenEdit}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded border text-xs font-mono font-medium transition-colors cursor-pointer bg-[#151312] border-[#2E2925] text-[#FAF7F2] hover:bg-[#201C19] dark:bg-[#151312] dark:border-[#2E2925] dark:text-[#FAF7F2] light:bg-[#FFFFFF] light:border-[#DDD5C9] light:text-[#171514]"
          >
            <Edit3 size={13} />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Identity Overview Card */}
        <div className="p-6 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] flex flex-col sm:flex-row items-center gap-5">
          <div className="w-16 h-16 rounded border flex items-center justify-center text-xl font-bold bg-[#181615] border-[#2E2925] text-[#FAF7F2] dark:bg-[#181615] dark:border-[#2E2925] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]">
            <User size={24} color="#909090" strokeWidth={2} />
          </div>
          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-lg font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                {profile.fullName || "Investor"}
              </h2>
              {isProfileComplete ? (
                <Badge variant="positive">KYC VERIFIED</Badge>
              ) : (
                <Badge variant="warning">PROFILE INCOMPLETE</Badge>
              )}
            </div>
            <p className="text-xs text-[#A9A39B]">{profile.email}</p>
          </div>

          <button
            onClick={handleOpenEdit}
            className="px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer bg-[#3A7BD5] text-white hover:bg-[#2F6BC0]"
          >
            {isProfileComplete ? "Update Details" : "Complete KYC"}
          </button>
        </div>

        {/* Warning banner if incomplete */}
        {!isProfileComplete && (
          <div className="p-4 rounded border border-[#D9822B]/30 bg-[#D9822B]/10 text-xs text-[#D9822B] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>
                Your investor profile is missing required information (Mobile Number or Date of Birth). Please complete these for full regulatory readiness.
              </span>
            </div>
            <button
              onClick={handleOpenEdit}
              className="px-2.5 py-1 rounded bg-[#D9822B] text-black font-semibold text-[11px] shrink-0"
            >
              Add Now
            </button>
          </div>
        )}

        {/* Personal Details & Financial Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Personal Information */}
          <div className="p-5 rounded border bg-[#151312] border-[#24201D] dark:bg-[#151312] dark:border-[#24201D] light:bg-[#FFFFFF] light:border-[#E8E2D8] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-[#A9A39B] block">
                Personal Information (Database)
              </span>
              <button
                onClick={handleOpenEdit}
                className="text-[11px] text-[#3A7BD5] hover:underline"
              >
                Edit &rarr;
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[#A9A39B] block text-[10px] uppercase font-semibold">Full Name</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  {profile.fullName || <span className="text-[#D9822B] font-normal italic">Not provided</span>}
                </span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px] uppercase font-semibold">Email Address</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                  {profile.email}
                </span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px] uppercase font-semibold">Mobile Number</span>
                {profile.phoneNo ? (
                  <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                    {profile.phoneNo}
                  </span>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[#D9822B] italic">Not provided</span>
                    <button
                      onClick={handleOpenEdit}
                      className="text-[10px] text-[#3A7BD5] hover:underline font-semibold"
                    >
                      + Add Phone
                    </button>
                  </div>
                )}
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px] uppercase font-semibold">Date of Birth</span>
                {profile.dob ? (
                  <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">
                    {profile.dob}
                  </span>
                ) : (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[#D9822B] italic">Not provided</span>
                    <button
                      onClick={handleOpenEdit}
                      className="text-[10px] text-[#3A7BD5] hover:underline font-semibold"
                    >
                      + Add Date of Birth
                    </button>
                  </div>
                )}
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
                Retake Quiz &rarr;
              </Link>
            </div>

            <div className="space-y-3.5">
              <div>
                <span className="text-[#A9A39B] block text-[10px] uppercase font-semibold">Risk Profile Category</span>
                <span className="font-bold text-[#4E9F76]">Moderate Growth (58/100)</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px] uppercase font-semibold">Investment Horizon</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Long Term (7+ Years)</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px] uppercase font-semibold">Primary Active Goals</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">Retirement, Emergency Reserve</span>
              </div>
              <div>
                <span className="text-[#A9A39B] block text-[10px] uppercase font-semibold">Target Asset Allocation</span>
                <span className="font-bold text-[#FAF7F2] dark:text-[#FAF7F2] light:text-[#171514]">65% Equity &bull; 20% Debt &bull; 10% Gold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => !isSaving && setIsEditModalOpen(false)}
          title="Update Investor Profile"
          subtitle="Your personal information is stored securely in our database to personalize portfolio recommendations."
          maxWidth="md"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-mono">
            {saveError && (
              <div className="p-3 rounded border border-[#D9534F]/30 bg-[#D9534F]/10 text-[#D9534F]">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 rounded border border-[#4E9F76]/30 bg-[#4E9F76]/10 text-[#4E9F76] flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>{saveSuccess}</span>
              </div>
            )}

            {/* Email (Disabled) */}
            <div>
              <label className="block text-[#A9A39B] mb-1 font-semibold">Email Address (Account ID)</label>
              <div className="relative">
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full h-10 px-3 pl-8 rounded border bg-[#181615]/50 border-[#2A2420] text-[#A9A39B] cursor-not-allowed outline-none"
                />
                <Mail size={14} className="absolute left-2.5 top-3 text-[#6F6A64]" />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-[#A9A39B] mb-1 font-semibold">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Vedant Singh"
                  className="w-full h-10 px-3 pl-8 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] focus:border-[#3A7BD5] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
                />
                <User size={14} className="absolute left-2.5 top-3 text-[#A9A39B]" />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-[#A9A39B] mb-1 font-semibold">Mobile Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full h-10 px-3 pl-8 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] focus:border-[#3A7BD5] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
                />
                <Phone size={14} className="absolute left-2.5 top-3 text-[#A9A39B]" />
              </div>
              <span className="text-[10px] text-[#A9A39B] mt-1 block">
                Required for real-time portfolio threshold SMS alerts.
              </span>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[#A9A39B] mb-1 font-semibold">Date of Birth *</label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={editDob}
                  onChange={(e) => setEditDob(e.target.value)}
                  className="w-full h-10 px-3 pl-8 rounded border bg-[#181615] border-[#2A2420] text-[#FAF7F2] focus:border-[#3A7BD5] outline-none dark:bg-[#181615] dark:border-[#2A2420] dark:text-[#FAF7F2] light:bg-[#FAF7F2] light:border-[#DDD5C9] light:text-[#171514]"
                />
                <Calendar size={14} className="absolute left-2.5 top-3 text-[#A9A39B]" />
              </div>
              <span className="text-[10px] text-[#A9A39B] mt-1 block">
                Used to calibrate investment horizon and age-appropriate asset allocation.
              </span>
            </div>

            {/* Action buttons */}
            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#24201D] dark:border-[#24201D] light:border-[#E8E2D8]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded border text-xs font-mono transition-colors bg-transparent border-[#2A2420] text-[#A9A39B] hover:text-[#FAF7F2]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded text-xs font-mono font-semibold transition-colors bg-[#3A7BD5] text-white hover:bg-[#2F6BC0] disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
