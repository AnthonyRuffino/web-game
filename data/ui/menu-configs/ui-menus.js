// data/ui/menu-configs/ui-menus.js
// General UI menu configurations for the MenuManager

(() => {
  const uiMenus = {
    // Simple test menu
    "test-menu": {
      id: "test-menu",
      title: "Test Menu",
      content: "<p>This is a simple test menu with some content!</p>",
      buttons: [
        {
          text: "Log Message",
          onClick: () => console.log("Button clicked! This proves the callback works.")
        },
        {
          text: "Another Button", 
          onClick: () => alert("Another button works too!")
        }
      ]
    },

    // Settings menu with radio groups
    "settings-menu": {
      id: "settings-menu",
      title: "Game Settings",
      content: "<h3>Configure Your Game</h3><p>Adjust various game settings below:</p>",
      radioGroups: [
        {
          label: "Theme Selection",
          options: [
            { text: "Dark Theme", value: "dark", checked: true },
            { text: "Light Theme", value: "light" },
            { text: "Auto", value: "auto" }
          ],
          onChange: (value) => console.log(`Theme changed to: ${value}`)
        },
        {
          label: "Game Difficulty",
          options: [
            { text: "Easy", value: "easy" },
            { text: "Normal", value: "normal", checked: true },
            { text: "Hard", value: "hard" },
            { text: "Expert", value: "expert" }
          ],
          onChange: (value) => console.log(`Difficulty changed to: ${value}`)
        }
      ],
      buttons: [
        {
          text: "Apply Settings",
          onClick: () => console.log("Settings applied!")
        },
        {
          text: "Reset to Defaults",
          onClick: () => console.log("Settings reset to defaults")
        }
      ]
    },

    // Advanced settings with tabs
    "advanced-settings": {
      id: "advanced-settings",
      title: "Advanced Settings",
      tabs: [
        {
          name: "Graphics",
          content: "<h3>Graphics Settings</h3><p>Configure your graphics options:</p>",
          radioGroups: [
            {
              label: "Graphics Quality",
              options: [
                { text: "Low", value: "low" },
                { text: "Medium", value: "medium", checked: true },
                { text: "High", value: "high" },
                { text: "Ultra", value: "ultra" }
              ],
              onChange: (value) => console.log(`Graphics quality changed to: ${value}`)
            },
            {
              label: "Sound Volume",
              options: [
                { text: "Muted", value: "0" },
                { text: "Low", value: "25" },
                { text: "Medium", value: "50", checked: true },
                { text: "High", value: "75" },
                { text: "Maximum", value: "100" }
              ],
              onChange: (value) => console.log(`Sound volume changed to: ${value}%`)
            }
          ],
          buttons: [
            {
              text: "Save Settings",
              onClick: () => console.log("Graphics settings saved!")
            },
            {
              text: "Test Graphics",
              onClick: () => console.log("Testing graphics settings...")
            }
          ]
        },
        {
          name: "Controls",
          content: "<h3>Control Settings</h3><p>Choose your control scheme:</p>",
          radioGroups: [
            {
              label: "Control Scheme",
              options: [
                { text: "WASD", value: "wasd", checked: true },
                { text: "Arrow Keys", value: "arrows" },
                { text: "Gamepad", value: "gamepad" }
              ],
              onChange: (value) => console.log(`Control scheme changed to: ${value}`)
            },
            {
              label: "Mouse Sensitivity",
              options: [
                { text: "Slow", value: "slow" },
                { text: "Normal", value: "normal", checked: true },
                { text: "Fast", value: "fast" }
              ],
              onChange: (value) => console.log(`Mouse sensitivity changed to: ${value}`)
            }
          ],
          buttons: [
            {
              text: "Save Controls",
              onClick: () => console.log("Control settings saved!")
            },
            {
              text: "Calibrate Gamepad",
              onClick: () => console.log("Calibrating gamepad...")
            }
          ]
        },
        {
          name: "Data",
          content: "<h3>Data View</h3><p>This tab shows some sample data:</p>",
          buttons: [
            {
              text: "Refresh Data",
              onClick: () => console.log("Data refreshed!")
            },
            {
              text: "Export",
              onClick: () => console.log("Data exported!")
            }
          ]
        },
        {
          name: "Actions",
          content: "<h3>Action Panel</h3><p>This tab has no buttons in the content area, but you can still add them below.</p>",
          buttons: [
            {
              text: "Help",
              onClick: () => alert("Help information would appear here!")
            },
            {
              text: "About",
              onClick: () => console.log("About dialog would open here!")
            }
          ]
        }
      ]
    },

    // Confirmation dialog (blocking)
    "confirm-delete": {
      id: "confirm-delete",
      title: "Confirm Deletion",
      content: "<p>Are you sure you want to delete this item? This action cannot be undone.</p>",
      isBlocking: true,
      buttons: [
        {
          text: "Delete",
          onClick: () => {
            console.log("Item deleted!");
            window.UI.menuManager.hideMenu("confirm-delete");
          }
        },
        {
          text: "Cancel",
          onClick: () => window.UI.menuManager.hideMenu("confirm-delete")
        }
      ]
    },

    // Info dialog
    "info-dialog": {
      id: "info-dialog",
      title: "Information",
      content: "<h3>Welcome to the Game!</h3><p>This is an informational dialog with some helpful tips:</p><ul><li>Use WASD to move</li><li>Click to interact</li><li>Press ESC to close menus</li></ul>",
      buttons: [
        {
          text: "Got It",
          onClick: () => window.UI.menuManager.hideMenu("info-dialog")
        },
        {
          text: "Show Tutorial",
          onClick: () => console.log("Opening tutorial...")
        }
      ]
    },

    // Grid example with different layouts
    "grid-examples": {
      id: "grid-examples",
      title: "Grid Examples",
      tabs: [
        {
          name: "Small Grid",
          content: "<h3>Small Grid (2x2)</h3>",
          gridButtons: [
            {
              label: "Small Grid",
              rows: 2,
              cols: 2,
              cellSize: 60,
              gap: 12,
              buttons: [
                {
                  name: "Item 1",
                  imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MTwvdGV4dD4KPC9zdmc+",
                  tooltip: "First item",
                  onClick: () => console.log("Item 1 clicked")
                },
                {
                  name: "Item 2",
                  imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNEVDREM0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MjwvdGV4dD4KPC9zdmc+",
                  tooltip: "Second item",
                  onClick: () => console.log("Item 2 clicked")
                }
              ],
              onEmptyClick: (index) => alert(`Add new item to position ${index}`)
            }
          ]
        },
        {
          name: "Large Grid",
          content: "<h3>Large Grid (4x6)</h3>",
          gridButtons: [
            {
              label: "Large Grid",
              rows: 4,
              cols: 6,
              cellSize: 70,
              gap: 20,
              buttons: [
                {
                  name: "Macro 1",
                  imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTZDRUI0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TTE8L3RleHQ+Cjwvc3ZnPg==",
                  tooltip: "Macro 1 - Click to execute",
                  onClick: () => console.log("Executing Macro 1")
                },
                {
                  name: "Macro 2",
                  imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZFQUFBNyIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk0yPC90ZXh0Pgo8L3N2Zz4=",
                  tooltip: "Macro 2 - Click to execute",
                  onClick: () => console.log("Executing Macro 2")
                }
              ],
              emptyTooltip: "Click to create new macro",
              onEmptyClick: (index) => console.log(`Create macro at position ${index}`)
            }
          ]
        }
      ]
    },

    // Menu hierarchy example
    "menu-hierarchy": {
      id: "menu-hierarchy",
      title: "Menu Hierarchy Example",
      content: "<p>This menu demonstrates the hierarchy system:</p>",
      buttons: [
        {
          text: "Open Level 1",
          onClickMenu: {
            id: "level1",
            title: "Level 1 Menu",
            content: "<p>This is level 1</p>",
            buttons: [
              {
                text: "Open Level 2",
                onClickMenu: {
                  id: "level2",
                  title: "Level 2 Menu",
                  content: "<p>This is level 2</p>",
                  buttons: [
                    {
                      text: "Close All",
                      onClick: () => {
                        window.UI.menuManager.removeMenu("menu-hierarchy");
                      }
                    }
                  ]
                }
              },
              {
                text: "Close Level 1",
                onClick: () => window.UI.menuManager.hideMenu("level1")
              }
            ]
          }
        }
      ]
    }
  };



  window.WebGame.MenuConfigs.uiMenus = uiMenus;
  
})(); 