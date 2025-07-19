// Action Bar Builder - Grid Layout Designer
// Visual grid designer for action bar slots with key binding and macro integration

const ActionBarBuilderMenus = {
  // Action Bar Builder Tab Content
  actionBarBuilder: {
    id: "actionbar-builder-content",
    type: "tabPanel",
    parentTab: "actionbars-tab",
    components: [
      // Left Panel - Action Bar Templates
      {
        id: "actionbar-templates",
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
            id: "templates-title",
            type: "label",
            text: "Action Bar Templates",
            style: {
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "15px",
              textAlign: "center"
            }
          },
          // Template Categories
          {
            id: "template-categories",
            type: "container",
            components: [
              {
                id: "basic-templates",
                type: "collapsibleSection",
                title: "Basic Layouts",
                expanded: true,
                components: [
                  {
                    id: "template-1x12",
                    type: "templateItem",
                    label: "1x12 Horizontal",
                    description: "Single row, 12 slots",
                    icon: "━━━━━━━━━━",
                    gridSize: { columns: 12, rows: 1 },
                    style: {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      cursor: "pointer"
                    }
                  },
                  {
                    id: "template-2x6",
                    type: "templateItem",
                    label: "2x6 Grid",
                    description: "Two rows, 6 slots each",
                    icon: "━━━━━━\n━━━━━━",
                    gridSize: { columns: 6, rows: 2 },
                    style: {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      cursor: "pointer"
                    }
                  },
                  {
                    id: "template-3x4",
                    type: "templateItem",
                    label: "3x4 Grid",
                    description: "Three rows, 4 slots each",
                    icon: "━━━━\n━━━━\n━━━━",
                    gridSize: { columns: 4, rows: 3 },
                    style: {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      cursor: "pointer"
                    }
                  }
                ]
              },
              {
                id: "advanced-templates",
                type: "collapsibleSection",
                title: "Advanced Layouts",
                expanded: false,
                components: [
                  {
                    id: "template-4x3",
                    type: "templateItem",
                    label: "4x3 Grid",
                    description: "Four rows, 3 slots each",
                    icon: "━━━\n━━━\n━━━\n━━━",
                    gridSize: { columns: 3, rows: 4 },
                    style: {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      cursor: "pointer"
                    }
                  },
                  {
                    id: "template-6x2",
                    type: "templateItem",
                    label: "6x2 Grid",
                    description: "Six rows, 2 slots each",
                    icon: "━━\n━━\n━━\n━━\n━━\n━━",
                    gridSize: { columns: 2, rows: 6 },
                    style: {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      cursor: "pointer"
                    }
                  },
                  {
                    id: "template-custom",
                    type: "templateItem",
                    label: "Custom Grid",
                    description: "Define your own layout",
                    icon: "⚙️",
                    gridSize: { columns: 1, rows: 1 },
                    style: {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "8px",
                      cursor: "pointer"
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      // Center Panel - Grid Designer
      {
        id: "grid-designer",
        type: "container",
        position: { x: "300px", y: "0%", anchor: "top-left" },
        size: { width: "calc(100% - 600px)", height: "100%" },
        style: {
          background: "rgba(0,0,0,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.1)"
        },
        components: [
          {
            id: "designer-header",
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
                id: "designer-title",
                type: "label",
                text: "Grid Designer",
                style: {
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "white"
                }
              },
              {
                id: "grid-controls",
                type: "container",
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                },
                components: [
                  {
                    id: "columns-label",
                    type: "label",
                    text: "Columns:",
                    style: {
                      fontSize: "12px",
                      color: "white"
                    }
                  },
                  {
                    id: "columns-input",
                    type: "input",
                    value: "12",
                    size: { width: "40px", height: "25px" },
                    style: {
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "3px",
                      color: "white",
                      textAlign: "center"
                    }
                  },
                  {
                    id: "rows-label",
                    type: "label",
                    text: "Rows:",
                    style: {
                      fontSize: "12px",
                      color: "white"
                    }
                  },
                  {
                    id: "rows-input",
                    type: "input",
                    value: "1",
                    size: { width: "40px", height: "25px" },
                    style: {
                      background: "rgba(255,255,255,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "3px",
                      color: "white",
                      textAlign: "center"
                    }
                  },
                  {
                    id: "apply-grid",
                    type: "button",
                    text: "Apply",
                    size: { width: "60px", height: "25px" },
                    style: {
                      background: "#4CAF50",
                      border: "none",
                      borderRadius: "3px",
                      color: "white",
                      fontSize: "12px",
                      cursor: "pointer"
                    }
                  }
                ]
              }
            ]
          },
          {
            id: "grid-canvas",
            type: "gridCanvas",
            position: { x: "0%", y: "50px", anchor: "top-left" },
            size: { width: "100%", height: "calc(100% - 50px)" },
            style: {
              background: "rgba(255,255,255,0.02)",
              border: "2px dashed rgba(255,255,255,0.2)",
              margin: "15px",
              borderRadius: "8px",
              position: "relative",
              overflow: "auto",
              padding: "20px"
            },
            properties: {
              gridSize: { columns: 12, rows: 1 },
              cellSize: { width: 60, height: 60 },
              gap: 5,
              showGrid: true,
              snapToGrid: true
            }
          }
        ]
      },
      // Right Panel - Slot Properties
      {
        id: "slot-properties",
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
            id: "properties-title",
            type: "label",
            text: "Slot Properties",
            style: {
              fontSize: "16px",
              fontWeight: "bold",
              color: "white",
              marginBottom: "15px",
              textAlign: "center"
            }
          },
          {
            id: "no-slot-selected",
            type: "label",
            text: "Click on a slot to edit its properties",
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

  // Slot Property Inspector (shown when slot is selected)
  slotInspector: {
    id: "slot-inspector",
    type: "container",
    components: [
      {
        id: "slot-basic-props",
        type: "propertySection",
        title: "Basic Properties",
        expanded: true,
        components: [
          {
            id: "slot-id",
            type: "propertyField",
            label: "Slot ID",
            fieldType: "input",
            value: "slot-1"
          },
          {
            id: "slot-position",
            type: "propertyField",
            label: "Position",
            fieldType: "position",
            value: { x: 0, y: 0 }
          },
          {
            id: "slot-size",
            type: "propertyField",
            label: "Size",
            fieldType: "size",
            value: { width: 1, height: 1 }
          }
        ]
      },
      {
        id: "slot-keybinding",
        type: "propertySection",
        title: "Key Binding",
        expanded: true,
        components: [
          {
            id: "key-binding",
            type: "propertyField",
            label: "Key",
            fieldType: "keyInput",
            value: "Key1",
            placeholder: "Press a key..."
          },
          {
            id: "modifier-keys",
            type: "propertyField",
            label: "Modifiers",
            fieldType: "checkboxGroup",
            options: ["Ctrl", "Alt", "Shift"],
            value: []
          }
        ]
      },
      {
        id: "slot-macro",
        type: "propertySection",
        title: "Macro Integration",
        expanded: true,
        components: [
          {
            id: "macro-id",
            type: "propertyField",
            label: "Macro ID",
            fieldType: "dropdown",
            options: ["macro-1", "macro-2", "macro-3"],
            value: ""
          },
          {
            id: "macro-command",
            type: "propertyField",
            label: "Command",
            fieldType: "textarea",
            value: "",
            placeholder: "Enter macro command..."
          }
        ]
      },
      {
        id: "slot-visual",
        type: "propertySection",
        title: "Visual Properties",
        expanded: true,
        components: [
          {
            id: "slot-icon",
            type: "propertyField",
            label: "Icon",
            fieldType: "fileInput",
            value: "",
            accept: "image/*"
          },
          {
            id: "slot-text",
            type: "propertyField",
            label: "Text",
            fieldType: "input",
            value: "",
            placeholder: "Slot text..."
          },
          {
            id: "show-cooldown",
            type: "propertyField",
            label: "Show Cooldown",
            fieldType: "checkbox",
            value: true
          },
          {
            id: "show-charges",
            type: "propertyField",
            label: "Show Charges",
            fieldType: "checkbox",
            value: false
          },
          {
            id: "slot-style",
            type: "propertyField",
            label: "Style",
            fieldType: "styleEditor",
            value: {
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "4px"
            }
          }
        ]
      }
    ]
  }
};

// Export the menu configurations
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ActionBarBuilderMenus;
} else if (typeof window !== 'undefined') {
  window.ActionBarBuilderMenus = ActionBarBuilderMenus;
} 