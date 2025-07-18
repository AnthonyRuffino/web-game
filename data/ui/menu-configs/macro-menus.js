// data/ui/macros/macro-menus.js
// Macro-related menu configurations for the MenuManager

const macroMenus = {
  // Simple macro grid with basic functionality
  "simple-macro-grid": {
    id: "simple-macro-grid",
    title: "Simple Macro Grid",
    gridButtons: [
      {
        label: "Macros",
        rows: 2,
        cols: 3,
        buttons: [
          {
            name: "Attack",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD4KPC9zdmc+",
            tooltip: "Configure attack macro",
            onClick: () => console.log("Attack macro clicked"),
            onClickMenu: {
              id: "attack-config",
              title: "Attack Macro Configuration",
              content: "<p>Configure your attack macro settings</p>",
              radioGroups: [
                {
                  label: "Attack Type",
                  options: [
                    { text: "Melee", value: "melee", checked: true },
                    { text: "Ranged", value: "ranged" },
                    { text: "Magic", value: "magic" }
                  ],
                  onChange: (value) => console.log(`Attack type: ${value}`)
                }
              ],
              buttons: [
                {
                  text: "Save Configuration",
                  onClick: () => console.log("Attack config saved!")
                },
                {
                  text: "Test Macro",
                  onClick: () => console.log("Testing attack macro...")
                },
                {
                  text: "Close",
                  onClick: () => window.UI.menuManager.hideMenu("attack-config")
                }
              ]
            }
          },
          {
            name: "Heal",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTZDRUI0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SDwvdGV4dD4KPC9zdmc+",
            tooltip: "Configure heal macro",
            onClick: () => console.log("Heal macro clicked"),
            onClickMenu: {
              id: "heal-config",
              title: "Heal Macro Configuration",
              content: "<p>Configure your heal macro settings</p>",
              buttons: [
                {
                  text: "Save",
                  onClick: () => console.log("Heal config saved!")
                }
              ]
            }
          }
        ],
        onEmptyClick: (index) => console.log(`Empty slot ${index} clicked`)
      }
    ]
  },

  // Advanced macro grid with multiple types
  "advanced-macro-grid": {
    id: "advanced-macro-grid",
    title: "Advanced Macro Grid",
    gridButtons: [
      {
        label: "Combat Macros",
        rows: 3,
        cols: 4,
        cellSize: 70,
        gap: 12,
        buttons: [
          {
            name: "Attack",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD4KPC9zdmc+",
            tooltip: "Attack macro",
            onClick: () => console.log("Attack executed"),
            onClickMenu: {
              id: "attack-macro-config",
              title: "Attack Macro",
              content: "<p>Configure your attack macro</p>",
              radioGroups: [
                {
                  label: "Target Priority",
                  options: [
                    { text: "Nearest", value: "nearest", checked: true },
                    { text: "Strongest", value: "strongest" },
                    { text: "Weakest", value: "weakest" }
                  ],
                  onChange: (value) => console.log(`Target priority: ${value}`)
                }
              ],
              buttons: [
                { text: "Save", onClick: () => console.log("Attack config saved") },
                { text: "Close", onClick: () => window.UI.menuManager.hideMenu("attack-macro-config") }
              ]
            }
          },
          {
            name: "Heal",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTZDRUI0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SDwvdGV4dD4KPC9zdmc+",
            tooltip: "Heal macro",
            onClick: () => console.log("Heal executed"),
            onClickMenu: {
              id: "heal-macro-config",
              title: "Heal Macro",
              content: "<p>Configure your heal macro</p>",
              radioGroups: [
                {
                  label: "Heal Type",
                  options: [
                    { text: "Self", value: "self", checked: true },
                    { text: "Party", value: "party" },
                    { text: "Target", value: "target" }
                  ],
                  onChange: (value) => console.log(`Heal type: ${value}`)
                }
              ],
              buttons: [
                { text: "Save", onClick: () => console.log("Heal config saved") },
                { text: "Close", onClick: () => window.UI.menuManager.hideMenu("heal-macro-config") }
              ]
            }
          },
          {
            name: "Defend",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZFQUFBNyIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkQ8L3RleHQ+Cjwvc3ZnPg==",
            tooltip: "Defend macro",
            onClick: () => console.log("Defend executed"),
            onClickMenu: {
              id: "defend-macro-config",
              title: "Defend Macro",
              content: "<p>Configure your defend macro</p>",
              buttons: [
                { text: "Save", onClick: () => console.log("Defend config saved") },
                { text: "Close", onClick: () => window.UI.menuManager.hideMenu("defend-macro-config") }
              ]
            }
          },
          {
            name: "Flee",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RjwvdGV4dD4KPC9zdmc+",
            tooltip: "Flee macro",
            onClick: () => console.log("Flee executed"),
            onClickMenu: {
              id: "flee-macro-config",
              title: "Flee Macro",
              content: "<p>Configure your flee macro</p>",
              buttons: [
                { text: "Save", onClick: () => console.log("Flee config saved") },
                { text: "Close", onClick: () => window.UI.menuManager.hideMenu("flee-macro-config") }
              ]
            }
          }
        ],
        onEmptyClick: (index) => console.log(`Create macro in slot ${index}`)
      }
    ]
  },

  // Macro management with tabs
  "macro-management": {
    id: "macro-management",
    title: "Macro Management",
    tabs: [
      {
        name: "Combat",
        content: "<h3>Combat Macros</h3><p>Manage your combat-related macros</p>",
        gridButtons: [
          {
            label: "Combat Macros",
            rows: 2,
            cols: 4,
            buttons: [
              {
                name: "Attack",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD4KPC9zdmc+",
                tooltip: "Attack macro",
                onClick: () => console.log("Attack macro clicked")
              },
              {
                name: "Heal",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTZDRUI0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SDwvdGV4dD4KPC9zdmc+",
                tooltip: "Heal macro",
                onClick: () => console.log("Heal macro clicked")
              }
            ],
            onEmptyClick: (index) => console.log(`Create combat macro in slot ${index}`)
          }
        ],
        buttons: [
          {
            text: "Import Combat Macros",
            onClick: () => console.log("Importing combat macros...")
          },
          {
            text: "Export Combat Macros",
            onClick: () => console.log("Exporting combat macros...")
          }
        ]
      },
      {
        name: "Utility",
        content: "<h3>Utility Macros</h3><p>Manage your utility macros</p>",
        gridButtons: [
          {
            label: "Utility Macros",
            rows: 2,
            cols: 4,
            buttons: [
              {
                name: "Teleport",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZFQUFBNyIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlQ8L3RleHQ+Cjwvc3ZnPg==",
                tooltip: "Teleport macro",
                onClick: () => console.log("Teleport macro clicked")
              }
            ],
            onEmptyClick: (index) => console.log(`Create utility macro in slot ${index}`)
          }
        ],
        buttons: [
          {
            text: "Import Utility Macros",
            onClick: () => console.log("Importing utility macros...")
          },
          {
            text: "Export Utility Macros",
            onClick: () => console.log("Exporting utility macros...")
          }
        ]
      },
      {
        name: "Settings",
        content: "<h3>Macro Settings</h3><p>Configure global macro settings</p>",
        radioGroups: [
          {
            label: "Macro Execution",
            options: [
              { text: "Instant", value: "instant", checked: true },
              { text: "Confirmation", value: "confirmation" },
              { text: "Delayed", value: "delayed" }
            ],
            onChange: (value) => console.log(`Macro execution: ${value}`)
          },
          {
            label: "Auto-Save",
            options: [
              { text: "Enabled", value: "enabled", checked: true },
              { text: "Disabled", value: "disabled" }
            ],
            onChange: (value) => console.log(`Auto-save: ${value}`)
          }
        ],
        buttons: [
          {
            text: "Save Settings",
            onClick: () => console.log("Macro settings saved!")
          },
          {
            text: "Reset to Defaults",
            onClick: () => console.log("Settings reset to defaults")
          }
        ]
      }
    ]
  }
};

// Export function to get menu configurations
function getMacroMenu(key) {
  return macroMenus[key];
}

// Export all available menu keys
function getMacroMenuKeys() {
  return Object.keys(macroMenus);
}

// Make available globally
window.MacroMenus = {
  menus: macroMenus,
  get: getMacroMenu,
  keys: getMacroMenuKeys
}; 