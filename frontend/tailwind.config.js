/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Poppins', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
    },
    fontSize: {
      // Desktop font sizes
      'h1-desktop': ['48px', '1.1'],
      'h2-desktop': ['36px', '1.5'],
      'h3-desktop': ['28px', '1.5'],
      'h4-desktop': ['24px', '1.5'],
      'subtitle-desktop': ['20px', '1.5'],
      'body-large-desktop': ['16px', '1.5'],
      'body-small-desktop': ['14px', '1.5'],
      'caption-desktop': ['12px', '1.5'],
      'caption-medium-desktop': ['10px', '1.5'],
      'caption-small-desktop': ['6px', '1'],

      // Mobile font sizes
      'h1-mobile': ['24px', '1.5'],
      'h2-mobile': ['20px', '1.5'],
      'h3-mobile': ['28px', '1.5'],
      'subtitle-mobile': ['18px', '1.5'],
      'body-large-mobile': ['16px', '1.5'],
      'body-small-mobile': ['14px', '1.5'],
      'caption-mobile': ['12px', '1.5'],
      'caption-medium-mobile': ['10px', '1.5'],
      'caption-moderate-mobile': ['9px', '1.5'],
      'caption-mid-mobile': ['7.59px', '1'],
      'caption-small-mobile': ['6px', '1'],
      'caption-smallest-mobile': ['5.69px', '1'],

      // Legacy sizes for backward compatibility
      xs: ['12px', '1.5'],
      sm: ['14px', '1.5'],
      base: ['16px', '1.5'],
      lg: ['20px', '1.5'],
      xl: ['28px', '1.2'],
      '2xl': ['36px', '1.1'],
      '3xl': ['48px', '1.1'],
      6: ['6px', '1'],
      
    },
    borderRadius: {
      none: '0',
      sm: '2px',
      DEFAULT: '10px',
      md: '10px',
      lg: '10px',
      xl: '12px',
      '2xl': '16px',
      '3xl': '24px',
      '4xl': '32px',
      full: '9999px',
    },

    extend: {
      colors: {
        primary: '#1976D2',
        'primary-lighter': '#0048FF1A',
        'primary-light': '#64B5F6',
        'primary-hover': '#0c67c1',
        secondary: '#2ECC71',
        accentYellow: '#FFCA28',
        accentYellowdark: '#EBB616',
        lightBlack: '#0000001A',
        accentBlue: '#0C67C1',
        DarkSlateGray: '#EEEEEE',
        accentGreen: '#23B460',
        darkFooter: '#003263',
        lighterGreen: '#CCFFE2',
        neutralGray: '#F3F4F6',
        DarkGray: '#364153',
        SlateGray: '#6A7282',
        grayDarker: '#7A7A7A',
        grayLight: '#E5E5E5',
        grayLighter: '#F6F6F6',
        grayDark: '#F7F7F7',
        greyDarker: '#6b7280',
        lighterRed: '#FFD9D0',
        greyDarkerText: '#9ca3af',
        purplelighter: '#8b5cf6',
        bluelighter: '#0098B6',
        redlighter: '#FF928A',
        lightYellow: '#FFF2C9',
        amberBgTint: '#F9B2331A',
        DarkSlateBlue: '#4A5565',
        error: '#FF2F00',
        surface: '#FFFFFF',
        background: '#F6F6F6',
        text: '#000000',
        lightBlue: '#EEF7FE',
        lighterYellow: '#FEF8EE',
        lightPurple: '#F3EEFC',
        purple: '#845AE0',
        lightRed: '#FEEDEC',
        border: '#E5E5E5',
        cyantext:"#0369A1",
        'primary-lightest': '#0048FF',
        'primary-border-light': '#1976D233',
        'color-footer': '#003263',
        'color-background-card': '#E6F0FF',
        'color-card-border': '#8AB9FF',
        'color-dashboard-border': '#EEEBEB',
        'color-menu-divider': '#B8B8B8',
        'color-card-border-lighter': '#93c5fd',
        // V2 DESIGN SYSTEM (New System)
        // ==========================================
        // Naming: Use classes like 'bg-v2-brand-500', 'text-v2-text-secondary', etc.
        // ==========================================
        v2: {
          /** 
           * Core brand colors and logo-specific primitives 
           * @example bg-v2-brand-500
           * @example text-v2-brand-600
           * @example fill-v2-brand-yellow
           */
          brand: {
            /** Primary Action Color - Usage: bg-v2-brand-500, text-v2-brand-500 */
            primarycolor: '#1976D2', 
            /** Hover State for Primary Action - Usage: bg-v2-brand-600 */
            primaryhover: '#1565C0', 
            /** Pressed State for Primary Action - Usage: bg-v2-brand-700 */
            primarypressed: '#0D47A1', 
            /** Brand Accent Color - Usage: bg-v2-brand-accent */
            accent: '#FFCA28',
            /** Logo Yellow Color - Usage: fill-v2-brand-yellow */
            yellow: '#FFCA28',
            /** Logo Teal Color - Usage: fill-v2-brand-teal */
            teal: '#008080',
            /** Footer Color - Usage: bg-v2-brand-footer */
            footer: '#003263',
            /** Logo Blue - brand/logo-blue · Usage: fill-v2-brand-logoBlue */
            logoBlue: '#1976D2',
            /** Logo Teal alias - brand/logo-teal semantic · Usage: fill-v2-brand-logoTeal */
            logoTeal: '#008080',
          },
          /** 
           * Complete neutral gray scale for backgrounds, borders, and text
           * @example bg-v2-neutral-50
           * @example border-v2-neutral-200
           * @example text-v2-neutral-700
           */
          neutral: {
            /** Pure White - Usage: bg-v2-neutral-0, text-v2-neutral-0 */
            0: '#FFFFFF',
            /** Subtle Background - Usage: bg-v2-neutral-50 */
            50: '#F8FAFC',
            /** Muted Background - Usage: bg-v2-neutral-100 */
            100: '#F1F5F9',
            /** Subtle Border - Usage: border-v2-neutral-200 */
            200: '#E2E8F0',
            /** Default Border - Usage: border-v2-neutral-300 */
            300: '#CBD5E1',
            /** Placeholder Text - Usage: text-v2-neutral-400 */
            400: '#94A3B8',
            /** Tertiary Text - Usage: text-v2-neutral-500 */
            500: '#64748B',
            /** Secondary Text - Usage: text-v2-neutral-600 */
            600: '#475569',
            /** Primary Text - Usage: text-v2-neutral-700 */
            700: '#334155',
            /** Dark Surface - Usage: bg-v2-neutral-800 */
            800: '#1E293B',
            /** Darkest/Black - Usage: text-v2-neutral-900, bg-v2-neutral-900 */
            900: '#0F172A',
          },
          /** 
           * Semantic state colors for feedback 
           * @example bg-v2-state-success
           * @example border-v2-state-error-border
           * @example text-v2-state-warning-text
           */
          state: {
            success: {
              /** Success Base Color - Usage: text-v2-state-success, bg-v2-state-success */
              DEFAULT: '#16A34A',
              /** Success Background - Usage: bg-v2-state-success-bg */
              bg: '#F0FDF4',
              /** Success Border - Usage: border-v2-state-success-border */
              border: '#86EFAC',
              /** Success Text - Usage: text-v2-state-success-text */
              text: '#16A34A',
            },
            warning: {
              /** Warning Base Color - Usage: text-v2-state-warning, bg-v2-state-warning */
              DEFAULT: '#F59E0B',
              /** Warning Background - Usage: bg-v2-state-warning-bg */
              bg: '#FFFAE7',
              /** Warning Border - Usage: border-v2-state-warning-border */
              border: '#FDE68A',
              /** Warning Text - Usage: text-v2-state-warning-text */
              text: '#F59E0B',
            },
            error: {
              /** Error Base Color - Usage: text-v2-state-error, bg-v2-state-error */
              DEFAULT: '#DC2626',
              /** Error Background - Usage: bg-v2-state-error-bg */
              bg: '#FEF2F2',
              /** Error Border - Usage: border-v2-state-error-border */
              border: '#FCA5A5',
              /** Error Text - Usage: text-v2-state-error-text */
              text: '#DC2626',
            },
            info: {
              /** Info Base Color - Usage: text-v2-state-info, bg-v2-state-info */
              DEFAULT: '#0284C7',
              /** Info Background - Usage: bg-v2-state-info-bg */
              bg: '#F0F9FF',
              /** Info Border - Usage: border-v2-state-info-border */
              border: '#7DD3FC',
              /** Info Text - Usage: text-v2-state-info-text */
              text: '#0284C7',
            },
          },
          /** 
           * Lifecycle status colors for badges 
           * @example bg-v2-status-active            (DEFAULT mapped to background)
           * @example text-v2-status-active-text
           * @example bg-v2-status-paused-dot
           */
          status: {
            /** Active Status (Green) */
            active: { 
              /** Active Background - Usage: bg-v2-status-active */
              DEFAULT: '#F0FDF4', 
              /** Active Text - Usage: text-v2-status-active-text */
              text: '#16A34A', 
              /** Active Dot/Icon - Usage: bg-v2-status-active-dot, text-v2-status-active-dot */
              dot: '#16A34A' 
            },
            /** Paused Status (Yellow) */
            paused: { 
              /** Paused Background - Usage: bg-v2-status-paused */
              DEFAULT: '#FFFBEB', 
              /** Paused Text - Usage: text-v2-status-paused-text */
              text: '#A16207', 
              /** Paused Dot/Icon - Usage: bg-v2-status-paused-dot, text-v2-status-paused-dot */
              dot: '#CA8A04' 
            },
            /** Terminated Status (Red) */
            terminated: { 
              /** Terminated Background - Usage: bg-v2-status-terminated */
              DEFAULT: '#FEF2F2', 
              /** Terminated Text - Usage: text-v2-status-terminated-text */
              text: '#DC2626', 
              /** Terminated Dot/Icon - Usage: bg-v2-status-terminated-dot, text-v2-status-terminated-dot */
              dot: '#DC2626' 
            },
            /** Inactive Status (Gray) */
            inactive: { 
              /** Inactive Background - Usage: bg-v2-status-inactive */
              DEFAULT: '#F1F5F9', 
              /** Inactive Text - Usage: text-v2-status-inactive-text */
              text: '#64748B', 
              /** Inactive Dot/Icon - Usage: bg-v2-status-inactive-dot, text-v2-status-inactive-dot */
              dot: '#94A3B8' 
            },
            /** Suspended Status (Orange) */
            suspended: { 
              /** Suspended Background - Usage: bg-v2-status-suspended */
              DEFAULT: '#FFF7ED', 
              /** Suspended Text - Usage: text-v2-status-suspended-text */
              text: '#C2410C', 
              /** Suspended Dot/Icon - Usage: bg-v2-status-suspended-dot, text-v2-status-suspended-dot */
              dot: '#EA580C' 
            },
          },
          /** 
           * Form input styling 
           * @example border-v2-input-border         (DEFAULT)
           * @example border-v2-input-border-focus
           * @example bg-v2-input-bg                 (DEFAULT)
           * @example text-v2-input-text-placeholder
           */
          input: {
            border: {
              /** Input Border Default - Usage: border-v2-input-border */
              DEFAULT: '#E2E8F0',
              /** Input Border Focus - Usage: border-v2-input-border-focus */
              focus: '#1976D2',
              /** Input Border Error - Usage: border-v2-input-border-error */
              error: '#DC2626',
              /** Input Border Disabled - Usage: border-v2-input-border-disabled */
              disabled: '#F1F5F9',
            },
            bg: {
              /** Input Background Default - Usage: bg-v2-input-bg */
              DEFAULT: '#FFFFFF',
              /** Input Background Disabled - Usage: bg-v2-input-bg-disabled */
              disabled: '#F8FAFC',
            },
            text: {
              /** Input Placeholder - Usage: text-v2-input-text-placeholder */
              placeholder: '#94A3B8',
              /** Input Value - Usage: text-v2-input-text-value */
              value: '#0F172A',
              /** Input Label - Usage: text-v2-input-text-label */
              label: '#334155',
            },
          },
          /** 
           * Switch/Toggle component colors 
           * @example bg-v2-toggle-track-on
           * @example bg-v2-toggle-thumb
           */
          toggle: {
            track: {
              /** Toggle Track Off - Usage: bg-v2-toggle-track-off */
              off: '#E2E8F0',
              /** Toggle Track On - Usage: bg-v2-toggle-track-on */
              on: '#1976D2',
            },
            /** Toggle Thumb - Usage: bg-v2-toggle-thumb */
            thumb: '#FFFFFF',
          },
          /** 
           * Global focus ring color 
           * @example ring-v2-focus-ring 
           */
          focus: {
            /** Focus Ring Color - Usage: ring-v2-focus-ring */
            ring: '#93C5FD',
          },
          /** 
           * Semantic text roles 
           * @example text-v2-text-primary
           * @example text-v2-text-secondary
           * @example text-v2-text-tertiary
           * @example text-v2-text-inverse
           */
          text: {
            /** Primary Text - Usage: text-v2-text-primary */
            primary: '#0F172A',
            /** Secondary Text - Usage: text-v2-text-secondary */
            secondary: '#475569',
            /** Tertiary Text - Usage: text-v2-text-tertiary */
            tertiary: '#64748B',
            /** Inverse/White Text - Usage: text-v2-text-inverse */
            inverse: '#FFFFFF',
            /** Brand Blue Text - text/brand · Usage: text-v2-text-brand */
            brand: '#1565C0',
          },
          /** 
           * Background surface roles 
           * @example bg-v2-surface          (DEFAULT)
           * @example bg-v2-surface-subtle
           * @example bg-v2-surface-muted
           * @example bg-v2-surface-overlay
           * @example bg-v2-surface-raised
           */
          surface: {
            /** Default Surface - Usage: bg-v2-surface */
            DEFAULT: '#FFFFFF',
            /** Subtle Surface - Usage: bg-v2-surface-subtle */
            subtle: '#F8FAFC',
            /** Muted Surface - Usage: bg-v2-surface-muted */
            muted: '#F1F5F9',
            /** Overlay Surface - Usage: bg-v2-surface-overlay */
            overlay: '#0F172A',
            /** Raised Surface - Usage: bg-v2-surface-raised */
            raised: '#FFFFFF',
          },
          /** 
           * General border roles 
           * @example border-v2-border       (DEFAULT)
           * @example border-v2-border-strong
           */
          border: {
            /** Default Border - Usage: border-v2-border */
            DEFAULT: '#E2E8F0',
            /** Strong Border - Usage: border-v2-border-strong */
            strong: '#CBD5E1',
          },
          /** 
           * Button and interactive roles 
           */
          action: {
            /** 
             * Primary Action Button
             * @example bg-v2-action-primary
             * @example text-v2-action-primary-foreground
             * @example bg-v2-action-primary-hover
             * @example bg-v2-action-primary-pressed
             */
            primary: {
              /** Primary Button Background - Usage: bg-v2-action-primary */
              DEFAULT: '#1976D2',
              /** Primary Button Text - Usage: text-v2-action-primary-foreground */
              foreground: '#FFFFFF',
              /** Primary Button Hover - Usage: bg-v2-action-primary-hover */
              hover: '#1565C0',
              /** Primary Button Pressed - action/primary/pressed · Usage: bg-v2-action-primary-pressed */
              pressed: '#0D47A1',
            },
            /** 
             * Secondary Action Button
             * @example bg-v2-action-secondary
             * @example text-v2-action-secondary-foreground
             * @example border-v2-action-secondary-border
             * @example bg-v2-action-secondary-hover
             * @example bg-v2-action-secondary-pressed
             */
            secondary: {
              /** Secondary Button Background - Usage: bg-v2-action-secondary */
              DEFAULT: '#FFFFFF',
              /** Secondary Button Text - Usage: text-v2-action-secondary-foreground */
              foreground: '#1976D2',
              /** Secondary Button Border - Usage: border-v2-action-secondary-border */
              border: '#1976D2',
              /** Secondary Button Hover Bg - action/secondary/hover · Usage: bg-v2-action-secondary-hover */
              hover: '#EFF6FF',
              /** Secondary Button Pressed Bg - action/secondary/pressed · Usage: bg-v2-action-secondary-pressed */
              pressed: '#E8F2FC',
            },
            /**
             * Disabled state (applies to ALL button variants)
             * @example bg-v2-action-disabled-bg
             * @example text-v2-action-disabled-fg
             */
            disabled: {
              /** Disabled Button Background - action/disabled/bg · Usage: bg-v2-action-disabled-bg */
              bg: '#E2E8F0',
              /** Disabled Button Text/Icons - action/disabled/fg · Usage: text-v2-action-disabled-fg */
              fg: '#94A3B8',
            },
            /**
             * Accent (Orange) Button
             * @example bg-v2-action-accent
             * @example bg-v2-action-accent-hover
             * @example bg-v2-action-accent-pressed
             * @example bg-v2-action-accent-disabledBg
             * @example text-v2-action-accent-disabledFg
             */
            accent: {
              /** Accent Button Background - action/accent/bg · Usage: bg-v2-action-accent */
              DEFAULT: '#FF8232',
              /** Accent Button Text - action/accent/fg · Usage: text-v2-action-accent-foreground */
              foreground: '#FFFFFF',
              /** Accent Button Hover - action/accent/hover · Usage: bg-v2-action-accent-hover */
              hover: '#F97316',
              /** Accent Button Pressed - action/accent/pressed · Usage: bg-v2-action-accent-pressed */
              pressed: '#EA580C',
              /** Accent Disabled Background - action/accent/disabled-bg · Usage: bg-v2-action-accent-disabledBg */
              disabledBg: '#FED7AA',
              /** Accent Disabled Text - action/accent/disabled-fg · Usage: text-v2-action-accent-disabledFg */
              disabledFg: '#FDBA74',
            },
            /**
             * Ghost / Outline Button
             * @example border-v2-action-ghost-stroke
             */
            ghost: {
              /** Ghost Button Border - action/ghost/stroke · Usage: border-v2-action-ghost-stroke */
              stroke: '#64748B',
            },
          },
          /** 
           * Base Generic Tool Colors (For features needing independent palettes)
           * Usage Pattern: {property}-v2-tool-{color}-{shade}
           * @example bg-v2-tool-orange-50
           * @example text-v2-tool-coral-600
           * @example border-v2-tool-violet-500
           */
          tool: {
            orange: { 
              /** Orange 50 - Usage: bg-v2-tool-orange-50 */
              orange50: '#FFF4ED', 
              /** Orange 500 - Usage: bg-v2-tool-orange-500, text-v2-tool-orange-500 */
              orange500: '#FF8232', 
              /** Orange 600 - Usage: text-v2-tool-orange-600 */
              orange600: '#F97316', 
              /** Orange 700 - Usage: text-v2-tool-orange-700 */
              orange700: '#EA580C' 
            },
            coral: { 
              /** Coral 50 - Usage: bg-v2-tool-coral-50 */
              coral50: '#FFEDED', 
              /** Coral 500 - Usage: bg-v2-tool-coral-500, text-v2-tool-coral-500 */
              coral500: '#FF5B5B', 
              /** Coral 600 - Usage: text-v2-tool-coral-600 */
              coral600: '#EF4444', 
              /** Coral 700 - Usage: text-v2-tool-coral-700 */
              coral700: '#DC2626' 
            },
            violet: { 
              /** Violet 50 - Usage: bg-v2-tool-violet-50 */
              violet50: '#F0F0FF', 
              /** Violet 500 - Usage: bg-v2-tool-violet-500, text-v2-tool-violet-500 */
              violet500: '#6366F1', 
              /** Violet 600 - Usage: text-v2-tool-violet-600 */
              violet600: '#4F46E5', 
              /** Violet 700 - Usage: text-v2-tool-violet-700 */
              violet700: '#4338CA' 
            },
            amber: { 
              /** Amber 50 - Usage: bg-v2-tool-amber-50 */
              amber50: '#FFF9E6',
              /** Amber 500 - tool/amber/500 · Usage: text-v2-tool-amber-amber500, bg-v2-tool-amber-amber500 */
              amber500: '#F59E0B',
              /** Amber 600 - tool/amber/600 · Usage: text-v2-tool-amber-amber600 */
              amber600: '#D97706',
            },
            pink: { 
              /** Pink 50 - Usage: bg-v2-tool-pink-50 */
              pink50: '#FFE8F0',
              /** Pink 500 - tool/pink/500 · Usage: text-v2-tool-pink-pink500, bg-v2-tool-pink-pink500 */
              pink500: '#EC4899',
              /** Pink 600 - tool/pink/600 · Usage: text-v2-tool-pink-pink600 */
              pink600: '#DB2777',
            },
            sky: { 
              /** Sky 50 - Usage: bg-v2-tool-sky-50 */
              sky50: '#E8F5FF',
              /** Sky 500 - tool/sky/500 · Usage: text-v2-tool-sky-sky500, bg-v2-tool-sky-sky500 */
              sky500: '#38BDF8',
              /** Sky 600 - tool/sky/600 · Usage: text-v2-tool-sky-sky600 */
              sky600: '#0EA5E9',
            },
          },
          /** 
           * Smart Tools Feature Palette (Contextual Colors)
           * @example bg-v2-smartTool-exam-bg
           * @example text-v2-smartTool-exam-accent
           * @example bg-v2-smartTool-exam-hover
           * 
           * @example bg-v2-smartTool-resume-bg
           * @example bg-v2-smartTool-match-bg
           * @example bg-v2-smartTool-prep-bg
           */
          smartTool: {
            /** Exam / Prep Context */
            exam: { 
              /** Exam Background - Usage: bg-v2-smartTool-exam-bg */
              bg: '#FFF4ED', 
              /** Exam Accent - Usage: text-v2-smartTool-exam-accent, bg-v2-smartTool-exam-accent */
              accent: '#FF8232', 
              /** Exam Hover - Usage: bg-v2-smartTool-exam-hover */
              hover: '#F97316' 
            },
            /** Resume / Profile Context */
            resume: { 
              /** Resume Background - Usage: bg-v2-smartTool-resume-bg */
              bg: '#FFEDED', 
              /** Resume Accent - Usage: text-v2-smartTool-resume-accent, bg-v2-smartTool-resume-accent */
              accent: '#FF5B5B', 
              /** Resume Hover - Usage: bg-v2-smartTool-resume-hover */
              hover: '#EF4444' 
            },
            /** Smart Match Context */
            match: { 
              /** Match Background - Usage: bg-v2-smartTool-match-bg */
              bg: '#F0F0FF', 
              /** Match Accent - Usage: text-v2-smartTool-match-accent, bg-v2-smartTool-match-accent */
              accent: '#6366F1', 
              /** Match Hover - Usage: bg-v2-smartTool-match-hover */
              hover: '#4F46E5' 
            },
            /** Supporting Surface Context: Prep */
            prep: { 
              /** Prep Background - Usage: bg-v2-smartTool-prep-bg */
              bg: '#FFF9E6' 
            },
            /** Supporting Surface Context: Design */
            design: { 
              /** Design Background - Usage: bg-v2-smartTool-design-bg */
              bg: '#FFE8F0' 
            },
            /** Supporting Surface Context: Interview */
            interview: { 
              /** Interview Background - Usage: bg-v2-smartTool-interview-bg */
              bg: '#E8F5FF' 
            },
          },
          /** 
           * Destructive action colors
           * @example bg-v2-danger           (DEFAULT)
           * @example bg-v2-danger-subtle
           */
          danger: {
            /** Primary Danger Color - Usage: text-v2-danger, bg-v2-danger */
            DEFAULT: '#E02924',
            /** Subtle Danger Background - Usage: bg-v2-danger-subtle */
            subtle: '#FEECEB',
          },
          /**
           * Standalone primitive scale values exposed as semantic aliases.
           * Use these when you need a specific shade that isn't covered
           * by the semantic tokens above.
           *
           * Naming: {property}-v2-primitive-{scale}-{shade}
           * @example text-v2-primitive-error-700
           * @example bg-v2-primitive-primary-50
           * @example ring-v2-primitive-info-200
           */
          primitive: {
            /** Primary tint scale (brand/primary) */
            primary: {
              /** primary/50 - action/secondary/hover bg · Usage: bg-v2-primitive-primary-50 */
              50: '#EFF6FF',
              /** primary/100 - action/secondary/pressed bg · Usage: bg-v2-primitive-primary-100 */
              100: '#E8F2FC',
            },
            /** Success scale */
            success: {
              /** success/600 - standalone success green · Usage: text-v2-primitive-success-600 */
              600: '#16A34A',
            },
            /** Error scale */
            error: {
              /** error/700 - exam tool accent / dark error · Usage: text-v2-primitive-error-700 */
              700: '#B40003',
            },
            /** Info scale */
            info: {
              /** info/200 - focus ring source · Usage: ring-v2-primitive-info-200 */
              200: '#93C5FD',
            },
            /** Amber scale */
            amber: {
              /** amber/600 - paused dot · Usage: bg-v2-primitive-amber-600 */
              600: '#CA8A04',
              /** amber/700 - warning text, paused text · Usage: text-v2-primitive-amber-700 */
              700: '#A16207',
            },
            /** Orange scale (for accent button disabled states) */
            orange: {
              /** orange/200 - accent disabled bg · Usage: bg-v2-primitive-orange-200 */
              200: '#FED7AA',
              /** orange/300 - accent disabled fg · Usage: text-v2-primitive-orange-300 */
              300: '#FDBA74',
            },
          },
        },
      },
      borderRadius: {
        /** V2 Small Radius - Usage: rounded-v2-sm */
        'v2-sm': '4px',
        /** V2 Medium Radius - Usage: rounded-v2-md */
        'v2-md': '8px',
        /** V2 Large Radius - Usage: rounded-v2-lg */
        'v2-lg': '10px',
        /** V2 Extra Large Radius - Usage: rounded-v2-xl */
        'v2-xl': '12px',
        /** V2 Radius - Usage: rounded-v2-radius */
        'v2-radius':'22px',
      },
      fontSize: {
        /** V2 Display Large - Usage: text-v2-display-l */
        'v2-display-l': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        /** V2 Display Medium - Usage: text-v2-display-m */
        'v2-display-m': ['40px', { lineHeight: '48px', fontWeight: '700' }],
        /** V2 Heading 1 - Usage: text-v2-h1 */
        'v2-h1': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        /** V2 Heading 2 - Usage: text-v2-h2 */
        'v2-h2': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        /** V2 Heading 3 - Usage: text-v2-h3 */
        'v2-h3': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        /** V2 Heading 4 - Usage: text-v2-h4 */
        'v2-h4': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        /** V2 Heading 5 - Usage: text-v2-h5 */
        'v2-h5': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        /** V2 Body Large (Regular) - Usage: text-v2-body-l */
        'v2-body-l': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        /** V2 Body Large (Medium) - Usage: text-v2-body-l-med */
        'v2-body-l-med': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        /** V2 Body Medium (Regular) - Usage: text-v2-body-m */
        'v2-body-m': ['14px', { lineHeight: '22px', fontWeight: '400' }],
        /** V2 Body Medium (Medium) - Usage: text-v2-body-m-med */
        'v2-body-m-med': ['14px', { lineHeight: '22px', fontWeight: '500' }],
        /** V2 Body Small - Usage: text-v2-body-s */
        'v2-body-s': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        /** V2 Label Large - Usage: text-v2-label-l */
        'v2-label-l': ['14px', { lineHeight: '20px', fontWeight: '600' }],
        /** V2 Label Medium - Usage: text-v2-label-m */
        'v2-label-m': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        /** V2 Label Small - Usage: text-v2-label-s */
        'v2-label-s': ['11px', { lineHeight: '16px', fontWeight: '600' }],
        /** V2 Caption - Usage: text-v2-caption */
        'v2-caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },


      screens: {
        // 'ipad-pro': { raw: '(width: 1024px) and (height: 1366px)' },
        xs: '320px', // for 320px phones
        smx: '375px', // for 375px phones
        xl: {
          max: '1536px',
        },
        mdx: '425px', // for 425px phones
        ipadAirH: { raw: '(width: 1180px) and (orientation: landscape)' },
        ipadMiniH: { raw: '(width: 1024px) and (orientation: landscape)' },
      },
      zIndex: {
        60: '60',
      },
      animation: {
        'scroll-x-infinite': 'scroll-x-infinite 20s linear infinite',
        'scroll-x-infinite-reverse': 'scroll-x-infinite-reverse 20s linear infinite',
        float: 'float 3s ease-in-out infinite',
        spin: 'spin 1s linear infinite',
      },
      keyframes: {
        'scroll-x-infinite': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'scroll-x-infinite-reverse': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '20%': { transform: 'translateY(-8px)' },
        },
      },

      backgroundImage: {
        'gradient-career': 'linear-gradient(180deg, #1976D2 0%, #845AE0 50%, #1976D2 100%)',
        'gradient-indigo-amber': 'linear-gradient(180deg, #6C63FF 0%, #F9B233 100%)',
        'gradient-deep-indigo': 'linear-gradient(180deg, #0048FF 0%, #6C63FF 100%)',
        'gradient-amber-deep-blue': 'linear-gradient(180deg, #F9B233 0%, #0048FF 100%)',
        'blue-soft-gradient':
          'linear-gradient(90deg, rgba(0, 72, 255, 0.04) 0%, rgba(108, 99, 255, 0.04) 100%)',

        'gradient-indigo-mist':
          'linear-gradient(180deg, rgba(25, 118, 210, 0.15) 0%, rgba(132, 90, 224, 0.15) 50%, rgba(25, 118, 210, 0.15) 100%)',
      },
      boxShadow: {
        customDouble: '10px 25px 100px 0px #1976D240, 0px 4px 6px 0px #0000000D',
        cardShadow: '4px 4px 12px 0px #00000008, -4px -4px 12px 0px #00000008',
        tabShadow: '0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.1)',
        courseCard: '4px 4px 12px 0px rgba(0, 0, 0, 0.02), -4px -4px 12px 0px rgba(0, 0, 0, 0.02)',
        tableShadow: '4px 4px 12px 0 rgba(0, 0, 0, 0.05), -4px -4px 12px 0 rgba(0, 0, 0, 0.05)',
        leadsCardShadow: '4px 4px 12px 0px #00000012, -4px -4px 12px 0px #00000012',
        navbarShadow: '0px 8px 25px -5px #00000026',
        elevatedLayer: '0px 8px 10px -6px #0000001A, 0px 20px 25px -5px #0000001A',
        dualDepth: '4px 4px 12px 0px #00000026, -4px -4px 12px 0px #00000026',
        deepShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        customShadow: '5px 5px 50px -15px rgba(0,0,0,0.29)',
        dualCard: '4px 4px 12px 0px #0000000D, -4px -4px 12px 0px #0000000D',
        customDual: '4px 4px 12px 0px #00000026, -4px -4px 49px 0px #00000026',

        detailsCard:
          '2.76px 2.76px 8.27px 0px rgba(0, 0, 0, 0.03), -2.76px -2.76px 8.27px 0px rgba(0, 0, 0, 0.03)',
      },
    },
  },

  plugins: [
    // require('tailwind-scrollbar-hide'),
    // require('tailwind-scrollbar'),
    // require('@tailwindcss/typography'),
    // function ({ addUtilities }) {
    //   const newUtilities = {
    //     '.text-gradient-career': {
    //       backgroundImage: 'linear-gradient(180deg, #1976D2 0%, #845AE0 50%, #1976D2 100%)',
    //       'background-clip': 'text',
    //       '-webkit-background-clip': 'text',
    //       color: 'transparent',
    //       '-webkit-text-fill-color': 'transparent',
    //     },
    //   };
    //   addUtilities(newUtilities);
    // },
  ],
};
