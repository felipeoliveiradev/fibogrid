# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
