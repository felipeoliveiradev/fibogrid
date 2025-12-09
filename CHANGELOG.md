# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
