
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

  // Portfolio State
  const [portfolioType, setPortfolioType] = useState<'image' | 'video' | 'link'>('image');
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [portfolioDesc, setPortfolioDesc] = useState('');
  const [portfolioImageFit, setPortfolioImageFit] = useState<'cover' | 'contain'>('cover');
  const [isUploadingPortfolio, setIsUploadingPortfolio] = useState(false);

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
          borderRadius: suggestion.borderRadius || card.style.borderRadius,
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

  const handleAddPortfolioItem = () => {
    if (!portfolioUrl) {
      alert("Por favor, adicione uma URL ou imagem.");
      return;
    }

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: portfolioType,
      title: portfolioTitle,
      url: portfolioUrl,
      description: portfolioDesc,
      imageFit: portfolioImageFit
    };

    const currentPortfolio = card.portfolio || [];
    onUpdate({ ...card, portfolio: [...currentPortfolio, newItem] });

    // Reset form
    setPortfolioTitle('');
    setPortfolioUrl('');
    setPortfolioDesc('');
    setPortfolioType('image');
    setPortfolioImageFit('cover');
  };

  const handleRemovePortfolioItem = (id: string) => {
    const currentPortfolio = card.portfolio || [];
    onUpdate({ ...card, portfolio: currentPortfolio.filter(item => item.id !== id) });
  };

  const handlePortfolioImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem é muito grande. Tente uma menor que 5MB.");
        return;
      }

      setIsUploadingPortfolio(true);
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const MAX_WIDTH = 500; // Slightly larger for portfolio
          const MAX_HEIGHT = 500;
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

          const isPng = file.type === 'image/png';
          const outputType = isPng ? 'image/png' : 'image/jpeg';
          const quality = isPng ? undefined : 0.8;
          const compressedBase64 = canvas.toDataURL(outputType, quality);
          setPortfolioUrl(compressedBase64);
          setIsUploadingPortfolio(false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
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
            {/* Add New Item */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-brand-blue" />
                Adicionar Novo Item
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipo de Conteúdo</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'image', label: 'Imagem', icon: Sparkles },
                      { id: 'video', label: 'Vídeo (YouTube)', icon: Smartphone },
                      { id: 'link', label: 'Link Externo', icon: Tablet }
                    ].map(type => (
                      <button
                        key={type.id}
                        onClick={() => setPortfolioType(type.id as any)}
                        className={`flex-1 p-3 rounded-xl border-2 text-sm font-bold flex items-center justify-center gap-2 transition-all ${portfolioType === type.id
                          ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {portfolioType === 'image' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Upload da Imagem</label>
                    {portfolioUrl ? (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                        <img src={portfolioUrl} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setPortfolioUrl('')}
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold"
                        >
                          <Trash2 size={24} /> Remover
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          id="portfolio-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePortfolioImageUpload}
                        />
                        <label
                          htmlFor="portfolio-upload"
                          className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors text-slate-500"
                        >
                          {isUploadingPortfolio ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                          <span className="text-xs font-bold uppercase">{isUploadingPortfolio ? 'Processando...' : 'Clique para enviar imagem'}</span>
                        </label>
                      </div>
                    )}

                    {/* Image Fit Control */}
                    {portfolioUrl && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Ajuste da Imagem</label>
                        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                          <button
                            onClick={() => setPortfolioImageFit('cover')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${portfolioImageFit === 'cover' ? 'bg-slate-100 text-brand-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            Preencher (Cortar)
                          </button>
                          <button
                            onClick={() => setPortfolioImageFit('contain')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${portfolioImageFit === 'contain' ? 'bg-slate-100 text-brand-blue shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            Ajustar (Inteira)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">URL do {portfolioType === 'video' ? 'Vídeo (YouTube/Vimeo)' : 'Link'}</label>
                    <input
                      type="text"
                      value={portfolioUrl}
                      onChange={e => setPortfolioUrl(e.target.value)}
                      placeholder={portfolioType === 'video' ? 'https://youtube.com/watch?v=...' : 'https://seu-site.com'}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Título (Opcional)</label>
                  <input
                    type="text"
                    value={portfolioTitle}
                    onChange={e => setPortfolioTitle(e.target.value)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue"
                    placeholder="Ex: Meu Projeto Incrível"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Descrição (Opcional)</label>
                  <textarea
                    value={portfolioDesc}
                    onChange={e => setPortfolioDesc(e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                    placeholder="Breve descrição..."
                  />
                </div>

                <button
                  onClick={handleAddPortfolioItem}
                  disabled={!portfolioUrl}
                  className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adicionar ao Portfólio
                </button>
              </div>
            </div>

            {/* List Existing Items */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-700 uppercase text-xs">Itens Adicionados ({card.portfolio?.length || 0})</h3>
              {(!card.portfolio || card.portfolio.length === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum item no portfólio.</p>
              )}

              {card.portfolio?.map((item, index) => (
                <div key={item.id || index} className="flex gap-4 p-4 bg-white border border-slate-200 rounded-2xl relative group">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {item.type === 'image' ? (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      item.type === 'video' ? <Smartphone size={24} className="text-slate-400" /> : <Tablet size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 truncate pr-8">{item.title || 'Sem título'}</h4>
                      <button
                        onClick={() => handleRemovePortfolioItem(item.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-brand-blue font-bold uppercase mt-1">{item.type}</p>
                    <p className="text-sm text-slate-500 truncate mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
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
