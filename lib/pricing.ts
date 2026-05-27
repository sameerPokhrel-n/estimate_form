// export interface QuoteData {
//     fullName: string;
//     phoneNumber: string;
//     emailAddress: string;
//     streetAddress: string;
//     city: string;
//     yardSize: 'small' | 'medium' | 'large';
//     serviceFrequency: 'one-time' | 'weekly' | 'biweekly';
//     addOns: string[];
//     propertyCondition: 'standard' | 'overgrown' | 'well-maintained';
//     photos: string[];
//     additionalNotes: string;
// }

// export interface Quote {
//     min: number;
//     max: number;
// }

// const BASE_PRICES: Record<string, Quote> = {
//     small: { min: 50, max: 70 },
//     medium: { min: 70, max: 100 },
//     large: { min: 100, max: 140 },
// };

// const ADDON_PRICES: Record<string, Quote> = {
//     'hedge-trimming': { min: 20, max: 40 },
//     'garden-bed-weeding': { min: 15, max: 30 },
//     'leaf-removal': { min: 30, max: 60 },
// };

// const FREQUENCY_DISCOUNTS: Record<string, number> = {
//     'one-time': 0,
//     weekly: 0.1, // 10% off
//     biweekly: 0.05, // 5% off
// };

// const CONDITION_MULTIPLIERS: Record<string, number> = {
//     standard: 1.0,
//     overgrown: 1.3, // 30% increase
//     'well-maintained': 0.9, // 10% discount
// };

// export function calculateQuote(data: QuoteData): Quote {
//     // Start with base price
//     let quote = { ...BASE_PRICES[data.yardSize] };

//     // Add addon services
//     data.addOns.forEach((addon) => {
//         const addonPrice = ADDON_PRICES[addon];
//         if (addonPrice) {
//             quote.min += addonPrice.min;
//             quote.max += addonPrice.max;
//         }
//     });

//     // Apply property condition multiplier
//     const conditionMultiplier = CONDITION_MULTIPLIERS[data.propertyCondition];
//     quote.min = Math.round(quote.min * conditionMultiplier);
//     quote.max = Math.round(quote.max * conditionMultiplier);

//     // Apply frequency discount
//     const discount = FREQUENCY_DISCOUNTS[data.serviceFrequency];
//     quote.min = Math.round(quote.min * (1 - discount));
//     quote.max = Math.round(quote.max * (1 - discount));

//     return quote;
// }
export interface QuoteData {
    fullName: string;
    phoneNumber: string;
    emailAddress: string;
    streetAddress: string;
    yardSize: 'small' | 'medium' | 'large';
    servicesNeeded: string[];
    yardCondition: 'well-maintained' | 'overgrown';
    howOften: 'one-time' | 'every-2-weeks' | 'weekly';
    photos: string[];
    additionalNotes: string;
}

export interface DetailedQuote {
    base: number;
    addons: number;
    total: {
        min: number;
        max: number;
    };
}

const BASE_PRICES: Record<string, number> = {
    small: 50,
    medium: 70,
    large: 100,
};

const BASE_RANGES: Record<string, { min: number; max: number }> = {
    small: { min: 50, max: 70 },
    medium: { min: 70, max: 100 },
    large: { min: 100, max: 140 },
};

const SERVICE_PRICES: Record<string, { min: number; max: number }> = {
    'grass-cutting': { min: 0, max: 0 }, // Base service
    'weed-removal': { min: 40, max: 60 },
    'bush-trimming': { min: 40, max: 70 },
    'deep-cleanup': { min: 60, max: 150 },
    'garden-beds': { min: 30, max: 50 },
};

const FREQUENCY_DISCOUNTS: Record<string, number> = {
    'one-time': 0,
    'every-2-weeks': 0.1, // 10% off
    weekly: 0.15, // 15% off
};

const CONDITION_SURCHARGES: Record<string, { min: number; max: number }> = {
    'well-maintained': { min: 0, max: 0 },
    overgrown: { min: 30, max: 50 },
};

export function calculateQuote(data: QuoteData): DetailedQuote {
    // Base price for yard size
    const basePrice = BASE_PRICES[data.yardSize] || 70;
    const baseRange = BASE_RANGES[data.yardSize] || { min: 70, max: 100 };

    // Calculate add-ons (excluding grass-cutting which is base)
    let addonMin = 0;
    let addonMax = 0;

    data.servicesNeeded.forEach((service) => {
        if (service !== 'grass-cutting' && SERVICE_PRICES[service]) {
            addonMin += SERVICE_PRICES[service].min;
            addonMax += SERVICE_PRICES[service].max;
        }
    });

    // Add condition surcharge
    const conditionSurcharge = CONDITION_SURCHARGES[data.yardCondition];
    addonMin += conditionSurcharge.min;
    addonMax += conditionSurcharge.max;

    // Calculate totals before discount
    let totalMin = baseRange.min + addonMin;
    let totalMax = baseRange.max + addonMax;

    // Apply frequency discount
    const discount = FREQUENCY_DISCOUNTS[data.howOften] || 0;
    totalMin = Math.round(totalMin * (1 - discount));
    totalMax = Math.round(totalMax * (1 - discount));

    return {
        base: basePrice,
        addons: Math.round((addonMin + addonMax) / 2), // Average for display
        total: {
            min: totalMin,
            max: totalMax,
        },
    };
}