// ui/jsonPopup.js
// Reusable JSON editing popup system

// JsonPopupButton class for injectable buttons
class JsonPopupButton {
  constructor(config) {
    this.text = config.text || 'Button';
    this.style = config.style || {
      background: '#666',
      color: '#fff',
      border: 'none',
      padding: '6px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginLeft: '8px'
    };
    this.onClick = config.onClick || (() => {});
    this.enabled = config.enabled !== false;
  }

  createElement() {
    const button = document.createElement('button');
    button.textContent = this.text;
    
    // Apply styles
    Object.assign(button.style, this.style);
    
    // Add click handler
    button.onclick = () => {
      if (this.enabled) {
        this.onClick();
      }
    };
    
    return button;
  }
}

// JsonPopup class for reusable JSON editing dialogs
class JsonPopup {
  constructor(config) {
    this.title = config.title || 'Edit JSON';
    this.jsonData = config.jsonData || {};
    this.onSave = config.onSave || (() => {});
    this.onCancel = config.onCancel || (() => {});
    this.onClose = config.onClose || (() => {});
    this.buttons = config.buttons || [];
    this.popup = null;
    this.textarea = null;
    this.errorDiv = null;
  }

  show() {
    if (this.popup) return; // already open

    // Create popup elements
    this.popup = document.createElement('div');
    this.popup.style.position = 'fixed';
    this.popup.style.left = '50%';
    this.popup.style.top = '50%';
    this.popup.style.transform = 'translate(-50%, -50%)';
    this.popup.style.background = '#222';
    this.popup.style.color = '#fff';
    this.popup.style.padding = '20px';
    this.popup.style.borderRadius = '8px';
    this.popup.style.zIndex = 9999;
    this.popup.style.boxShadow = '0 4px 32px #000a';
    this.popup.style.width = '600px'; // 50% bigger than original 400px
    this.popup.style.height = '450px'; // 50% bigger than original 300px
    this.popup.style.minWidth = '400px';
    this.popup.style.minHeight = '300px';
    this.popup.style.maxWidth = '90vw';
    this.popup.style.maxHeight = '80vh';
    this.popup.style.overflow = 'hidden';
    this.popup.style.resize = 'both';
    this.popup.style.cursor = 'default';

    // Create content container for scrolling
    const contentContainer = document.createElement('div');
    contentContainer.style.position = 'absolute';
    contentContainer.style.top = '20px';
    contentContainer.style.left = '20px';
    contentContainer.style.right = '20px';
    contentContainer.style.bottom = '80px'; // Leave space for buttons
    contentContainer.style.overflow = 'auto';
    contentContainer.style.paddingRight = '10px'; // Space for scrollbar
    contentContainer.style.display = 'flex';
    contentContainer.style.flexDirection = 'column';

    const label = document.createElement('div');
    label.textContent = this.title + ':';
    label.style.marginBottom = '8px';
    label.style.flexShrink = '0';
    contentContainer.appendChild(label);

    this.textarea = document.createElement('textarea');
    this.textarea.style.width = '100%';
    this.textarea.style.flex = '1';
    this.textarea.style.minHeight = '200px';
    this.textarea.style.background = '#111';
    this.textarea.style.color = '#fff';
    this.textarea.style.fontFamily = 'monospace';
    this.textarea.style.fontSize = '14px';
    this.textarea.style.border = '1px solid #444';
    this.textarea.style.borderRadius = '4px';
    this.textarea.style.padding = '8px';
    this.textarea.style.resize = 'none'; // Disable textarea resize since popup is resizable
    this.textarea.value = JSON.stringify(this.jsonData, null, 2);
    contentContainer.appendChild(this.textarea);

    this.errorDiv = document.createElement('div');
    this.errorDiv.style.color = '#ff5252';
    this.errorDiv.style.margin = '8px 0';
    this.errorDiv.style.flexShrink = '0';
    contentContainer.appendChild(this.errorDiv);

    this.popup.appendChild(contentContainer);

    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.justifyContent = 'flex-end';
    btnRow.style.gap = '8px';
    btnRow.style.position = 'absolute';
    btnRow.style.bottom = '20px';
    btnRow.style.right = '20px';
    btnRow.style.left = '20px';

    // Add custom buttons first
    this.buttons.forEach(buttonConfig => {
      const button = new JsonPopupButton(buttonConfig);
      btnRow.appendChild(button.createElement());
    });

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Save';
    submitBtn.style.background = '#43a047';
    submitBtn.style.color = '#fff';
    submitBtn.style.border = 'none';
    submitBtn.style.padding = '6px 16px';
    submitBtn.style.borderRadius = '4px';
    submitBtn.style.cursor = 'pointer';
    submitBtn.onclick = () => this.handleSave();
    btnRow.appendChild(submitBtn);

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.background = '#e53935';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.padding = '6px 16px';
    cancelBtn.style.borderRadius = '4px';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => this.handleCancel();
    btnRow.appendChild(cancelBtn);

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.width = '20px';
    resizeHandle.style.height = '20px';
    resizeHandle.style.cursor = 'nw-resize';
    resizeHandle.style.background = 'linear-gradient(135deg, transparent 0%, transparent 50%, #666 50%, #666 100%)';
    resizeHandle.style.borderRadius = '0 0 8px 0';
    resizeHandle.title = 'Drag to resize';
    
    this.popup.appendChild(btnRow);
    this.popup.appendChild(resizeHandle);
    document.body.appendChild(this.popup);
  }

  handleSave() {
    try {
      const newConfig = JSON.parse(this.textarea.value);
      this.onSave(newConfig);
      this.close();
    } catch (err) {
      this.errorDiv.textContent = 'Invalid JSON: ' + err.message;
    }
  }

  handleCancel() {
    this.onCancel();
    this.close();
  }

  close() {
    if (this.popup) {
      document.body.removeChild(this.popup);
      this.popup = null;
      this.textarea = null;
      this.errorDiv = null;
      this.onClose();
    }
  }

  updateJsonData(newData) {
    this.jsonData = newData;
    if (this.textarea) {
      this.textarea.value = JSON.stringify(this.jsonData, null, 2);
    }
  }
}

// Make classes available globally
window.JsonPopup = JsonPopup;
window.JsonPopupButton = JsonPopupButton; 