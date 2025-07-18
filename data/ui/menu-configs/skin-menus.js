// data/ui/macros/skin-menus.js
// Skin-related menu configurations for the MenuManager

const skinMenus = {
  // Simple skin selector
  "simple-skin-selector": {
    id: "simple-skin-selector",
    title: "Skin Selector",
    content: "<h3>Choose Your Character Skin</h3><p>Select from available character skins:</p>",
    gridButtons: [
      {
        label: "Available Skins",
        rows: 2,
        cols: 4,
        cellSize: 80,
        gap: 15,
        buttons: [
          {
            name: "Default",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+RDwvdGV4dD4KPC9zdmc+",
            tooltip: "Default skin",
            onClick: () => console.log("Default skin selected"),
            onClickMenu: {
              id: "default-skin-preview",
              title: "Default Skin Preview",
              content: "<h3>Default Skin</h3><p>This is the default character skin.</p><p>Features:</p><ul><li>Classic design</li><li>Good visibility</li><li>Balanced colors</li></ul>",
              buttons: [
                {
                  text: "Apply Skin",
                  onClick: () => {
                    console.log("Default skin applied!");
                    window.UI.menuManager.hideMenu("default-skin-preview");
                  }
                },
                {
                  text: "Close",
                  onClick: () => window.UI.menuManager.hideMenu("default-skin-preview")
                }
              ]
            }
          },
          {
            name: "Warrior",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNEVDREM0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VzwvdGV4dD4KPC9zdmc+",
            tooltip: "Warrior skin",
            onClick: () => console.log("Warrior skin selected"),
            onClickMenu: {
              id: "warrior-skin-preview",
              title: "Warrior Skin Preview",
              content: "<h3>Warrior Skin</h3><p>Mighty warrior appearance with armor details.</p><p>Features:</p><ul><li>Armor plating</li><li>Battle scars</li><li>Weapon attachments</li></ul>",
              buttons: [
                {
                  text: "Apply Skin",
                  onClick: () => {
                    console.log("Warrior skin applied!");
                    window.UI.menuManager.hideMenu("warrior-skin-preview");
                  }
                },
                {
                  text: "Close",
                  onClick: () => window.UI.menuManager.hideMenu("warrior-skin-preview")
                }
              ]
            }
          },
          {
            name: "Mage",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTZDRUI0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TTwvdGV4dD4KPC9zdmc+",
            tooltip: "Mage skin",
            onClick: () => console.log("Mage skin selected"),
            onClickMenu: {
              id: "mage-skin-preview",
              title: "Mage Skin Preview",
              content: "<h3>Mage Skin</h3><p>Mystical mage with arcane symbols.</p><p>Features:</p><ul><li>Robe details</li><li>Magic effects</li><li>Arcane symbols</li></ul>",
              buttons: [
                {
                  text: "Apply Skin",
                  onClick: () => {
                    console.log("Mage skin applied!");
                    window.UI.menuManager.hideMenu("mage-skin-preview");
                  }
                },
                {
                  text: "Close",
                  onClick: () => window.UI.menuManager.hideMenu("mage-skin-preview")
                }
              ]
            }
          },
          {
            name: "Rogue",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkZFQUFBNyIvPgo8dGV4dCB4PSIyMCIgeT0iMjUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlI8L3RleHQ+Cjwvc3ZnPg==",
            tooltip: "Rogue skin",
            onClick: () => console.log("Rogue skin selected"),
            onClickMenu: {
              id: "rogue-skin-preview",
              title: "Rogue Skin Preview",
              content: "<h3>Rogue Skin</h3><p>Stealthy rogue with dark attire.</p><p>Features:</p><ul><li>Dark clothing</li><li>Stealth effects</li><li>Hidden weapons</li></ul>",
              buttons: [
                {
                  text: "Apply Skin",
                  onClick: () => {
                    console.log("Rogue skin applied!");
                    window.UI.menuManager.hideMenu("rogue-skin-preview");
                  }
                },
                {
                  text: "Close",
                  onClick: () => window.UI.menuManager.hideMenu("rogue-skin-preview")
                }
              ]
            }
          }
        ],
        onEmptyClick: (index) => console.log(`Unlock skin for slot ${index}`)
      }
    ],
    buttons: [
      {
        text: "Random Skin",
        onClick: () => console.log("Random skin selected")
      },
      {
        text: "Reset to Default",
        onClick: () => console.log("Skin reset to default")
      }
    ]
  },

  // Advanced skin customization with tabs
  "advanced-skin-customization": {
    id: "advanced-skin-customization",
    title: "Advanced Skin Customization",
    tabs: [
      {
        name: "Character",
        content: "<h3>Character Skins</h3><p>Choose your character appearance:</p>",
        gridButtons: [
          {
            label: "Character Skins",
            rows: 3,
            cols: 3,
            cellSize: 70,
            gap: 10,
            buttons: [
              {
                name: "Knight",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SzwvdGV4dD4KPC9zdmc+",
                tooltip: "Knight character",
                onClick: () => console.log("Knight selected")
              },
              {
                name: "Archer",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNEVDREM0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD4KPC9zdmc+",
                tooltip: "Archer character",
                onClick: () => console.log("Archer selected")
              },
              {
                name: "Wizard",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTZDRUI0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VzwvdGV4dD4KPC9zdmc+",
                tooltip: "Wizard character",
                onClick: () => console.log("Wizard selected")
              }
            ],
            onEmptyClick: (index) => console.log(`Unlock character for slot ${index}`)
          }
        ],
        buttons: [
          {
            text: "Random Character",
            onClick: () => console.log("Random character selected")
          },
          {
            text: "Preview Character",
            onClick: () => console.log("Character preview opened")
          }
        ]
      },
      {
        name: "Equipment",
        content: "<h3>Equipment Skins</h3><p>Customize your equipment appearance:</p>",
        gridButtons: [
          {
            label: "Weapon Skins",
            rows: 2,
            cols: 4,
            cellSize: 60,
            gap: 8,
            buttons: [
              {
                name: "Sword",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UzwvdGV4dD4KPC9zdmc+",
                tooltip: "Sword skin",
                onClick: () => console.log("Sword skin selected")
              },
              {
                name: "Bow",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNEVDREM0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QjwvdGV4dD4KPC9zdmc+",
                tooltip: "Bow skin",
                onClick: () => console.log("Bow skin selected")
              },
              {
                name: "Staff",
                imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjOTZDRUI0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U1Q8L3RleHQ+Cjwvc3ZnPg==",
                tooltip: "Staff skin",
                onClick: () => console.log("Staff skin selected")
              }
            ],
            onEmptyClick: (index) => console.log(`Unlock weapon skin for slot ${index}`)
          }
        ],
        buttons: [
          {
            text: "Apply Equipment",
            onClick: () => console.log("Equipment applied")
          },
          {
            text: "Reset Equipment",
            onClick: () => console.log("Equipment reset")
          }
        ]
      },
      {
        name: "Effects",
        content: "<h3>Visual Effects</h3><p>Customize your visual effects:</p>",
        radioGroups: [
          {
            label: "Particle Effects",
            options: [
              { text: "None", value: "none" },
              { text: "Low", value: "low", checked: true },
              { text: "Medium", value: "medium" },
              { text: "High", value: "high" }
            ],
            onChange: (value) => console.log(`Particle effects: ${value}`)
          },
          {
            label: "Animation Quality",
            options: [
              { text: "Simple", value: "simple" },
              { text: "Standard", value: "standard", checked: true },
              { text: "Smooth", value: "smooth" }
            ],
            onChange: (value) => console.log(`Animation quality: ${value}`)
          }
        ],
        buttons: [
          {
            text: "Save Effects",
            onClick: () => console.log("Effects saved!")
          },
          {
            text: "Preview Effects",
            onClick: () => console.log("Effects preview opened")
          }
        ]
      }
    ]
  },

  // Skin unlock system
  "skin-unlock-system": {
    id: "skin-unlock-system",
    title: "Skin Unlock System",
    content: "<h3>Unlock New Skins</h3><p>Complete challenges to unlock new character skins:</p>",
    gridButtons: [
      {
        label: "Available Challenges",
        rows: 3,
        cols: 2,
        cellSize: 100,
        gap: 15,
        buttons: [
          {
            name: "Win 10 Games",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRkY2QjZCIi8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+MTA8L3RleHQ+Cjwvc3ZnPg==",
            tooltip: "Win 10 games to unlock",
            onClick: () => console.log("Win 10 games challenge clicked"),
            onClickMenu: {
              id: "win-10-challenge",
              title: "Win 10 Games Challenge",
              content: "<h3>Win 10 Games</h3><p>Win 10 games to unlock the Golden Warrior skin!</p><p>Progress: 3/10 games won</p>",
              buttons: [
                {
                  text: "View Progress",
                  onClick: () => console.log("Progress: 3/10 games won")
                },
                {
                  text: "Close",
                  onClick: () => window.UI.menuManager.hideMenu("win-10-challenge")
                }
              ]
            }
          },
          {
            name: "Reach Level 50",
            imageDataUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNEVDREM0Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+NTA8L3RleHQ+Cjwvc3ZnPg==",
            tooltip: "Reach level 50 to unlock",
            onClick: () => console.log("Reach level 50 challenge clicked"),
            onClickMenu: {
              id: "level-50-challenge",
              title: "Reach Level 50 Challenge",
              content: "<h3>Reach Level 50</h3><p>Reach level 50 to unlock the Elite Mage skin!</p><p>Progress: 23/50 levels completed</p>",
              buttons: [
                {
                  text: "View Progress",
                  onClick: () => console.log("Progress: 23/50 levels completed")
                },
                {
                  text: "Close",
                  onClick: () => window.UI.menuManager.hideMenu("level-50-challenge")
                }
              ]
            }
          }
        ],
        onEmptyClick: (index) => console.log(`Challenge slot ${index} is locked`)
      }
    ],
    buttons: [
      {
        text: "View All Challenges",
        onClick: () => console.log("All challenges view opened")
      },
      {
        text: "Claim Rewards",
        onClick: () => console.log("Rewards claimed!")
      }
    ]
  }
};

// Export function to get menu configurations
function getSkinMenu(key) {
  return skinMenus[key];
}

// Export all available menu keys
function getSkinMenuKeys() {
  return Object.keys(skinMenus);
}

// Make available globally
window.SkinMenus = {
  menus: skinMenus,
  get: getSkinMenu,
  keys: getSkinMenuKeys
}; 