# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.32] - 2026-10-15

### Added
- **Next.js marketing site** - New `site/` App Router app (landing + docs + sitemap/robots) to replace GitHub Pages; OpusJake-inspired layout with FiboGrid brand; locales `en` / `pt` / `es` / `zh`.

### Changed
- **Public docs URL** - Homepage and README now point to [https://fibogrid.vercel.app](https://fibogrid.vercel.app) instead of GitHub Pages.
- **GitHub Pages workflow** - Retired Vite Pages deploy; public site targets Vercel with Root Directory `site`.

## [1.0.31] - 2026-10-14

### Added
- **Infinite scroll (server)** - Lazy page loading for server-side data sources, with LRU page cache, prefetch, and abortable fetches.
- **`AbortSignal` on server requests** - `ServerSideDataSourceRequest.signal` is passed on main, prefetch, background refresh, and append `getRows` calls so cancelled pages can abort the network request.
- **Cell undo entries** - Cell commits push a lightweight `{ kind: 'cell', rowId, field, previous, hadField }` history entry instead of cloning the full row array; paste still uses full snapshots.
- **Filter value virtualization by default** - `enableFilterValueVirtualization` defaults to `true`; unique filter values are scanned in idle chunks when opening a column filter.
- **In-repo docs tree** - Structured docs under `docs/` (`01`–`11`) plus `docs/guides/usage.md` and `docs/guides/theming.md`.
- **Vitest suite** - Unit tests for helpers, infinite scroll, and lazy page cache (`npm test`).

### Changed
- **Performance — data signature** - Source sync uses array reference equality; no deep cell walk on every infinite-scroll page append.
- **Performance — grouping** - Paginated client groups skip the full-tree flatten; only the visible page is flattened on expand/collapse.
- **Performance — selection** - Selected-row resolution uses a cached `Map<id, RowNode>` while the rows identity is stable.
- **Performance — column resize** - Width updates are coalesced with `requestAnimationFrame` and flushed on mouseup.
- **Performance — quick filter** - Client filtering uses `useDeferredValue`, skips hidden columns, and lowercases the needle once; select filters use a `Set` for membership.
- **Performance — cell commit** - Row nodes are patched only for overridden ids; filter/sort are reused when the edited field is outside the active models.
- **Excel export** - SheetJS is loaded via dynamic `import('xlsx')` so it is not in the main ES bundle until export runs.
- **SheetJS dependency** - Upgraded from vulnerable `xlsx@0.18.5` (npm) to **SheetJS CE 0.20.3** via the official CDN tarball (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`).
- **Fill handle** - `editable` functions fail closed without a real `GridApi`; pass `api` in `useFillHandle` options for permission-aware columns.
- **Grid API row ids** - Without `getRowId`, mutations require a non-empty `row.id` (no empty-string fallback that could corrupt updates).
- **MCP server paths** - Docs and scripts use portable paths; `configure-claude.sh` / `test-server.sh` resolve relative to the script directory.
- **Repo hygiene** - `.gitignore` / `.npmignore` ignore agent tooling, backups, and alternate lockfiles; dual `bun.lockb` removed in favour of npm.

### Fixed
- Clipboard copy now runs the same formula neutralization as CSV/Excel export (`=`, `@`, tab/CR, and non-numeric `+`/`-` prefixes).
- Stale cell overrides are dropped only when the source row array identity changes and overrides exist.
- Group expand/collapse no longer flattens the entire grouped dataset when client pagination is on.
- Cancelling a server page no longer only discards the response — the request receives an abort signal.

### Security
- Closed medium findings from the FiboGrid security audit: clipboard formula injection, misplaced Portainer `tools.yaml`, row-id collision on mutations, fill-handle editable bypass, and SheetJS CVEs (prototype pollution / ReDoS fixed in 0.20.3).
- Removed Portainer control-plane `tools.yaml` from the repository root.
- Removed local agent config (`.claude/`) and absolute machine paths from MCP documentation.

### Removed
- Root-level `THEMING.md` and `USAGE.md` (moved to `docs/guides/`).
- `EventBuilder.ts.backup`, orphan `scripts/` favicon stub, `.DS_Store` clutter.
- Static top-level `import 'xlsx'` in the Excel export module.

## [1.0.16] - 2025-12-11

### Added
- **Enhanced Internationalization** - Harden locale support across all components.
- **Locale Updates** - Added missing keys to `koKR` and verified `enUS`, `esES`, `ptBR` dictionaries.
- **Flex Column Layout** - Added support for `flex` property in `ColumnDef`. Columns with `flex` defined will now automatically fill the remaining available space in the grid container.
- **Global Column Defaults** - Clarified support for `defaultColDef` prop to apply common settings (like `flex: 1`) to all columns efficiently.
- **Themeable Z-Index System** - Added a multi-layer z-index system.
  - **Global Variables**: `--fibogrid-z-popover`, `--fibogrid-z-popover-nested`, `--fibogrid-z-dialog`, `--fibogrid-z-panel`.
  - **Granular Variables**: `--fibogrid-z-filter-popover`, `--fibogrid-z-column-menu`, `--fibogrid-z-filter-panel`, `--fibogrid-z-column-panel`.

### Fixed
- **TypeScript Errors** - Resolved "Cannot find name 'locale'" build errors in strict mode.
- **Context Awareness in Popovers** - Multi-language context now correctly propagates to `FilterPopover`.
- **Header Localization** - `GridHeader` now correctly receives and utilizes locale definitions.
- **Z-Index Specificity** - Added `!important` to z-index theme utilities to ensure they strictly override third-party library defaults.
- **Row Click event on Checkbox** - Fixed an issue where `onRowClicked` and `onRowClickFallback` were not firing when clicking the row selection checkbox.

## [1.0.15] - 2025-12-11

### Added
- **Grid Refresh API** - Added `api.refresh()` method to trigger data reload (server-side) or state reset (client-side).
- **Toolbar Refresh** - Connected the Grid Toolbar's refresh button to the new `api.refresh()` method.

### Fixed
- **Quick Filter Sync** - Fixed an issue where `api.removeQuickFilter()` would clear the filter but not update the search input in the toolbar.
- **Refresh Infinite Loop** - Fixed a potential infinite loop in server-side data fetching when triggering refreshes.

### Changed
- **State Synchronization** - Optimized internal state synchronization in `useGridState` and `GridToolbar` to use `useRef` instead of `useEffect` for better performance and to prevent unwanted side effects.

## [1.0.14] - 2025-12-11

### Added
- **Custom Layouts** - Added `configs.header.layout` and `configs.footer.layout` to allow full reordering of toolbar and footer elements.
- **Granular Footer Control** - Header and Footer can now be customized with specific keys (e.g., `'search'`, `'pagination-controls'`, `'status-info'`) and spacers for flexible implementation.
- **Custom Layout Demo** - Added a new demo section showcasing the new layout capabilities.

## [1.0.13] - 2025-12-11

### Added
- **Grid Registry System** - Introduced `GridRegistryContext`, `GridRegistryProvider`, and `useGridRegistry` hooks to enable seamless cross-grid communication.
- **Selection Toggle** - Improved `rowSelection="single"` behavior to allow toggling off selection by clicking the selected row again.

### Changed
- **Performance Optimization** - Optimized `GridRegistryContext` to use stable references (`useRef`), preventing unnecessary re-renders when grids register or unregister.

## [1.0.12] - 2025-12-11

### Added
- **Pinned Column Priority** - Added `pinnedPriority` property to `ColumnDef` to control the sort order of pinned columns (e.g., `pinnedPriority: 1` ensures the column is the most "inner" or "important" one in the pinned stack).
- **Custom Column Types** - Added explicit `type: 'checkbox' | 'rowNumber'` to `ColumnDef` and `field: 'checkbox' | 'number'` magic strings. This allows defining Row Number and Checkbox columns as regular columns in `columnDefs`, automatically disabling the built-in fixed columns for better customization flexibility.

### Fixed
- **Header Layout** - Fixed an issue where header cell content could break or misalign due to improper container elements (`div` vs `span`) and CSS formatting.
- **Context Menu Scope** - Restrict `GridContextMenu` to trigger ONLY on the rows area. Right-clicking headers or footers now correctly shows the minimal/default browser menu instead of the grid actions.
- **Grid Header Height** - Fixed invalid CSS unit generation for header height.

## [1.0.11] - 2025-12-11

### Added
- **Localization Support** - `lang` prop now accepts typed locales with built-in `enUS`, `es` and `ptBR` dictionaries, exported via `FiboGridLocale`
- **Demo Refresh** - New stock market demo composed of modular header/settings/grid components for clearer usage examples
- **Custom View Props** - New properties to show or customize elements in the data table via the `FiboGridLocale` interface
- **Hybrid Filtering** - Added a new prop to columns called `useInternalFilter`.
### Changed
- **Styles Consolidation** - Removed unused CSS bundles and now ship a single `lib.css` import from `components/FiboGrid/styles`
- **Project Structure** - Updated routes/imports to use folder-based pages and cleaned Vite config for clearer dev/prod separation

### Removed
- **Legacy Assets** - Deprecated CSS outputs (`fibogrid.css`, `fibogrid-isolated.css`, `fibogrid-lib.css`, `fibogrid-theme.css`) and the legacy monolithic demo page

## [1.0.10] - 2025-12-10

### Added
- **Data Access Helpers** - Grid components now use `getValueFromPath` for safer nested access
- **Demo Editor Options** - Demo gains a cell editor with predefined values for quicker interactions

### Changed
- **Filtering/Sorting** - Logic updated to use consistent data retrieval via helpers
- **GridCell & FiboGrid** - Refactored to rely on helper-based access instead of direct props

### Enhanced
- **Data Reliability** - More robust handling of nested fields across filtering, sorting, and rendering
- **Demo UX** - Faster selection through predefined editor values

## [1.0.9] - 2025-12-10

### Added
- **Cell Value Updates** - `onCellValueChanged` now updates row data dynamically and triggers user feedback via toasts in Demo

### Changed
- **Demo Flow** - Refactored cell update handling for clarity and reliability
- **Grid State** - Improved grid state hook to support the new update flow
- **Package** - Minor package metadata/formatting adjustment

### Enhanced
- **Editing UX** - Clearer feedback and more robust data updates after edits

## [1.0.8] - 2025-12-10

### Added
- **Value Setter Validation** - Enabled `valueSetter` in `ColumnDef` to validate and transform values during edits
- **Dynamic Row Classes** - Support for `getRowClass` to style rows based on their data
- **Contextual Menus** - Context menu now supports dynamic items/actions using row data
- **Documentation** - Updated docs to cover new validation and styling capabilities

### Changed
- **Grid API** - Improved edit workflow to incorporate validation via `valueSetter`
- **Context Menu** - Enhanced to receive row context and handle dynamic actions
- **GridRow** - Better styling flexibility to reflect dynamic row classes

### Enhanced
- **Editing UX** - More reliable validation/transformation during cell edits
- **Row Styling UX** - Clearer visual feedback through data-driven row classes
- **Context Menu UX** - More relevant actions based on the selected row

## [1.0.7] - 2025-12-10

### Added
- **Value Setter Validation** - Added `valueSetter` functionality to `ColumnDef` for validation during cell edits
- **Dynamic Row Classes** - Implemented `getRowClass` function support for dynamic row styling based on row data
- **Enhanced Context Menu** - Added support for dynamic context menu items and actions based on row data
- **Row Data Context** - Context menu now receives row data for more contextual actions

### Changed
- **GridRow Component** - Enhanced to support dynamic row classes and improved styling flexibility
- **ContextMenu Component** - Updated to handle new dynamic items and actions based on row context
- **FiboGrid API** - Improved cell editing workflow with validation support through valueSetter

### Enhanced
- **Cell Editing** - Better validation and data transformation during cell edits
- **Row Styling** - More flexible row styling through dynamic class assignment
- **User Experience** - Improved context menu with row-specific actions

## [1.0.6] - 2025-12-10

### Added
- **Favicon Support** - Added favicon support with both SVG and ICO formats for better branding
- **Beta Badge** - Added Beta badge next to FiboGrid name in all page headers for brand consistency
- **Column Layout Properties** - Added `isFirstPinnedRight` and `isLastCenterBeforeRight` properties to GridCell for improved layout handling

### Changed
- **Column Widths** - Adjusted column widths in Home component for better alignment and full-width utilization
- **Grid Layout** - Enhanced GridHeader and GridRow to utilize new properties for better visual consistency in column rendering

### Fixed
- **Pinned Column Borders** - Fixed left border visibility on right-pinned columns
- **Border Duplication** - Removed duplicate border between last center column and first right-pinned column for cleaner visual separation

## [1.0.5] - 2025-12-09

### Fixed
- **Checkbox Checkmark** - Fixed missing checkmark content in checkbox checked state (added `content: '✓'`)
- **Component Layout** - Adjusted styling in FiboGrid components for improved layout consistency
- **Checkbox Indeterminate State** - Fixed indeterminate checkbox state rendering with proper visual indicator

### Changed
- **Component Styling** - Improved layout and spacing in various FiboGrid components for better visual consistency

## [1.0.4] - 2025-12-09

### Added
- **Complete Theme System Migration** - Migrated all inline styles to CSS variables system
- **Theme Presets** - Added complete theme presets (Matrix, Uber, Material, Apple, Excel) with all CSS variables
- **Semantic Component Classes** - Added utility classes for toolbar, statusbar, pagination, badges, and search inputs
- **Right-click Selection** - Implemented right-click selection logic for better user interaction
- **Context Menu Enhancements** - Enhanced context menu with new styling and features
- **Interactive Theme Preview** - Added theme builder with live preview in documentation
- **Controlled ThemeSelector** - Enhanced ThemeSelector component for controlled usage

### Changed
- **CSS Architecture** - Migrated all component inline styles to theme system using CSS variables
- **Theme Management** - Streamlined theme management in ThemeSelector and documentation
- **Checkbox Styling** - Complete redesign of checkbox styling with custom checkmark using CSS
- **Column Panel Styling** - Migrated ColumnPanel to use theme variables instead of hardcoded Tailwind classes
- **Popover Styling** - Migrated all popover components to use theme variables
- **Build Process** - Updated build process to copy library to node_modules for GitHub Pages deployment

### Fixed
- **Checkbox Interaction** - Fixed checkbox column interaction by removing `pointer-events-none`
- **Checkbox Visual State** - Fixed checkbox checked state rendering with proper CSS
- **Theme Variable Coverage** - Ensured all theme presets have complete variable definitions matching Matrix theme pattern
- **Row Selection Visual Feedback** - Fixed row selection background colors and checkbox states

### Documentation
- Enhanced documentation with context menu details and examples
- Added comprehensive theming section with interactive examples
- Updated theme builder documentation with preset examples

## [1.0.3] - 2025-12-09

### Fixed
- **CRITICAL: Removed global Tailwind styles** - CSS now fully isolated to `.fibogrid` container
- Removed `@tailwind base` directive that was affecting user's application styles
- Created isolated CSS system that doesn't conflict with user's styles
- All styles are now scoped and won't affect elements outside the grid

### Changed
- Refactored CSS build process to exclude global resets
- Created `fibogrid-isolated.css` with component-specific styles only
- Updated build configuration to prevent style leakage

### Added
- Complete server-side integration documentation with examples
- Backend API examples for Node.js/Express, Python/FastAPI, and Laravel/PHP
- Debounced search hook example
- Props reference for server-side operations

## [1.0.2] - 2025-12-09

### Added
- **Isolated CSS Variables System** - All styles scoped under `.fibogrid` class
- 60+ customizable CSS variables prefixed with `--fibogrid-*`
- Complete theming documentation (THEMING.md)
- No style conflicts with user's application
- Custom theme support via CSS classes or inline styles
- Pre-built theme examples (Compact, Comfortable, Material, Minimal)

### Fixed
- Removed Lovable references from project
- Fixed React Router basename for GitHub Pages

## [1.0.1] - 2025-12-09

### Fixed
- Added CSS styles export (`fibogrid/styles.css`)
- Users can now import styles: `import 'fibogrid/styles.css'`
- Fixed GitHub Actions workflow to use `npm install` instead of `npm ci`

## [1.0.0] - 2025-12-09

### Added
- Initial release of FiboGrid
- Virtual scrolling optimized for 100k+ rows
- Multi-column sorting with priority order
- Excel-style filtering with multiple conditions
- Column pinning (left/right)
- Inline cell editing with various editor types
- Row grouping with aggregations (sum, avg, min, max, count)
- Range selection for copying cell ranges
- Drag & drop for rows and columns
- Export to CSV and Excel formats
- Full dark mode support
- Linked grids functionality
- Server-side pagination, sorting, and filtering
- Full keyboard navigation
- Complete TypeScript support
- Comprehensive documentation and examples

### Features
- **Performance**: Optimized rendering with virtual scrolling
- **Flexibility**: Highly customizable columns and cells
- **Modern UI**: Built with Tailwind CSS and shadcn/ui
- **Developer Experience**: Full TypeScript support with type inference
- **Accessibility**: Keyboard navigation and ARIA labels

### Documentation
- Live documentation site at GitHub Pages
- Interactive examples and demos
- Complete API reference
- Migration guides and best practices
