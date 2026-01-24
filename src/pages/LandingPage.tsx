import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Star, Shield, Zap, Layout } from 'lucide-react';
import { PLAN_FEATURES, PlanTier } from '../constants/plans';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="https://i.ibb.co/yms4WVyw/logo-positivo2-connectid.png" alt="ConnectID" className="h-12" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-slate-600 font-semibold hover:text-brand-blue transition-colors">Entrar</Link>
                        <Link to="/register" className="bg-brand-blue text-white px-6 py-2.5 rounded-full font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-brand-blue/20">
                            Criar Conta
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-block px-4 py-1.5 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-bold mb-6 animate-fade-in-up">
                        🚀 O Futuro do Networking Chegou
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-tight">
                        Seu Cartão de Visita <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-600">Inteligente</span>
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Crie, personalize e compartilhe sua identidade profissional em segundos. Conecte-se com clientes através de QR Codes dinâmicos e painéis de analytics.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-brand-blue text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:transform hover:scale-105 transition-all shadow-xl shadow-brand-blue/30">
                            Começar Agora Grátis <ArrowRight />
                        </Link>
                        <a href="#features" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-colors">
                            Saiba Mais
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Ferramentas poderosas para você se destacar no mercado.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Layout, title: "Editor Intuitivo", desc: "Crie designs incríveis com nosso editor drag-and-drop em tempo real." },
                            { icon: Zap, title: "Compartilhamento Rápido", desc: "QR Codes, Links e integração direta com WhatsApp." },
                            { icon: Shield, title: "Analytics Detalhado", desc: "Saiba quem viu seu cartão e quem clicou nos seus links." }
                        ].map((f, i) => (
                            <div key={i} className="p-8 bg-slate-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all border border-slate-100">
                                <div className="w-14 h-14 bg-brand-blue/10 text-brand-blue rounded-2xl flex items-center justify-center mb-6">
                                    <f.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-20 px-4 bg-slate-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Escolha seu Plano</h2>
                        <p className="text-slate-500">Comece grátis e faça upgrade quando precisar.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.values(PlanTier).map((tier) => {
                            const features = PLAN_FEATURES[tier];
                            const isPopular = tier === PlanTier.ADVANCED;

                            return (
                                <div key={tier} className={`relative p-8 rounded-3xl bg-white border-2 flex flex-col ${isPopular ? 'border-brand-blue shadow-2xl scale-105 z-10' : 'border-transparent shadow-lg text-slate-500'}`}>
                                    {isPopular && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                                            Mais Popular
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold mb-2 uppercase tracking-wider text-slate-900">{features.name}</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-black text-slate-900">
                                            {tier === 'basic' ? 'Grátis' : tier === 'intermediate' ? 'R$ 19' : tier === 'advanced' ? 'R$ 29' : 'R$ 49'}
                                        </span>
                                        <span className="text-sm font-medium opacity-60">/mês</span>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        <li className="flex items-center gap-3 text-sm">
                                            <Check size={16} className="text-green-500" />
                                            {features.maxCards === 100 ? 'Cartões Ilimitados' : `${features.maxCards} Cartão(ões)`}
                                        </li>
                                        <li className="flex items-center gap-3 text-sm">
                                            <Check size={16} className="text-green-500" />
                                            Até {features.maxLinks} Links
                                        </li>
                                        <li className="flex items-center gap-3 text-sm">
                                            {features.allowCustomization ? <Check size={16} className="text-green-500" /> : <Shield size={16} className="text-slate-300" />}
                                            <span className={!features.allowCustomization ? 'line-through opacity-50' : ''}>Personalização Total</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm">
                                            {features.allowPortfolio ? <Check size={16} className="text-green-500" /> : <Shield size={16} className="text-slate-300" />}
                                            <span className={!features.allowPortfolio ? 'line-through opacity-50' : ''}>Portfólio</span>
                                        </li>
                                        <li className="flex items-center gap-3 text-sm">
                                            {features.allowAnalytics ? <Check size={16} className="text-green-500" /> : <Shield size={16} className="text-slate-300" />}
                                            <span className={!features.allowAnalytics ? 'line-through opacity-50' : ''}>Analytics Avançado</span>
                                        </li>
                                    </ul>

                                    <Link
                                        to="/register"
                                        className={`w-full py-3 rounded-xl font-bold text-center transition-all ${isPopular ? 'bg-brand-blue text-white hover:bg-opacity-90' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                    >
                                        Escolher {features.name}
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <img src="https://i.ibb.co/9mSMG5G2/logo-negativo2-connectid.png" alt="ConnectID" className="h-8 opacity-50" />
                        <span className="font-bold text-xl tracking-tight">ConnectID</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                        © 2026 ConnectID. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
