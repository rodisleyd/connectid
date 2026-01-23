export enum PlanTier {
    BASIC = 'basic',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    PREMIUM = 'premium'
}

export const PLAN_FEATURES = {
    [PlanTier.BASIC]: {
        name: 'Básico',
        maxCards: 1,
        maxLinks: 3,
        allowCustomization: false, // No colors/fonts
        allowPortfolio: false,
        allowAnalytics: false,
        allowAnimations: false,
        allowCta: false,
        mobilePreview: true,
    },
    [PlanTier.INTERMEDIATE]: {
        name: 'Intermediário',
        maxCards: 1,
        maxLinks: 6,
        allowCustomization: true,
        allowPortfolio: false,
        allowAnalytics: false,
        allowAnimations: false,
        allowCta: false,
        mobilePreview: true,
    },
    [PlanTier.ADVANCED]: {
        name: 'Avançado',
        maxCards: 1,
        maxLinks: 10,
        allowCustomization: true,
        allowPortfolio: true,
        allowAnalytics: false,
        allowAnimations: true,
        allowCta: true,
        mobilePreview: true,
    },
    [PlanTier.PREMIUM]: {
        name: 'Premium',
        maxCards: 100, // Unlimited effectively
        maxLinks: 20,
        allowCustomization: true,
        allowPortfolio: true,
        allowAnalytics: true,
        allowAnimations: true,
        allowCta: true,
        mobilePreview: true,
    }
};
