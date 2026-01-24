
import React, { useState, useEffect, useRef } from 'react';
import { BusinessCard, ViewState } from '../types';
import { INITIAL_CARD_DATA } from '../constants';
import Dashboard from '../components/Dashboard';
import Editor from '../components/Editor';
import CardPreview from '../components/CardPreview';
import { QRCodeCanvas } from 'qrcode.react';
import { Layout, X, Share2, Download, Check, AlertCircle, Sun, Moon } from 'lucide-react';
import { DEVICES } from '../constants';
import { Device } from '../types';
import DeviceSelector from '../components/DeviceSelector';
import { PlanTier, PLAN_FEATURES } from '../constants/plans';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

const AppLayout: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [currentCard, setCurrentCard] = useState<BusinessCard | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device>(DEVICES[1]); // Default to iPhone 16
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [currentPlan, setCurrentPlan] = useState<PlanTier>(PlanTier.BASIC);

  // Update plan based on actual user data
  useEffect(() => {
    if (currentUser) {
      const fetchUserPlan = async () => {
        // In a real app we'd listen to the user doc, but for now let's just default basic or allow admin to override in memory if needed
        // Actually, we should check the user document from Firestore here.
        // For simplicity in this step, let's keep basic but allow the database listener below to update it.
        const userDoc = await import('firebase/firestore').then(fs => fs.getDoc(fs.doc(db, "users", currentUser.uid)));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.plan) setCurrentPlan(userData.plan as PlanTier);
        }
      };
      fetchUserPlan();
    }
  }, [currentUser]);

  const planFeatures = PLAN_FEATURES[currentPlan];

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const qrRef = useRef<HTMLCanvasElement>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Listen to User's Cards
        const q = query(collection(db, "cards"), where("userId", "==", user.uid));
        const unsubscribeCards = onSnapshot(q, (snapshot) => {
          const loadedCards: BusinessCard[] = [];
          snapshot.forEach((doc) => {
            loadedCards.push(doc.data() as BusinessCard);
          });
          setCards(loadedCards);
        });
        return () => unsubscribeCards();
      } else {
        setCurrentUser(null);
        setCards([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateNew = async () => {
    if (!currentUser) return;

    if (cards.length >= planFeatures.maxCards) {
      showNotification(`Seu plano ${planFeatures.name} permite apenas ${planFeatures.maxCards} cartão(ões). Atualize para criar mais!`, 'error');
      return;
    }

    const newId = Math.random().toString(36).substr(2, 9);
    const newCard = {
      ...INITIAL_CARD_DATA,
      id: newId,
      userId: currentUser.uid,
      createdAt: new Date().toISOString()
    };

    // Optimistic Update handled by snapshot listener, but we set current locally to edit immediately
    setCurrentCard(newCard);
    setView('editor');
  };

  const handleEdit = (card: BusinessCard) => {
    setCurrentCard({ ...card });
    setView('editor');
  };

  const handleUpdateCurrentCard = (updatedCard: BusinessCard) => {
    setCurrentCard(updatedCard);
  };

  const handleSaveCard = async () => {
    if (!currentCard || !currentUser) return;

    try {
      await setDoc(doc(db, "cards", currentCard.id), {
        ...currentCard,
        userId: currentUser.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setView('dashboard');
      showNotification('Cartão salvo na nuvem com sucesso!', 'success');
    } catch (e) {
      console.error(e);
      showNotification('Erro ao salvar cartão.', 'error');
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await deleteDoc(doc(db, "cards", id));
        showNotification('Cartão removido.', 'success');
      } catch (e) {
        showNotification('Erro ao remover cartão.', 'error');
      }
    }
  };

  const handleToggleActive = async (id: string) => {
    const card = cards.find(c => c.id === id);
    if (card) {
      await setDoc(doc(db, "cards", id), { active: !card.active }, { merge: true });
    }
  };

  const handleShare = (card: BusinessCard) => {
    setCurrentCard(card);
    setShowShareModal(true);
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Link copiado para a área de transferência!', 'success');
  };

  const downloadQRCode = () => {
    if (!qrRef.current || !currentCard) return;

    const canvas = qrRef.current;
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${currentCard.name.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    showNotification('QR Code baixado com sucesso!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-950 border-b dark:border-slate-800 px-4 py-4 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
          <img src={darkMode ? "/logo-negative.png" : "/logo.png"} alt="ConnectID" className="h-14 md:h-16 object-contain transition-all duration-300" />
        </div>
        <div className="flex items-center gap-4">
          {cards.length > 0 && view === 'dashboard' && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
              <div className="w-2 h-2 bg-brand-blue dark:bg-brand-gold rounded-full animate-pulse"></div>
              {cards.length} {cards.length === 1 ? 'CARTÃO' : 'CARTÕES'}
            </div>
          )}

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm">
            <img src="https://picsum.photos/100" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>



      {/* Notifications */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl text-white font-semibold ${notification.type === 'success' ? 'bg-brand-blue' : 'bg-red-500'}`}>
            {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            {notification.message}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {view === 'dashboard' && (
          <Dashboard
            cards={cards}
            onEdit={handleEdit}
            onNew={handleCreateNew}
            onAnalytics={(c) => {
              if (!planFeatures.allowAnalytics) {
                showNotification(`Analytics disponível apenas no plano Premium!`, 'error');
                return;
              }
              setCurrentCard(c);
              setView('analytics');
            }}
            onDelete={handleDeleteCard}
            onToggleActive={handleToggleActive}
            onShare={handleShare}
            planFeatures={planFeatures}
          />
        )}

        {view === 'editor' && currentCard && (
          <div className="h-[calc(100vh-73px)] flex flex-col md:flex-row bg-white overflow-hidden">
            {/* Editor Sidebar */}
            <div className="w-full md:w-[450px] md:border-r h-full overflow-hidden flex flex-col bg-slate-50">
              <Editor
                card={currentCard}
                onUpdate={handleUpdateCurrentCard}
                onSave={handleSaveCard}
                onCancel={() => setView('dashboard')}
                selectedDevice={selectedDevice}
                onSelectDevice={setSelectedDevice}
                planFeatures={planFeatures}
              />
            </div>

            {/* Preview Area */}
            <div className="hidden md:flex flex-1 bg-slate-100/50 dark:bg-slate-900/50 flex items-center justify-center p-8 overflow-y-auto pattern-grid transition-colors">
              <div
                className="relative group transition-all duration-300"
                style={{
                  transform: `scale(${selectedDevice.scale})`,
                  transformOrigin: 'center center'
                }}
              >
                <div className="absolute -inset-4 bg-brand-blue/10 blur-2xl rounded-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardPreview card={currentCard} isMockup={true} device={selectedDevice} />
              </div>
            </div>

            {/* Device Selector Sidebar */}
            <div className="hidden lg:block border-l dark:border-slate-800 h-full overflow-hidden bg-white dark:bg-slate-950">
              <DeviceSelector selectedDevice={selectedDevice} onSelect={setSelectedDevice} />
            </div>
          </div>
        )}

        {view === 'analytics' && currentCard && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 mb-8 transition-colors">
              <Download size={18} className="rotate-90" />
              Voltar ao Dashboard
            </button>
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-6 mb-12">
                <img src={currentCard.avatar} alt="" className="w-20 h-20 rounded-3xl object-cover shadow-md" />
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{currentCard.name}</h2>
                  <p className="text-slate-500 font-medium">Analytics Detalhado • Últimos 30 dias</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Visualizações</div>
                  <div className="text-3xl font-black text-indigo-600">{currentCard.analytics.views}</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Cliques no WhatsApp</div>
                  <div className="text-3xl font-black text-green-500">{currentCard.analytics.whatsappClicks}</div>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Links Externos</div>
                  <div className="text-3xl font-black text-slate-800">{currentCard.analytics.linkClicks}</div>
                </div>
              </div>

              <div className="h-64 w-full bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Gráfico de desempenho será exibido aqui com dados reais.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && currentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-2">Compartilhar Cartão</h2>
            <p className="text-slate-500 mb-8">Escolha como deseja enviar seu cartão digital para o mundo.</p>

            <div className="flex flex-col items-center gap-6">
              <div className="p-4 bg-white border border-slate-100 rounded-3xl shadow-lg">
                <QRCodeCanvas
                  ref={qrRef}
                  value={`${window.location.origin}/card/${currentCard.id}`}
                  size={200}
                  level={"H"}
                  includeMargin={true}
                  imageSettings={{
                    src: currentCard.avatar,
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              <div className="w-full space-y-3">
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="flex-1 text-xs font-medium text-slate-500 truncate">{window.location.host}/card/{currentCard.id}</span>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/card/${currentCard.id}`)}
                    className="text-indigo-600 text-xs font-bold hover:underline px-3"
                  >
                    COPIAR
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center justify-center gap-2 p-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    <Download size={18} />
                    Baixar QR
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Cartão de Visita - ${currentCard.name}`,
                          text: `Confira meu cartão de visita digital!`,
                          url: `${window.location.origin}/card/${currentCard.id}`,
                        }).catch(console.error);
                      } else {
                        copyToClipboard(`${window.location.origin}/card/${currentCard.id}`);
                      }
                    }}
                    className="flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                  >
                    <Share2 size={18} />
                    Enviar Link
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compatível com Dispositivos NFC</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Pattern Background for Editor */}
      <style>{`
        .pattern-grid {
          background-image: radial-gradient(#cbd5e1 0.5px, transparent 0.5px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
