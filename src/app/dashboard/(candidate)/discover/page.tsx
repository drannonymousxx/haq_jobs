"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  BookOpen, 
  Award, 
  PlayCircle 
} from "lucide-react";

// Mock legal courses dataset
const coursesData = [
  {
    id: "c1",
    title: "Advanced Contract Drafting",
    provider: "HAQJobs Academy",
    duration: "6 Weeks",
    level: "Advanced",
    category: "Contracts",
    shortDesc: "Master commercial drafting, indemnity clauses, and risk allocation mechanisms.",
    instructor: "Adv. Rajshekhar Rao (Senior Counsel)",
    syllabus: [
      "Introduction to Commercial Contracts & Term Sheets",
      "Drafting Indemnity, Liability & Limitation Clauses",
      "Liquidated Damages & Dispute Resolution Provisions",
      "Practical Drafting Clinic & Review Session"
    ]
  },
  {
    id: "c2",
    title: "Intellectual Property Law in India",
    provider: "National Law Institute",
    duration: "8 Weeks",
    level: "Intermediate",
    category: "IPR",
    shortDesc: "Comprehensive overview of Trademarks, Patents, and Copyrights litigation in India.",
    instructor: "Dr. Kritika Sharma (IP Specialist)",
    syllabus: [
      "IPR Legislative Framework & Treaties",
      "Trademark Registration & Infringement Suits",
      "Patent Specification Drafting & Filing",
      "Copyright Law & Digital Rights Management"
    ]
  },
  {
    id: "c3",
    title: "Corporate Compliance & Governance",
    provider: "Corporate Law Association",
    duration: "4 Weeks",
    level: "Beginner",
    category: "Corporate Law",
    shortDesc: "Practical guide to incorporation filings, board meetings, and SEBI compliance guidelines.",
    instructor: "CS Rahul Malhotra (Compliance Head)",
    syllabus: [
      "Company Incorporation & ROC Filings",
      "Board Meetings & Governance Protocols",
      "SEBI Listing Regulations (LODR) Compliance",
      "Compliance Audit Checklists & Reporting"
    ]
  },
  {
    id: "c4",
    title: "Commercial Arbitration Practice",
    provider: "Legal Advancements Academy",
    duration: "5 Weeks",
    level: "Advanced",
    category: "Arbitration",
    shortDesc: "Procedural guide to domestic and international commercial arbitrations in India.",
    instructor: "Hon'ble Justice (Retd.) A. K. Singh",
    syllabus: [
      "Arbitration Agreements & Seat/Venue Clauses",
      "Interim Reliefs under Section 9 & 17",
      "Conduct of Arbitral Proceedings & Pleadings",
      "Challenging & Setting Aside Arbitral Awards"
    ]
  },
  {
    id: "c5",
    title: "Cyber Law & Data Regulations",
    provider: "TechLaw Institute",
    duration: "3 Weeks",
    level: "Beginner",
    category: "Technology Law",
    shortDesc: "Fundamentals of IT Act 2000, digital privacy compliance, and electronic evidence.",
    instructor: "Adv. Sandeep Bisht (Cyber Specialist)",
    syllabus: [
      "Overview of IT Act 2000 & Amendments",
      "Cyber Crimes, Admissibility of Electronic Evidence",
      "Data Protection Rules & DPDPA Impact",
      "Drafting Privacy Policies & Terms of Service"
    ]
  }
];

// Mock legal events dataset
const eventsData = [
  {
    id: "e1",
    title: "National Moot Court Competition",
    organizer: "Delhi Law Society",
    date: "Aug 24 - 26, 2026",
    location: "New Delhi (Offline)",
    category: "Moot Courts",
    status: "Open",
    shortDesc: "Premier national-level moot court focusing on constitutional law and privacy disputes.",
    schedule: "3 Days • Preliminary rounds, Quarter-finals, and Final bench review",
    highlights: ["₹1,00,000 Cash Prize Pool", "Supreme Court judges panel for finals", "Networking dinner with top law firm partners"]
  },
  {
    id: "e2",
    title: "Legal Research & Citation Workshop",
    organizer: "Legal Scholars Association",
    date: "July 18, 2026",
    location: "Zoom (Online)",
    category: "Workshops",
    status: "Open",
    shortDesc: "Master search query structuring on SCC Online, Manupatra, and writing peer-reviewed papers.",
    schedule: "Saturday • 10:00 AM - 4:00 PM (IST)",
    highlights: ["Hands-on citation training (Bluebook 21st ed)", "Practical research scenarios", "Verified certificate of participation"]
  },
  {
    id: "e3",
    title: "Constitutional Law Precedents Seminar",
    organizer: "Republic Law Forum",
    date: "July 30, 2026",
    location: "Mumbai (Offline)",
    category: "Constitutional Law",
    status: "Closing Soon",
    shortDesc: "Debating recent landmark judgments, administrative rules, and judicial review dynamics.",
    schedule: "Single Day • 9:30 AM - 5:30 PM",
    highlights: ["Interactive debates on federalism", "Panels with high court judges", "Compulsory readings package included"]
  },
  {
    id: "e4",
    title: "Corporate M&A Advisory Conference",
    organizer: "Corporate Counsel Forum",
    date: "Sept 12, 2026",
    location: "Bengaluru (Offline)",
    category: "Corporate Law",
    status: "Open",
    shortDesc: "High-level panel debates on tax structuring, antitrust clearances, and due diligence checks.",
    schedule: "Full Day Summit • 4 Panel Sessions",
    highlights: ["M&A transaction mock drills", "Panels with General Counsels of major corporations", "Fringe networking hour"]
  },
  {
    id: "e5",
    title: "Mediation & Negotiation Workshop",
    organizer: "Resolve India Forum",
    date: "July 20, 2026",
    location: "Zoom (Online)",
    category: "Workshops",
    status: "Open",
    shortDesc: "ADR workshop focusing on mediation advocacy, counsel techniques, and family disputes.",
    schedule: "Sunday • 2:00 PM - 7:00 PM",
    highlights: ["Interactive dispute roleplay simulation", "Negotiation brief templates", "Critique from certified mediators"]
  }
];

const categories = [
  "All",
  "Corporate Law",
  "Contracts",
  "IPR",
  "Arbitration",
  "Technology Law",
  "Constitutional Law",
  "Moot Courts",
  "Workshops"
];

export default function CandidateDiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Expand states for detailed overlays
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Scroll viewport references
  const coursesScrollRef = useRef<HTMLDivElement>(null);
  const eventsScrollRef = useRef<HTMLDivElement>(null);

  // Helper to scroll carousel viewports
  const scrollCarousel = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollVal = ref.current.clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollVal : scrollVal,
        behavior: "smooth"
      });
    }
  };

  // Filters calculation
  const getFilteredCourses = () => {
    return coursesData.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All" || 
        course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const getFilteredEvents = () => {
    return eventsData.filter(event => {
      const matchesSearch = 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === "All" || 
        event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const filteredCourses = getFilteredCourses();
  const filteredEvents = getFilteredEvents();

  return (
    <div className="space-y-10 max-w-5xl font-poppins pb-10">
      
      {/* 1. Header Section */}
      <div className="select-none">
        <h1 className="text-2xl font-extrabold text-slate-800 font-poppins">Discover</h1>
        <p className="text-xs text-slate-400 font-semibold mt-1">
          Explore legal courses, certifications, moot courts, competitions, workshops, articles and career opportunities.
        </p>
      </div>

      {/* 2. Full-Width Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search courses, events, competitions..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            // reset expands on query
            setSelectedCourseId(null);
            setSelectedEventId(null);
          }}
          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:border-[#013CF1] text-xs font-semibold bg-white transition-all shadow-sm"
        />
        <Search size={14} className="text-slate-400 absolute left-3.5 top-4 pointer-events-none select-none" />
      </div>

      {/* 3. Horizontal Scrolling Category Pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 select-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                // reset expands on category switch
                setSelectedCourseId(null);
                setSelectedEventId(null);
              }}
              className={`px-4.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-[#013CF1] text-white shadow-md border-transparent"
                  : "bg-slate-50 border border-slate-150 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 4. Courses Section */}
      <div className="space-y-4 relative">
        <div className="flex justify-between items-center select-none">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <BookOpen size={16} className="text-[#013CF1]" />
            <span>Courses</span>
          </h2>
          
          {/* Slider controls */}
          {filteredCourses.length > 1 && (
            <div className="flex gap-1">
              <button 
                onClick={() => scrollCarousel(coursesScrollRef, "left")}
                className="p-1.5 rounded-lg border border-slate-150 bg-white text-slate-500 hover:text-slate-700 cursor-pointer shadow-sm"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={() => scrollCarousel(coursesScrollRef, "right")}
                className="p-1.5 rounded-lg border border-slate-150 bg-white text-slate-500 hover:text-slate-700 cursor-pointer shadow-sm"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 font-semibold select-none">
            No certificate courses match your criteria.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Carousel track wrapper */}
            <div 
              ref={coursesScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2"
            >
              {filteredCourses.map((course) => {
                const isSelected = selectedCourseId === course.id;
                return (
                  <div 
                    key={course.id}
                    onClick={() => setSelectedCourseId(isSelected ? null : course.id)}
                    className="snap-start flex-shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] cursor-pointer select-none"
                  >
                    <div className={`h-full bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      isSelected ? "border-[#013CF1] ring-2 ring-[#013CF1]/10 bg-blue-50/5" : "border-slate-150"
                    }`}>
                      {/* Gradient card visual header */}
                      <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-600 p-4 flex flex-col justify-between text-white relative">
                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          {course.level}
                        </div>
                        <BookOpen size={20} className="opacity-90" />
                        <span className="text-[10px] font-black tracking-widest uppercase text-blue-100 block">
                          {course.provider}
                        </span>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-1.5 flex-grow">
                        <h3 className="text-xs font-black text-slate-800 leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                          {course.shortDesc}
                        </p>
                      </div>

                      {/* Info footer */}
                      <div className="px-4 pb-4 pt-1 flex justify-between items-center border-t border-slate-50 text-[9px] text-slate-400 font-bold bg-slate-50/30">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          {course.duration}
                        </span>
                        <span className="text-[#013CF1] font-black tracking-wide">
                          {isSelected ? "Collapse Details" : "View Details"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Course Details Expansion (sliding height panel) */}
            <AnimatePresence>
              {selectedCourseId && (() => {
                const course = filteredCourses.find(c => c.id === selectedCourseId);
                if (!course) return null;
                return (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden border border-slate-100 shadow-lg rounded-3xl bg-slate-50/20 p-5 md:p-6"
                  >
                    <div className="relative space-y-6">
                      {/* Close trigger */}
                      <button 
                        onClick={() => setSelectedCourseId(null)}
                        className="absolute top-0 right-0 p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-pointer"
                      >
                        <X size={14} />
                      </button>

                      {/* Header block */}
                      <div className="space-y-1 pr-8">
                        <span className="text-[9px] font-black tracking-widest text-[#013CF1] uppercase">Course Curriculum Details</span>
                        <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-tight">{course.title}</h2>
                        <span className="text-[10px] text-slate-400 font-bold block pt-0.5">Offered by {course.provider}</span>
                      </div>

                      {/* Splitted core grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Left column: Syllabus / Overview */}
                        <div className="md:col-span-8 space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-slate-800 tracking-wider uppercase">Syllabus Overview</h4>
                            <div className="space-y-2.5">
                              {course.syllabus.map((step, idx) => (
                                <div key={idx} className="flex gap-2 text-xs text-slate-600 font-semibold leading-relaxed">
                                  <span className="w-5 h-5 rounded-full bg-blue-50 text-[#013CF1] flex items-center justify-center text-[9px] font-black border border-blue-100 flex-shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="pt-0.5">{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <h4 className="text-[10px] font-black text-slate-800 tracking-wider uppercase flex items-center gap-1 select-none">
                              <User size={12} className="text-slate-400" />
                              Instructor Profile
                            </h4>
                            <p className="text-xs text-slate-500 leading-normal font-semibold pl-4.5">
                              {course.instructor}
                            </p>
                          </div>
                        </div>

                        {/* Right column: Quick stats & apply CTA */}
                        <div className="md:col-span-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-4 select-none">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Duration</span>
                              <span className="text-slate-800 font-extrabold flex items-center gap-1">
                                <Clock size={12} className="text-slate-400" />
                                {course.duration}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-2.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Skill Level</span>
                              <span className="bg-blue-50 text-[#013CF1] font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">
                                {course.level}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-2.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Access Code</span>
                              <span className="text-slate-800 font-mono font-bold">Free Trial</span>
                            </div>
                          </div>

                          <button 
                            onClick={() => alert(`Registration pending request submitted for course: ${course.title}`)}
                            className="w-full py-3 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide"
                          >
                            <PlayCircle size={13} />
                            <span>Enroll Course</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 5. Events Section */}
      <div className="space-y-4 relative">
        <div className="flex justify-between items-center select-none">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Calendar size={16} className="text-amber-500" />
            <span>Events</span>
          </h2>
          
          {/* Slider controls */}
          {filteredEvents.length > 1 && (
            <div className="flex gap-1">
              <button 
                onClick={() => scrollCarousel(eventsScrollRef, "left")}
                className="p-1.5 rounded-lg border border-slate-150 bg-white text-slate-500 hover:text-slate-700 cursor-pointer shadow-sm"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                onClick={() => scrollCarousel(eventsScrollRef, "right")}
                className="p-1.5 rounded-lg border border-slate-150 bg-white text-slate-500 hover:text-slate-700 cursor-pointer shadow-sm"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 font-semibold select-none">
            No upcoming events match your criteria.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Carousel track wrapper */}
            <div 
              ref={eventsScrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory py-2"
            >
              {filteredEvents.map((event) => {
                const isSelected = selectedEventId === event.id;
                return (
                  <div 
                    key={event.id}
                    onClick={() => setSelectedEventId(isSelected ? null : event.id)}
                    className="snap-start flex-shrink-0 w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] cursor-pointer select-none"
                  >
                    <div className={`h-full bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                      isSelected ? "border-amber-500 ring-2 ring-amber-500/10 bg-amber-50/5" : "border-slate-150"
                    }`}>
                      {/* Gradient card visual header */}
                      <div className="h-28 bg-gradient-to-br from-amber-500 to-rose-500 p-4 flex flex-col justify-between text-white relative">
                        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                          {event.status}
                        </div>
                        <Calendar size={20} className="opacity-90" />
                        <span className="text-[10px] font-black tracking-widest uppercase text-amber-100 block">
                          {event.organizer}
                        </span>
                      </div>

                      {/* Info body */}
                      <div className="p-4 space-y-1.5 flex-grow">
                        <h3 className="text-xs font-black text-slate-800 leading-tight">
                          {event.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                          {event.shortDesc}
                        </p>
                      </div>

                      {/* Info footer */}
                      <div className="px-4 pb-4 pt-1 flex justify-between items-center border-t border-slate-50 text-[9px] text-slate-400 font-bold bg-slate-50/30">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} className="text-slate-400" />
                          {event.location}
                        </span>
                        <span className="text-amber-600 font-black tracking-wide">
                          {isSelected ? "Collapse Details" : "View Details"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Event Details Expansion (sliding height panel) */}
            <AnimatePresence>
              {selectedEventId && (() => {
                const event = filteredEvents.find(e => e.id === selectedEventId);
                if (!event) return null;
                return (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden border border-slate-100 shadow-lg rounded-3xl bg-slate-50/20 p-5 md:p-6"
                  >
                    <div className="relative space-y-6">
                      {/* Close trigger */}
                      <button 
                        onClick={() => setSelectedEventId(null)}
                        className="absolute top-0 right-0 p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 rounded-xl cursor-pointer"
                      >
                        <X size={14} />
                      </button>

                      {/* Header block */}
                      <div className="space-y-1 pr-8">
                        <span className="text-[9px] font-black tracking-widest text-amber-600 uppercase">Event Schedule & Highlights</span>
                        <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight leading-tight">{event.title}</h2>
                        <span className="text-[10px] text-slate-400 font-bold block pt-0.5">Hosted by {event.organizer}</span>
                      </div>

                      {/* Splitted core grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Left column: Key Highlights */}
                        <div className="md:col-span-8 space-y-4">
                          <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-slate-800 tracking-wider uppercase">Event Overview</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-semibold pl-1">
                              {event.shortDesc}
                            </p>
                          </div>

                          <div className="space-y-2 pt-1">
                            <h4 className="text-[10px] font-black text-slate-800 tracking-wider uppercase">Key Highlights</h4>
                            <div className="space-y-2.5">
                              {event.highlights.map((highlight, idx) => (
                                <div key={idx} className="flex gap-2 text-xs text-slate-600 font-semibold leading-relaxed">
                                  <span className="text-amber-500 font-bold">✓</span>
                                  <span>{highlight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right column: Venue stats & register CTA */}
                        <div className="md:col-span-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-4 select-none">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Date & Timing</span>
                              <span className="text-slate-800 font-extrabold flex items-center gap-1 text-[11px]">
                                <Calendar size={12} className="text-slate-400" />
                                {event.date}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-2.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Location Venue</span>
                              <span className="text-slate-800 font-extrabold flex items-center gap-1">
                                <MapPin size={12} className="text-slate-400" />
                                {event.location}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t border-slate-50 pt-2.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">Timeline Duration</span>
                              <span className="text-slate-800 font-semibold text-[11px] truncate max-w-[140px]">
                                {event.schedule}
                              </span>
                            </div>
                          </div>

                          <button 
                            onClick={() => alert(`Registration request received for event: ${event.title}`)}
                            className="w-full py-3 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide"
                          >
                            <Award size={13} />
                            <span>Register Event</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
