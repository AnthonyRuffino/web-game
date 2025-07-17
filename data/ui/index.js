// data/ui/macros/index.js
// Main export file for all menu configurations

// Initialize the unified menu system
async function initializeMenuSystem() {
  
  const macroMenus = window.MacroMenus.menus;
  const uiMenus = window.UIMenus.menus;
  const skinMenus = window.SkinMenus.menus;
  
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
      macro: window.MacroMenus.keys(),
      ui: window.UIMenus.keys(),
      skin: window.SkinMenus.keys()
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

  // Create the unified menu system
  window.MenuConfigs = {
    getMenu,
    getAllMenuKeys,
    getMenuKeysByCategory,
    getMenusByCategory,
    macro: { 
      menus: macroMenus, 
      get: window.MacroMenus.get, 
      keys: window.MacroMenus.keys 
    },
    ui: { 
      menus: uiMenus, 
      get: window.UIMenus.get, 
      keys: window.UIMenus.keys 
    },
    skin: { 
      menus: skinMenus, 
      get: window.SkinMenus.get, 
      keys: window.SkinMenus.keys 
    }
  };

  console.log('[MenuConfigs] Menu system initialized with', getAllMenuKeys().length, 'menus');
}