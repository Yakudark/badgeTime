export const steampunkTheme = {
  colors: {
    primary: '#CD8032',
    secondary: '#FFC107',
    background: {
      gradient: ['#2C1810', '#462921', '#2C1810'],
      card: '#462921',
    },
    text: {
      primary: '#FFC107',
      secondary: '#CD8032',
      muted: '#B87333',
    },
    border: {
      primary: 'rgba(205,128,50,0.4)',
      secondary: 'rgba(205,128,50,0.3)',
      light: 'rgba(205,128,50,0.1)',
    },
    status: {
      positive: '#4ADE80',
      negative: '#DC2626',
    },
    gradients: {
      card: ['rgba(205,128,50,0.15)', 'rgba(205,128,50,0.0)'],
      input: ['#3D2317', '#2C1810'],
    }
  },
  spacing: {
    base: 4,
    padding: {
      card: 20,
      input: 12,
    },
    radius: {
      base: 8,
      card: 24,
      input: 12,
    },
  },
  typography: {
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 32,
      '4xl': 40,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  components: {
    card: {
      base: "rounded-3xl border-2 border-[#CD8032]/40 bg-[#462921]/50",
      blur: 20,
    },
    input: {
      container: "rounded-xl border border-[#CD8032]/30",
      text: "font-bold text-[#FFC107] text-center",
      placeholder: "#614126",
    },
    header: {
      height: 100,
      borderWidth: 2,
    },
    tabBar: {
      height: 65,
      borderWidth: 2,
    }
  }
};

// Utility functions pour faciliter l'utilisation du thème
export const getColor = (path: string) => {
  return path.split('.').reduce((obj, key) => obj[key], steampunkTheme.colors);
};

export const getSpacing = (value: number) => {
  return steampunkTheme.spacing.base * value;
};
