/**
 * Sanitize SVG content by removing potentially dangerous elements and attributes
 * This is a lightweight alternative to DOMPurify for serverless environments
 */
export default function sanitizeSVGs(svgContent: string): string | null {
  try {
    // Remove dangerous elements and attributes
    const dangerous = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,  // script tags
      /on\w+\s*=\s*["'][^"']*["']/gi,                          // event handlers (onclick, onload, etc.)
      /javascript:/gi,                                          // javascript: protocol
      /<iframe/gi,                                              // iframes
      /<embed/gi,                                               // embed tags
      /<object/gi,                                              // object tags
      /<foreignObject/gi,                                       // foreignObject (can embed HTML)
      /xlink:href\s*=\s*["']javascript:/gi,                    // javascript in xlink:href
    ];

    let cleaned = svgContent;
    dangerous.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Validate it's still a valid SVG structure
    if (!cleaned.includes('<svg') || !cleaned.includes('</svg>')) {
      return null;
    }

    return cleaned;
  } catch {
    return null;
  }
}