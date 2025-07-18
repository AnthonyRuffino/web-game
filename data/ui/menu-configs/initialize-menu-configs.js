// data/ui/macros/index.js
// Main export file for all menu configurations

((webGame) =>{
  // Initialize the unified menu system
async function initialize(macroMenus, uiMenus, skinMenus) {
  
  // Combined menu collections
  const allMenus = {
    ...macroMenus,
    ...uiMenus,
    ...skinMenus
  };

  // Unified getter function that searches all collections
  function getMenu(key) {
    return allMenus[key] || null;
  }

  // Get all available menu keys
  function getAllMenuKeys() {
    return Object.keys(allMenus);
  }

  // Get menu keys by category
  function getMenuKeysByCategory() {
    return {
      macro: _MacroMenus.keys(),
      ui: _UIMenus.keys(),
      skin: _SkinMenus.keys()
    };
  }

  // Get menus by category
  function getMenusByCategory() {
    return {
      macro: macroMenus,
      ui: uiMenus,
      skin: skinMenus
    };
  }

  webGame.MenuConfigs.getMenu = getMenu;
  webGame.MenuConfigs.getAllMenuKeys = getAllMenuKeys;
  webGame.MenuConfigs.getMenuKeysByCategory = getMenuKeysByCategory;
  webGame.MenuConfigs.getMenusByCategory = getMenusByCategory;
  webGame.MenuConfigs.macro = { 
    menus: macroMenus, 
    get: (key) => macroMenus[key], 
    keys: Object.keys(macroMenus)
  };
  webGame.MenuConfigs.ui = { 
    menus: uiMenus, 
    get: (key) => uiMenus[key], 
    keys: Object.keys(uiMenus) 
  };
  webGame.MenuConfigs.skin = { 
    menus: skinMenus, 
    get: (key) => skinMenus[key], 
    keys: Object.keys(skinMenus)
  };
  console.log('[MenuConfigs] Menu system initialized with', getAllMenuKeys().length, 'menus');
}

window.WebGame.MenuConfigs.init = initialize;

})(window.WebGame);