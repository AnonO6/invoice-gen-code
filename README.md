# Invoice PDF Generator

A Node.js-based invoice generator that creates professional PDF invoices using EJS templating and HTML-to-PDF conversion.

## Overview

This project generates PDF invoices with proper formatting, GST calculations, and professional layout. It includes advanced page-break handling to prevent line items from being split across pages.

## Key Features

- Professional invoice layout with company branding
- GST/tax calculations with proper formatting
- Client billing information management
- Line items with costs and descriptions
- Amount in words conversion (Indian numbering system)
- Bank details and legal notices
- **Advanced page-break protection** for line items

## Technical Solution: Atomic Service Blocks

### Problem Solved
The original implementation had issues where invoice line items would get **vertically sliced** across page boundaries, making the PDF look unprofessional and hard to read.

### Solution: Atomic Block Approach
Instead of relying on unreliable CSS `page-break` properties with PhantomJS/html-pdf, we implemented an **atomic block structure**:

```html
<tr>
  <td colspan="3">
    <div style="display: inline-block; width: 100%;">  <!-- Atomic unit -->
      <div style="display: table;">                    <!-- Internal layout -->
        <div style="display: table-cell;">Service</div>
        <div style="display: table-cell;">Quantity</div>  
        <div style="display: table-cell;">Price</div>
      </div>
    </div>
  </td>
</tr>
```

### Why This Works
1. **PhantomJS treats `inline-block` elements as atomic units** - they cannot be split across pages
2. **No reliance on CSS page-break properties** which are unreliable in PhantomJS
3. **Natural page breaks occur between complete line items**, not within them
4. **Text wrapping is preserved** within the service name column using `word-wrap: break-word`
5. **Maintains exact visual layout** as traditional table structure

### Text Wrapping Strategy
- **Service Name Column**: Uses `word-wrap: break-word` and `overflow-wrap: break-word` to allow long service names to wrap within their cell
- **Quantity & Price Columns**: Use `white-space: nowrap` to keep these compact and prevent unnecessary wrapping
- **Row Integrity**: Each complete row (including wrapped text) stays together on the same page

## Installation & Setup

### Prerequisites
- Node.js (v12 or higher)
- npm

### Install Dependencies
```bash
npm install
```

Required packages:
- `ejs` - Template engine
- `html-pdf` - HTML to PDF conversion
- `intl` - Internationalization support

## How to Run

### Generate Invoice PDF
```bash
node index.js
```

This will:
1. Process the invoice data from `index.js`
2. Render the HTML template from `test.html`
3. Convert HTML to PDF using `html-pdf`
4. Generate `out.pdf` in the project directory

### Customize Invoice Data
Edit the `data` object in `index.js` to modify:
- Client information
- Line items and services
- Invoice numbers and dates
- Company details
- Tax information

## Project Structure

```
invoice_test/
├── index.js          # Main script with invoice data and PDF generation
├── test.html         # EJS template for invoice HTML structure
├── out.pdf           # Generated PDF invoice (created after running)
├── package.json      # Project dependencies and configuration
├── package-lock.json # Dependency lock file (gitignored)
├── node_modules/     # Dependencies folder (gitignored)
├── .gitignore        # Git ignore rules
└── README.md         # This documentation
```

## Key Files

### `index.js`
- Contains invoice data structure
- Implements amount-to-words conversion
- Configures PDF generation options
- Handles EJS template rendering

### `test.html`
- EJS template with professional invoice layout
- Implements atomic block structure for line items
- Responsive design with proper spacing
- GST and tax calculation display

## Recent Improvements

### Page-Break Fix (Atomic Blocks)
- **Problem**: Line items were getting vertically sliced across pages
- **Solution**: Restructured each line item as an unbreakable `inline-block` element
- **Result**: Clean page breaks between complete line items, no more slicing

### Text Wrapping Enhancement
- **Problem**: Long service names were overlapping other columns
- **Solution**: Added `word-wrap: break-word` to service column while keeping quantity/price columns compact
- **Result**: Long service descriptions wrap naturally within their cell boundaries

### Header Spacing Optimization
- Reduced gap between header and company information
- Improved overall layout density and professional appearance

## Testing

The project includes test data with 5 diverse line items to verify edge cases:
1. Short service names (single line)
2. Medium service names (1-2 lines)
3. Very long service names (multiple lines)
4. Different cost values and formatting
5. Mixed content lengths

## Output

The generated `out.pdf` includes:
- Professional header with company logo space
- Client billing information
- Detailed service line items with proper formatting
- Tax calculations (GST/IGST)
- Total amounts in numbers and words
- Bank details and legal notices
- Authorized signature section

## Browser Compatibility

Uses PhantomJS rendering engine through `html-pdf` library, ensuring consistent PDF generation across different environments.

## License

ISC License

---

**Note**: This solution specifically addresses page-break issues commonly encountered when generating PDFs from HTML using PhantomJS-based libraries. The atomic block approach provides a robust solution that works reliably across different content lengths and page boundaries.
