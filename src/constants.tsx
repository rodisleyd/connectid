
import { TemplateType, BusinessCard } from './types';

export const DEFAULT_CARD_STYLE = {
  primaryColor: '#6366f1', // Indigo 500
  secondaryColor: '#1e293b', // Slate 800
  fontFamily: 'Inter',
  borderRadius: '12px'
};

export const INITIAL_CARD_DATA: BusinessCard = {
  id: 'temp-id',
  userId: 'temp-user',
  active: true,
  name: 'Seu Nome',
  role: 'Seu Cargo',
  company: 'Sua Empresa',
  bio: 'Uma breve descrição sobre você e suas habilidades.',
  avatar: 'https://picsum.photos/200',
  phone: '+55 11 99999-9999',
  whatsapp: '5511999999999',
  email: 'seuemail@exemplo.com',
  website: 'www.seusite.com.br',
  address: 'São Paulo, Brasil',
  socialLinks: [
    { id: '1', platform: 'LinkedIn', url: 'https://linkedin.com/in/username' },
    { id: '2', platform: 'Instagram', url: 'https://instagram.com/username' }
  ],
  template: TemplateType.PROFESSIONAL,
  style: DEFAULT_CARD_STYLE,
  analytics: {
    views: 0,
    whatsappClicks: 0,
    linkClicks: 0,
    lastUpdated: new Date().toISOString()
  },
  createdAt: new Date().toISOString(),
  portfolio: [],
  ctaButtons: [],
  animationSettings: {
    entrance: 'fade-in',
    hover: 'scale'
  }
};

export const TEMPLATE_CONFIGS = {
  [TemplateType.PROFESSIONAL]: {
    name: 'Profissional',
    description: 'Design sóbrio e estruturado para networking corporativo.',
    bgColor: 'bg-white',
    accentColor: 'indigo'
  },
  [TemplateType.CREATIVE]: {
    name: 'Criativo',
    description: 'Cores vibrantes e layouts dinâmicos.',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    accentColor: 'pink'
  },
  [TemplateType.MINIMALIST]: {
    name: 'Minimalista',
    description: 'Foco total na informação com tipografia limpa.',
    bgColor: 'bg-gray-50',
    accentColor: 'slate'
  },
  [TemplateType.CORPORATE]: {
    name: 'Corporativo',
    description: 'Elegância e confiança para marcas estabelecidas.',
    bgColor: 'bg-slate-900',
    accentColor: 'blue'
  },
  [TemplateType.ARTISTIC]: {
    name: 'Artístico',
    description: 'Layout expressivo com elementos visuais únicos.',
    bgColor: 'bg-amber-50',
    accentColor: 'orange'
  }
};

export const DEVICES: import('./types').Device[] = [
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', width: 440, height: 956, type: 'phone', scale: 1 },
  { id: 'iphone-16', name: 'iPhone 16', width: 393, height: 852, type: 'phone', scale: 1 },
  { id: 'iphone-14', name: 'iPhone 14', width: 390, height: 844, type: 'phone', scale: 1 },
  { id: 'android-medium', name: 'Android Medium', width: 360, height: 800, type: 'phone', scale: 1 },
  { id: 'android-compact', name: 'Android Compact', width: 320, height: 700, type: 'phone', scale: 1 },
  { id: 'ipad-mini', name: 'iPad Mini 8.3', width: 744, height: 1133, type: 'tablet', scale: 0.6 },
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', width: 834, height: 1194, type: 'tablet', scale: 0.5 },
];
