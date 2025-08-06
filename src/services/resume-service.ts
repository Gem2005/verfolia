import { createClient } from '@/utils/supabase/client';

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
  profiles?: Profile;
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
  plan_type: 'free' | 'pro' | 'premium';
  status: 'active' | 'canceled' | 'expired';
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
  async createResume(resumeData: Omit<Resume, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'slug'>): Promise<Resume> {
    // Generate unique slug
    const { data: slugData, error: slugError } = await this.supabase
      .rpc('generate_unique_slug', { 
        base_title: resumeData.title, 
        user_id_param: resumeData.user_id 
      });

    if (slugError) throw slugError;

    const { data, error } = await this.supabase
      .from('resumes')
      .insert({
        ...resumeData,
        slug: slugData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getResume(id: string): Promise<Resume> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async getResumeBySlug(slug: string): Promise<Resume> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getPublicResumes(limit = 10, offset = 0): Promise<Resume[]> {
    const { data, error } = await this.supabase
      .from('resumes')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('view_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data;
  }

  async updateResume(id: string, updates: Partial<Resume>): Promise<Resume> {
    const { data, error } = await this.supabase
      .from('resumes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteResume(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async incrementViewCount(id: string): Promise<void> {
    const { error } = await this.supabase
      .rpc('increment_resume_view_count', { resume_id_param: id });

    if (error) throw error;
  }

  // Template operations
  async getTemplates(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data;
  }

  // Theme operations
  async getThemes(): Promise<Theme[]> {
    const { data, error } = await this.supabase
      .from('themes')
      .select('*')
      .order('sort_order');

    if (error) throw error;
    return data;
  }

  // Profile operations
  async getProfile(userId: string): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Saved resumes operations
  async saveResume(userId: string, resumeId: string): Promise<void> {
    const { error } = await this.supabase
      .from('saved_resumes')
      .insert({
        user_id: userId,
        resume_id: resumeId
      });

    if (error) throw error;
  }

  async unsaveResume(userId: string, resumeId: string): Promise<void> {
    const { error } = await this.supabase
      .from('saved_resumes')
      .delete()
      .eq('user_id', userId)
      .eq('resume_id', resumeId);

    if (error) throw error;
  }

  async getSavedResumes(userId: string): Promise<Resume[]> {
    // First get the saved resume IDs
    const { data: savedData, error: savedError } = await this.supabase
      .from('saved_resumes')
      .select('resume_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (savedError) throw savedError;
    if (!savedData || savedData.length === 0) return [];

    // Then get the actual resumes
    const resumeIds = savedData.map(item => item.resume_id);
    const { data, error } = await this.supabase
      .from('resumes')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .in('id', resumeIds)
      .eq('is_public', true); // Only return public resumes that can be saved

    if (error) throw error;
    return data || [];
  }

  // Analytics operations
  async getResumeAnalytics(resumeId: string, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('resume_analytics')
      .select('*')
      .eq('resume_id', resumeId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Search operations
  async searchResumes(query: string, filters?: {
    template?: string;
    category?: string;
  }): Promise<Resume[]> {
    let queryBuilder = this.supabase
      .from('resumes')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .ilike('title', `%${query}%`);

    if (filters?.template) {
      queryBuilder = queryBuilder.eq('template_id', filters.template);
    }

    const { data, error } = await queryBuilder
      .order('view_count', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data;
  }

  // Subscription operations
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createOrUpdateSubscription(userId: string, subscriptionData: Partial<UserSubscription>): Promise<UserSubscription> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .upsert({
        user_id: userId,
        ...subscriptionData
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const resumeService = new ResumeService();
