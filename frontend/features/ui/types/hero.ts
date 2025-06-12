import React from "react";

export interface HeroAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  icon?: React.ReactNode;
}

export interface HeroContent {
  badge: {
    icon: React.ReactNode;
    text: string;
  };
  title: {
    main: string;
    highlight: string;
    subtitle: string;
  };
  description: string;
  highlight: string;
  actions: HeroAction[];
  statusMessage: string;
}

export interface DeviceMockup {
  type: "phone" | "desktop";
  content: {
    title: string;
    description?: string;
    author?: string;
  };
}
