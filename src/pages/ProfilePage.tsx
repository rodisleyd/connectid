import React, { useState, useEffect } from 'react';
import { User, updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { User as UserIcon, Lock, Save, Loader2, ArrowLeft, Camera, Upload } from 'lucide-react';

interface ProfilePageProps {
    currentUser: User;
    onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onBack }) => {
    const [name, setName] = useState(currentUser.displayName || '');
    const [email, setEmail] = useState(currentUser.email || '');
    const [avatarUrl, setAvatarUrl] = useState(currentUser.photoURL || '');
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            await updateProfile(currentUser, { displayName: name });
            await updateDoc(doc(db, "users", currentUser.uid), { name: name });
            alert("Perfil atualizado com sucesso!");
        } catch (error: any) {
            console.error("Erro ao atualizar perfil:", error);
            alert("Erro ao atualizar perfil.");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("As novas senhas não coincidem.");
            return;
        }

        if (newPassword.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        setLoadingPassword(true);
        try {
            // Re-authenticate
            const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);

            // Update Password
            await updatePassword(currentUser, newPassword);
            alert("Senha alterada com sucesso!");

            // Clean fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            console.error("Erro ao alterar senha:", error);
            if (error.code === 'auth/wrong-password') {
                alert("Senha atual incorreta.");
            } else {
                alert(`Erro ao alterar senha: ${error.message}`);
            }
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setUploadingAvatar(true);
        try {
            const storageRef = ref(storage, `avatars/${currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateProfile(currentUser, { photoURL: downloadURL });
            await updateDoc(doc(db, "users", currentUser.uid), { photoURL: downloadURL });
            setAvatarUrl(downloadURL);

            // Force refresh of user context if needed, but local state helps UI feedback
            alert("Foto de perfil atualizada!");
        } catch (error: any) {
            console.error("Erro ao enviar foto:", error);
            alert("Erro ao enviar foto. Tente novamente.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <button
                onClick={onBack}
                className="mb-6 text-slate-500 hover:text-slate-800 flex items-center gap-2 font-bold text-sm transition-colors"
            >
                <ArrowLeft size={16} /> Voltar ao Dashboard
            </button>

            <h1 className="text-3xl font-bold text-slate-900 mb-8">Meu Perfil</h1>

            {/* Personal Info */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                        <UserIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Informações Pessoais</h2>
                        <p className="text-sm text-slate-500">Atualize seus dados de identificação</p>
                    </div>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 group-hover:border-brand-blue transition-colors">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
                                    <UserIcon size={48} />
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer">
                            {uploadingAvatar ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                        </label>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Clique para alterar a foto</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loadingProfile}
                            className="bg-brand-blue text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loadingProfile ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* Security */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Segurança</h2>
                        <p className="text-sm text-slate-500">Altere sua senha de acesso</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Senha Atual</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                            placeholder="Digite sua senha atual"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Nova Senha</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Confirmar Nova Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-blue outline-none transition-all"
                                placeholder="Repita a nova senha"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loadingPassword}
                            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loadingPassword ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Alterar Senha</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
