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
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  repoUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface Language {
  name: string;
  proficiency: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: {
    id: string;
    title: string;
    description: string;
    date?: string;
  }[];
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
    const { data, error } = await this.supabase
      .from('resumes')
      .insert([resume])
      .select()
      .single();

    if (error) {
      console.error('Error creating resume:', error);
      return null;
    }

    return data;
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

  // Delete resume
  async deleteResume(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting resume:', error);
      return false;
    }

    return true;
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
  async getTemplates(): Promise<any[]> {
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
  async getThemes(): Promise<any[]> {
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

      // Process views data
      const views = viewsData?.map((view: any) => ({
        id: view.id,
        viewed_at: view.viewed_at,
        country: view.country,
        city: view.city,
        view_duration: view.view_duration,
        referrer: view.referrer
      })) || [];

      // Process interactions data
      const interactions = interactionsData?.map((interaction: any) => ({
        id: interaction.id,
        clicked_at: interaction.clicked_at,
        interaction_type: interaction.interaction_type,
        section_name: interaction.section_name,
        target_value: interaction.target_value
      })) || [];

      // Calculate summary data
      const viewsByDate = views.reduce((acc: { [key: string]: number }, view: any) => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const viewsByCountry = views.reduce((acc: { [key: string]: number }, view: any) => {
        if (view.country) {
          acc[view.country] = (acc[view.country] || 0) + 1;
        }
        return acc;
      }, {});

      const viewsByReferrer = views.reduce((acc: { [key: string]: number }, view: any) => {
        if (view.referrer) {
          acc[view.referrer] = (acc[view.referrer] || 0) + 1;
        }
        return acc;
      }, {});

      const interactionsByType = interactions.reduce((acc: { [key: string]: number }, interaction: any) => {
        acc[interaction.interaction_type] = (acc[interaction.interaction_type] || 0) + 1;
        return acc;
      }, {});

      const totalViewDuration = views.reduce((sum: number, view: any) => sum + (view.view_duration || 0), 0);
      const avgViewDuration = views.length > 0 ? totalViewDuration / views.length : 0;

      // Construct and return the AnalyticsData object
      return {
        views,
        interactions,
        summary: {
          totalViews: views.length,
          totalInteractions: interactions.length,
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
