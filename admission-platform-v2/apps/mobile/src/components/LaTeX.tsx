/**
 * LaTeX Component for React Native
 * Renders mathematical notation using WebView and MathJax
 *
 * Supports:
 * - Inline math: $...$
 * - Display math: $$...$$
 * - Plain text (no LaTeX)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface LaTeXProps {
  children: string;
  style?: any;
}

export const LaTeX: React.FC<LaTeXProps> = ({ children, style }) => {
  // Handle null/undefined children
  if (!children) {
    return <Text style={style}></Text>;
  }

  // Quick optimization: if no LaTeX delimiters, just return plain text
  if (!children.includes('$') && !children.includes('\\[')) {
    return <Text style={[styles.plainText, style]}>{children}</Text>;
  }

  // Create HTML with MathJax to render the LaTeX
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
      <script>
        MathJax = {
          tex: {
            inlineMath: [['$', '$']],
            displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']]
          },
          startup: {
            ready: () => {
              MathJax.startup.defaultReady();
              MathJax.startup.promise.then(() => {
                // Notify React Native that rendering is complete
                window.ReactNativeWebView.postMessage('rendered');
              });
            }
          }
        };
      </script>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #374151;
          margin: 8px;
          padding: 0;
        }
        .math-content {
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="math-content">
        ${children}
      </div>
    </body>
    </html>
  `;

  // Estimate height based on content
  const estimatedHeight = Math.max(50, Math.ceil(children.length / 40) * 30);

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ height: estimatedHeight, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        javaScriptEnabled={true}
        androidLayerType="software"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  plainText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
});

export default LaTeX;
