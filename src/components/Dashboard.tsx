
import React from 'react';
import { BusinessCard } from '../types';
import { PlanTier, PLAN_FEATURES } from '../constants/plans';
import { Plus, Eye, Share2, MoreVertical, Edit3, BarChart2, Trash2, Power, Lock } from 'lucide-react';

interface DashboardProps {
  cards: BusinessCard[];
  onEdit: (card: BusinessCard) => void;
  onNew: () => void;
  onAnalytics: (card: BusinessCard) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onShare: (card: BusinessCard) => void;
  planFeatures: typeof PLAN_FEATURES[PlanTier.BASIC];
}

const Dashboard: React.FC<DashboardProps> = ({ cards, onEdit, onNew, onAnalytics, onDelete, onToggleActive, onShare, planFeatures }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Meus Cartões</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie seus cartões de visita digitais e analise seu alcance.</p>
        </div>
        <button
          onClick={onNew}
          className="bg-brand-blue hover:bg-opacity-90 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-lg shadow-brand-blue/20 dark:shadow-none"
        >
          <Plus size={20} />
          Novo Cartão
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[40px] p-20 text-center transition-colors">
          <div className="bg-slate-50 dark:bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Plus size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Crie seu primeiro cartão</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">Personalize seu perfil, escolha um design e comece a compartilhar seu trabalho em segundos.</p>
          <button
            onClick={onNew}
            className="mt-8 text-brand-blue font-bold hover:underline"
          >
            Começar agora
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} className="group bg-white dark:bg-slate-950 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner bg-slate-50 dark:bg-slate-900">
                    <img src={card.avatar} alt={card.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[140px]">{card.name}</h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleActive(card.id)}
                    className={`p-2 rounded-xl transition-colors ${card.active ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                    title={card.active ? 'Ativado' : 'Desativado'}
                  >
                    <Power size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 py-4 border-y border-slate-50 dark:border-slate-900">
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">VISTO</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">{card.analytics.views}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">CLICKS</div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">{card.analytics.linkClicks + card.analytics.whatsappClicks}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">DESIGN</div>
                  <div className="text-xs font-bold text-brand-blue dark:text-brand-gold truncate mt-1">{card.template}</div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit(card)}
                    className="p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => onAnalytics(card)}
                    className="p-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                    title="Analytics"
                  >
                    <BarChart2 size={18} />
                  </button>
                  <button
                    onClick={() => onShare(card)}
                    className="p-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title="Compartilhar"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
                <button
                  onClick={() => onDelete(card.id)}
                  className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics Summary Banner */}
      {cards.length > 0 && (
        <div className="mt-16 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>

          {/* Lock Overlay for Non-Premium/Analytics Plans */}
          {!planFeatures.allowAnalytics && (
            <div className="absolute inset-0 z-20 backdrop-blur-sm bg-slate-900/60 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
              <div className="bg-white/10 p-4 rounded-full mb-4 ring-1 ring-white/20">
                <Lock size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Analytics Avançado</h3>
              <p className="text-slate-300 max-w-md mb-6">Atualize para o plano Premium para acompanhar visualizações, cliques e engajamento em tempo real.</p>
              <button className="bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-2 rounded-full font-bold transition-colors">
                Fazer Upgrade
              </button>
            </div>
          )}

          <div className={`relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${!planFeatures.allowAnalytics ? 'blur-sm opacity-50 pointer-events-none select-none' : ''}`}>
            <div>
              <h2 className="text-2xl font-bold">Resumo Geral de Performance</h2>
              <p className="text-slate-400 mt-2">Acompanhe como sua rede de contatos está interagindo com você nos últimos 30 dias.</p>
              <div className="flex gap-10 mt-8">
                <div>
                  <div className="text-4xl font-bold">{cards.reduce((acc, c) => acc + c.analytics.views, 0)}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Total de Views</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{cards.reduce((acc, c) => acc + c.analytics.whatsappClicks, 0)}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Conversas Iniciadas</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-xs p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs font-bold opacity-60">ENGANJAMENTO</span>
                  <span className="text-xs font-bold text-green-400">+12% vs anterior</span>
                </div>
                <div className="flex items-end gap-2 h-20">
                  {[35, 60, 45, 80, 55, 90, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-brand-blue/40 dark:bg-brand-gold/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
