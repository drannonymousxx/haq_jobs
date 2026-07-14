"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  FileText, 
  User, 
  Briefcase, 
  Star, 
  Loader2,
  Award,
  Notebook
} from "lucide-react";
import { triggerWorkflowEvent } from "@/lib/systemAccount";

type RecommendationType = 'strong_hire' | 'hire' | 'no_hire' | 'strong_no_hire';

export default function ScorecardPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  // Session User
  const [sessionUser, setSessionUser] = useState<any>(null);
  
  // Data states
  const [interview, setInterview] = useState<any>(null);
  const [privateNotes, setPrivateNotes] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form states
  const [recommendation, setRecommendation] = useState<RecommendationType>("hire");
  const [feedbackNotes, setFeedbackNotes] = useState("");

  useEffect(() => {
    async function loadScorecardData() {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.push("/login");
          return;
        }
        setSessionUser(session.user);

        // Fetch interview details
        const { data: dbInt, error: intErr } = await supabase
          .from("interviews")
          .select(`
            *,
            job:job_id (
              title,
              firm_name
            ),
            candidate:candidate_id (
              full_name,
              id
            ),
            recruiter:recruiter_id (
              full_name
            )
          `)
          .eq("id", interviewId)
          .single();

        if (intErr || !dbInt) {
          setErrorMsg("Access Denied: You are not authorized to write a scorecard for this interview.");
          setLoading(false);
          return;
        }

        setInterview(dbInt);

        // Verify that the logged-in user is indeed the recruiter
        if (session.user.id !== dbInt.recruiter_id) {
          setErrorMsg("Access Denied: Only the interviewer can submit the scorecard.");
          setLoading(false);
          return;
        }

        // Fetch recruiter's private notes taken during the interview
        const { data: notesData } = await supabase
          .from("private_interview_notes")
          .select("notes")
          .eq("interview_id", interviewId)
          .eq("recruiter_id", session.user.id)
          .maybeSingle();

        if (notesData) {
          setPrivateNotes(notesData.notes || "");
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg("Failed to load interview context.");
      } finally {
        setLoading(false);
      }
    }
    loadScorecardData();
  }, [interviewId]);

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionLoading || !interview || !sessionUser) return;

    setActionLoading(true);
    try {
      // 1. Insert scorecard in Supabase
      const { error: insertErr } = await supabase
        .from("interview_scorecards")
        .insert({
          interview_id: interviewId,
          recruiter_id: sessionUser.id,
          recommendation,
          feedback_notes: feedbackNotes
        });

      if (insertErr) throw insertErr;

      // 2. Format recommendation text for alerts
      const recLabels: Record<RecommendationType, string> = {
        strong_hire: "Strong Hire",
        hire: "Hire",
        no_hire: "No Hire",
        strong_no_hire: "Strong No Hire"
      };

      // 3. Notify the hiring team (in a real ATS, this goes to job collaborators)
      // For now, trigger a workflow event indicating scorecard submitted
      await triggerWorkflowEvent({
        userId: sessionUser.id,
        title: "Scorecard Submitted",
        content: `You submitted a "${recLabels[recommendation]}" scorecard for "${interview.candidate?.full_name}" (Round: ${interview.round || "Legal Round"}).`,
        type: "interview",
        referenceId: interview.application_id,
        referenceType: "job_applications"
      });

      // 4. Redirect recruiter to job pipeline view
      router.push(`/dashboard/recruiter/jobs/${interview.job_id}`);
    } catch (err: any) {
      alert("Failed to submit scorecard: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg/50 flex flex-col items-center justify-center gap-4 font-poppins">
        <Loader2 className="w-8 h-8 animate-spin text-[#B63106]" />
        <p className="text-xs font-semibold text-brand-text-muted">Loading scorecard editor...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-bg/50 font-poppins">
        <div className="bg-brand-card border border-brand-border rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-base font-black text-brand-text">Access Denied</h3>
            <p className="text-xs text-brand-text-muted leading-relaxed font-semibold">{errorMsg}</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/recruiter")}
            className="w-full py-3 bg-black hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg/50 py-10 px-4 sm:px-6 font-poppins">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Notes & Candidate Overview */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Candidate Card */}
          <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <User size={14} className="text-[#B63106]" />
              <span>Interview Session Details</span>
            </h3>
            
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-brand-border/40">
                <span className="text-brand-text-muted font-bold">Candidate:</span>
                <span className="text-brand-text font-black">{interview?.candidate?.full_name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-brand-border/40">
                <span className="text-brand-text-muted font-bold">Vacancy Title:</span>
                <span className="text-brand-text font-black">{interview?.job?.title}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-brand-border/40">
                <span className="text-brand-text-muted font-bold">Company Name:</span>
                <span className="text-brand-text-secondary font-black">{interview?.job?.firm_name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-brand-border/40">
                <span className="text-brand-text-muted font-bold">Scheduled Round:</span>
                <span className="text-[#B63106] font-black">{interview?.round || "Legal Round"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-brand-text-muted font-bold">Duration:</span>
                <span className="text-brand-text font-black">{interview?.duration}</span>
              </div>
            </div>
          </div>

          {/* Session Private Notes */}
          <div className="bg-brand-card border border-brand-border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <Notebook size={14} className="text-[#B63106]" />
              <span>Session Notes (Private)</span>
            </h3>
            
            {privateNotes ? (
              <div className="bg-brand-bg/50 border border-brand-border/60 p-4 rounded-2xl max-h-80 overflow-y-auto text-xs text-brand-text-secondary font-medium leading-relaxed whitespace-pre-wrap">
                {privateNotes}
              </div>
            ) : (
              <div className="p-4 bg-brand-bg/30 border border-dashed border-brand-border rounded-2xl text-center text-xs text-brand-text-muted font-medium">
                No personal notes taken during this call.
              </div>
            )}
            
            <p className="text-[10px] text-brand-text-muted font-semibold leading-relaxed">
              * Note: These are private notes you logged during the live call. They are only visible to you and are never shown to candidates.
            </p>
          </div>

        </section>

        {/* RIGHT COLUMN: Submit Scorecard Form */}
        <section className="lg:col-span-7">
          <form 
            onSubmit={handleSubmitScorecard} 
            className="bg-brand-card border border-brand-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-8"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-black text-brand-text font-poppins">Interviewer Scorecard Submission</h2>
              <p className="text-[11px] text-brand-text-muted font-bold font-poppins">Grade the applicant round performance and leave detailed feedback notes.</p>
            </div>

            {/* Recommendation Options */}
            <div className="space-y-3.5">
              <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider block">
                Overall Hiring Recommendation
              </label>
              
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  {
                    value: "strong_hire" as const,
                    label: "Strong Hire",
                    color: "border-emerald-500 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-50"
                  },
                  {
                    value: "hire" as const,
                    label: "Hire",
                    color: "border-teal-500 text-teal-800 bg-teal-50/50 hover:bg-teal-50"
                  },
                  {
                    value: "no_hire" as const,
                    label: "No Hire",
                    color: "border-amber-500 text-amber-800 bg-amber-50/50 hover:bg-amber-50"
                  },
                  {
                    value: "strong_no_hire" as const,
                    label: "Strong No Hire",
                    color: "border-red-500 text-red-800 bg-red-50/50 hover:bg-red-50"
                  }
                ].map((option) => {
                  const isSelected = recommendation === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRecommendation(option.value)}
                      className={`p-4 border rounded-2xl text-center text-xs font-black transition-all cursor-pointer shadow-sm select-none ${
                        isSelected 
                          ? `${option.color} ring-2 ring-offset-2 ring-blue-500` 
                          : "border-brand-border hover:bg-brand-bg text-brand-text-secondary bg-brand-card"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed feedback notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider block">
                Evaluation Notes & Candidate Feedback
              </label>
              <textarea
                required
                rows={8}
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Include insights on communication skills, legal knowledge, technical problem solving, cultural fit, and summary of round details..."
                className="w-full p-4 border border-brand-border rounded-2xl outline-none focus:border-[#B63106] text-xs bg-brand-bg/50 font-medium leading-relaxed shadow-sm"
              />
            </div>

            {/* Form actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-brand-border/40">
              <button
                type="submit"
                disabled={actionLoading}
                className="flex-grow py-3.5 bg-[#B63106] hover:bg-[#932604] text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer disabled:opacity-60"
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Submitting Scorecard...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    <span>Submit Scorecard</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push(`/dashboard/recruiter/jobs/${interview.job_id}`)}
                className="px-5 py-3.5 border border-brand-border hover:bg-brand-bg text-brand-text-secondary font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Skip / Later
              </button>
            </div>

          </form>
        </section>

      </div>
    </div>
  );
}
