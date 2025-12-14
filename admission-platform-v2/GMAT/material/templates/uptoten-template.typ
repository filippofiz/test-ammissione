// ============================================================================
// UPTOTEN DOCUMENT TEMPLATE
// A reusable Typst template for all UpToTen educational materials
// ============================================================================

// ----------------------------------------------------------------------------
// TEMPLATE CONFIGURATION
// ----------------------------------------------------------------------------

// Brand Colors
#let uptoten-blue = rgb("#021d49")      // Dark navy blue - primary
#let uptoten-green = rgb("#4caf50")     // Material green - tips/success
#let uptoten-orange = rgb("#ffb606")    // Golden orange - warnings

// Document metadata (customize these for each document)
#let doc-title = "Document Title"
#let doc-subtitle = "Document Subtitle"
#let doc-level = "Level"                 // e.g., "Overview", "Fundamentals", "Core", "Excellence"
#let doc-intro = "Introduction text for this document."

// Logo path (relative to the document location)
#let logo-path = "../../Logo.png"

// ----------------------------------------------------------------------------
// STYLED BOX COMPONENTS
// ----------------------------------------------------------------------------

// Info box - Blue background for definitions and important concepts
#let info-box(breakable: false, content) = block(
  fill: uptoten-blue.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  breakable: breakable,
  content
)

// Tip box - Green background for strategies and best practices
#let tip-box(breakable: false, content) = block(
  fill: uptoten-green.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  breakable: breakable,
  content
)

// Warning box - Orange background for critical warnings and common traps
#let warning-box(breakable: false, content) = block(
  fill: uptoten-orange.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  breakable: breakable,
  content
)

// Example box - Gray background for worked examples
// Use breakable: true for long examples that should flow across pages
#let example-box(breakable: false, content) = block(
  fill: gray.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  breakable: breakable,
  content
)

// Strategy box - Green border for advanced strategy guidance
#let strategy-box(breakable: false, content) = block(
  fill: uptoten-green.lighten(95%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  stroke: 1pt + uptoten-green,
  breakable: breakable,
  content
)

// Highlight box - For emphasizing key points
#let highlight-box(content) = box(
  fill: uptoten-blue.lighten(90%),
  inset: 12pt,
  radius: 4pt,
  width: 100%,
  stroke: 1pt + uptoten-blue,
  content
)

// Checkbox - Empty checkbox for forms and checklists
#let checkbox = box(
  width: 0.8em,
  height: 0.8em,
  stroke: 0.5pt + black,
  radius: 1pt,
  inset: 0pt,
)

// ----------------------------------------------------------------------------
// TABLE STYLING HELPER
// ----------------------------------------------------------------------------

// Creates a styled table with UpToTen branding
// Usage: #uptoten-table(columns: 3, header: ("Col1", "Col2", "Col3"), ..data)
#let uptoten-table(columns: 2, header: (), ..data) = {
  let header-cells = header.map(h => table.cell(fill: uptoten-blue.lighten(90%), text(weight: "bold", h)))

  table(
    columns: columns,
    stroke: 0.5pt + gray,
    inset: 8pt,
    align: left,
    ..header-cells,
    ..data.pos()
  )
}

// ----------------------------------------------------------------------------
// DOCUMENT SETUP FUNCTION
// ----------------------------------------------------------------------------

#let uptoten-doc(
  title: "Document Title",
  subtitle: "Document Subtitle",
  level: "Level",
  intro: "Introduction text for this document.",
  logo: "../../Logo.png",
  show-legal: true,
  legal-text: none,
  body
) = {
  // Page configuration
  set page(
    paper: "a4",
    margin: (x: 2.5cm, y: 2.5cm),
    numbering: "1",

    // Header (from page 2 onwards)
    header: context {
      if counter(page).get().first() > 1 [
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          [#text(style: "italic", size: 10pt, fill: uptoten-blue)[#title - #subtitle]],
          [#image(logo, width: 2cm)]
        )
        #v(-0.3em)
        #line(length: 100%, stroke: 1pt + uptoten-green)
      ]
    },

    // Footer (from page 2 onwards)
    footer: context {
      if counter(page).get().first() > 1 [
        #line(length: 100%, stroke: 0.5pt + uptoten-green)
        #v(-0.5em)
        #align(center)[
          #text(size: 9pt, fill: uptoten-blue)[
            Page #counter(page).display() | UpToTen - Learn Stem More
          ]
        ]
      ]
    }
  )

  // Text configuration
  set text(
    font: "Arial",
    size: 11pt,
    lang: "en"
  )

  // Paragraph configuration
  set par(
    justify: true,
    leading: 0.65em
  )

  // Heading numbering
  set heading(numbering: "1.")

  // ---- TITLE PAGE ----
  {
    v(2cm)
    align(center)[
      #figure(
        image(logo, width: 7cm),
        numbering: none
      )
    ]

    v(1cm)

    align(center)[
      #text(size: 28pt, weight: "bold", fill: uptoten-blue)[#title]

      #v(0.5em)

      #text(size: 24pt, weight: "bold", fill: uptoten-blue)[#subtitle]

      #v(0.5em)

      #text(size: 16pt, fill: uptoten-green)[#level]

      #v(1em)

      #line(length: 60%, stroke: 2pt + uptoten-green)

      #v(1em)

      #text(size: 11pt)[#intro]
    ]

    v(1fr)

    // Footer info
    align(center)[
      #text(size: 10pt, fill: gray)[
        Via G. Frua 21/6, Milano | www.uptoten.it
      ]
    ]

    v(1em)

    // Legal notices
    if show-legal {
      let default-legal = [
        *TRADEMARK NOTICE:* GMAT™ is a trademark of the Graduate Management Admission Council (GMAC). This material is not endorsed by, affiliated with, or associated with GMAC. All GMAT-related trademarks are the property of their respective owners.

        *COPYRIGHT & DISTRIBUTION NOTICE:* This document is proprietary educational material of UpToTen. All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means without prior written permission. Unauthorized copying, sharing, or redistribution is strictly prohibited.

        *EDUCATIONAL PURPOSE:* This material is intended solely for educational purposes to help students prepare for standardized tests.
      ]

      box(
        width: 100%,
        inset: 10pt,
        radius: 4pt,
        fill: white,
        stroke: 0.5pt + gray,
        text(size: 7pt, fill: gray)[
          #if legal-text != none { legal-text } else { default-legal }
        ]
      )
    }

    pagebreak()
  }

  // ---- MAIN CONTENT ----
  body
}

// ----------------------------------------------------------------------------
// USAGE EXAMPLE (Comment this out in production)
// ----------------------------------------------------------------------------

/*
#show: uptoten-doc.with(
  title: "GMAT",
  subtitle: "Quantitative Reasoning",
  level: "Fundamentals",
  intro: "This guide covers the fundamental mathematical concepts you need to master for the GMAT Quantitative Reasoning section.",
  logo: "../../Logo.png"
)

= Introduction

This is the first section of your document.

#info-box[
  *Key Concept:* This is an important definition or concept that students should remember.
]

== Subsection

Here's some content in a subsection.

#tip-box[
  *Pro Tip:* Use this box for strategic advice and best practices.
]

#warning-box[
  *Watch Out:* Use this for common mistakes and pitfalls to avoid.
]

#example-box[
  *Example:* Here's a worked example showing how to solve a problem.

  Step 1: Identify the problem type

  Step 2: Apply the appropriate strategy

  Step 3: Verify your answer
]

#strategy-box[
  *Advanced Strategy:* For high-level strategic guidance and decision frameworks.
]

= Summary

This concludes the document.
*/
