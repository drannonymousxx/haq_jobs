/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string.
 */
export function generateICSString(params: {
  id: string;
  title: string;
  scheduledAt: string; // ISO string
  duration: string; // e.g. "30 minutes" or "1 hour"
  type: "online" | "offline" | "phone";
  meetingLink?: string;
  location?: string;
  notes?: string;
  recruiterName: string;
  recruiterEmail: string;
  candidateName: string;
  candidateEmail: string;
}): string {
  const startDate = new Date(params.scheduledAt);
  
  // Parse duration
  let durationMins = 30; // default fallback
  const durationStr = params.duration.toLowerCase();
  if (durationStr.includes("hour")) {
    const match = durationStr.match(/(\d+)/);
    if (match) durationMins = parseInt(match[1]) * 60;
  } else {
    const match = durationStr.match(/(\d+)/);
    if (match) durationMins = parseInt(match[1]);
  }
  
  const endDate = new Date(startDate.getTime() + durationMins * 60 * 1000);
  
  const formatICSDate = (d: Date): string => {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const h = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    const s = String(d.getUTCSeconds()).padStart(2, '0');
    return `${y}${m}${day}T${h}${min}${s}Z`;
  };

  const dtStamp = formatICSDate(new Date());
  const dtStart = formatICSDate(startDate);
  const dtEnd = formatICSDate(endDate);

  const cleanText = (str: string) => {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
      .replace(/\n/g, "\\n");
  };

  let eventLocation = "";
  if (params.type === "online") {
    eventLocation = params.meetingLink || "HAQJobs Live Interview Room";
  } else if (params.type === "offline") {
    eventLocation = params.location || "Office Location";
  } else {
    eventLocation = "Phone Call";
  }

  const descriptionParts = [
    `Interview Round: ${params.title}`,
    `Recruiter: ${params.recruiterName}`,
    `Candidate: ${params.candidateName}`,
    params.notes ? `Notes: ${params.notes}` : "",
  ].filter(Boolean);

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//HAQJobs//Interview Scheduler//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${params.id}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `ORGANIZER;CN="${cleanText(params.recruiterName)}":MAILTO:${params.recruiterEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${cleanText(params.candidateName)}":MAILTO:${params.candidateEmail}`,
    `SUMMARY:${cleanText(params.title)}`,
    `DESCRIPTION:${cleanText(descriptionParts.join("\\n"))}`,
    `LOCATION:${cleanText(eventLocation)}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR"
  ];

  return icsLines.join("\r\n");
}

/**
 * Returns a base64 encoded Data URI for client-side download/attachment.
 */
export function generateICSDataURI(params: Parameters<typeof generateICSString>[0]): string {
  const icsString = generateICSString(params);
  // Using modern browser compatibility format
  const base64 = typeof window !== 'undefined' 
    ? btoa(unescape(encodeURIComponent(icsString)))
    : Buffer.from(icsString).toString('base64');
  return `data:text/calendar;charset=utf-8;base64,${base64}`;
}
