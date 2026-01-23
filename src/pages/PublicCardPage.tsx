import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { BusinessCard } from '../types';
import CardPreview from '../components/CardPreview';
import { Loader2, AlertCircle } from 'lucide-react';
import { DEVICES } from '../constants';

const PublicCardPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [card, setCard] = useState<BusinessCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCard = async () => {
            if (!id) return;
            try {
                const docRef = doc(db, "cards", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const cardData = docSnap.data() as BusinessCard;
                    if (cardData.active) {
                        setCard(cardData);
                        // Increment views
                        updateDoc(docRef, {
                            "analytics.views": increment(1)
                        }).catch(console.error);
                    } else {
                        setError(true); // Card inactive
                    }
                } else {
                    setError(true); // Not found
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchCard();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-brand-blue" size={40} />
            </div>
        );
    }

    if (error || !card) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <AlertCircle size={48} className="text-slate-400 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Cartão não encontrado</h1>
                <p className="text-slate-500">O cartão que você procura não existe ou foi desativado.</p>
            </div>
        );
    }

    // Use a generic mobile device frame for public view
    const displayDevice = DEVICES.find(d => d.id === 'iphone-14') || DEVICES[0];

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="md:hidden w-full h-full absolute inset-0 bg-white">
                <CardPreview card={card} />
            </div>
            <div className="hidden md:block scale-90">
                <CardPreview card={card} isMockup={true} device={displayDevice} />
            </div>
        </div>
    );
};

export default PublicCardPage;
