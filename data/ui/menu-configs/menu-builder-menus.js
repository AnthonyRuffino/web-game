// Menu Builder - Main Interface
// A powerful visual menu creation tool accessible from the main menu bar

const MenuBuilderMenus = {
  // Main Menu Builder Interface
  mainMenuBuilder: {
    id: "menu-builder-main",
    type: "menu",
    title: "Menu Builder",
    position: {
      mode: "viewport-relative",
      x: "50%",
      y: "50%",
      anchor: "center"
    },
    size: {
      width: "80%",
      height: "80%",
      minWidth: "800px",
      minHeight: "600px"
    },
    style: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      border: "2px solid #4a5568",
      borderRadius: "12px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      zIndex: 10000
    },
    responsive: {
      breakpoints: {
        small: { 
          maxWidth: "768px", 
          layout: "stacked", 
          size: { width: "95%", height: "90%" } 
        },
        medium: { 
          maxWidth: "1024px", 
          layout: "side-by-side", 
          size: { width: "85%", height: "85%" } 
        },
        large: { 
          minWidth: "1025px", 
          layout: "expanded", 
          size: { width: "80%", height: "80%" } 
        }
      }
    },
    rendering: {
      mode: "canvas-overlay",
      layer: "overlay",
      pointerEvents: "auto"
    },
    components: [
      // Header with title and close button
      {
        id: "header",
        type: "container",
        position: { x: "0%", y: "0%", anchor: "top-left" },
        size: { width: "100%", height: "60px" },
        style: {
          background: "rgba(255,255,255,0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 20px"
        },
        components: [
          {
            id: "title",
            type: "label",
            text: "🎨 Menu Builder",
            style: {
              fontSize: "24px",
              fontWeight: "bold",
              color: "white",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)"
            }
          },
          {
            id: "close-btn",
            type: "button",
            text: "✕",
            position: { x: "calc(100% - 40px)", y: "10px", anchor: "top-right" },
            size: { width: "30px", height: "30px" },
            style: {
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "50%",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            },
            events: {
              onClick: "MenuBuilder.close()",
              onMouseEnter: "this.style.background='rgba(255,255,255,0.3)'",
              onMouseLeave: "this.style.background='rgba(255,255,255,0.2)'"
            }
          }
        ]
      },
      // Tab Navigation
      {
        id: "tab-nav",
        type: "tabNavigation",
        position: { x: "0%", y: "60px", anchor: "top-left" },
        size: { width: "100%", height: "50px" },
        style: {
          background: "rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        },
        tabs: [
          {
            id: "menus-tab",
            label: "🎯 Menus",
            icon: "📋",
            active: true
          },
          {
            id: "actionbars-tab",
            label: "⚡ Action Bars",
            icon: "🎮"
          },
          {
            id: "examples-tab",
            label: "📚 Examples",
            icon: "💡"
          },
          {
            id: "export-tab",
            label: "💾 Export",
            icon: "📤"
          }
        ]
      },
      // Tab Content Area
      {
        id: "tab-content",
        type: "tabContent",
        position: { x: "0%", y: "110px", anchor: "top-left" },
        size: { width: "100%", height: "calc(100% - 110px)" },
        style: {
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden"
        }
      }
    ]
  },

  // Menus Tab Content
  menusTab: {
    id: "menus-tab-content",
    type: "tabPanel",
    parentTab: "menus-tab",
    components: [
      // Left Panel - Component Palette
      {
        id: "component-palette",
        type: "container",
        position: { x: "0%", y: "0%", anchor: "top-left" },
        size: { width: "250px", height: "100%" },
        style: {
          background: "rgba(0,0,0,0.1)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          padding: "15px"
        },
        components: [
          {
            id: "palette-title",
            type: "label",
            text: "Component Palette",
            style: {
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "15px",
              textAlign: "center"
            }
          },
          // Basic Elements Section
          {
            id: "basic-elements",
            type: "collapsibleSection",
            title: "Basic Elements",
            expanded: true,
            components: [
              {
                id: "button-component",
                type: "draggableComponent",
                componentType: "button",
                label: "Button",
                icon: "🔘",
                preview: { text: "Click Me", style: { background: "#4CAF50", color: "white", padding: "8px 16px", borderRadius: "4px" } }
              },
              {
                id: "label-component",
                type: "draggableComponent",
                componentType: "label",
                label: "Label",
                icon: "🏷️",
                preview: { text: "Sample Text", style: { color: "white", fontSize: "14px" } }
              },
              {
                id: "input-component",
                type: "draggableComponent",
                componentType: "input",
                label: "Text Input",
                icon: "📝",
                preview: { placeholder: "Enter text...", style: { background: "white", border: "1px solid #ccc", padding: "8px", borderRadius: "4px" } }
              },
              {
                id: "checkbox-component",
                type: "draggableComponent",
                componentType: "checkbox",
                label: "Checkbox",
                icon: "☑️",
                preview: { text: "Check me", style: { color: "white" } }
              },
              {
                id: "radio-component",
                type: "draggableComponent",
                componentType: "radio",
                label: "Radio Button",
                icon: "🔘",
                preview: { text: "Select me", style: { color: "white" } }
              }
            ]
          },
          // Advanced Elements Section
          {
            id: "advanced-elements",
            type: "collapsibleSection",
            title: "Advanced Elements",
            expanded: false,
            components: [
              {
                id: "tab-component",
                type: "draggableComponent",
                componentType: "tab",
                label: "Tab Container",
                icon: "📑",
                preview: { text: "Tab 1 | Tab 2", style: { background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "4px" } }
              },
              {
                id: "grid-component",
                type: "draggableComponent",
                componentType: "grid",
                label: "Grid",
                icon: "📊",
                preview: { text: "Grid Layout", style: { background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "4px" } }
              },
              {
                id: "image-component",
                type: "draggableComponent",
                componentType: "image",
                label: "Image",
                icon: "🖼️",
                preview: { text: "Image", style: { background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "4px", border: "2px dashed rgba(255,255,255,0.3)" } }
              },
              {
                id: "dropdown-component",
                type: "draggableComponent",
                componentType: "dropdown",
                label: "Dropdown",
                icon: "📋",
                preview: { text: "Select option ▼", style: { background: "white", border: "1px solid #ccc", padding: "8px", borderRadius: "4px" } }
              },
              {
                id: "slider-component",
                type: "draggableComponent",
                componentType: "slider",
                label: "Slider",
                icon: "🎚️",
                preview: { text: "━━━━●━━━━", style: { color: "white", fontSize: "12px" } }
              }
            ]
          },
          // Layout Elements Section
          {
            id: "layout-elements",
            type: "collapsibleSection",
            title: "Layout Elements",
            expanded: false,
            components: [
              {
                id: "container-component",
                type: "draggableComponent",
                componentType: "container",
                label: "Container",
                icon: "📦",
                preview: { text: "Container", style: { background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.3)", padding: "8px", borderRadius: "4px" } }
              },
              {
                id: "divider-component",
                type: "draggableComponent",
                componentType: "divider",
                label: "Divider",
                icon: "➖",
                preview: { text: "━━━━━━━━━━", style: { color: "rgba(255,255,255,0.5)", fontSize: "12px" } }
              },
              {
                id: "spacer-component",
                type: "draggableComponent",
                componentType: "spacer",
                label: "Spacer",
                icon: "␣",
                preview: { text: "Space", style: { background: "rgba(255,255,255,0.05)", padding: "8px", borderRadius: "4px", border: "1px dotted rgba(255,255,255,0.3)" } }
              }
            ]
          }
        ]
      },
      // Center Panel - Visual Designer
      {
        id: "visual-designer",
        type: "container",
        position: { x: "250px", y: "0%", anchor: "top-left" },
        size: { width: "calc(100% - 500px)", height: "100%" },
        style: {
          background: "rgba(0,0,0,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.1)"
        },
        components: [
          {
            id: "designer-header",
            type: "container",
            position: { x: "0%", y: "0%", anchor: "top-left" },
            size: { width: "100%", height: "40px" },
            style: {
              background: "rgba(255,255,255,0.05)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              alignItems: "center",
              padding: "0 15px"
            },
            components: [
              {
                id: "designer-title",
                type: "label",
                text: "Visual Designer",
                style: {
                  fontSize: "14px",
                  fontWeight: "bold",
                  color: "white"
                }
              },
              {
                id: "zoom-controls",
                type: "container",
                position: { x: "calc(100% - 120px)", y: "0%", anchor: "top-right" },
                size: { width: "120px", height: "100%" },
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                },
                components: [
                  {
                    id: "zoom-out",
                    type: "button",
                    text: "🔍-",
                    size: { width: "25px", height: "25px" },
                    style: {
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "3px",
                      color: "white",
                      fontSize: "10px"
                    }
                  },
                  {
                    id: "zoom-level",
                    type: "label",
                    text: "100%",
                    style: {
                      fontSize: "12px",
                      color: "white",
                      minWidth: "40px",
                      textAlign: "center"
                    }
                  },
                  {
                    id: "zoom-in",
                    type: "button",
                    text: "🔍+",
                    size: { width: "25px", height: "25px" },
                    style: {
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "3px",
                      color: "white",
                      fontSize: "10px"
                    }
                  }
                ]
              }
            ]
          },
          {
            id: "designer-canvas",
            type: "designerCanvas",
            position: { x: "0%", y: "40px", anchor: "top-left" },
            size: { width: "100%", height: "calc(100% - 40px)" },
            style: {
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.2)",
              margin: "10px",
              borderRadius: "8px",
              position: "relative",
              overflow: "auto"
            },
            properties: {
              gridSize: 10,
              snapToGrid: true,
              showGrid: true,
              zoom: 1.0
            }
          }
        ]
      },
      // Right Panel - Property Inspector
      {
        id: "property-inspector",
        type: "container",
        position: { x: "calc(100% - 250px)", y: "0%", anchor: "top-right" },
        size: { width: "250px", height: "100%" },
        style: {
          background: "rgba(0,0,0,0.1)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          padding: "15px"
        },
        components: [
          {
            id: "inspector-title",
            type: "label",
            text: "Property Inspector",
            style: {
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "15px",
              textAlign: "center"
            }
          },
          {
            id: "no-selection",
            type: "label",
            text: "Select a component to edit its properties",
            style: {
              fontSize: "12px",
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              fontStyle: "italic"
            }
          }
        ]
      }
    ]
  }
};

// Export the menu configurations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MenuBuilderMenus;
} else if (typeof window !== 'undefined') {
  window.MenuBuilderMenus = MenuBuilderMenus;
} 