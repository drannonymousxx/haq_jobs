"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  LiveKitRoom, 
  useTracks, 
  VideoTrack,
  useLocalParticipant,
  useParticipants,
  RoomAudioRenderer
} from "@livekit/components-react";
import { Track } from "livekit-client";
import "@livekit/components-styles";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor, 
  Users, 
  Clock, 
  Activity, 
  AlertCircle,
  ArrowLeft,
  Settings,
  ShieldAlert,
  Notebook
} from "lucide-react";
import Link from "next/link";
import { triggerWorkflowEvent } from "@/lib/systemAccount";

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  // Session & Auth
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // States
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video Room States
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  // Pre-join local media settings
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [localCamOn, setLocalCamOn] = useState(true);
  const [localMicOn, setLocalMicOn] = useState(true);
  const previewVideoRef = useRef<HTMLVideoElement>(null);

  // Retrieve user session & interview details
  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.user) {
          router.push("/login");
          return;
        }
        setSessionUser(session.user);

        // Fetch user profile
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(userProfile);

        // Fetch interview details (Respects RLS: user must be recruiter or candidate)
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
              profile_photo_url
            ),
            recruiter:recruiter_id (
              full_name
            )
          `)
          .eq("id", interviewId)
          .single();

        if (intErr || !dbInt) {
          setError("Access Denied: You are not authorized to view this interview page.");
          setLoading(false);
          return;
        }

        setInterview(dbInt);

        // Access check: only assigned recruiter or candidate can view
        const isCandidate = session.user.id === dbInt.candidate_id;
        const isRecruiter = session.user.id === dbInt.recruiter_id;
        if (!isCandidate && !isRecruiter) {
          setError("Access Denied: You are not a registered participant in this session.");
          setLoading(false);
          return;
        }

        if (dbInt.status === "completed") {
          setError("This interview session has already ended.");
          setLoading(false);
          return;
        }

        // Fetch LiveKit access token from backend API route
        const tokenRes = await fetch(`/api/livekit/token?interviewId=${interviewId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error) {
          setError(tokenData.error);
        } else {
          setToken(tokenData.token);
          setLivekitUrl(tokenData.url);
        }
      } catch (err: any) {
        console.error(err);
        setError("An unexpected error occurred while setting up the interview.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [interviewId]);

  // Handle local camera preview
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startPreview() {
      try {
        if (!joined && !loading && !error) {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: localCamOn,
            audio: localMicOn
          });
          setLocalStream(activeStream);
          if (previewVideoRef.current) {
            previewVideoRef.current.srcObject = activeStream;
          }
        }
      } catch (err) {
        console.warn("Failed to get preview stream:", err);
      }
    }
    startPreview();
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [joined, localCamOn, localMicOn, loading, error]);

  const handleJoin = () => {
    // Stop local preview tracks
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
    }
    setJoined(true);
  };

  const handleLeave = () => {
    router.push("/dashboard");
  };

  const handleEndInterview = async () => {
    if (!window.confirm("Are you sure you want to end this interview? This will disconnect all participants and mark the session as Completed.")) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // 1. Terminate LiveKit room immediately
      if (session) {
        try {
          await fetch("/api/livekit/delete-room", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ interviewId })
          });
        } catch (roomErr) {
          console.warn("Failed to delete LiveKit room server-side:", roomErr);
        }
      }

      // 2. Set interview status to completed in database
      const { error } = await supabase
        .from("interviews")
        .update({ status: "completed" })
        .eq("id", interviewId);

      if (error) throw error;

      // 3. Update job application status to interview_completed
      if (interview?.application_id) {
        await supabase
          .from("job_applications")
          .update({ status: "interview_completed" })
          .eq("id", interview.application_id);
      }

      // 4. Notify candidate
      if (interview?.candidate_id) {
        await triggerWorkflowEvent({
          userId: interview.candidate_id,
          title: "Interview Completed",
          content: `Your interview for "${interview.job?.title || "Legal Role"}" has been marked as Completed.`,
          type: "interview",
          referenceId: interviewId,
          referenceType: "interviews"
        });
      }

      // 5. Redirect recruiter to fill scorecard
      router.push(`/interview/${interviewId}/scorecard`);
    } catch (e: any) {
      alert("Failed to mark interview as completed: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white gap-4 font-poppins">
        <div className="w-12 h-12 border-4 border-[#B63106] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-zinc-400">Securing your connection to HAQJobs Rooms...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white p-6 font-poppins">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-red-950 border border-red-800 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-white">Access Denied</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-semibold">{error}</p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-[#B63106] hover:bg-[#932604] text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-poppins flex flex-col overflow-hidden select-none">
      {!joined ? (
        // SETUP & PREVIEW SCREEN
        <div className="flex-grow flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left side: Setup Cam Preview */}
            <div className="md:col-span-7 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">Video Room Setup</h2>
              <div className="relative aspect-video w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
                {localCamOn ? (
                  <video 
                    ref={previewVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-zinc-500 text-xs font-semibold">
                    <VideoOff size={32} />
                    <span>Camera is turned off</span>
                  </div>
                )}

                {/* Prejoin setup triggers */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-zinc-850">
                  <button 
                    onClick={() => setLocalMicOn(!localMicOn)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                      localMicOn 
                        ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                        : "bg-red-600 text-white hover:bg-red-500"
                    }`}
                  >
                    {localMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                  </button>
                  <button 
                    onClick={() => setLocalCamOn(!localCamOn)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all ${
                      localCamOn 
                        ? "bg-zinc-800 text-white hover:bg-zinc-700" 
                        : "bg-red-600 text-white hover:bg-red-500"
                    }`}
                  >
                    {localCamOn ? <Video size={16} /> : <VideoOff size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Session Card info */}
            <div className="md:col-span-5 bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl space-y-6">
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  {interview?.round || "Legal Interview"}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">{interview?.title}</h3>
                <p className="text-xs text-[#B63106] font-bold">{interview?.job?.firm_name}</p>
              </div>

              <div className="space-y-3.5 border-t border-zinc-800 pt-4 text-xs font-semibold text-zinc-400">
                <div className="flex justify-between items-center">
                  <span>Candidate:</span>
                  <span className="text-white font-black">{interview?.candidate?.full_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Recruiter:</span>
                  <span className="text-white font-black">{interview?.recruiter?.full_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Duration:</span>
                  <span className="text-white font-black">{interview?.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Time:</span>
                  <span className="text-white font-black">
                    {new Date(interview?.scheduled_at).toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <button
                onClick={handleJoin}
                className="w-full py-4 bg-[#B63106] hover:bg-[#932604] text-white font-bold text-xs rounded-2xl transition-all shadow-lg hover:shadow-brand/20 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                Join Interview Session
              </button>
            </div>

          </div>
        </div>
      ) : (
        // LIVEKIT ROOM CONTENT
        <LiveKitRoom
          video={localCamOn}
          audio={localMicOn}
          token={token!}
          serverUrl={livekitUrl!}
          connectOptions={{ autoSubscribe: true }}
          data-lk-theme="default"
          className="flex-grow flex flex-col min-h-0"
        >
          <RoomAudioRenderer />
          <CustomInterviewUI 
            interview={interview} 
            sessionUser={sessionUser}
            onLeave={handleLeave}
            onEndInterview={handleEndInterview}
          />
        </LiveKitRoom>
      )}
    </div>
  );
}

interface CustomUIProps {
  interview: any;
  sessionUser: any;
  onLeave: () => void;
  onEndInterview: () => void;
}

// Full custom video UI nested inside LiveKitRoom to access LiveKit hooks
function CustomInterviewUI({ interview, sessionUser, onLeave, onEndInterview }: CustomUIProps) {
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();

  // Control toggles
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenOn, setScreenOn] = useState(false);
  const [drawerType, setDrawerType] = useState<"participants" | "notes" | null>(null);

  // Private recruiter notes states
  const [personalNotes, setPersonalNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  // Call duration counter
  const [durationSecs, setDurationSecs] = useState(0);

  const isRecruiter = sessionUser.id === interview.recruiter_id;

  // Duration ticking
  useEffect(() => {
    const interval = setInterval(() => {
      setDurationSecs(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (totalSecs: number): string => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins < 10 ? "0" + mins : mins}:${secs < 10 ? "0" + secs : secs}`;
  };

  // Sync initial toggles from PreJoin settings
  useEffect(() => {
    if (localParticipant) {
      setMicOn(localParticipant.isMicrophoneEnabled);
      setCamOn(localParticipant.isCameraEnabled);
    }
  }, [localParticipant]);

  // Fetch initial private notes (recruiters only)
  useEffect(() => {
    if (isRecruiter) {
      async function fetchNotes() {
        try {
          const { data } = await supabase
            .from("private_interview_notes")
            .select("notes")
            .eq("interview_id", interview.id)
            .eq("recruiter_id", sessionUser.id)
            .maybeSingle();
          if (data) {
            setPersonalNotes(data.notes || "");
          }
        } catch (err) {
          console.warn("Failed to fetch initial notes:", err);
        }
      }
      fetchNotes();
    }
  }, [interview.id, sessionUser.id, isRecruiter]);

  // Debounced Autosave for Private Notes
  useEffect(() => {
    if (!isRecruiter || personalNotes === "") return;

    const delayDebounce = setTimeout(async () => {
      setNotesSaving(true);
      try {
        const { data, error: selectErr } = await supabase
          .from("private_interview_notes")
          .select("id")
          .eq("interview_id", interview.id)
          .eq("recruiter_id", sessionUser.id)
          .maybeSingle();

        if (selectErr) throw selectErr;

        if (data) {
          await supabase
            .from("private_interview_notes")
            .update({ notes: personalNotes })
            .eq("id", data.id);
        } else {
          await supabase
            .from("private_interview_notes")
            .insert({
              interview_id: interview.id,
              recruiter_id: sessionUser.id,
              notes: personalNotes
            });
        }
      } catch (err) {
        console.error("Autosave notes failed:", err);
      } finally {
        setNotesSaving(false);
      }
    }, 1500);

    return () => clearTimeout(delayDebounce);
  }, [personalNotes, interview.id, sessionUser.id, isRecruiter]);

  const toggleMic = async () => {
    const next = !micOn;
    await localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  };

  const toggleCam = async () => {
    const next = !camOn;
    await localParticipant.setCameraEnabled(next);
    setCamOn(next);
  };

  const toggleScreen = async () => {
    try {
      const next = !screenOn;
      await localParticipant.setScreenShareEnabled(next);
      setScreenOn(next);
    } catch (e) {
      console.warn("Failed screen sharing:", e);
      setScreenOn(false);
    }
  };

  // Filter video & screenshare tracks
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ]);

  return (
    <div className="flex-grow flex flex-col min-h-0 relative select-none">
      
      {/* 1. Header Control */}
      <header className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={isRecruiter ? onEndInterview : onLeave}
            className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-750 transition-all"
            title="Leave Session"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h4 className="text-xs font-black text-white">{interview.title}</h4>
            <p className="text-[10px] text-zinc-400 font-bold">
              Round: {interview.round || "Legal Interview"} &middot; {interview.job?.firm_name}
            </p>
          </div>
        </div>

        {/* Info indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black border border-zinc-700/50">
            <Clock size={12} className="text-[#B63106] animate-pulse" />
            <span>{formatDuration(durationSecs)}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black border border-zinc-700/50">
            <Activity size={12} className="text-emerald-500" />
            <span>Connected</span>
          </div>
        </div>
      </header>

      {/* 2. Main content room body */}
      <div className="flex-grow flex min-h-0 relative">
        {/* Video Tiles Grid */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 p-4 min-h-0 bg-zinc-950 overflow-y-auto">
          {tracks.map((trackRef) => {
            const isLocal = trackRef.participant.identity === localParticipant?.identity;
            const trackPub = trackRef.publication;
            const hasVideo = trackPub && !trackPub.isMuted && trackPub.isSubscribed;
            
            return (
              <div 
                key={trackRef.publication?.trackSid || trackRef.participant.identity}
                className="relative bg-zinc-900 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-md flex items-center justify-center aspect-video md:aspect-auto"
              >
                {hasVideo ? (
                  <VideoTrack 
                    trackRef={trackRef as any}
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-zinc-600 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center font-black text-xl text-zinc-400 border border-zinc-750">
                      {trackRef.participant.name?.charAt(0).toUpperCase() || "P"}
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">{trackRef.participant.name || "Anonymous Participant"}</p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-0.5">Camera Off</p>
                    </div>
                  </div>
                )}

                {/* Participant badge indicator */}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-black border border-zinc-800/60 max-w-[150px] truncate">
                  {trackRef.participant.name} {isLocal && "(You)"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Side Panel Drawer (Participants list or private notes) */}
        {drawerType && (
          <aside className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col z-20 absolute sm:relative right-0 top-0 bottom-0 shadow-2xl sm:shadow-none animate-slide-in">
            {drawerType === "participants" ? (
              <>
                <header className="p-4 border-b border-zinc-800 flex justify-between items-center">
                  <h5 className="text-xs font-black uppercase tracking-wider text-zinc-400">Participants ({participants.length + 1})</h5>
                  <button 
                    onClick={() => setDrawerType(null)}
                    className="text-zinc-500 hover:text-white text-xs font-bold hover:bg-zinc-800 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </header>
                <div className="flex-grow overflow-y-auto p-4 space-y-3.5">
                  {/* Local user */}
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white truncate">{localParticipant?.name || "You"} (You)</span>
                    <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700">Local</span>
                  </div>
                  {/* Remote users */}
                  {participants.map((p) => (
                    <div key={p.sid} className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-300 truncate">{p.name || p.identity}</span>
                      <span className="text-[9px] bg-[#B63106]/15 text-[#B63106] px-2 py-0.5 rounded border border-[#B63106]/20">Active</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <header className="p-4 border-b border-zinc-800 flex justify-between items-center">
                  <h5 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <span>Personal Notes</span>
                    {notesSaving ? (
                      <span className="text-[9px] text-[#B63106] font-bold animate-pulse">Saving...</span>
                    ) : (
                      <span className="text-[9px] text-emerald-500 font-bold">Autosaved</span>
                    )}
                  </h5>
                  <button 
                    onClick={() => setDrawerType(null)}
                    className="text-zinc-500 hover:text-white text-xs font-bold hover:bg-zinc-800 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </header>
                <div className="flex-grow flex flex-col p-4 space-y-3 min-h-0 bg-zinc-900">
                  <textarea
                    value={personalNotes}
                    onChange={(e) => setPersonalNotes(e.target.value)}
                    placeholder="Type personal recruiter notes here. These notes are private, visible only to you, and autosaved in real-time. They will be shown on your scorecard review screen..."
                    className="flex-grow w-full p-3 bg-zinc-950 border border-zinc-850 rounded-2xl outline-none focus:border-[#B63106] text-xs font-medium text-white leading-relaxed resize-none"
                  />
                  <p className="text-[10px] text-zinc-500 leading-normal font-semibold">
                    * Candidate cannot view these notes. They are fetched automatically on your scorecard review.
                  </p>
                </div>
              </>
            )}
          </aside>
        )}
      </div>

      {/* 3. Bottom Controls Panel Bar (Responsive touch targets) */}
      <footer className="bg-zinc-900 border-t border-zinc-800 px-4 py-4 sm:py-5 flex flex-col sm:flex-row gap-4 justify-between items-center z-10">
        
        {/* Toggle drawers */}
        <div className="flex items-center gap-2 self-start sm:self-center order-2 sm:order-1 flex-wrap">
          <button 
            onClick={() => setDrawerType(drawerType === "participants" ? null : "participants")}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
              drawerType === "participants" 
                ? "bg-zinc-800 text-white border-zinc-700" 
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            <Users size={16} />
            <span className="hidden sm:inline">Participants</span>
            <span className="px-1.5 py-0.5 bg-zinc-950 rounded text-[9px] font-black">
              {participants.length + 1}
            </span>
          </button>

          {isRecruiter && (
            <button 
              onClick={() => setDrawerType(drawerType === "notes" ? null : "notes")}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-center gap-1.5 text-xs font-bold ${
                drawerType === "notes" 
                  ? "bg-[#B63106]/20 text-[#B63106] border-[#B63106]/30" 
                  : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Notebook size={16} />
              <span>Private Notes</span>
            </button>
          )}
        </div>

        {/* Core Audio/Video/Screen buttons (48px Touch Targets for Mobile) */}
        <div className="flex items-center gap-3 sm:gap-4 order-1 sm:order-2">
          <button 
            onClick={toggleMic}
            className={`w-12 h-12 rounded-2xl cursor-pointer transition-all flex items-center justify-center shadow-md ${
              micOn 
                ? "bg-zinc-850 text-white hover:bg-zinc-750 border border-zinc-800" 
                : "bg-red-600 text-white hover:bg-red-500 border border-red-500"
            }`}
            title={micOn ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          
          <button 
            onClick={toggleCam}
            className={`w-12 h-12 rounded-2xl cursor-pointer transition-all flex items-center justify-center shadow-md ${
              camOn 
                ? "bg-zinc-850 text-white hover:bg-zinc-750 border border-zinc-800" 
                : "bg-red-600 text-white hover:bg-red-500 border border-red-500"
            }`}
            title={camOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {camOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>

          <button 
            onClick={toggleScreen}
            className={`w-12 h-12 rounded-2xl cursor-pointer transition-all flex items-center justify-center shadow-md ${
              screenOn 
                ? "bg-[#B63106] text-white hover:bg-[#932604] border border-[#B63106]" 
                : "bg-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-750 border border-zinc-800"
            }`}
            title={screenOn ? "Stop Screen Share" : "Share Screen"}
          >
            <Monitor size={18} />
          </button>
        </div>

        {/* End / Disconnect Call actions (Mobile Friendly Button) */}
        <div className="flex items-center gap-2 w-full sm:w-auto order-3 select-none">
          {isRecruiter ? (
            <button 
              onClick={onEndInterview}
              className="w-full sm:w-auto px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer h-12"
            >
              <PhoneOff size={16} /> End Interview
            </button>
          ) : (
            <button 
              onClick={onLeave}
              className="w-full sm:w-auto px-5 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer h-12"
            >
              <PhoneOff size={16} /> Leave Room
            </button>
          )}
        </div>

      </footer>

    </div>
  );
}
