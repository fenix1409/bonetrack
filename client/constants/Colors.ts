const primary = '#10B981'; // Emerald 500 (Clean medical feel)
const primaryDark = '#059669'; // Emerald 600
const accent = '#3B82F6'; // Blue 500
const secondary = '#8B5CF6'; // Violet 500

export type Theme = {
    text: string;
    textMuted: string;
    background: string;
    surface: string;
    card: string;
    primary: string;
    primaryDark: string;
    accent: string;
    secondary: string;
    primaryBg: string;
    tint: string;
    tabIconDefault: string;
    tabIconSelected: string;
    border: string;
    excellent: string;
    excellentBg: string;
    medium: string;
    mediumBg: string;
    low: string;
    lowBg: string;
    shadow: string;
    divider: string;
    inputBg: string;
    goodChip: string;
    goodChipText: string;
    mediumChip: string;
    mediumChipText: string;
    harmfulChip: string;
    harmfulChipText: string;
    overlay: string;
};

export default {
    light: {
        text: '#1F2937', // Gray 800
        textMuted: '#6B7280', // Gray 500
        background: '#F9FAFB', // Gray 50 (Figma background)
        surface: '#FFFFFF',
        card: '#FFFFFF',
        primary,
        primaryDark,
        accent,
        secondary,
        primaryBg: '#ECFDF5', // Emerald 50
        tint: primary,
        tabIconDefault: '#9CA3AF', // Gray 400
        tabIconSelected: primary,
        border: '#E5E7EB', // Gray 200
        excellent: '#10B981',
        excellentBg: '#D1FAE5',
        medium: '#F59E0B', // Amber 500
        mediumBg: '#FEF3C7',
        low: '#EF4444', // Red 500
        lowBg: '#FEE2E2',
        shadow: 'rgba(31, 41, 55, 0.08)',
        divider: '#F3F4F6',
        inputBg: '#F3F4F6',
        goodChip: '#D1FAE5',
        goodChipText: '#065F46',
        mediumChip: '#FEF3C7',
        mediumChipText: '#92400E',
        harmfulChip: '#FEE2E2',
        harmfulChipText: '#991B1B',
        overlay: 'rgba(31, 41, 55, 0.05)',
    },
    dark: {
        text: '#F9FAFB',
        textMuted: '#9CA3AF',
        background: '#111827', // Gray 900
        surface: '#1F2937', // Gray 800
        card: '#1F2937',
        primary: '#34D399',
        primaryDark: '#10B981',
        accent: '#60A5FA',
        secondary: '#A78BFA',
        primaryBg: '#064E3B',
        tint: '#34D399',
        tabIconDefault: '#4B5563',
        tabIconSelected: '#34D399',
        border: '#374151',
        excellent: '#34D399',
        excellentBg: '#064E3B',
        medium: '#FBBF24',
        mediumBg: '#451A03',
        low: '#F87171',
        lowBg: '#450A0A',
        shadow: 'rgba(0, 0, 0, 0.3)',
        divider: '#374151',
        inputBg: '#111827',
        goodChip: '#064E3B',
        goodChipText: '#6EE7B7',
        mediumChip: '#78350F',
        mediumChipText: '#FCD34D',
        harmfulChip: '#450A0A',
        harmfulChipText: '#FCA5A5',
        overlay: 'rgba(0, 0, 0, 0.4)',
    },
};
