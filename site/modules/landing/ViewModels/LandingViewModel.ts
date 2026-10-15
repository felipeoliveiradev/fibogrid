import {
  bindHotkeys,
  createStore,
  ScrollController,
  signal,
  writeClipboard,
} from "fiboui";
import {
  ARCH_SLIDE_GAP,
  FAQ_DEFAULT_OPEN,
  type DocIndexEntry,
} from "../Models";

export const libraryOpen = signal(false);
export const cmdQuery = signal("");
export const copiedInstall = signal(false);
export const mobileNavOpen = signal(false);
export const faqOpen = signal<string[]>([...FAQ_DEFAULT_OPEN]);

export const architectureScroll = new ScrollController();

export const landingStore = createStore({
  installCmd: "npm install fibogrid",
});

export function filterDocs(
  query: string,
  library: readonly DocIndexEntry[],
): DocIndexEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...library];
  return library.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.desc.toLowerCase().includes(q) ||
      d.tag.toLowerCase().includes(q),
  );
}

export const landingVm = {
  openLibrary() {
    libraryOpen.value = true;
  },
  closeLibrary() {
    libraryOpen.value = false;
    cmdQuery.value = "";
  },
  setCmdQuery(q: string) {
    cmdQuery.value = q;
  },
  scrollArchitecture(dir: -1 | 1) {
    architectureScroll.scrollByChild(dir, ARCH_SLIDE_GAP);
  },
  toggleMobileNav() {
    mobileNavOpen.value = !mobileNavOpen.value;
  },
  closeMobileNav() {
    mobileNavOpen.value = false;
  },
  copyInstall() {
    void writeClipboard(landingStore.getState().installCmd);
    copiedInstall.value = true;
    const t = setTimeout(() => {
      copiedInstall.value = false;
    }, 1600);
    void t;
  },
  toggleFaq(code: string) {
    const cur = faqOpen.value;
    faqOpen.value = cur.includes(code)
      ? cur.filter((c) => c !== code)
      : [...cur, code];
  },
};

let landingHotkeysBound = false;
export function bindLandingHotkeys() {
  if (landingHotkeysBound) return;
  landingHotkeysBound = true;
  bindHotkeys([
    {
      key: "k",
      metaOrCtrl: true,
      preventDefault: true,
      run: () => landingVm.openLibrary(),
    },
    {
      key: "Escape",
      when: () => libraryOpen.value,
      run: () => landingVm.closeLibrary(),
    },
  ]);
}

bindLandingHotkeys();
