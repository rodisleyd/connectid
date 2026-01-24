
import React, { useState, useEffect } from 'react';
import { BusinessCard, TemplateType, Device } from '../types';
import { Phone, Mail, Globe, MapPin, Share2, UserPlus, Linkedin, Instagram, Facebook, Twitter, Link as LinkIcon, MessageCircle, User, Play, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface CardPreviewProps {
  card: BusinessCard;
  onAction?: (action: string) => void;
  isMockup?: boolean;
  device?: Device;
}



const CardPreview: React.FC<CardPreviewProps> = ({ card, onAction, isMockup = false, device }) => {
  const { template, style, name, role, company, bio, avatar, phone, email, website, address, socialLinks, whatsapp } = card;

  const renderSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return <Linkedin size={20} />;
      case 'instagram': return <Instagram size={20} />;

      default: return <LinkIcon size={20} />;
    }
  };

  const WhatsappLogo = () => (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="0"
      fill="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const containerStyles = `
    ${isMockup ? '' : 'w-full max-w-sm min-h-[600px]'}
    ${isMockup ? 'rounded-[40px] border-[8px] border-slate-800 shadow-2xl overflow-hidden relative flex flex-col' : 'mx-auto shadow-2xl overflow-hidden relative flex flex-col'}
    ${template === TemplateType.CORPORATE ? 'bg-slate-900 text-white' : ''}
    ${template === 'minimalist' ? 'bg-white text-slate-800 font-light' : ''}
    ${template === 'creative' ? 'bg-gradient-to-br from-white to-slate-100 text-slate-900 border-4' : ''}
    ${template === 'artistic' ? 'text-slate-900 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")]' : ''}
    ${(template !== TemplateType.CORPORATE && template !== 'minimalist' && template !== 'creative' && template !== 'artistic') ? 'bg-white text-slate-900' : ''}
  `;

  return (
    <div
      className={containerStyles}
      style={isMockup && device ? { width: `${device.width}px`, height: `${device.height}px` } : undefined}
    >
      <div className={`w-full h-full flex flex-col ${isMockup ? 'overflow-y-auto no-scrollbar pt-12 pb-8' : ''} bg-inherit`}>
        {/* Header / Cover Image */}
        <div
          className={`h-32 w-full relative shrink-0 ${template === 'minimalist' ? 'h-24 opacity-20' : ''} ${template === 'creative' ? 'h-40 clip-path-slant' : ''}`}
          style={{
            backgroundColor: style.primaryColor,
            backgroundImage: template === 'artistic' ? `linear-gradient(45deg, ${style.primaryColor}, ${style.secondaryColor})` : undefined
          }}
        >
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <div className={`w-32 h-32 overflow-hidden shadow-lg bg-white flex items-center justify-center bg-slate-200 ${template === 'minimalist' ? 'border-2' : 'border-4 border-white'}`} style={{ borderRadius: style.borderRadius }}>
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User size={64} className="text-slate-400" />
              )}
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
              className="w-full py-3 px-4 flex items-center justify-center gap-2 font-semibold transition-transform active:scale-95 shadow-md"
              style={{ backgroundColor: style.primaryColor, color: 'white', borderRadius: style.borderRadius }}
              onClick={() => onAction?.('save')}
            >
              <UserPlus size={18} />
              Salvar Contato
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                className="py-3 px-4 border-2 flex items-center justify-center gap-2 font-medium transition-colors"
                style={{ borderColor: style.primaryColor, color: style.primaryColor, borderRadius: style.borderRadius }}
                onClick={() => onAction?.('share')}
              >
                <Share2 size={18} />
                Compartilhar
              </button>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 flex items-center justify-center gap-2 font-medium bg-green-500 text-white shadow-md"
                style={{ borderRadius: style.borderRadius }}
                onClick={() => onAction?.('whatsapp')}
              >
                <WhatsappLogo />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Contact Info List */}
          <div className="mt-8 w-full space-y-4 text-left">
            <a href={`tel:${phone}`} className="flex items-center gap-3 p-3 hover:bg-slate-100 transition-colors group" style={{ borderRadius: style.borderRadius }}>
              <div className="p-2 rounded-full bg-slate-100 group-hover:bg-white text-slate-600 transition-colors">
                <Phone size={16} />
              </div>
              <span className="text-sm font-medium">{phone}</span>
            </a>
            <a href={`mailto:${email}`} className="flex items-center gap-3 p-3 hover:bg-slate-100 transition-colors group" style={{ borderRadius: style.borderRadius }}>
              <div className="p-2 rounded-full bg-slate-100 group-hover:bg-white text-slate-600 transition-colors">
                <Mail size={16} />
              </div>
              <span className="text-sm font-medium">{email}</span>
            </a>
            {website && (
              <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 hover:bg-slate-100 transition-colors group" style={{ borderRadius: style.borderRadius }}>
                <div className="p-2 rounded-full bg-slate-100 group-hover:bg-white text-slate-600 transition-colors">
                  <Globe size={16} />
                </div>
                <span className="text-sm font-medium">{website.replace('https://', '').replace('http://', '')}</span>
              </a>
            )}
            <div className="flex items-center gap-3 p-3 hover:bg-slate-100 transition-colors group" style={{ borderRadius: style.borderRadius }}>
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
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                style={{ borderRadius: style.borderRadius }}
                title={link.platform}
              >
                {renderSocialIcon(link.platform)}
              </a>
            ))}
          </div>

          {/* Portfolio Section */}
          {card.portfolio && card.portfolio.length > 0 && (
            <div className="mt-10 w-full">
              <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4">Portfólio</h3>
              <div className="grid grid-cols-1 gap-4">
                {card.portfolio.map((item, index) => (
                  <div key={item.id || index} className="bg-slate-50 overflow-hidden border border-slate-100 group" style={{ borderRadius: style.borderRadius }}>
                    {item.type === 'image' && (
                      <div className={`relative aspect-video ${item.imageFit === 'contain' ? 'bg-transparent' : 'bg-slate-200'}`}>
                        <img src={item.url} alt={item.title} className={`w-full h-full ${item.imageFit === 'contain' ? 'object-contain' : 'object-cover'}`} />
                      </div>
                    )}

                    {item.type === 'video' && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-video bg-black group-hover:opacity-90 transition-opacity">
                        {getYoutubeId(item.url) ? (
                          <img src={`https://img.youtube.com/vi/${getYoutubeId(item.url)}/hqdefault.jpg`} alt={item.title} className="w-full h-full object-cover opacity-60" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50">
                            <Play size={48} />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <Play size={24} fill="white" />
                          </div>
                        </div>
                      </a>
                    )}

                    {item.type === 'link' && (
                      <div className="p-4 flex items-center gap-4 bg-slate-100/50">
                        <div className="p-3 bg-white text-brand-blue shadow-sm" style={{ borderRadius: `calc(${style.borderRadius} / 1.5)` }}>
                          <Globe size={20} />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="font-bold text-sm text-slate-800 truncate">{item.title || 'Link Externo'}</div>
                          <div className="text-xs text-slate-500 truncate">{item.url}</div>
                        </div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-brand-blue">
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    )}

                    {(item.title || item.description) && item.type !== 'link' && (
                      <div className="p-4 text-left">
                        {item.title && <h4 className="font-bold text-sm text-slate-800 mb-1">{item.title}</h4>}
                        {item.description && <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
