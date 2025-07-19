// Examples Menu - Pre-built Examples and Templates
// Complete examples of various menu types and configurations

const ExamplesMenus = {
  // Examples Tab Content
  examplesTab: {
    id: "examples-tab-content",
    type: "tabPanel",
    parentTab: "examples-tab",
    components: [
      // Left Panel - Example Categories
      {
        id: "example-categories",
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
            id: "categories-title",
            type: "label",
            text: "Example Categories",
            style: {
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "15px",
              textAlign: "center"
            }
          },
          {
            id: "category-list",
            type: "container",
            components: [
              {
                id: "game-systems",
                type: "categoryItem",
                label: "🎮 Game Systems",
                description: "Inventory, character, quest systems",
                expanded: true,
                components: [
                  {
                    id: "macro-menu-example",
                    type: "exampleItem",
                    label: "Macro Menu Clone",
                    description: "Complete macro menu functionality",
                    icon: "⚡",
                    template: "macro-menu-template"
                  },
                  {
                    id: "skin-menu-example",
                    type: "exampleItem",
                    label: "Skin Menu Clone",
                    description: "Complete skin menu functionality",
                    icon: "🎨",
                    template: "skin-menu-template"
                  },
                  {
                    id: "inventory-example",
                    type: "exampleItem",
                    label: "Inventory System",
                    description: "Grid-based inventory with drag-drop",
                    icon: "🎒",
                    template: "inventory-template"
                  },
                  {
                    id: "character-example",
                    type: "exampleItem",
                    label: "Character Sheet",
                    description: "Tabbed character information",
                    icon: "👤",
                    template: "character-template"
                  }
                ]
              },
              {
                id: "ui-components",
                type: "categoryItem",
                label: "🧩 UI Components",
                description: "Forms, dialogs, panels, toolbars",
                expanded: false,
                components: [
                  {
                    id: "settings-example",
                    type: "exampleItem",
                    label: "Settings Panel",
                    description: "Comprehensive settings with categories",
                    icon: "⚙️",
                    template: "settings-template"
                  },
                  {
                    id: "chat-example",
                    type: "exampleItem",
                    label: "Chat Interface",
                    description: "Multi-tab chat with emote system",
                    icon: "💬",
                    template: "chat-template"
                  },
                  {
                    id: "quest-example",
                    type: "exampleItem",
                    label: "Quest Log",
                    description: "Hierarchical quest tracking",
                    icon: "📜",
                    template: "quest-template"
                  },
                  {
                    id: "crafting-example",
                    type: "exampleItem",
                    label: "Crafting System",
                    description: "Recipe browser with materials",
                    icon: "🔨",
                    template: "crafting-template"
                  }
                ]
              },
              {
                id: "data-display",
                type: "categoryItem",
                label: "📊 Data Display",
                description: "Tables, charts, lists, grids",
                expanded: false,
                components: [
                  {
                    id: "table-example",
                    type: "exampleItem",
                    label: "Data Table",
                    description: "Sortable, filterable data table",
                    icon: "📋",
                    template: "table-template"
                  },
                  {
                    id: "chart-example",
                    type: "exampleItem",
                    label: "Chart Dashboard",
                    description: "Interactive charts and graphs",
                    icon: "📈",
                    template: "chart-template"
                  },
                  {
                    id: "list-example",
                    type: "exampleItem",
                    label: "Virtual List",
                    description: "High-performance scrolling list",
                    icon: "📝",
                    template: "list-template"
                  }
                ]
              },
              {
                id: "interactive",
                type: "categoryItem",
                label: "🎯 Interactive",
                description: "Wizards, surveys, games, tools",
                expanded: false,
                components: [
                  {
                    id: "wizard-example",
                    type: "exampleItem",
                    label: "Setup Wizard",
                    description: "Multi-step configuration wizard",
                    icon: "🧙",
                    template: "wizard-template"
                  },
                  {
                    id: "survey-example",
                    type: "exampleItem",
                    label: "Survey Form",
                    description: "Interactive survey with validation",
                    icon: "📝",
                    template: "survey-template"
                  },
                  {
                    id: "minigame-example",
                    type: "exampleItem",
                    label: "Mini Game",
                    description: "Simple embedded game interface",
                    icon: "🎮",
                    template: "minigame-template"
                  }
                ]
              }
            ]
          }
        ]
      },
      // Center Panel - Example Preview
      {
        id: "example-preview",
        type: "container",
        position: { x: "250px", y: "0%", anchor: "top-left" },
        size: { width: "calc(100% - 500px)", height: "100%" },
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
                text: "Example Preview",
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
                    id: "preview-size",
                    type: "dropdown",
                    options: ["Small", "Medium", "Large", "Full Screen"],
                    value: "Medium",
                    size: { width: "100px", height: "25px" },
                    style: {
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "3px",
                      color: "white",
                      fontSize: "12px"
                    }
                  },
                  {
                    id: "preview-refresh",
                    type: "button",
                    text: "🔄",
                    size: { width: "25px", height: "25px" },
                    style: {
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "3px",
                      color: "white",
                      fontSize: "12px"
                    }
                  }
                ]
              }
            ]
          },
          {
            id: "preview-canvas",
            type: "previewCanvas",
            position: { x: "0%", y: "50px", anchor: "top-left" },
            size: { width: "100%", height: "calc(100% - 50px)" },
            style: {
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.2)",
              margin: "15px",
              borderRadius: "8px",
              position: "relative",
              overflow: "auto"
            }
          }
        ]
      },
      // Right Panel - Example Details
      {
        id: "example-details",
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
            id: "details-title",
            type: "label",
            text: "Example Details",
            style: {
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "15px",
              textAlign: "center"
            }
          },
          {
            id: "no-example-selected",
            type: "label",
            text: "Select an example to view details",
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
  },

  // Macro Menu Clone Example
  macroMenuClone: {
    id: "macro-menu-clone",
    type: "menu",
    title: "Macro Manager",
    position: {
      mode: "viewport-relative",
      x: "50%",
      y: "50%",
      anchor: "center"
    },
    size: {
      width: "600px",
      height: "500px"
    },
    style: {
      background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
      border: "2px solid #3498db",
      borderRadius: "8px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    },
    components: [
      {
        id: "macro-header",
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
            id: "macro-title",
            type: "label",
            text: "⚡ Macro Manager",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "white"
            }
          },
          {
            id: "macro-close",
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
        id: "macro-tabs",
        type: "tabContainer",
        position: { x: "0%", y: "50px", anchor: "top-left" },
        size: { width: "100%", height: "calc(100% - 50px)" },
        tabs: [
          {
            id: "macros-tab",
            label: "Macros",
            icon: "⚡",
            components: [
              {
                id: "macro-list",
                type: "list",
                position: { x: "10px", y: "10px", anchor: "top-left" },
                size: { width: "calc(100% - 20px)", height: "calc(100% - 80px)" },
                style: {
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px"
                },
                items: [
                  { id: "macro-1", text: "Attack Macro", icon: "⚔️" },
                  { id: "macro-2", text: "Heal Macro", icon: "💚" },
                  { id: "macro-3", text: "Buff Macro", icon: "✨" }
                ]
              },
              {
                id: "macro-actions",
                type: "container",
                position: { x: "10px", y: "calc(100% - 70px)", anchor: "bottom-left" },
                size: { width: "calc(100% - 20px)", height: "60px" },
                style: {
                  display: "flex",
                  gap: "10px",
                  alignItems: "center"
                },
                components: [
                  {
                    id: "new-macro",
                    type: "button",
                    text: "➕ New Macro",
                    size: { width: "100px", height: "30px" },
                    style: {
                      background: "#27ae60",
                      border: "none",
                      borderRadius: "4px",
                      color: "white",
                      cursor: "pointer"
                    }
                  },
                  {
                    id: "edit-macro",
                    type: "button",
                    text: "✏️ Edit",
                    size: { width: "80px", height: "30px" },
                    style: {
                      background: "#f39c12",
                      border: "none",
                      borderRadius: "4px",
                      color: "white",
                      cursor: "pointer"
                    }
                  },
                  {
                    id: "delete-macro",
                    type: "button",
                    text: "🗑️ Delete",
                    size: { width: "80px", height: "30px" },
                    style: {
                      background: "#e74c3c",
                      border: "none",
                      borderRadius: "4px",
                      color: "white",
                      cursor: "pointer"
                    }
                  }
                ]
              }
            ]
          },
          {
            id: "settings-tab",
            label: "Settings",
            icon: "⚙️",
            components: [
              {
                id: "macro-settings",
                type: "form",
                position: { x: "10px", y: "10px", anchor: "top-left" },
                size: { width: "calc(100% - 20px)", height: "calc(100% - 20px)" },
                fields: [
                  {
                    id: "auto-save",
                    type: "checkbox",
                    label: "Auto-save macros",
                    value: true
                  },
                  {
                    id: "keybind-prefix",
                    type: "input",
                    label: "Keybind prefix",
                    value: "Ctrl+",
                    placeholder: "e.g., Ctrl+"
                  },
                  {
                    id: "max-macros",
                    type: "number",
                    label: "Maximum macros",
                    value: 50,
                    min: 1,
                    max: 100
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  // Inventory System Example
  inventorySystem: {
    id: "inventory-system",
    type: "menu",
    title: "Inventory",
    position: {
      mode: "viewport-relative",
      x: "50%",
      y: "50%",
      anchor: "center"
    },
    size: {
      width: "700px",
      height: "600px"
    },
    style: {
      background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)",
      border: "2px solid #8e44ad",
      borderRadius: "8px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
    },
    components: [
      {
        id: "inventory-header",
        type: "container",
        position: { x: "0%", y: "0%", anchor: "top-left" },
        size: { width: "100%", height: "50px" },
        style: {
          background: "rgba(142, 68, 173, 0.2)",
          borderBottom: "1px solid #8e44ad",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 15px"
        },
        components: [
          {
            id: "inventory-title",
            type: "label",
            text: "🎒 Inventory",
            style: {
              fontSize: "18px",
              fontWeight: "bold",
              color: "white"
            }
          },
          {
            id: "inventory-weight",
            type: "label",
            text: "Weight: 45/100",
            style: {
              fontSize: "14px",
              color: "rgba(255,255,255,0.8)"
            }
          }
        ]
      },
      {
        id: "inventory-grid",
        type: "grid",
        position: { x: "10px", y: "60px", anchor: "top-left" },
        size: { width: "calc(100% - 20px)", height: "calc(100% - 120px)" },
        style: {
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "4px",
          padding: "10px"
        },
        properties: {
          columns: 8,
          rows: 6,
          cellSize: { width: 60, height: 60 },
          gap: 5
        },
        slots: [
          {
            id: "slot-1",
            position: { x: 0, y: 0 },
            item: { name: "Sword", icon: "⚔️", quantity: 1 }
          },
          {
            id: "slot-2",
            position: { x: 1, y: 0 },
            item: { name: "Shield", icon: "🛡️", quantity: 1 }
          },
          {
            id: "slot-3",
            position: { x: 2, y: 0 },
            item: { name: "Health Potion", icon: "🧪", quantity: 5 }
          }
        ]
      },
      {
        id: "inventory-info",
        type: "container",
        position: { x: "10px", y: "calc(100% - 60px)", anchor: "bottom-left" },
        size: { width: "calc(100% - 20px)", height: "50px" },
        style: {
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "4px",
          padding: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        },
        components: [
          {
            id: "selected-item",
            type: "label",
            text: "Selected: Sword",
            style: {
              fontSize: "14px",
              color: "white"
            }
          },
          {
            id: "item-actions",
            type: "container",
            style: {
              display: "flex",
              gap: "10px"
            },
            components: [
              {
                id: "use-item",
                type: "button",
                text: "Use",
                size: { width: "60px", height: "25px" },
                style: {
                  background: "#27ae60",
                  border: "none",
                  borderRadius: "3px",
                  color: "white",
                  cursor: "pointer"
                }
              },
              {
                id: "drop-item",
                type: "button",
                text: "Drop",
                size: { width: "60px", height: "25px" },
                style: {
                  background: "#e74c3c",
                  border: "none",
                  borderRadius: "3px",
                  color: "white",
                  cursor: "pointer"
                }
              }
            ]
          }
        ]
      }
    ]
  }
};

// Export the menu configurations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExamplesMenus;
} else if (typeof window !== 'undefined') {
  window.ExamplesMenus = ExamplesMenus;
} 