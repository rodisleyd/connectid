
export enum TemplateType {
  PROFESSIONAL = 'professional',
  CREATIVE = 'creative',
  MINIMALIST = 'minimalist',
  CORPORATE = 'corporate',
  ARTISTIC = 'artistic'
}

export interface SocialLink {
  platform: string;
  url: string;
  id: string;
}

export interface CardStyle {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
}

export interface CardAnalytics {
  views: number;
  whatsappClicks: number;
  linkClicks: number;
  lastUpdated: string;
}

export interface BusinessCard {
  id: string;
  active: boolean;
  name: string;
  role: string;
  company: string;
  bio: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  address: string;
  socialLinks: SocialLink[];
  template: TemplateType;
  style: CardStyle;
  analytics: CardAnalytics;
  createdAt: string;
  portfolio: PortfolioItem[];
  ctaButtons: CtaButton[];
  animationSettings: {
    entrance: string;
    hover: string;
  };
}

export interface PortfolioItem {
  id: string;
  type: 'image' | 'video' | 'link';
  url: string;
  title?: string;
  description?: string;
  imageFit?: 'cover' | 'contain';
}

export interface CtaButton {
  id: string;
  label: string;
  actionType: 'whatsapp' | 'link' | 'email' | 'schedule';
  value: string;
  primary: boolean;
}

export interface Device {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'phone' | 'tablet' | 'desktop';
  scale: number;
}

export type ViewState = 'dashboard' | 'editor' | 'preview' | 'analytics' | 'profile';
