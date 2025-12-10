# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
