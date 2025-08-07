import { createClient } from "@/utils/supabase/client";

// Helper function to decode base64 to Uint8Array for file upload
function decode(base64String: string): Uint8Array {
  const binaryString = atob(base64String);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  template_id: string;
  theme_id: string;
  is_public: boolean;
  personal_info: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  custom_sections: CustomSection[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  summary: string;
  photo?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  description: string;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  startDate: string;
  endDate: string;
  url?: string;
  github?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  preview_image: string | null;
  has_photo: boolean;
  layout_type: string;
  is_premium: boolean;
  sort_order: number;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  is_premium: boolean;
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: "free" | "pro" | "premium";
  status: "active" | "canceled" | "expired";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

class ResumeService {
  private supabase = createClient();

  // Resume CRUD operations
  async createResume(
    resumeData: Omit<
      Resume,
      "id" | "created_at" | "updated_at" | "view_count" | "slug"
    >
  ): Promise<Resume> {
    // Process profile photo if it exists
    let photoUrl = null;
    if (
      resumeData.personal_info?.photo &&
      resumeData.personal_info.photo.startsWith("data:image")
    ) {
      try {
        // Remove the data URL prefix and convert to binary
        const base64Data = resumeData.personal_info.photo.split(",")[1];
        const fileName = `${resumeData.user_id}_${Date.now()}.jpg`;

        // Upload to Supabase storage
        const { error: uploadError } = await this.supabase.storage
          .from("profileimg")
          .upload(fileName, decode(base64Data), {
            contentType: "image/jpeg",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = this.supabase.storage
          .from("profileimg")
          .getPublicUrl(fileName);

        photoUrl = urlData.publicUrl;

        // Update personal_info with the URL instead of base64
        resumeData.personal_info.photo = photoUrl;
      } catch (error) {
        console.error("Error uploading profile image:", error);
        // Remove the photo data if upload fails to prevent large data in database
        delete resumeData.personal_info.photo;
      }
    }

    // Generate unique slug
    const { data: slugData, error: slugError } = await this.supabase.rpc(
      "generate_unique_slug",
      {
        base_title: resumeData.title,
        user_id_param: resumeData.user_id,
      }
    );

    if (slugError) throw slugError;

    const { data, error } = await this.supabase
      .from("resumes")
      .insert({
        ...resumeData,
        slug: slugData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getResume(id: string): Promise<Resume> {
    const { data, error } = await this.supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  async getResumeBySlug(slug: string): Promise<Resume> {
    const { data, error } = await this.supabase
      .from("resumes")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    const { data, error } = await this.supabase
      .from("resumes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async getPublicResumes(limit = 10, offset = 0): Promise<Resume[]> {
    const { data, error } = await this.supabase
      .from("resumes")
      .select("*")
      .eq("is_public", true)
      .order("view_count", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async getPublicResume(slug: string): Promise<Resume> {
    const { data, error } = await this.supabase
      .from("resumes")
      .select("*")
      .eq("slug", slug)
      .eq("is_public", true)
      .single();

    if (error) throw error;

    // Increment view count
    await this.supabase
      .from("resumes")
      .update({ view_count: data.view_count + 1 })
      .eq("id", data.id);

    return data;
  }

  async updateResume(id: string, updates: Partial<Resume>): Promise<Resume> {
    const { data, error } = await this.supabase
      .from("resumes")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteResume(id: string): Promise<void> {
    const { error } = await this.supabase.from("resumes").delete().eq("id", id);

    if (error) throw error;
  }

  async incrementViewCount(id: string): Promise<void> {
    // Update the basic view count in the resume table
    const { error } = await this.supabase.rpc("increment_resume_view_count", {
      resume_id_param: id,
    });

    if (error) throw error;

    // Also track detailed analytics
    await this.trackResumeView(id);
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from("templates")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    return data;
  }

  // Theme operations
  async getThemes(): Promise<Theme[]> {
    const { data, error } = await this.supabase
      .from("themes")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    return data;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(
    userId: string,
    updates: Partial<Profile>
  ): Promise<Profile> {
    const { data, error } = await this.supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Saved resumes operations
  async saveResume(userId: string, resumeId: string): Promise<void> {
    const { error } = await this.supabase.from("saved_resumes").insert({
      user_id: userId,
      resume_id: resumeId,
    });

    if (error) throw error;
  }

  async unsaveResume(userId: string, resumeId: string): Promise<void> {
    const { error } = await this.supabase
      .from("saved_resumes")
      .delete()
      .eq("user_id", userId)
      .eq("resume_id", resumeId);

    if (error) throw error;
  }

  async getSavedResumes(userId: string): Promise<Resume[]> {
    // First get the saved resume IDs
    const { data: savedData, error: savedError } = await this.supabase
      .from("saved_resumes")
      .select("resume_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (savedError) throw savedError;
    if (!savedData || savedData.length === 0) return [];

    // Then get the actual resumes
    const resumeIds = savedData.map((item) => item.resume_id);
    const { data, error } = await this.supabase
      .from("resumes")
      .select("*")
      .in("id", resumeIds)
      .eq("is_public", true); // Only return public resumes that can be saved

    if (error) throw error;
    return data || [];
  }

  // Analytics operations
  async getResumeAnalytics(resumeId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get view analytics
    const { data: viewData, error: viewError } = await this.supabase
      .from("resume_views")
      .select("*")
      .eq("resume_id", resumeId)
      .gte("viewed_at", startDate.toISOString())
      .order("viewed_at", { ascending: false });

    // If the table doesn't exist or there's an error, return empty data
    if (viewError) {
      console.error("Error fetching view data:", viewError);
      // Continue with empty view data instead of throwing
    }

    // Get interaction analytics
    const { data: interactionData, error: interactionError } =
      await this.supabase
        .from("resume_interactions")
        .select("*")
        .eq("resume_id", resumeId)
        .gte("clicked_at", startDate.toISOString())
        .order("clicked_at", { ascending: false });

    // If the table doesn't exist or there's an error, return empty data
    if (interactionError) {
      console.error("Error fetching interaction data:", interactionError);
      // Continue with empty interaction data instead of throwing
    }

    // Ensure we have arrays even if the queries failed
    const safeViewData = viewData || [];
    const safeInteractionData = interactionData || [];

    // Get summary analytics
    const viewsByDate = this.groupDataByDate(safeViewData, "viewed_at");
    const interactionsByType = this.groupDataByField(
      safeInteractionData,
      "interaction_type"
    );
    const viewsByCountry = this.groupDataByField(safeViewData, "country");
    const viewsByReferrer = this.groupDataByField(safeViewData, "referrer");

    // Calculate average view duration
    const totalDuration = safeViewData.reduce(
      (sum, view) => sum + (view.view_duration || 0),
      0
    );
    const avgViewDuration =
      safeViewData.length > 0 ? totalDuration / safeViewData.length : 0;

    return {
      views: safeViewData,
      interactions: safeInteractionData,
      summary: {
        totalViews: safeViewData.length,
        totalInteractions: safeInteractionData.length,
        avgViewDuration: Math.round(avgViewDuration),
        viewsByDate,
        interactionsByType,
        viewsByCountry,
        viewsByReferrer,
      },
    };
  }

  // Helper function to group data by date
  private groupDataByDate(data: Record<string, unknown>[], dateField: string) {
    const grouped = data.reduce<Record<string, number>>((acc, item) => {
      const date = new Date(item[dateField] as string).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    }, {});

    // Convert to array for chart
    return Object.entries(grouped)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Helper function to group data by a field
  private groupDataByField(data: Record<string, unknown>[], field: string) {
    const grouped = data.reduce<Record<string, number>>((acc, item) => {
      const typedItem = item as Record<
        string,
        string | number | boolean | null | undefined
      >;
      const value = String(typedItem[field] ?? "Unknown");
      if (!acc[value]) {
        acc[value] = 0;
      }
      acc[value]++;
      return acc;
    }, {});

    // Convert to array for chart
    return Object.entries(grouped).map(([name, count]) => ({
      name,
      count,
    }));
  }

  // Track resume view
  async trackResumeView(resumeId: string): Promise<void> {
    try {
      // Generate a session ID if one doesn't exist
      const sessionId = this.getOrCreateSessionId();

      // Track view using the Edge Function
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-analytics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            resumeId,
            sessionId,
            event: "view",
            userAgent:
              typeof window !== "undefined" ? window.navigator.userAgent : null,
            referrer:
              typeof document !== "undefined" ? document.referrer : null,
          }),
        }
      );
    } catch (error) {
      console.error("Failed to track resume view:", error);
      // Don't throw, as this is not critical to application function
    }
  }

  // Track resume interaction
  async trackResumeInteraction(
    resumeId: string,
    interactionType: string,
    targetValue?: string,
    sectionName?: string
  ): Promise<void> {
    try {
      // Generate a session ID if one doesn't exist
      const sessionId = this.getOrCreateSessionId();

      // Track interaction using the Edge Function
      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-analytics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            resumeId,
            sessionId,
            event: "interaction",
            interactionType,
            targetValue,
            sectionName,
          }),
        }
      );
    } catch (error) {
      console.error("Failed to track resume interaction:", error);
      // Don't throw, as this is not critical to application function
    }
  }

  // Update view duration
  async updateViewDuration(resumeId: string, duration: number): Promise<void> {
    try {
      const sessionId = this.getSessionId();
      if (!sessionId) return;

      await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/track-analytics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            resumeId,
            sessionId,
            event: "view",
            viewDuration: duration,
          }),
        }
      );
    } catch (error) {
      console.error("Failed to update view duration:", error);
    }
  }

  // Helper to get or create session ID
  private getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "server-side";

    let sessionId = this.getSessionId();
    if (!sessionId) {
      sessionId =
        "session_" +
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      localStorage.setItem("verfolia_session_id", sessionId);
    }
    return sessionId;
  }

  // Helper to get session ID
  private getSessionId(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("verfolia_session_id");
  }

  // Search operations
  async searchResumes(
    query: string,
    filters?: {
      template?: string;
      category?: string;
    }
  ): Promise<Resume[]> {
    let queryBuilder = this.supabase
      .from("resumes")
      .select("*")
      .eq("is_public", true)
      .ilike("title", `%${query}%`);

    if (filters?.template) {
      queryBuilder = queryBuilder.eq("template_id", filters.template);
    }

    const { data, error } = await queryBuilder
      .order("view_count", { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  }

  // Subscription operations
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  }

  async createOrUpdateSubscription(
    userId: string,
    subscriptionData: Partial<UserSubscription>
  ): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from("user_subscriptions")
      .upsert({
        user_id: userId,
        ...subscriptionData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const resumeService = new ResumeService();
