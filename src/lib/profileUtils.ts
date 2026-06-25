export interface ChecklistItem {
  key: string;
  name: string;
  weight: number;
  completed: boolean;
  tab: string;
}

export interface ProfileStrengthResult {
  score: number;
  label: "Basic Profile" | "Developing Profile" | "Strong Profile" | "Verified Strong Profile";
  checklist: ChecklistItem[];
}

export function calculateProfileStrength(
  profile: any,
  experiences: any[] = [],
  educations: any[] = [],
  skills: any[] = [],
  reviewsCount: number = 0,
  recommendationsCount: number = 0
): ProfileStrengthResult {
  const checklist: ChecklistItem[] = [
    {
      key: "photo",
      name: "Upload Profile Photo",
      weight: 5,
      completed: !!(profile?.profile_photo_url && profile.profile_photo_url.trim()),
      tab: "personal"
    },
    {
      key: "bio",
      name: "Add Bio / About Yourself",
      weight: 10,
      completed: !!(profile?.bio && profile.bio.trim()),
      tab: "personal"
    },
    {
      key: "career_preferences",
      name: "Select Career Preferences",
      weight: 5,
      completed: Array.isArray(profile?.career_preferences) && profile.career_preferences.length > 0,
      tab: "preferences"
    },
    {
      key: "legal_domains",
      name: "Add Legal Specializations",
      weight: 5,
      completed: Array.isArray(profile?.legal_specializations) && profile.legal_specializations.length > 0,
      tab: "preferences"
    },
    {
      key: "education",
      name: "Complete Education Details",
      weight: 15,
      completed: educations.length > 0,
      tab: "education"
    },
    {
      key: "experience",
      name: "Add Professional Experience",
      weight: 20,
      completed: experiences.length > 0,
      tab: "experience"
    },
    {
      key: "skills",
      name: "Add Skills Tags",
      weight: 5,
      completed: skills.length > 0,
      tab: "skills"
    },
    {
      key: "resume",
      name: "Upload Resume / CV",
      weight: 10,
      completed: !!(profile?.resume_url && profile.resume_url.trim()),
      tab: "documents"
    },
    {
      key: "bar_enrollment",
      name: "Add Bar Enrollment Details",
      weight: 15,
      completed: !!(profile?.bar_enrollment_number && profile.bar_enrollment_number.trim()),
      tab: "verification"
    },
    {
      key: "contact_number",
      name: "Add Contact Number",
      weight: 10,
      completed: !!(profile?.contact_number && profile.contact_number.trim()),
      tab: "personal"
    },
    {
      key: "reviews_recs",
      name: "Receive Reviews or Recommendations",
      weight: 10,
      completed: (reviewsCount + recommendationsCount) > 0,
      tab: "reviews"
    }
  ];

  // Sum weights of completed items
  const score = checklist.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);

  let label: ProfileStrengthResult["label"] = "Basic Profile";
  if (score >= 86) {
    label = "Verified Strong Profile";
  } else if (score >= 61) {
    label = "Strong Profile";
  } else if (score >= 26) {
    label = "Developing Profile";
  }

  return {
    score,
    label,
    checklist
  };
}

export interface RecruiterChecklistItem {
  key: string;
  name: string;
  weight: number;
  completed: boolean;
  tab: string;
}

export interface RecruiterStrengthResult {
  score: number;
  label: "Basic" | "Growing" | "Professional" | "Verified Recruiter";
  checklist: RecruiterChecklistItem[];
}

export function calculateRecruiterStrength(profile: any): RecruiterStrengthResult {
  const checklist: RecruiterChecklistItem[] = [
    {
      key: "photo",
      name: "Upload Recruiter Photo",
      weight: 5,
      completed: !!(profile?.profile_photo_url && profile.profile_photo_url.trim()),
      tab: "personal"
    },
    {
      key: "logo",
      name: "Upload Firm Logo",
      weight: 10,
      completed: !!(profile?.firm_logo_url && profile.firm_logo_url.trim()),
      tab: "company"
    },
    {
      key: "designation",
      name: "Add Designation",
      weight: 5,
      completed: !!(profile?.designation && profile.designation.trim()),
      tab: "personal"
    },
    {
      key: "firm_name",
      name: "Add Firm Name",
      weight: 10,
      completed: !!(profile?.company_name && profile.company_name.trim()),
      tab: "company"
    },
    {
      key: "website",
      name: "Add Company Website",
      weight: 10,
      completed: !!(profile?.company_website && profile.company_website.trim()),
      tab: "company"
    },
    {
      key: "linkedin",
      name: "Add LinkedIn URL",
      weight: 5,
      completed: !!(profile?.linkedin_url && profile.linkedin_url.trim()),
      tab: "company"
    },
    {
      key: "address",
      name: "Add Office Address",
      weight: 10,
      completed: !!(profile?.office_address && profile.office_address.trim()),
      tab: "company"
    },
    {
      key: "founded",
      name: "Add Founded Year",
      weight: 10,
      completed: !!profile?.founded_year,
      tab: "company"
    },
    {
      key: "team_size",
      name: "Add Team Size",
      weight: 10,
      completed: !!(profile?.team_size && profile.team_size.trim()),
      tab: "company"
    },
    {
      key: "description",
      name: "Add Company Description",
      weight: 15,
      completed: !!(profile?.about_company && profile.about_company.trim()),
      tab: "company"
    },
    {
      key: "verification",
      name: "Verification Info (Reg/GST/Domain)",
      weight: 10,
      completed: !!(
        (profile?.company_reg_number && profile.company_reg_number.trim()) ||
        (profile?.gst_number && profile.gst_number.trim()) ||
        (profile?.official_email_domain && profile.official_email_domain.trim())
      ),
      tab: "verification"
    }
  ];

  const score = checklist.reduce((sum, item) => sum + (item.completed ? item.weight : 0), 0);

  let label: RecruiterStrengthResult["label"] = "Basic";
  if (score >= 90) {
    label = "Verified Recruiter";
  } else if (score >= 70) {
    label = "Professional";
  } else if (score >= 40) {
    label = "Growing";
  }

  return {
    score,
    label,
    checklist
  };
}

