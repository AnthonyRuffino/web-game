// ui/macros.js
// Macro management system

// Ensure UI object exists
// Macro Management System
window.UI.macroManager = {
  // Storage keys
  storageKey: 'ui_macros',
  
  // Macro data
  macros: {}, // { macroName: { name, command, created } }
  macroIcons: {}, // { macroName: dataURL }
  
  // Initialize macro system
  init() {
    this.loadMacros();
    console.log('[UI] Macro system initialized');
    console.log(`[UI] Loaded ${Object.keys(this.macros).length} macros`);
  },
  
  // Load macros from localStorage
  loadMacros() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        this.macros = data.macros || {};
        this.macroIcons = data.macroIcons || {};
        console.log(`[UI] Loaded ${Object.keys(this.macros).length} macros from storage`);
      }
    } catch (error) {
      console.warn('[UI] Failed to load macros:', error);
      this.macros = {};
      this.macroIcons = {};
    }
  },
  
  // Save macros to localStorage
  saveMacros() {
    try {
      const data = {
        macros: this.macros,
        macroIcons: this.macroIcons
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('[UI] Failed to save macros:', error);
    }
  },
  
  // Create a new macro
  createMacro(name, command) {
    if (this.macros[name]) {
      console.error(`[UI] Macro '${name}' already exists`);
      return false;
    }
    
    // Create macro data
    this.macros[name] = {
      name: name,
      command: command,
      created: Date.now()
    };
    
    // Generate dynamic icon
    this.generateMacroIcon(name);
    
    // Save to localStorage
    this.saveMacros();
    
    console.log(`[UI] Created macro '${name}' with command '${command}'`);
    return true;
  },
  
  // Generate a dynamic icon for a macro
  generateMacroIcon(macroName) {
    // Create a temporary canvas for icon generation
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generate random colors
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const bgColor = colors[Math.floor(Math.random() * colors.length)];
    const shapeColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw random shapes
    const shapeCount = Math.floor(Math.random() * 3) + 2; // 2-4 shapes
    for (let i = 0; i < shapeCount; i++) {
      ctx.fillStyle = shapeColor;
      const shapeType = Math.floor(Math.random() * 3); // 0=circle, 1=rect, 2=triangle
      
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 20 + 10;
      
      switch (shapeType) {
        case 0: // Circle
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 1: // Rectangle
          ctx.fillRect(x - size/2, y - size/2, size, size);
          break;
        case 2: // Triangle
          ctx.beginPath();
          ctx.moveTo(x, y - size/2);
          ctx.lineTo(x - size/2, y + size/2);
          ctx.lineTo(x + size/2, y + size/2);
          ctx.closePath();
          ctx.fill();
          break;
      }
    }
    
    // Convert to data URL
    this.macroIcons[macroName] = canvas.toDataURL('image/png');
  },
  
  // Assign a macro to an action bar slot
  assignMacro(barSlot, macroName) {
    if (!this.macros[macroName]) {
      console.error(`[UI] Macro '${macroName}' does not exist`);
      return false;
    }
    
    // Parse bar-slot format (e.g., "mainBar-0", "secondaryBar-3")
    const parts = barSlot.split('-');
    if (parts.length !== 2) {
      console.error('[UI] Invalid bar-slot format. Use "barName-slotIndex" (e.g., "mainBar-0", "secondaryBar-3")');
      return false;
    }
    
    const barName = parts[0];
    const slotIndex = parseInt(parts[1], 10);
    
    if (isNaN(slotIndex) || slotIndex < 0) {
      console.error('[UI] Invalid slot index. Must be a non-negative number.');
      return false;
    }
    
    // Get the action bar
    const bar = window.UI.actionBarManager.getActionBar(barName);
    if (!bar) {
      console.error(`[UI] Action bar '${barName}' does not exist`);
      return false;
    }
    
    if (slotIndex >= bar.slots) {
      console.error(`[UI] Slot index ${slotIndex} is out of range for bar '${barName}' (0-${bar.slots - 1})`);
      return false;
    }
    
    // Assign the macro
    bar.assignMacro(slotIndex, macroName);
    
    console.log(`[UI] Assigned macro '${macroName}' to ${barName} slot ${slotIndex}`);
    return true;
  },
  
  // Remove a macro from an action bar slot
  removeMacro(barSlot) {
    // Parse bar-slot format
    const parts = barSlot.split('-');
    if (parts.length !== 2) {
      console.error('[UI] Invalid bar-slot format. Use "barName-slotIndex"');
      return false;
    }
    
    const barName = parts[0];
    const slotIndex = parseInt(parts[1], 10);
    
    if (isNaN(slotIndex) || slotIndex < 0) {
      console.error('[UI] Invalid slot index');
      return false;
    }
    
    // Get the action bar
    const bar = window.UI.actionBarManager.getActionBar(barName);
    if (!bar) {
      console.error(`[UI] Action bar '${barName}' does not exist`);
      return false;
    }
    
    // Remove the macro
    bar.removeMacro(slotIndex);
    
    console.log(`[UI] Removed macro from ${barName} slot ${slotIndex}`);
    return true;
  },
  
  // Delete a macro entirely
  deleteMacro(macroName) {
    if (!this.macros[macroName]) {
      console.error(`[UI] Macro '${macroName}' does not exist`);
      return false;
    }
    
    // Remove from all action bars
    const bars = window.UI.actionBarManager.listActionBars();
    for (const barName of bars) {
      const bar = window.UI.actionBarManager.getActionBar(barName);
      if (bar) {
        for (let i = 0; i < bar.slots; i++) {
          if (bar.macroBindings[i] === macroName) {
            bar.removeMacro(i);
          }
        }
      }
    }
    
    // Remove from storage
    delete this.macros[macroName];
    delete this.macroIcons[macroName];
    this.saveMacros();
    
    console.log(`[UI] Deleted macro '${macroName}'`);
    return true;
  },
  
  // List all macros
  listMacros() {
    return Object.keys(this.macros);
  },
  
  // Get macro info
  getMacro(name) {
    return this.macros[name];
  },
  
  // Clear all macros
  clearAllMacros() {
    // Remove from all action bars
    const bars = window.UI.actionBarManager.listActionBars();
    for (const barName of bars) {
      const bar = window.UI.actionBarManager.getActionBar(barName);
      if (bar) {
        for (let i = 0; i < bar.slots; i++) {
          bar.removeMacro(i);
        }
      }
    }
    
    // Clear storage
    this.macros = {};
    this.macroIcons = {};
    this.saveMacros();
    
    console.log('[UI] Cleared all macros');
  },

  // --- Macro Management UI (Step 12) ---
  openMacroUI() {
    // Prevent multiple modals
    if (document.getElementById('macro-ui-modal')) return;

    // Create overlay for the modal
    const overlay = document.createElement('div');
    overlay.id = 'macro-ui-modal';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';

    // Handle escape key to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Helper to refresh the macro grid
    const refreshGrid = () => {
      // Remove and re-open the modal
      const old = document.getElementById('macro-ui-modal');
      if (old) old.remove();
      this.openMacroUI();
    };

    // --- Macro Creation Dialog ---
    const openCreateDialog = (slotIndex) => {
      if (document.getElementById('macro-create-dialog')) return;

      // Overlay
      const dialogOverlay = document.createElement('div');
      dialogOverlay.id = 'macro-create-dialog';
      dialogOverlay.style.position = 'fixed';
      dialogOverlay.style.top = '0';
      dialogOverlay.style.left = '0';
      dialogOverlay.style.width = '100vw';
      dialogOverlay.style.height = '100vh';
      dialogOverlay.style.background = 'rgba(0,0,0,0.6)';
      dialogOverlay.style.zIndex = '2100';
      dialogOverlay.style.display = 'flex';
      dialogOverlay.style.alignItems = 'center';
      dialogOverlay.style.justifyContent = 'center';

      // Dialog
      const dialog = document.createElement('div');
      dialog.style.background = '#23232b';
      dialog.style.borderRadius = '10px';
      dialog.style.boxShadow = '0 4px 32px rgba(0,0,0,0.8)';
      dialog.style.padding = '32px 32px 24px 32px';
      dialog.style.minWidth = '340px';
      dialog.style.maxWidth = '95vw';
      dialog.style.color = '#fff';
      dialog.style.position = 'relative';

      dialog.innerHTML = `<h3 style='margin-top:0'>Create Macro</h3>`;

      // Name input
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Macro Name:';
      nameLabel.style.display = 'block';
      nameLabel.style.marginTop = '8px';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.style.width = '100%';
      nameInput.style.margin = '4px 0 12px 0';
      nameInput.style.fontSize = '1rem';
      nameInput.style.padding = '6px';
      nameInput.style.borderRadius = '4px';
      nameInput.style.border = '1px solid #444';
      nameInput.onfocus = () => {
        // Input is blocked by focus-based logic in ui/input.js
      };
      nameInput.onblur = () => {
        // Input is blocked by focus-based logic in ui/input.js
      };
      dialog.appendChild(nameLabel);
      dialog.appendChild(nameInput);

      // Command input
      const cmdLabel = document.createElement('label');
      cmdLabel.textContent = 'Macro Command:';
      cmdLabel.style.display = 'block';
      const cmdInput = document.createElement('input');
      cmdInput.type = 'text';
      cmdInput.style.width = '100%';
      cmdInput.style.margin = '4px 0 12px 0';
      cmdInput.style.fontSize = '1rem';
      cmdInput.style.padding = '6px';
      cmdInput.style.borderRadius = '4px';
      cmdInput.style.border = '1px solid #444';
      cmdInput.onfocus = () => {
        // Input is blocked by focus-based logic in ui/input.js
      };
      cmdInput.onblur = () => {
        // Input is blocked by focus-based logic in ui/input.js
      };
      dialog.appendChild(cmdLabel);
      dialog.appendChild(cmdInput);

      // Icon preview
      const iconPreview = document.createElement('img');
      iconPreview.style.width = '48px';
      iconPreview.style.height = '48px';
      iconPreview.style.borderRadius = '6px';
      iconPreview.style.background = '#444';
      iconPreview.style.display = 'block';
      iconPreview.style.margin = '8px auto 8px auto';
      iconPreview.style.objectFit = 'cover';
      iconPreview.alt = 'Macro Icon';
      dialog.appendChild(iconPreview);

      // PNG upload
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/png';
      fileInput.style.display = 'none';
      dialog.appendChild(fileInput);
      const uploadBtn = document.createElement('button');
      uploadBtn.textContent = 'Upload PNG';
      uploadBtn.style.marginRight = '8px';
      uploadBtn.onclick = () => fileInput.click();
      dialog.appendChild(uploadBtn);
      fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          iconPreview.src = reader.result;
          iconPreview._pendingIcon = reader.result;
        };
        reader.readAsDataURL(file);
      });

      // Random icon button
      const randomBtn = document.createElement('button');
      randomBtn.textContent = 'Random Icon';
      randomBtn.onclick = () => {
        // Use macroManager's icon generation logic
        const tempName = '__temp_macro_icon__';
        this.generateMacroIcon(tempName);
        iconPreview.src = this.macroIcons[tempName];
        iconPreview._pendingIcon = this.macroIcons[tempName];
        delete this.macroIcons[tempName];
      };
      dialog.appendChild(randomBtn);

      // Save/Cancel buttons
      const btnRow = document.createElement('div');
      btnRow.style.marginTop = '18px';
      btnRow.style.textAlign = 'right';
      btnRow.style.display = 'flex';
      btnRow.style.justifyContent = 'flex-end';
      btnRow.style.gap = '12px';
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.style.background = '#4ECDC4';
      saveBtn.style.color = '#222';
      saveBtn.style.border = 'none';
      saveBtn.style.borderRadius = '5px';
      saveBtn.style.padding = '7px 18px';
      saveBtn.style.fontWeight = 'bold';
      saveBtn.style.cursor = 'pointer';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.background = '#444';
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '5px';
      cancelBtn.style.padding = '7px 18px';
      cancelBtn.style.cursor = 'pointer';
      btnRow.appendChild(saveBtn);
      btnRow.appendChild(cancelBtn);
      dialog.appendChild(btnRow);

      // Save handler
      saveBtn.onclick = () => {
        const name = nameInput.value.trim();
        const command = cmdInput.value.trim();
        if (!name) {
          alert('Macro name is required.');
          return;
        }
        if (this.macros[name]) {
          alert('Macro name must be unique.');
          return;
        }
        if (!command) {
          alert('Macro command is required.');
          return;
        }
        // Create macro
        this.macros[name] = {
          name: name,
          command: command,
          created: Date.now()
        };
        // Save icon if present
        if (iconPreview._pendingIcon) {
          this.macroIcons[name] = iconPreview._pendingIcon;
        } else {
          this.generateMacroIcon(name);
        }
        this.saveMacros();
        document.body.removeChild(dialogOverlay);
        refreshGrid();
      };
      // Cancel handler
      cancelBtn.onclick = () => {
        document.body.removeChild(dialogOverlay);
      };

      dialogOverlay.appendChild(dialog);
      document.body.appendChild(dialogOverlay);
      nameInput.focus();
    };

    // --- Macro Edit Dialog ---
    const openEditDialog = (macroName) => {
      if (document.getElementById('macro-edit-dialog')) return;
      const macro = this.macros[macroName];
      if (!macro) return;

      // Overlay
      const dialogOverlay = document.createElement('div');
      dialogOverlay.id = 'macro-edit-dialog';
      dialogOverlay.style.position = 'fixed';
      dialogOverlay.style.top = '0';
      dialogOverlay.style.left = '0';
      dialogOverlay.style.width = '100vw';
      dialogOverlay.style.height = '100vh';
      dialogOverlay.style.background = 'rgba(0,0,0,0.6)';
      dialogOverlay.style.zIndex = '2100';
      dialogOverlay.style.display = 'flex';
      dialogOverlay.style.alignItems = 'center';
      dialogOverlay.style.justifyContent = 'center';

      // Dialog
      const dialog = document.createElement('div');
      dialog.style.background = '#23232b';
      dialog.style.borderRadius = '10px';
      dialog.style.boxShadow = '0 4px 32px rgba(0,0,0,0.8)';
      dialog.style.padding = '32px 32px 24px 32px';
      dialog.style.minWidth = '340px';
      dialog.style.maxWidth = '95vw';
      dialog.style.color = '#fff';
      dialog.style.position = 'relative';
      dialog.innerHTML = `<h3 style='margin-top:0'>Edit Macro</h3>`;

      // Name input
      const nameLabel = document.createElement('label');
      nameLabel.textContent = 'Macro Name:';
      nameLabel.style.display = 'block';
      nameLabel.style.marginTop = '8px';
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = macro.name;
      nameInput.style.width = '100%';
      nameInput.style.margin = '4px 0 12px 0';
      nameInput.style.fontSize = '1rem';
      nameInput.style.padding = '6px';
      nameInput.style.borderRadius = '4px';
      nameInput.style.border = '1px solid #444';
      nameInput.onfocus = () => {
        // Input is blocked by focus-based logic in ui/input.js
      };
      nameInput.onblur = () => {
        // Input is blocked by focus-based logic in ui/input.js
      };
      dialog.appendChild(nameLabel);
      dialog.appendChild(nameInput);

      // Command input
      const cmdLabel = document.createElement('label');
      cmdLabel.textContent = 'Macro Command:';
      cmdLabel.style.display = 'block';
      const cmdInput = document.createElement('input');
      cmdInput.type = 'text';
      cmdInput.value = macro.command;
      cmdInput.style.width = '100%';
      cmdInput.style.margin = '4px 0 12px 0';
      cmdInput.style.fontSize = '1rem';
      cmdInput.style.padding = '6px';
      cmdInput.style.borderRadius = '4px';
      cmdInput.style.border = '1px solid #444';
      cmdInput.onfocus = () => {
        // Input is blocked by focus-based logic in ui/input.js
      };
      cmdInput.onblur = () => {
        // Input is blocked by focus-based logic in ui/input.js
      };
      dialog.appendChild(cmdLabel);
      dialog.appendChild(cmdInput);

      // Icon preview
      const iconPreview = document.createElement('img');
      iconPreview.style.width = '48px';
      iconPreview.style.height = '48px';
      iconPreview.style.borderRadius = '6px';
      iconPreview.style.background = '#444';
      iconPreview.style.display = 'block';
      iconPreview.style.margin = '8px auto 8px auto';
      iconPreview.style.objectFit = 'cover';
      iconPreview.alt = 'Macro Icon';
      iconPreview.src = this.macroIcons[macroName] || '';
      dialog.appendChild(iconPreview);

      // PNG upload
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/png';
      fileInput.style.display = 'none';
      dialog.appendChild(fileInput);
      const uploadBtn = document.createElement('button');
      uploadBtn.textContent = 'Upload PNG';
      uploadBtn.style.marginRight = '8px';
      uploadBtn.onclick = () => fileInput.click();
      dialog.appendChild(uploadBtn);
      fileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function () {
          iconPreview.src = reader.result;
          iconPreview._pendingIcon = reader.result;
        };
        reader.readAsDataURL(file);
      });

      // Random icon button
      const randomBtn = document.createElement('button');
      randomBtn.textContent = 'Random Icon';
      randomBtn.onclick = () => {
        const tempName = '__temp_macro_icon__';
        this.generateMacroIcon(tempName);
        iconPreview.src = this.macroIcons[tempName];
        iconPreview._pendingIcon = this.macroIcons[tempName];
        delete this.macroIcons[tempName];
      };
      dialog.appendChild(randomBtn);

      // Action bar binding
      const barLabel = document.createElement('label');
      barLabel.textContent = 'Bind to Action Bar:';
      barLabel.style.display = 'block';
      barLabel.style.marginTop = '16px';
      const barSelect = document.createElement('select');
      barSelect.style.width = '100%';
      barSelect.style.margin = '4px 0 8px 0';
      const bars = window.UI.actionBarManager.listActionBars();
      barSelect.innerHTML = '<option value="">-- Select Action Bar --</option>';
      bars.forEach(barName => {
        const opt = document.createElement('option');
        opt.value = barName;
        opt.textContent = barName;
        barSelect.appendChild(opt);
      });
      dialog.appendChild(barLabel);
      dialog.appendChild(barSelect);

      // Slot binding
      const slotLabel = document.createElement('label');
      slotLabel.textContent = 'Slot:';
      slotLabel.style.display = 'block';
      const slotSelect = document.createElement('select');
      slotSelect.style.width = '100%';
      slotSelect.style.margin = '4px 0 8px 0';
      slotSelect.disabled = true;
      dialog.appendChild(slotLabel);
      dialog.appendChild(slotSelect);
      barSelect.onchange = () => {
        slotSelect.innerHTML = '';
        const barName = barSelect.value;
        if (!barName) {
          slotSelect.disabled = true;
          return;
        }
        const bar = window.UI.actionBarManager.getActionBar(barName);
        if (!bar) {
          slotSelect.disabled = true;
          return;
        }
        slotSelect.disabled = false;
        for (let i = 0; i < bar.slots; i++) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = `Slot ${i + 1}`;
          slotSelect.appendChild(opt);
        }
      };

      // Save/Bind/Delete/Cancel buttons
      const btnRow = document.createElement('div');
      btnRow.style.marginTop = '18px';
      btnRow.style.textAlign = 'right';
      btnRow.style.display = 'flex';
      btnRow.style.justifyContent = 'flex-end';
      btnRow.style.gap = '12px';
      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';
      saveBtn.style.background = '#4ECDC4';
      saveBtn.style.color = '#222';
      saveBtn.style.border = 'none';
      saveBtn.style.borderRadius = '5px';
      saveBtn.style.padding = '7px 18px';
      saveBtn.style.fontWeight = 'bold';
      saveBtn.style.cursor = 'pointer';
      const bindBtn = document.createElement('button');
      bindBtn.textContent = 'Bind';
      bindBtn.style.background = '#45B7D1';
      bindBtn.style.color = '#fff';
      bindBtn.style.border = 'none';
      bindBtn.style.borderRadius = '5px';
      bindBtn.style.padding = '7px 18px';
      bindBtn.style.cursor = 'pointer';
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.background = '#FF6B6B';
      deleteBtn.style.color = '#fff';
      deleteBtn.style.border = 'none';
      deleteBtn.style.borderRadius = '5px';
      deleteBtn.style.padding = '7px 18px';
      deleteBtn.style.cursor = 'pointer';
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.background = '#444';
      cancelBtn.style.color = '#fff';
      cancelBtn.style.border = 'none';
      cancelBtn.style.borderRadius = '5px';
      cancelBtn.style.padding = '7px 18px';
      cancelBtn.style.cursor = 'pointer';
      btnRow.appendChild(saveBtn);
      btnRow.appendChild(bindBtn);
      btnRow.appendChild(deleteBtn);
      btnRow.appendChild(cancelBtn);
      dialog.appendChild(btnRow);

      // Save handler
      saveBtn.onclick = () => {
        const newName = nameInput.value.trim();
        const command = cmdInput.value.trim();
        if (!newName) {
          alert('Macro name is required.');
          return;
        }
        if (newName !== macroName && this.macros[newName]) {
          alert('Macro name must be unique.');
          return;
        }
        if (!command) {
          alert('Macro command is required.');
          return;
        }
        // Rename macro if needed
        if (newName !== macroName) {
          this.macros[newName] = { ...macro, name: newName, command };
          if (this.macroIcons[macroName]) {
            this.macroIcons[newName] = this.macroIcons[macroName];
            delete this.macroIcons[macroName];
          }
          delete this.macros[macroName];
        } else {
          this.macros[newName].command = command;
        }
        // Save icon if present
        if (iconPreview._pendingIcon) {
          this.macroIcons[newName] = iconPreview._pendingIcon;
        }
        this.saveMacros();
        document.body.removeChild(dialogOverlay);
        refreshGrid();
      };
      // Bind handler
      bindBtn.onclick = () => {
        const barName = barSelect.value;
        const slotIdx = parseInt(slotSelect.value, 10);
        const currentName = nameInput.value.trim();
        if (!barName || isNaN(slotIdx)) {
          alert('Select an action bar and slot to bind.');
          return;
        }
        if (!this.macros[currentName]) {
          alert('Macro must be saved before binding.');
          return;
        }
        window.UI.macroManager.assignMacro(`${barName}-${slotIdx}`, currentName);
        this.saveMacros();
        document.body.removeChild(dialogOverlay);
        refreshGrid();
      };
      // Delete handler
      deleteBtn.onclick = () => {
        if (!confirm('Delete this macro? This cannot be undone.')) return;
        delete this.macros[macroName];
        if (this.macroIcons[macroName]) delete this.macroIcons[macroName];
        this.saveMacros();
        document.body.removeChild(dialogOverlay);
        refreshGrid();
      };
      // Cancel handler
      cancelBtn.onclick = () => {
        document.body.removeChild(dialogOverlay);
      };

      dialogOverlay.appendChild(dialog);
      document.body.appendChild(dialogOverlay);
      nameInput.focus();
    };

    // Create modal content
    const modal = document.createElement('div');
    modal.style.background = '#222';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 32px rgba(0,0,0,0.7)';
    modal.style.padding = '32px 40px';
    modal.style.minWidth = '480px';
    modal.style.maxWidth = '95vw';
    modal.style.color = '#fff';
    modal.style.position = 'relative';
    modal.innerHTML = `<h2 style="margin-top:0">Macro Management</h2>`;

    // Macro grid config
    const gridRows = 4;
    const gridCols = 4;
    const totalSlots = gridRows * gridCols;
    const macroNames = Object.keys(this.macros);

    // Create grid container
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
    grid.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    grid.style.gap = '16px';
    grid.style.margin = '24px 0 12px 0';
    grid.style.width = '400px';
    grid.style.maxWidth = '80vw';

    // Render slots
    for (let i = 0; i < totalSlots; i++) {
      const cell = document.createElement('div');
      cell.style.background = '#333';
      cell.style.borderRadius = '8px';
      cell.style.display = 'flex';
      cell.style.flexDirection = 'column';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.height = '80px';
      cell.style.cursor = 'pointer';
      cell.style.position = 'relative';
      cell.style.transition = 'background 0.2s';
      cell.onmouseenter = () => cell.style.background = '#444';
      cell.onmouseleave = () => cell.style.background = '#333';

      if (macroNames[i]) {
        // Filled cell: show icon and name
        const macro = this.macros[macroNames[i]];
        const icon = this.macroIcons[macroNames[i]];
        if (icon) {
          const img = document.createElement('img');
          img.src = icon;
          img.alt = macro.name;
          img.style.width = '40px';
          img.style.height = '40px';
          img.style.marginBottom = '6px';
          img.style.borderRadius = '6px';
          cell.appendChild(img);
        }
        const name = document.createElement('div');
        name.textContent = macro.name;
        name.style.fontSize = '14px';
        name.style.textAlign = 'center';
        name.style.wordBreak = 'break-all';
        cell.appendChild(name);
        cell.onclick = () => openEditDialog(macroNames[i]);
      } else {
        // Empty cell: show plus
        const plus = document.createElement('div');
        plus.textContent = '+';
        plus.style.fontSize = '32px';
        plus.style.color = '#aaa';
        plus.style.userSelect = 'none';
        cell.appendChild(plus);
        cell.onclick = () => openCreateDialog(i);
      }
      grid.appendChild(cell);
    }

    modal.appendChild(grid);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '16px';
    closeBtn.style.right = '16px';
    closeBtn.style.background = '#444';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '6px';
    closeBtn.style.padding = '6px 14px';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => {
      overlay.remove();
      document.removeEventListener('keydown', handleEscape);
    };
    modal.appendChild(closeBtn);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  },

  // Ensure macro manager is always available
  ensureMacroManager() {
    if (!window.UI.macroManager) {
      console.error('[UI] Macro manager not found - this should not happen');
      return false;
    }
    
    // If not initialized, initialize it
    if (!window.UI.macroManager.macros) {
      window.UI.macroManager.init();
    }
    
    return true;
  }
};

// Manual initialization function for debugging
window.UI.initMacroManager = function() {
  if (window.UI.macroManager) {
    window.UI.macroManager.init();
    console.log('[UI] Macro manager manually initialized');
  } else {
    console.error('[UI] Macro manager not found');
  }
};

// Initialize immediately when script loads
if (window.UI.macroManager) {
  window.UI.macroManager.init();
  console.log('[UI] Macro manager initialized immediately');
}

// Also initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  if (window.UI.macroManager) {
    // Re-initialize to ensure it's ready
    window.UI.macroManager.init();
    console.log('[UI] Macro manager initialized on DOM ready');
  } else {
    console.error('[UI] Macro manager not found during DOM ready');
  }
});

// Fallback: try to initialize after a short delay
setTimeout(() => {
  if (window.UI.macroManager && !window.UI.macroManager.macros) {
    window.UI.macroManager.init();
    console.log('[UI] Macro manager initialized via fallback');
  }
}, 500); 