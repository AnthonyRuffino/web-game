// data/ui/macros/index.js
// Main export file for all menu configurations

(() =>{
  // Initialize the unified menu system
async function initialize(_MacroMenus, _UIMenus, _SkinMenus) {
  
  const macroMenus = _MacroMenus.menus;
  const uiMenus = _UIMenus.menus;
  const skinMenus = _SkinMenus.menus;
  
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

  // Create the unified menu system
  window.WebGame.MenuConfigs = {
    ...window.WebGame.MenuConfigs,
    getMenu,
    getAllMenuKeys,
    getMenuKeysByCategory,
    getMenusByCategory,
    macro: { 
      menus: macroMenus, 
      get: _MacroMenus.get, 
      keys: _MacroMenus.keys 
    },
    ui: { 
      menus: uiMenus, 
      get: _UIMenus.get, 
      keys: _UIMenus.keys 
    },
    skin: { 
      menus: skinMenus, 
      get: _SkinMenus.get, 
      keys: _SkinMenus.keys 
    }
  };

  console.log('[MenuConfigs] Menu system initialized with', getAllMenuKeys().length, 'menus');
}

window.WebGame.MenuConfigs = {
  initialize
}
})();