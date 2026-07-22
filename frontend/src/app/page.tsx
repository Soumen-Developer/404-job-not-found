"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  Menu, 
  X, 
  Building2, 
  Briefcase, 
  Clock, 
  Send,
  Sparkles,
  Users2,
  BookmarkCheck,
  TrendingUp,
  MapPinIcon,
  GraduationCap
} from "lucide-react";

function getCurrencySymbol(location?: string | null): string {
  if (!location) return "₹";
  const loc = location.toLowerCase();
  if (loc.includes("india") || loc.includes("in") || loc.includes("mumbai") || loc.includes("bangalore") || loc.includes("pune") || loc.includes("delhi")) {
    return "₹";
  }
  if (loc.includes("uk") || loc.includes("gb") || loc.includes("london")) {
    return "£";
  }
  if (loc.includes("europe") || loc.includes("eu") || loc.includes("germany")) {
    return "€";
  }
  return "$";
}

function formatSalary(salary?: string | number | null, location?: string | null): string {
  if (!salary) return "Competitive";
  const symbol = getCurrencySymbol(location);
  const salaryStr = String(salary);
  const cleanedSalary = salaryStr.replace(/^[₹$£€\s]+/, "");
  return `${symbol}${cleanedSalary}`;
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");

  const jobCategories = [
    { name: "Company", count: "120+ active", icon: Building2, color: "text-[#1976D2] bg-blue-50" },
    { name: "Full-Time", count: "450+ jobs", icon: Briefcase, color: "text-[#2ECC71] bg-emerald-50" },
    { name: "Part-Time", count: "180+ jobs", icon: Clock, color: "text-[#FFCA28] bg-amber-50" },
    { name: "Freelance", count: "90+ jobs", icon: Send, color: "text-[#8b5cf6] bg-purple-50" },
  ];

  const featuredJobs = [
    {
      id: "1",
      title: "Graphics Designer",
      company: "Slack",
      logoBg: "bg-[#4A154B]",
      logoLetter: "S",
      salary: "₹15,000 - ₹20,000/Month",
      location: "Mumbai, India",
      type: "Full Time",
      typeBg: "bg-blue-50 text-[#1976D2]",
    },
    {
      id: "2",
      title: "Product Sales Specialist",
      company: "Amazon",
      logoBg: "bg-[#FF9900]",
      logoLetter: "A",
      salary: "$4,000 - $5,000/Month",
      location: "Seattle, USA",
      type: "Full Time",
      typeBg: "bg-blue-50 text-[#1976D2]",
    },
    {
      id: "3",
      title: "Finance Manager",
      company: "Intel",
      logoBg: "bg-[#0071C5]",
      logoLetter: "I",
      salary: "₹1,20,000 - ₹1,50,000/Month",
      location: "Bangalore, India",
      type: "Full Time",
      typeBg: "bg-blue-50 text-[#1976D2]",
    },
    {
      id: "4",
      title: "General Accountant",
      company: "Bemis",
      logoBg: "bg-[#1E3A8A]",
      logoLetter: "B",
      salary: "£450 - £600/Week",
      location: "London, UK",
      type: "Full Time",
      typeBg: "bg-blue-50 text-[#1976D2]",
    },
  ];

  return (
    <div 
      className="min-h-screen bg-[#F5F8F8] text-[#364153] font-sans antialiased relative selection:bg-[#FFCA28] selection:text-zinc-950"
      style={{ 
        backgroundImage: 'radial-gradient(#E2E8F0 1.2px, transparent 1.2px)', 
        backgroundSize: '24px 24px' 
      }}
    >
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-[#F5F8F8]/90 backdrop-blur-md border-b border-[#E5E5E5]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 select-none group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1976D2] to-[#0098B6] flex items-center justify-center text-white font-black text-xl shadow-md transition-transform group-hover:rotate-6">
                CY
              </div>
              <span className="text-xl font-bold tracking-tight text-[#364153]">CY-Jobs</span>
            </div>

            {/* Redirection link back to CareerYatraa */}
            <a 
              href="https://careeryatraa.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold rounded-full transition-all border border-amber-200/50 shadow-sm hover:shadow"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              CareerYatraa Education
            </a>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold text-[#1976D2] hover:text-[#0c67c1] transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#1976D2] after:rounded-full">
              Home
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-[#364153]/80 hover:text-[#364153] transition-colors">
              Find Jobs
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-[#364153]/80 hover:text-[#364153] transition-colors">
              Job Alerts
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-[#364153]/80 hover:text-[#364153] transition-colors">
              Find Candidates
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold text-[#364153]/80 hover:text-[#364153] transition-colors">
              Career Advice
            </Link>
          </nav>

          {/* Nav Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-semibold text-[#364153]/80 hover:text-[#364153] px-4 py-2 transition-colors">
              Login
            </Link>
            <Link 
              href="/dashboard" 
              className="text-sm font-bold text-white bg-[#1976D2] hover:bg-[#0c67c1] px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
            >
              Register Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#364153] hover:bg-zinc-200/50 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E5E5E5]/50 bg-[#F5F8F8] px-4 pt-4 pb-6 space-y-3 shadow-inner">
            <Link href="/" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-[#1976D2] bg-blue-50">
              Home
            </Link>
            <Link href="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-[#364153]/80 hover:bg-zinc-100">
              Find Jobs
            </Link>
            <Link href="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-[#364153]/80 hover:bg-zinc-100">
              Job Alerts
            </Link>
            <Link href="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-[#364153]/80 hover:bg-zinc-100">
              Find Candidates
            </Link>
            <Link href="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-[#364153]/80 hover:bg-zinc-100">
              Career Advice
            </Link>
            <div className="pt-4 border-t border-zinc-200 flex flex-col gap-2">
              <a 
                href="https://careeryatraa.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200/50 flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="w-4 h-4" />
                CareerYatraa Education
              </a>
              <Link href="/dashboard" className="w-full text-center py-2.5 rounded-lg text-sm font-semibold text-[#364153]/80 hover:bg-zinc-100">
                Login
              </Link>
              <Link href="/dashboard" className="w-full text-center py-3 bg-[#1976D2] text-white rounded-full text-sm font-bold shadow-md">
                Register Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#1976D2]/5 rounded-full border border-[#1976D2]/10 backdrop-blur-sm select-none">
              <Sparkles className="w-3.5 h-3.5 text-[#1976D2] animate-pulse" />
              <span className="text-[10px] font-black tracking-widest uppercase text-[#1976D2]">AI-Powered Career Intelligence</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-[4.75rem] font-black tracking-tight text-[#364153] leading-[1.05]">
              Find a Job With <br />
              <span className="relative inline-block text-[#1976D2]">
                Your Interests
                <span className="absolute bottom-2 left-0 w-full h-[8px] bg-[#FFCA28]/35 -z-10 rounded-full" />
              </span> and <br />
              Abilities
            </h1>
            <p className="text-lg text-[#6A7282] max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Find jobs that match your interests with us. CY-Jobs provides an intelligent, AI-powered space to find your perfect job and grow your career.
            </p>

            {/* CTA Button */}
            <div className="inline-block">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 bg-[#1976D2] hover:bg-[#0c67c1] text-white text-base font-bold px-8 py-4.5 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Inline Search Bar */}
            <div className="bg-white rounded-3xl p-3 shadow-xl border border-[#E5E5E5]/60 flex flex-col md:flex-row items-center gap-4 max-w-2xl mx-auto lg:mx-0 relative z-10">
              <div className="flex items-center gap-2.5 px-3 w-full md:w-1/2 border-b md:border-b-0 md:border-r border-[#E5E5E5] pb-2 md:pb-0">
                <Briefcase className="w-5 h-5 text-[#6A7282]" />
                <input 
                  type="text" 
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  placeholder="Job title" 
                  className="w-full bg-transparent border-none outline-none text-[#364153] placeholder-zinc-400 font-semibold"
                />
              </div>
              <div className="flex items-center gap-2.5 px-3 w-full md:w-1/2">
                <MapPin className="w-5 h-5 text-[#6A7282]" />
                <input 
                  type="text" 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="District, City" 
                  className="w-full bg-transparent border-none outline-none text-[#364153] placeholder-zinc-400 font-semibold"
                />
              </div>
              <Link 
                href={`/dashboard?search=${encodeURIComponent(searchTitle)}&location=${encodeURIComponent(searchLocation)}`}
                className="w-full md:w-auto bg-[#0098B6] hover:bg-[#0c67c1] text-white font-bold px-8 py-3.5 rounded-2xl text-center transition-colors shrink-0 shadow flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Link>
            </div>

            {/* Category Quick Browse Section */}
            <div className="pt-4 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6A7282] block mb-3">
                Browse by Category
              </span>
              <div className="flex flex-wrap gap-3">
                {jobCategories.map((cat, i) => {
                  const IconComponent = cat.icon;
                  return (
                    <Link 
                      href={`/dashboard?search=${encodeURIComponent(cat.name)}`}
                      key={i} 
                      className="flex items-center gap-2.5 bg-white hover:bg-zinc-50 text-xs font-semibold px-4.5 py-2.5 rounded-full border border-[#E5E5E5]/40 shadow-sm hover:shadow transition-all group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cat.color} transition-transform group-hover:scale-110`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-[#364153]">{cat.name}</span>
                      <span className="text-[#6A7282] bg-zinc-100 group-hover:bg-zinc-200/60 px-2 py-0.5 rounded-full text-[10px]">
                        {cat.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Image Illustration Column */}
          <div className="lg:col-span-5 flex justify-center w-full relative">
            <div className="w-full max-w-md aspect-square relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:scale-[1.01] transition-transform duration-500">
              <Image 
                src="/hero_illustration.png" 
                alt="Working illustration" 
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Brand Logos Bar */}
      <section className="bg-white py-10 border-y border-[#E5E5E5]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-[#6A7282] mb-6">
            Trusted by forward-thinking teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {/* Slack Logo */}
            <div className="flex items-center gap-1.5 text-xl font-black text-[#364153] select-none">
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#36C5F0]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#2EB67D]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ECB22E]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E01E5A]" />
              </div>
              <span>slack</span>
            </div>

            {/* Amazon Logo */}
            <div className="flex flex-col items-center select-none pt-2">
              <span className="text-xl font-black tracking-tighter text-[#364153] leading-none">amazon</span>
              <span className="w-12 h-1.5 border-b-2 border-t-0 border-[#FF9900] rounded-b-full relative left-1" />
            </div>

            {/* Kellogg's Logo */}
            <div className="text-2xl font-serif italic font-black text-red-600 select-none tracking-tight">
              Kellogg&apos;s
            </div>

            {/* Bemis Logo */}
            <div className="text-xl font-extrabold tracking-widest text-[#E01E5A] select-none">
              BEMIS
            </div>

            {/* Deribit Logo */}
            <div className="flex items-center gap-1.5 text-xl font-bold text-[#364153] select-none">
              <span className="w-3 h-3 rotate-45 border-2 border-[#0098B6] bg-transparent" />
              <span>Deribit</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#364153]">
            How It <span className="text-[#1976D2]">Works</span>
          </h2>
          <p className="text-[#6A7282]">
            Explore the following simple steps to find and apply to your dream job using CY-Jobs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E5E5]/50 shadow-sm relative group hover:border-[#1976D2]/30 hover:shadow-md transition-all">
            <div className="text-5xl font-black text-[#1976D2]/10 group-hover:text-[#1976D2]/20 transition-colors absolute top-6 right-8">
              Step 1
            </div>
            <div className="w-12 h-12 bg-blue-50 text-[#1976D2] rounded-xl flex items-center justify-center text-xl font-bold mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-[#364153] mb-3">Register Account</h3>
            <p className="text-sm text-[#6A7282] leading-relaxed mb-6">
              Create your candidate or employer account in under a minute to access personalized tools.
            </p>
            <Link href="/dashboard" className="text-sm font-bold text-[#1976D2] hover:text-[#0c67c1] inline-flex items-center gap-1.5 transition-colors">
              REGISTER ACCOUNT <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E5E5]/50 shadow-sm relative group hover:border-[#1976D2]/30 hover:shadow-md transition-all">
            <div className="text-5xl font-black text-[#1976D2]/10 group-hover:text-[#1976D2]/20 transition-colors absolute top-6 right-8">
              Step 2
            </div>
            <div className="w-12 h-12 bg-blue-50 text-[#1976D2] rounded-xl flex items-center justify-center text-xl font-bold mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-[#364153] mb-3">Find Job</h3>
            <p className="text-sm text-[#6A7282] leading-relaxed mb-6">
              Search and filter through thousands of aggregated, active roles with intelligent AI matching.
            </p>
            <Link href="/dashboard" className="text-sm font-bold text-[#1976D2] hover:text-[#0c67c1] inline-flex items-center gap-1.5 transition-colors">
              FIND JOB <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-[#E5E5E5]/50 shadow-sm relative group hover:border-[#1976D2]/30 hover:shadow-md transition-all">
            <div className="text-5xl font-black text-[#1976D2]/10 group-hover:text-[#1976D2]/20 transition-colors absolute top-6 right-8">
              Step 3
            </div>
            <div className="w-12 h-12 bg-blue-50 text-[#1976D2] rounded-xl flex items-center justify-center text-xl font-bold mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-[#364153] mb-3">Apply Job</h3>
            <p className="text-sm text-[#6A7282] leading-relaxed mb-6">
              Submit your tailored profile directly to matching employers with one click.
            </p>
            <Link href="/dashboard" className="text-sm font-bold text-[#1976D2] hover:text-[#0c67c1] inline-flex items-center gap-1.5 transition-colors">
              APPLY JOB <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Contact Us / Value Prop Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-white rounded-3xl border border-[#E5E5E5]/30 shadow-xl my-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#364153]">
              Why You Contact Us
            </h2>
            <p className="text-[#6A7282] leading-relaxed font-medium">
              CY-Jobs is not just another job portal. We bridge the gap between education and career, bringing complete candidate profiles and smart matches directly to your fingers.
            </p>
            <div className="pt-4">
              <Link href="/dashboard" className="inline-flex items-center bg-[#1976D2] hover:bg-[#0c67c1] text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all hover:-translate-y-0.5">
                Learn More
              </Link>
            </div>
          </div>

          {/* Right Statistics Widgets */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#F5F8F8] p-6 rounded-2xl text-center border border-[#E5E5E5]/50 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1976D2] mb-3">
                <BookmarkCheck className="w-5 h-5" />
              </div>
              <p className="text-4xl font-black text-[#1976D2]">Over 10k+</p>
              <h4 className="text-[#364153] font-bold mt-2">Active Jobs</h4>
              <p className="text-xs text-[#6A7282] mt-1">Aggregated daily</p>
            </div>
            
            <div className="bg-[#F5F8F8] p-6 rounded-2xl text-center border border-[#E5E5E5]/50 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-[#0098B6] mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <p className="text-4xl font-black text-[#0098B6]">Over 10k+</p>
              <h4 className="text-[#364153] font-bold mt-2">Companies</h4>
              <p className="text-xs text-[#6A7282] mt-1">Hiring worldwide</p>
            </div>

            <div className="bg-[#F5F8F8] p-6 rounded-2xl text-center border border-[#E5E5E5]/50 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#2ECC71] mb-3">
                <Users2 className="w-5 h-5" />
              </div>
              <p className="text-4xl font-black text-[#2ECC71]">Over 10k+</p>
              <h4 className="text-[#364153] font-bold mt-2">Mentors</h4>
              <p className="text-xs text-[#6A7282] mt-1">Providing advice</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#364153]">
            Find The Job That <span className="text-[#1976D2]">Qualifies Your Life</span>
          </h2>
          <p className="text-[#6A7282]">
            Discover premium job listings handpicked to improve your professional growth and work-life balance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredJobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-3xl border border-[#E5E5E5]/50 shadow-sm flex flex-col justify-between hover:border-[#1976D2]/30 hover:shadow-md transition-all">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${job.typeBg} mb-4`}>
                  {job.type}
                </span>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${job.logoBg} flex items-center justify-center text-white font-extrabold text-lg`}>
                    {job.logoLetter}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-[#364153] text-lg hover:text-[#1976D2] transition-colors cursor-pointer">
                      {job.title}
                    </h3>
                    <p className="text-sm text-[#6A7282]">{job.company}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-[#6A7282]">
                    <Sparkles className="w-4 h-4 text-amber-500" /> {formatSalary(job.salary, job.location)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6A7282]">
                    <MapPinIcon className="w-4 h-4 text-red-400" /> {job.location}
                  </div>
                </div>
              </div>

              <Link 
                href="/dashboard" 
                className="w-full text-center py-2.5 bg-[#F5F8F8] hover:bg-[#1976D2] text-[#364153] hover:text-white rounded-xl text-sm font-bold transition-all border border-zinc-200/50 hover:border-transparent"
              >
                Apply Now
              </Link>
            </div>
          ))}

          {/* CTA Card for more jobs */}
          <div className="bg-gradient-to-br from-[#1976D2] to-[#0098B6] p-8 rounded-3xl text-white flex flex-col justify-between shadow-lg relative overflow-hidden group">
            {/* Background pattern */}
            <div className="absolute right-[-10%] bottom-[-10%] opacity-10 pointer-events-none transition-transform group-hover:scale-110 duration-700">
              <TrendingUp className="w-64 h-64" />
            </div>
            
            <div className="relative z-10">
              <p className="text-5xl font-black mb-2">100K+</p>
              <h3 className="text-xl font-bold mb-4">Explore all active job listings</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Connect your account and upload your resume to immediately match with thousands of other open positions.
              </p>
            </div>
            <Link 
              href="/dashboard" 
              className="relative z-10 w-full text-center py-3 bg-white text-[#1976D2] hover:bg-[#FFCA28] hover:text-zinc-950 font-bold rounded-xl text-sm shadow transition-all mt-6"
            >
              Explore All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 bg-white rounded-3xl border border-[#E5E5E5]/30 shadow-xl my-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Testimonial Quote Card */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#364153]">
              What Our Clients Say <br />About Us
            </h2>
            <div className="relative">
              <span className="text-7xl font-serif text-[#1976D2]/10 absolute -top-8 -left-4">“</span>
              <p className="text-lg md:text-xl text-[#364153]/80 italic relative z-10 pl-6 leading-relaxed">
                CY-Jobs is an amazing career intelligence platform. The automated matching system is incredibly accurate, which saved us weeks of sorting through unqualified resumes.
              </p>
            </div>
            
            <div className="flex items-center gap-4 pl-6 pt-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#1976D2]/20 relative">
                <Image 
                  src="/testimonial_headshot.png" 
                  alt="John Cina" 
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-[#364153]">John Cina</h4>
                <p className="text-xs text-[#6A7282]">CEO, Slack</p>
              </div>
            </div>
          </div>

          {/* Testimonial Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm aspect-[0.95] relative rounded-3xl overflow-hidden border border-[#E5E5E5]/50 shadow-md">
              <Image 
                src="/onboarding_library.png" 
                alt="Candidate profile mockup" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#003263] text-white/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 select-none">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#003263] font-black text-lg">
                CY
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CY-Jobs</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-xs">
              CY-Jobs is an AI-powered Career Intelligence Platform helping people manage their professional timeline and connect with the best opportunities.
            </p>
          </div>

          {/* Column 2: Ecosystem */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Ecosystem</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://careeryatraa.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 text-amber-500" /> CareerYatraa (Education)
                </a>
              </li>
              <li><Link href="/" className="hover:text-white transition-colors">CY-Jobs (Careers)</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Skill Assessments</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">City Guide</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Service</Link></li>
              <li><Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Office</h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>Amborkhana, Sylhet</li>
              <li>015784668</li>
              <li>support@cy-jobs.com</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/10 mt-12 pt-8 text-center text-xs text-white/40">
          © {new Date().getFullYear()} CY-Jobs. All rights reserved. Built for professional career growth.
        </div>
      </footer>
    </div>
  );
}
