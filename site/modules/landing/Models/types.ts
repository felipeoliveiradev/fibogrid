export type ArchitectureIconKind =
  | "virtual"
  | "manager"
  | "registry"
  | "fibo"
  | "group"
  | "range";

export interface ArchitectureCard {
  title: string;
  desc: string;
  href: string;
  icon: ArchitectureIconKind;
}

export interface VoiceCard {
  quote: string;
  author: string;
  badge: string;
  href: string;
}

export interface FaqEntry {
  code: string;
  q: string;
  a: string[];
}

export interface DocIndexEntry {
  num: string;
  title: string;
  desc: string;
  tag: string;
  href: string;
}

export type MobileNavLink = {
  keyId: string;
  label: string;
  onPress: () => void;
};
