export type DocsChapter = {
  slug: string[];
  title: string;
  href: string;
};

export type DocsSection = {
  id: string;
  label: string;
  items: DocsChapter[];
};
