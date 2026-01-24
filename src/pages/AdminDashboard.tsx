import React, { useEffect, useState } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Loader2, Trash2, Shield, ShieldAlert, Award, Search, LogOut } from 'lucide-react';
import { PlanTier, PLAN_FEATURES } from '../constants/plans';
import { useNavigate } from 'react-router-dom';

interface UserData {
    uid: string;
    name: string;
    email: string;
    plan: PlanTier;
    role?: 'admin' | 'user';
    createdAt: string;
}

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let unsubscribeAuth: (() => void) | undefined;

        const init = async () => {
            const { onAuthStateChanged } = await import('firebase/auth');
            unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    navigate('/login');
                    return;
                }

                // Auth verified, now check admin and fetch
                await checkAdminAndFetchUsers(user);
            });
        };

        init();
        return () => {
            if (unsubscribeAuth) unsubscribeAuth();
        }
    }, []);

    const checkAdminAndFetchUsers = async (currentUser: any) => {
        // Temporary: Allow known email to be admin automatically for bootstrapping
        const BOOTSTRAP_ADMINS = ['rodisleyd@yahoo.com.br', 'admin@connectid.me'];

        if (BOOTSTRAP_ADMINS.includes(currentUser.email || '')) {
            setIsAdmin(true);
        }

        try {
            const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            const loadedUsers: UserData[] = [];
            querySnapshot.forEach((doc) => {
                loadedUsers.push({ uid: doc.id, ...doc.data() } as UserData);
            });
            setUsers(loadedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePlan = async (userId: string, newPlan: PlanTier) => {
        if (!confirm(`Alterar plano para ${newPlan}?`)) return;
        try {
            await updateDoc(doc(db, "users", userId), { plan: newPlan });
            setUsers(users.map(u => u.uid === userId ? { ...u, plan: newPlan } : u));
            alert("Plano atualizado com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar plano.");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Tem certeza? Isso apagará os dados do usuário do banco de dados (mas a conta de login pode permanecer ativa até que ele tente logar novamente e seja bloqueado).")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            setUsers(users.filter(u => u.uid !== userId));
            alert("Usuário removido do banco de dados.");
        } catch (error) {
            console.error(error);
            alert("Erro ao remover usuário.");
        }
    };

    const handleToggleAdmin = async (userId: string, currentRole?: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Alterar função para ${newRole}?`)) return;
        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error(error);
            alert("Erro ao alterar permissão.");
        }
    };


    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
                        <p className="text-slate-500">Gerencie usuários, planos e permissões.</p>
                    </div>
                    <button onClick={() => navigate('/app')} className="text-sm font-bold text-slate-500 hover:text-brand-blue flex items-center gap-2">
                        <LogOut size={16} className="rotate-180" /> Voltar ao App
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><UserIcon /></div>
                        <div>
                            <div className="text-2xl font-bold">{users.length}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Total de Usuários</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-xl"><Award /></div>
                        <div>
                            <div className="text-2xl font-bold">{users.filter(u => u.plan === PlanTier.PREMIUM).length}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Usuários Premium</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Shield /></div>
                        <div>
                            <div className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</div>
                            <div className="text-xs text-slate-500 uppercase font-bold">Administradores</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="p-4 border-b">Usuário</th>
                                    <th className="p-4 border-b">Plano Atual</th>
                                    <th className="p-4 border-b">Função</th>
                                    <th className="p-4 border-b text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map(user => (
                                    <tr key={user.uid} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900">{user.name}</div>
                                            <div className="text-sm text-slate-500">{user.email}</div>
                                            <div className="text-xs text-slate-400 mt-1">ID: {user.uid}</div>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={user.plan}
                                                onChange={(e) => handleUpdatePlan(user.uid, e.target.value as PlanTier)}
                                                className="p-2 rounded-lg border border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                                            >
                                                {Object.values(PlanTier).map(tier => (
                                                    <option key={tier} value={tier}>{PLAN_FEATURES[tier].name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleToggleAdmin(user.uid, user.role)}
                                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                {user.role === 'admin' ? <Shield size={12} /> : null}
                                                {user.role === 'admin' ? 'ADMIN' : 'USUÁRIO'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.uid)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir Usuário"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);

export default AdminDashboard;
