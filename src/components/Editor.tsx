
import React, { useState } from 'react';
import { BusinessCard, TemplateType } from '../types';
import { PlanTier, PLAN_FEATURES } from '../constants/plans';
import { DEFAULT_CARD_STYLE, TEMPLATE_CONFIGS } from '../constants';
import { generateBio, suggestStyle } from '../geminiService';
import { Wand2, Sparkles, Plus, Trash2, Save, ArrowLeft, Loader2, Eye, Smartphone, Tablet, Upload } from 'lucide-react';
import CardPreview from './CardPreview';
import { Device } from '../types';
import { DEVICES } from '../constants';

interface EditorProps {
  card: BusinessCard;
  onUpdate: (updatedCard: BusinessCard) => void;
  onSave: () => void;
  onCancel: () => void;
  selectedDevice: Device;
  onSelectDevice: (device: Device) => void;
  planFeatures: typeof PLAN_FEATURES[PlanTier.BASIC];
}

const Editor: React.FC<EditorProps> = ({ card, onUpdate, onSave, onCancel, selectedDevice, onSelectDevice, planFeatures }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'design' | 'links' | 'preview'>('info');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onUpdate({ ...card, [name]: value });
  };

  const handleStyleChange = (key: string, value: string) => {
    onUpdate({
      ...card,
      style: { ...card.style, [key]: value }
    });
  };

  const handleTemplateSelect = (template: TemplateType) => {
    onUpdate({ ...card, template });
  };

  const handleMagicBio = async () => {
    if (!card.name || !card.role) {
      alert("Por favor, preencha nome e cargo para gerar uma bio personalizada.");
      return;
    }
    setIsGenerating(true);
    const newBio = await generateBio(card.name, card.role, card.company || "Inovação e Resultados");
    onUpdate({ ...card, bio: newBio });
    setIsGenerating(false);
  };

  const handleMagicDesign = async () => {
    setIsGenerating(true);
    const suggestion = await suggestStyle(card.role);
    if (suggestion) {
      onUpdate({
        ...card,
        style: {
          ...card.style,
          primaryColor: suggestion.primaryColor || card.style.primaryColor,
          secondaryColor: suggestion.secondaryColor || card.style.secondaryColor,
        },
        template: (suggestion.template as TemplateType) || card.template
      });
    }
    setIsGenerating(false);
  };

  /* 
   * FALLBACK TO BASE64 (NO FIREBASE STORAGE NEEDED)
   * Why: User is having issues configuring Firebase Storage on Spark Plan.
   * Solution: Compress image and save as string in Firestore. Reliable and Free.
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem é muito grande. Tente uma menor que 5MB.");
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image using canvas to reduce size
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Max dimensions
          const MAX_WIDTH = 300;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          // Get compressed Base64
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          onUpdate({ ...card, avatar: compressedBase64 });
          setIsUploading(false);
        };
        img.src = event.target?.result as string;
      };

      reader.readAsDataURL(file);
    }
  };

  const handleAddSocial = () => {
    if (card.socialLinks.length >= planFeatures.maxLinks) {
      alert(`Seu plano permite no máximo ${planFeatures.maxLinks} links.`);
      return;
    }
    const newLink = { id: Math.random().toString(36).substr(2, 9), platform: 'LinkedIn', url: '' };
    onUpdate({ ...card, socialLinks: [...card.socialLinks, newLink] });
  };

  const handleSocialChange = (id: string, field: 'platform' | 'url', value: string) => {
    const updatedLinks = card.socialLinks.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    );
    onUpdate({ ...card, socialLinks: updatedLinks });
  };

  const handleRemoveSocial = (id: string) => {
    onUpdate({ ...card, socialLinks: card.socialLinks.filter(l => l.id !== id) });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10 transition-colors">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-slate-200">
          <ArrowLeft size={20} />
        </button>
        <h2 className="font-bold text-lg dark:text-white">Editor de Cartão</h2>
        <button
          onClick={onSave}
          className="bg-brand-blue text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <Save size={18} />
          Salvar
        </button>
      </div>

      <div className="flex border-b dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors overflow-x-auto">
        {(['info', 'design', 'portfolio', 'links'] as const).map((tab) => {
          if (tab === 'design' && !planFeatures.allowCustomization) return null;
          if (tab === 'portfolio' && !planFeatures.allowPortfolio) return null;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-medium text-sm capitalize border-b-2 transition-colors min-w-[33%] whitespace-nowrap ${activeTab === tab ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              {tab === 'info' ? 'Informações' : tab === 'design' ? 'Design' : tab === 'portfolio' ? 'Portfólio' : 'Redes Sociais'}
            </button>
          )
        })}
        <button
          onClick={() => setActiveTab('preview')}
          className={`md:hidden flex-1 py-3 font-medium text-sm capitalize border-b-2 transition-colors flex items-center justify-center gap-1 ${activeTab === 'preview' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
        >
          <Eye size={16} />
          Preview
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-slate-950 transition-colors">
        {activeTab === 'info' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Avatar (URL da Imagem)</label>
              <input
                type="text"
                name="avatar"
                value={card.avatar}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition-colors"
              />
            </div>
            <div className="mt-2">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <label
                htmlFor="avatar-upload"
                className="flex items-center justify-center gap-2 w-full p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isUploading ? 'Enviando...' : 'Carregar imagem do computador'}
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nome Completo</label>
                <input
                  type="text"
                  name="name"
                  value={card.name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cargo / Profissão</label>
                <input
                  type="text"
                  name="role"
                  value={card.role}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Empresa</label>
              <input
                type="text"
                name="company"
                value={card.company}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none dark:text-white transition-colors"
              />
            </div>

            <div className="space-y-1 relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Biografia Curta</label>
                <button
                  onClick={handleMagicBio}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-[10px] font-bold hover:bg-brand-blue/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-brand-blue/20 shadow-sm"
                >
                  {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                  GERAR COM IA
                </button>
              </div>
              <textarea
                name="bio"
                value={card.bio}
                onChange={handleInputChange}
                rows={3}
                placeholder="Conte um pouco sobre você..."
                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-brand-blue outline-none resize-none text-sm leading-relaxed dark:text-white transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">WhatsApp</label>
                <input type="text" name="whatsapp" value={card.whatsapp} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="ex: 5511999999999" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Telefone</label>
                <input type="text" name="phone" value={card.phone} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">E-mail</label>
                <input type="email" name="email" value={card.email} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Website / Portfólio</label>
                <input type="text" name="website" value={card.website} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" placeholder="https://..." />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Endereço</label>
              <input type="text" name="address" value={card.address} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
            </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Escolha um Template</label>
                <button
                  onClick={handleMagicDesign}
                  disabled={isGenerating}
                  className="text-[10px] font-bold text-brand-blue flex items-center gap-1 hover:underline disabled:opacity-50"
                >
                  <Sparkles size={12} />
                  IA SUGERE DESIGN
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(TEMPLATE_CONFIGS).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => handleTemplateSelect(key as TemplateType)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${card.template === key ? 'border-brand-blue bg-brand-blue/10 shadow-sm dark:bg-brand-blue/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                  >
                    <div className={`font-bold text-sm ${card.template === key ? 'text-brand-blue dark:text-brand-blue' : 'text-slate-800 dark:text-white'}`}>{config.name}</div>
                    <div className={`text-[10px] opacity-60 leading-tight mt-1 ${card.template === key ? 'text-brand-blue dark:text-brand-blue' : 'text-slate-500 dark:text-slate-400'}`}>{config.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-4 block">Personalização de Cores</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold opacity-50 dark:text-slate-300">COR PRIMÁRIA</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={card.style.primaryColor}
                      onChange={(e) => handleStyleChange('primaryColor', e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <span className="text-xs font-mono uppercase dark:text-slate-300">{card.style.primaryColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-[10px] font-semibold opacity-50 dark:text-slate-300">RAIO DA BORDA</div>
                  <select
                    value={card.style.borderRadius}
                    onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs dark:text-white"
                  >
                    <option value="0px">Quadrado</option>
                    <option value="12px">Suave</option>
                    <option value="24px">Arredondado</option>
                    <option value="99px">Cápsula</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && planFeatures.allowPortfolio && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-500 font-medium">✨ Área de Portfólio (Plano Avançado)</p>
              <p className="text-xs text-slate-400 mt-2">Em breve: Upload de imagens e vídeos aqui.</p>
            </div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Redes Sociais e Links</label>
              <button
                onClick={handleAddSocial}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus size={14} />
                ADICIONAR LINK
              </button>
            </div>

            <div className="space-y-4">
              {card.socialLinks.map((link) => (
                <div key={link.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 relative group">
                  <button
                    onClick={() => handleRemoveSocial(link.id)}
                    className="absolute -top-2 -right-2 bg-white text-red-500 p-1.5 rounded-full shadow-md border border-slate-100 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="grid grid-cols-1 gap-3">
                    <select
                      value={link.platform}
                      onChange={(e) => handleSocialChange(link.id, 'platform', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                    >
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Twitter">X / Twitter</option>
                      <option value="Portfolio">Portfólio</option>
                      <option value="Github">Github</option>
                    </select>
                    <input
                      type="text"
                      placeholder="URL do perfil ou link"
                      value={link.url}
                      onChange={(e) => handleSocialChange(link.id, 'url', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}

              {card.socialLinks.length === 0 && (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-sm text-slate-400">Nenhum link social adicionado ainda.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden">

            {/* Mobile Device Selector Controls */}
            <div className="p-4 bg-white dark:bg-slate-950 border-b dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {DEVICES.map(device => (
                <button
                  key={device.id}
                  onClick={() => onSelectDevice(device)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedDevice.id === device.id
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                    }`}
                >
                  {device.type === 'phone' ? <Smartphone size={12} /> : <Tablet size={12} />}
                  {device.name}
                </button>
              ))}
            </div>

            <div className="flex-1 flex justify-center p-8 overflow-y-auto relative">
              <div
                className="relative transition-all duration-300 shadow-2xl my-auto"
                style={{
                  transform: `scale(${Math.min(0.8, window.innerWidth / selectedDevice.width * 0.85)})`,
                  transformOrigin: 'center center'
                }}
              >
                <CardPreview card={card} isMockup={true} device={selectedDevice} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
