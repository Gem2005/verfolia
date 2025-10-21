import { createClient } from "@/utils/supabase/client";
import { analyticsService } from "./analytics-service";
import { AnalyticsData } from "@/types/analytics";

// Types
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

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  website?: string;
  location?: string;
  summary?: string;
  title?: string;
  photo?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  technologies?: string[];
  location?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
  gpa?: string;
  location?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  liveUrl?: string;
  repoUrl?: string;
  startDate?: string;
  endDate?: string;
  isLocked?: boolean;
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
  items: Array<{
    title?: string;
    subtitle?: string;
    description?: string;
    date?: string;
    location?: string;
    details?: string[];
  }>;
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
  // Uploaded file metadata
  uploaded_file_path?: string;
  uploaded_file_url?: string;
  original_filename?: string;
  file_size_bytes?: number;
  mime_type?: string;
  uploaded_at?: string;
}

class ResumeService {
  private supabase = createClient();

  // Get resume by ID
  async getResumeById(id: string): Promise<Resume | null> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching resume:', error);
      return null;
    }

    return data;
  }

  // Get resume by slug
  async getResumeBySlug(slug: string): Promise<Resume | null> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching resume:', error);
      return null;
    }

    return data;
  }

  // Create resume
  async createResume(resume: Omit<Resume, 'id' | 'created_at' | 'updated_at'>): Promise<Resume | null> {
    const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resume),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating resume:', errorData);
        throw new Error(errorData.error || 'Failed to create resume');
    }

    return await response.json();
  }

  // Update resume
  async updateResume(id: string, resume: Partial<Resume>): Promise<Resume | null> {
    const { data, error } = await this.supabase
      .from('resumes')
      .update(resume)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating resume:', error);
      return null;
    }

    return data;
  }

  // Delete resume from database only (storage deletion handled by API route)
  async deleteResumeFromDB(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('resumes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting resume from database:', error);
        throw new Error(`Failed to delete resume: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('[Resume Service] Error in deleteResumeFromDB:', error);
      return false;
    }
  }

  // Get user's resumes
  async getUserResumes(userId: string): Promise<Resume[]> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching user resumes:', error);
      return [];
    }

    return data || [];
  }

  // Get all available templates
  async getTemplates(): Promise<unknown[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }

    return data || [];
  }

  // Get all available themes
  async getThemes(): Promise<unknown[]> {
    const { data, error } = await this.supabase
      .from('themes')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching themes:', error);
      throw error;
    }

    return data || [];
  }

  // Increment view count for a resume
  async incrementViewCount(resumeId: string): Promise<boolean> {
    const { error } = await this.supabase.rpc('increment_resume_view_count', {
      resume_id: resumeId
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      throw error;
    }

    return true;
  }

  // Get public resumes with pagination
  async getPublicResumes(limit: number = 12, offset: number = 0): Promise<Resume[]> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('is_public', true)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching public resumes:', error);
      return [];
    }

    return data || [];
  }

  // Search public resumes
  async searchResumes(query: string, options?: { template?: string; category?: string }): Promise<Resume[]> {
    let supabaseQuery = this.supabase
      .from('resumes')
      .select('*')
      .eq('is_public', true)
      .textSearch('title', query, { 
        type: 'websearch',
        config: 'english'
      });

    if (options?.template) {
      supabaseQuery = supabaseQuery.eq('template_id', options.template);
    }

    if (options?.category) {
      supabaseQuery = supabaseQuery.eq('category', options.category);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Error searching resumes:', error);
      return [];
    }

    return data || [];
  
  }

    // Get resume analytics
  async getResumeAnalytics(resumeId: string, days: number): Promise<AnalyticsData> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Fetch views
      const { data: viewsData, error: viewsError } = await this.supabase
        .from('resume_views')
        .select('*')
        .eq('resume_id', resumeId)
        .gte('viewed_at', startDate.toISOString());

      if (viewsError) throw viewsError;

      // Fetch interactions
      const { data: interactionsData, error: interactionsError } = await this.supabase
        .from('resume_interactions')
        .select('*')
        .eq('resume_id', resumeId)
        .gte('clicked_at', startDate.toISOString());

      if (interactionsError) throw interactionsError;

      // Define types for database records
      interface ViewRecord {
        id: string;
        viewed_at: string;
        country: string | null;
        city: string | null;
        view_duration: number | null;
        referrer: string | null;
      }

      interface InteractionRecord {
        id: string;
        clicked_at: string;
        interaction_type: string;
        section_name: string | null;
        target_value: string | null;
      }

      // Process views data
      const views = viewsData?.map((view: ViewRecord) => ({
        id: view.id,
        viewed_at: view.viewed_at,
        country: view.country,
        city: view.city,
        view_duration: view.view_duration,
        referrer: view.referrer
      })) || [];

      // Process interactions data
      const interactions = interactionsData?.map((interaction: InteractionRecord) => ({
        id: interaction.id,
        clicked_at: interaction.clicked_at,
        interaction_type: interaction.interaction_type,
        section_name: interaction.section_name,
        target_value: interaction.target_value
      })) || [];

      // Calculate summary data
      const viewsByDate = views.reduce((acc: { [key: string]: number }, view: ViewRecord) => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const viewsByCountry = views.reduce((acc: { [key: string]: number }, view: ViewRecord) => {
        if (view.country) {
          acc[view.country] = (acc[view.country] || 0) + 1;
        }
        return acc;
      }, {});

      const viewsByReferrer = views.reduce((acc: { [key: string]: number }, view: ViewRecord) => {
        if (view.referrer) {
          acc[view.referrer] = (acc[view.referrer] || 0) + 1;
        }
        return acc;
      }, {});

      const interactionsByType = interactions.reduce((acc: { [key: string]: number }, interaction: InteractionRecord) => {
        // Skip section_view_duration as it's only for duration chart
        if (interaction.interaction_type === 'section_view_duration') {
          return acc;
        }
        
        // For section_view and section_click, use section name; for others, use interaction type
        let key: string;
        if ((interaction.interaction_type === 'section_view' || interaction.interaction_type === 'section_click') && interaction.section_name) {
          // Remove "custom_" prefix from section names and capitalize
          key = interaction.section_name
            .replace(/^custom_/i, '')
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        } else {
          key = interaction.interaction_type;
        }
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const totalViewDuration = views.reduce((sum: number, view: ViewRecord) => sum + (view.view_duration || 0), 0);
      const viewsWithDuration = views.filter((view: ViewRecord) => view.view_duration && view.view_duration > 0).length;
      const avgViewDuration = viewsWithDuration > 0 ? totalViewDuration / viewsWithDuration : 0;

      // Count total interactions excluding section_view_duration
      const totalInteractions = interactions.filter(
        (i: InteractionRecord) => i.interaction_type !== 'section_view_duration'
      ).length;

      // Construct and return the AnalyticsData object
      return {
        views,
        interactions,
        summary: {
          totalViews: views.length,
          totalInteractions,
          avgViewDuration,
          viewsByDate: Object.entries(viewsByDate).map(([date, count]) => ({ date, count: count as number })),
          interactionsByType: Object.entries(interactionsByType).map(([name, count]) => ({ name, count: count as number })),
          viewsByCountry: Object.entries(viewsByCountry).map(([name, count]) => ({ name, count: count as number })),
          viewsByReferrer: Object.entries(viewsByReferrer).map(([name, count]) => ({ name, count: count as number }))
        }
      };
    } catch (error) {
      console.error('Error fetching resume analytics:', error);
      throw error;
    }
  }

  // Analytics methods delegated to analyticsService
  async trackResumeView(resumeId: string): Promise<void> {
    return analyticsService.trackResumeView(resumeId);
  }

  async trackResumeInteraction(
    resumeId: string,
    interactionType: string,
    targetValue?: string,
    sectionName?: string
  ): Promise<void> {
    return analyticsService.trackResumeInteraction(
      resumeId,
      interactionType,
      targetValue,
      sectionName
    );
  }

  async updateViewDuration(resumeId: string, duration: number): Promise<void> {
    return analyticsService.updateViewDuration(resumeId, duration);
  }
}

// Export a singleton instance
export const resumeService = new ResumeService();
