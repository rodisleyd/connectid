
import React, { useState, useEffect } from 'react';
import { BusinessCard, TemplateType, Device } from '../types';
import { Phone, Mail, Globe, MapPin, Share2, UserPlus, Linkedin, Instagram, Facebook, Twitter, Link as LinkIcon, MessageCircle, User } from 'lucide-react';

interface CardPreviewProps {
  card: BusinessCard;
  onAction?: (action: string) => void;
  isMockup?: boolean;
  device?: Device;
}

const OptimizedImage: React.FC<{ src: string; alt: string; className?: string }> = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div className={`relative w-full h-full bg-slate-100 flex items-center justify-center overflow-hidden ${className}`}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
          <User className="text-slate-400" size={40} />
        </div>
      )}
      {error ? (
        <div className="flex items-center justify-center w-full h-full bg-slate-200 text-slate-400">
          <User size={40} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};

const CardPreview: React.FC<CardPreviewProps> = ({ card, onAction, isMockup = false, device }) => {
  const { template, style, name, role, company, bio, avatar, phone, email, website, address, socialLinks, whatsapp } = card;

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return <Linkedin size={20} />;
      case 'instagram': return <Instagram size={20} />;
      case 'facebook': return <Facebook size={20} />;
      case 'twitter': case 'x': return <Twitter size={20} />;
      default: return <LinkIcon size={20} />;
    }
  };

  const containerStyles = `
    ${isMockup ? '' : 'w-full max-w-sm min-h-[600px] rounded-3xl'}
    ${isMockup ? 'rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative flex flex-col' : 'mx-auto shadow-2xl overflow-hidden relative flex flex-col'}
    ${template === TemplateType.CORPORATE ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}
  `;

  return (
    <div
      className={containerStyles}
      style={isMockup && device ? { width: `${device.width}px`, height: `${device.height}px` } : undefined}
    >
      <div className={`w-full h-full flex flex-col ${isMockup ? 'overflow-y-auto no-scrollbar pt-12 pb-8' : ''} bg-inherit`}>
        {/* Header / Cover Image */}
        <div
          className="h-32 w-full relative shrink-0"
          style={{ backgroundColor: style.primaryColor }}
        >
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
              <OptimizedImage src={avatar} alt={name} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-20 px-6 pb-8 flex-1 flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-sm font-medium opacity-80 mt-1 uppercase tracking-wider">{role}</p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: style.primaryColor }}>{company}</p>

          <p className="mt-4 text-sm leading-relaxed opacity-90 max-w-xs">{bio}</p>

          {/* Action Buttons */}
          <div className="mt-8 w-full space-y-3">
            <button
              className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-transform active:scale-95 shadow-md"
              style={{ backgroundColor: style.primaryColor, color: 'white' }}
              onClick={() => onAction?.('save')}
            >
              <UserPlus size={18} />
              Salvar Contato
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="py-3 px-4 rounded-xl border-2 flex items-center justify-center gap-2 font-medium transition-colors"
                style={{ borderColor: style.primaryColor, color: style.primaryColor }}
                onClick={() => onAction?.('share')}
              >
                <Share2 size={18} />
                Compartilhar
              </button>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium bg-green-500 text-white shadow-md"
                onClick={() => onAction?.('whatsapp')}
              >
                <MessageCircle size={18} />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Info List */}
          <div className="mt-8 w-full space-y-4 text-left">
            <a href={`tel:${phone}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors group">
              <div className="p-2 rounded-full bg-slate-100 group-hover:bg-white text-slate-600 transition-colors">
                <Phone size={16} />
              </div>
              <span className="text-sm font-medium">{phone}</span>
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors group">
              <div className="p-2 rounded-full bg-slate-100 group-hover:bg-white text-slate-600 transition-colors">
                <Mail size={16} />
              </div>
              <span className="text-sm font-medium">{email}</span>
            </a>
            {website && (
              <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors group">
                <div className="p-2 rounded-full bg-slate-100 group-hover:bg-white text-slate-600 transition-colors">
                  <Globe size={16} />
                </div>
                <span className="text-sm font-medium">{website.replace('https://', '').replace('http://', '')}</span>
              </a>
            )}
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors group">
              <div className="p-2 rounded-full bg-slate-100 group-hover:bg-white text-slate-600 transition-colors">
                <MapPin size={16} />
              </div>
              <span className="text-sm font-medium">{address}</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title={link.platform}
              >
                {renderSocialIcon(link.platform)}
              </a>
            ))}
          </div>
        </div>

        {/* Footer Branding */}
        <div className="pb-6 text-center">
          <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Criado com ConnectID</p>
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
