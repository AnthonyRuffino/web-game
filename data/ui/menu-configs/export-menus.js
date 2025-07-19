// Export System - Serialization and Export/Import Functionality
// JSON export, UI skin files, code generation, and version control

const ExportMenus = {
  // Export Tab Content
  exportTab: {
    id: "export-tab-content",
    type: "tabPanel",
    parentTab: "export-tab",
    components: [
      // Left Panel - Export Options
      {
        id: "export-options",
        type: "container",
        position: { x: "0%", y: "0%", anchor: "top-left" },
        size: { width: "300px", height: "100%" },
        style: {
          background: "rgba(0,0,0,0.1)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          padding: "15px"
        },
        components: [
          {
            id: "export-title",
            type: "label",
            text: "Export Options",
            style: {
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "15px",
              textAlign: "center"
            }
          },
          {
            id: "export-format",
            type: "propertySection",
            title: "Export Format",
            expanded: true,
            components: [
              {
                id: "format-json",
                type: "radio",
                label: "JSON Configuration",
                value: "json",
                checked: true,
                description: "Raw JSON data"
              },
              {
                id: "format-uiskin",
                type: "radio",
                label: "UI Skin File (.uiskin)",
                value: "uiskin",
                description: "Compressed skin package"
              },
              {
                id: "format-code",
                type: "radio",
                label: "JavaScript Code",
                value: "js",
                description: "Generated JavaScript"
              },
              {
                id: "format-docs",
                type: "radio",
                label: "Documentation",
                value: "docs",
                description: "Auto-generated docs"
              }
            ]
          },
          {
            id: "export-scope",
            type: "propertySection",
            title: "Export Scope",
            expanded: true,
            components: [
              {
                id: "scope-current",
                type: "radio",
                label: "Current Menu Only",
                value: "current",
                checked: true
              },
              {
                id: "scope-all-menus",
                type: "radio",
                label: "All Menus",
                value: "all-menus"
              },
              {
                id: "scope-all-actionbars",
                type: "radio",
                label: "All Action Bars",
                value: "all-actionbars"
              },
              {
                id: "scope-complete",
                type: "radio",
                label: "Complete UI Skin",
                value: "complete"
              }
            ]
          },
          {
            id: "export-settings",
            type: "propertySection",
            title: "Export Settings",
            expanded: true,
            components: [
              {
                id: "include-assets",
                type: "checkbox",
                label: "Include Assets",
                value: true,
                description: "Images, icons, sounds"
              },
              {
                id: "minify-output",
                type: "checkbox",
                label: "Minify Output",
                value: false,
                description: "Compress for production"
              },
              {
                id: "include-dependencies",
                type: "checkbox",
                label: "Include Dependencies",
                value: true,
                description: "Required libraries"
              },
              {
                id: "generate-docs",
                type: "checkbox",
                label: "Generate Documentation",
                value: true,
                description: "Auto-documentation"
              }
            ]
          },
          {
            id: "export-actions",
            type: "container",
            style: {
              marginTop: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            },
            components: [
              {
                id: "export-button",
                type: "button",
                text: "💾 Export",
                size: { width: "100%", height: "40px" },
                style: {
                  background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(39, 174, 96, 0.3)"
                }
              },
              {
                id: "import-button",
                type: "button",
                text: "📁 Import",
                size: { width: "100%", height: "40px" },
                style: {
                  background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(52, 152, 219, 0.3)"
                }
              },
              {
                id: "preview-button",
                type: "button",
                text: "👁️ Preview",
                size: { width: "100%", height: "40px" },
                style: {
                  background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(243, 156, 18, 0.3)"
                }
              }
            ]
          }
        ]
      },
      // Center Panel - Export Preview
      {
        id: "export-preview",
        type: "container",
        position: { x: "300px", y: "0%", anchor: "top-left" },
        size: { width: "calc(100% - 600px)", height: "100%" },
        style: {
          background: "rgba(0,0,0,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.1)"
        },
        components: [
          {
            id: "preview-header",
            type: "container",
            position: { x: "0%", y: "0%", anchor: "top-left" },
            size: { width: "100%", height: "50px" },
            style: {
              background: "rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 15px"
            },
            components: [
              {
                id: "preview-title",
                type: "label",
                text: "Export Preview",
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "white"
                }
              },
              {
                id: "preview-controls",
                type: "container",
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                },
                components: [
                  {
                    id: "syntax-highlight",
                    type: "checkbox",
                    label: "Syntax Highlight",
                    value: true
                  },
                  {
                    id: "line-numbers",
                    type: "checkbox",
                    label: "Line Numbers",
                    value: true
                  },
                  {
                    id: "word-wrap",
                    type: "checkbox",
                    label: "Word Wrap",
                    value: false
                  }
                ]
              }
            ]
          },
          {
            id: "preview-content",
            type: "codeEditor",
            position: { x: "0%", y: "50px", anchor: "top-left" },
            size: { width: "100%", height: "calc(100% - 50px)" },
            style: {
              background: "#1e1e1e",
              border: "1px solid rgba(255,255,255,0.1)",
              margin: "10px",
              borderRadius: "6px",
              fontFamily: "Consolas, Monaco, monospace",
              fontSize: "12px",
              lineHeight: "1.4"
            },
            properties: {
              language: "json",
              theme: "dark",
              readOnly: true,
              showLineNumbers: true,
              wordWrap: false
            },
            content: `{
  "metadata": {
    "name": "My Custom UI Skin",
    "version": "1.0.0",
    "description": "A custom UI skin created with Menu Builder",
    "author": "User",
    "created": "2024-01-01T00:00:00Z",
    "compatibility": "1.0.0"
  },
  "menus": {
    "main-menu": {
      "id": "main-menu",
      "type": "menu",
      "title": "Main Menu",
      "position": {
        "mode": "viewport-relative",
        "x": "50%",
        "y": "50%",
        "anchor": "center"
      },
      "size": {
        "width": "400px",
        "height": "300px"
      },
      "style": {
        "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "border": "2px solid #4a5568",
        "borderRadius": "12px"
      }
    }
  },
  "actionBars": {
    "main-actionbar": {
      "id": "main-actionbar",
      "type": "actionBar",
      "position": {
        "mode": "canvas-relative",
        "x": "50%",
        "y": "90%",
        "anchor": "bottom-center"
      },
      "size": {
        "width": "60%",
        "height": "8%"
      },
      "layout": "grid",
      "gridSize": { "columns": 12, "rows": 1 }
    }
  },
  "assets": {
    "images": {},
    "sounds": {},
    "fonts": {}
  },
  "dependencies": [],
  "documentation": {
    "readme": "# My Custom UI Skin\\n\\nThis is a custom UI skin created with the Menu Builder...",
    "components": {},
    "usage": {}
  }
}`
          }
        ]
      },
      // Right Panel - Export History & Version Control
      {
        id: "export-history",
        type: "container",
        position: { x: "calc(100% - 300px)", y: "0%", anchor: "top-right" },
        size: { width: "300px", height: "100%" },
        style: {
          background: "rgba(0,0,0,0.1)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          padding: "15px"
        },
        components: [
          {
            id: "history-title",
            type: "label",
            text: "Export History",
            style: {
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "15px",
              textAlign: "center"
            }
          },
          {
            id: "version-control",
            type: "propertySection",
            title: "Version Control",
            expanded: true,
            components: [
              {
                id: "version-number",
                type: "input",
                label: "Version",
                value: "1.0.0",
                placeholder: "e.g., 1.0.0"
              },
              {
                id: "version-notes",
                type: "textarea",
                label: "Release Notes",
                value: "",
                placeholder: "What's new in this version?",
                rows: 3
              },
              {
                id: "auto-version",
                type: "checkbox",
                label: "Auto-increment version",
                value: true
              }
            ]
          },
          {
            id: "export-history-list",
            type: "list",
            style: {
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "4px",
              maxHeight: "300px",
              overflow: "auto"
            },
            items: [
              {
                id: "export-1",
                text: "v1.0.0 - Initial export",
                subtitle: "2024-01-01 12:00 PM",
                icon: "📦"
              },
              {
                id: "export-2",
                text: "v0.9.0 - Beta version",
                subtitle: "2023-12-31 11:30 PM",
                icon: "🧪"
              },
              {
                id: "export-3",
                text: "v0.8.0 - Alpha version",
                subtitle: "2023-12-30 10:15 PM",
                icon: "🔬"
              }
            ]
          },
          {
            id: "history-actions",
            type: "container",
            style: {
              marginTop: "15px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            },
            components: [
              {
                id: "restore-version",
                type: "button",
                text: "🔄 Restore Version",
                size: { width: "100%", height: "30px" },
                style: {
                  background: "rgba(52, 152, 219, 0.8)",
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  cursor: "pointer"
                }
              },
              {
                id: "compare-versions",
                type: "button",
                text: "🔍 Compare",
                size: { width: "100%", height: "30px" },
                style: {
                  background: "rgba(155, 89, 182, 0.8)",
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  cursor: "pointer"
                }
              },
              {
                id: "clear-history",
                type: "button",
                text: "🗑️ Clear History",
                size: { width: "100%", height: "30px" },
                style: {
                  background: "rgba(231, 76, 60, 0.8)",
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  cursor: "pointer"
                }
              }
            ]
          }
        ]
      }
    ]
  },

  // Import Dialog
  importDialog: {
    id: "import-dialog",
    type: "modal",
    title: "Import UI Skin",
    position: {
      mode: "viewport-relative",
      x: "50%",
      y: "50%",
      anchor: "center"
    },
    size: {
      width: "500px",
      height: "400px"
    },
    style: {
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      border: "2px solid #3498db",
      borderRadius: "8px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    },
    components: [
      {
        id: "import-header",
        type: "container",
        position: { x: "0%", y: "0%", anchor: "top-left" },
        size: { width: "100%", height: "50px" },
        style: {
          background: "rgba(52, 152, 219, 0.2)",
          borderBottom: "1px solid #3498db",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 15px"
        },
        components: [
          {
            id: "import-title",
            type: "label",
            text: "📁 Import UI Skin",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "white"
            }
          },
          {
            id: "import-close",
            type: "button",
            text: "✕",
            size: { width: "30px", height: "30px" },
            style: {
              background: "rgba(231, 76, 60, 0.8)",
              border: "none",
              borderRadius: "50%",
              color: "white",
              cursor: "pointer"
            }
          }
        ]
      },
      {
        id: "import-content",
        type: "container",
        position: { x: "0%", y: "50px", anchor: "top-left" },
        size: { width: "100%", height: "calc(100% - 100px)" },
        style: {
          padding: "20px"
        },
        components: [
          {
            id: "import-method",
            type: "propertySection",
            title: "Import Method",
            expanded: true,
            components: [
              {
                id: "method-file",
                type: "radio",
                label: "Upload File",
                value: "file",
                checked: true
              },
              {
                id: "method-url",
                type: "radio",
                label: "From URL",
                value: "url"
              },
              {
                id: "method-paste",
                type: "radio",
                label: "Paste JSON",
                value: "paste"
              }
            ]
          },
          {
            id: "file-upload",
            type: "fileUpload",
            label: "Choose UI Skin File",
            accept: ".json,.uiskin",
            style: {
              background: "rgba(255,255,255,0.05)",
              border: "2px dashed rgba(255,255,255,0.3)",
              borderRadius: "6px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer"
            }
          },
          {
            id: "import-options",
            type: "propertySection",
            title: "Import Options",
            expanded: true,
            components: [
              {
                id: "overwrite-existing",
                type: "checkbox",
                label: "Overwrite existing menus",
                value: false
              },
              {
                id: "import-assets",
                type: "checkbox",
                label: "Import assets",
                value: true
              },
              {
                id: "validate-import",
                type: "checkbox",
                label: "Validate before import",
                value: true
              }
            ]
          }
        ]
      },
      {
        id: "import-actions",
        type: "container",
        position: { x: "0%", y: "calc(100% - 50px)", anchor: "bottom-left" },
        size: { width: "100%", height: "50px" },
        style: {
          background: "rgba(255,255,255,0.05)",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "10px",
          padding: "0 15px"
        },
        components: [
          {
            id: "import-cancel",
            type: "button",
            text: "Cancel",
            size: { width: "80px", height: "30px" },
            style: {
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer"
            }
          },
          {
            id: "import-confirm",
            type: "button",
            text: "Import",
            size: { width: "80px", height: "30px" },
            style: {
              background: "#27ae60",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer"
            }
          }
        ]
      }
    ]
  }
};

// Export the menu configurations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportMenus;
} else if (typeof window !== 'undefined') {
  window.ExportMenus = ExportMenus;
} 