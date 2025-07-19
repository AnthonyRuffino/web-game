// Button Component
// A versatile button component with various styles and states

const ButtonComponent = {
  // Component definition
  type: "button",
  
  // Default properties
  defaultProps: {
    text: "Button",
    size: { width: "auto", height: "auto" },
    style: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      border: "none",
      borderRadius: "6px",
      color: "white",
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)"
    },
    states: {
      hover: {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)"
      },
      active: {
        transform: "translateY(0px)",
        boxShadow: "0 2px 10px rgba(102, 126, 234, 0.3)"
      },
      disabled: {
        opacity: "0.6",
        cursor: "not-allowed",
        transform: "none"
      }
    }
  },

  // Button variants
  variants: {
    primary: {
      style: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white"
      }
    },
    secondary: {
      style: {
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        color: "white"
      }
    },
    success: {
      style: {
        background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
        color: "white"
      }
    },
    danger: {
      style: {
        background: "linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)",
        color: "white"
      }
    },
    warning: {
      style: {
        background: "linear-gradient(135deg, #f39c12 0%, #e67e22 100%)",
        color: "white"
      }
    },
    info: {
      style: {
        background: "linear-gradient(135deg, #3498db 0%, #2980b9 100%)",
        color: "white"
      }
    },
    ghost: {
      style: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "white"
      }
    },
    icon: {
      style: {
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "50%",
        padding: "8px",
        minWidth: "36px",
        minHeight: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }
  },

  // Button sizes
  sizes: {
    small: {
      padding: "6px 12px",
      fontSize: "12px",
      borderRadius: "4px"
    },
    medium: {
      padding: "10px 20px",
      fontSize: "14px",
      borderRadius: "6px"
    },
    large: {
      padding: "14px 28px",
      fontSize: "16px",
      borderRadius: "8px"
    },
    xlarge: {
      padding: "18px 36px",
      fontSize: "18px",
      borderRadius: "10px"
    }
  },

  // Render function
  render: function(props) {
    const {
      id,
      text,
      icon,
      variant = "primary",
      size = "medium",
      disabled = false,
      loading = false,
      fullWidth = false,
      style = {},
      events = {},
      position = { x: "0%", y: "0%", anchor: "top-left" },
      size: componentSize = { width: "auto", height: "auto" }
    } = props;

    // Merge styles
    const baseStyle = { ...this.defaultProps.style };
    const variantStyle = this.variants[variant]?.style || {};
    const sizeStyle = this.sizes[size] || {};
    const finalStyle = {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...style
    };

    // Handle full width
    if (fullWidth) {
      finalStyle.width = "100%";
    }

    // Handle disabled state
    if (disabled) {
      finalStyle.opacity = "0.6";
      finalStyle.cursor = "not-allowed";
      finalStyle.pointerEvents = "none";
    }

    // Handle loading state
    if (loading) {
      finalStyle.cursor = "wait";
    }

    // Create button element
    const button = {
      id: id,
      type: "button",
      text: loading ? "Loading..." : text,
      icon: icon,
      position: position,
      size: componentSize,
      style: finalStyle,
      events: {
        onClick: events.onClick,
        onMouseEnter: (e) => {
          if (!disabled && !loading) {
            e.target.style.transform = this.defaultProps.states.hover.transform;
            e.target.style.boxShadow = this.defaultProps.states.hover.boxShadow;
          }
          if (events.onMouseEnter) events.onMouseEnter(e);
        },
        onMouseLeave: (e) => {
          if (!disabled && !loading) {
            e.target.style.transform = "none";
            e.target.style.boxShadow = finalStyle.boxShadow;
          }
          if (events.onMouseLeave) events.onMouseLeave(e);
        },
        onMouseDown: (e) => {
          if (!disabled && !loading) {
            e.target.style.transform = this.defaultProps.states.active.transform;
            e.target.style.boxShadow = this.defaultProps.states.active.boxShadow;
          }
          if (events.onMouseDown) events.onMouseDown(e);
        },
        onMouseUp: (e) => {
          if (!disabled && !loading) {
            e.target.style.transform = this.defaultProps.states.hover.transform;
            e.target.style.boxShadow = this.defaultProps.states.hover.boxShadow;
          }
          if (events.onMouseUp) events.onMouseUp(e);
        },
        ...events
      }
    };

    return button;
  },

  // Create button with specific configuration
  create: function(config) {
    return this.render(config);
  },

  // Button group component
  group: {
    type: "buttonGroup",
    
    render: function(props) {
      const {
        id,
        buttons = [],
        orientation = "horizontal", // horizontal or vertical
        style = {},
        position = { x: "0%", y: "0%", anchor: "top-left" },
        size = { width: "auto", height: "auto" }
      } = props;

      const groupStyle = {
        display: "flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        gap: "5px",
        ...style
      };

      return {
        id: id,
        type: "container",
        position: position,
        size: size,
        style: groupStyle,
        components: buttons.map((buttonConfig, index) => ({
          ...ButtonComponent.render(buttonConfig),
          id: `${id}-button-${index}`
        }))
      };
    }
  },

  // Toggle button component
  toggle: {
    type: "toggleButton",
    
    render: function(props) {
      const {
        id,
        text,
        icon,
        checked = false,
        onChange,
        style = {},
        position = { x: "0%", y: "0%", anchor: "top-left" },
        size = { width: "auto", height: "auto" }
      } = props;

      const toggleStyle = {
        ...ButtonComponent.defaultProps.style,
        background: checked 
          ? "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)"
          : "rgba(255,255,255,0.1)",
        border: checked 
          ? "none"
          : "1px solid rgba(255,255,255,0.2)",
        ...style
      };

      return {
        id: id,
        type: "button",
        text: text,
        icon: icon,
        position: position,
        size: size,
        style: toggleStyle,
        events: {
          onClick: (e) => {
            if (onChange) {
              onChange(!checked, e);
            }
          }
        }
      };
    }
  }
};

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ButtonComponent;
} else if (typeof window !== 'undefined') {
  window.ButtonComponent = ButtonComponent;
} 