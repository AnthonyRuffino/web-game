// Tab Component
// Tab navigation and tab content management

const TabComponent = {
  // Component definition
  type: "tab",
  
  // Default properties
  defaultProps: {
    style: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "6px"
    },
    tabStyle: {
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "4px",
      padding: "8px 16px",
      color: "white",
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    activeTabStyle: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      border: "1px solid #667eea",
      color: "white",
      boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)"
    }
  },

  // Tab variants
  variants: {
    default: {
      style: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)"
      }
    },
    card: {
      style: {
        background: "rgba(0,0,0,0.1)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
      }
    },
    minimal: {
      style: {
        background: "transparent",
        border: "none"
      },
      tabStyle: {
        background: "transparent",
        border: "none",
        borderBottom: "2px solid transparent",
        borderRadius: "0",
        padding: "8px 16px"
      },
      activeTabStyle: {
        background: "transparent",
        border: "none",
        borderBottom: "2px solid #667eea",
        color: "#667eea"
      }
    }
  },

  // Render function
  render: function(props) {
    const {
      id,
      tabs = [],
      activeTab = 0,
      variant = "default",
      orientation = "horizontal", // horizontal or vertical
      style = {},
      position = { x: "0%", y: "0%", anchor: "top-left" },
      size = { width: "100%", height: "100%" }
    } = props;

    // Merge styles
    const baseStyle = { ...this.defaultProps.style };
    const variantStyle = this.variants[variant]?.style || {};
    const finalStyle = {
      ...baseStyle,
      ...variantStyle,
      ...style
    };

    // Create tab navigation
    const tabNavigation = {
      id: `${id}-navigation`,
      type: "tabNavigation",
      tabs: tabs.map((tab, index) => ({
        id: tab.id || `tab-${index}`,
        label: tab.label,
        icon: tab.icon,
        active: index === activeTab,
        disabled: tab.disabled || false
      })),
      orientation: orientation,
      style: {
        display: "flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        gap: "2px",
        padding: "10px",
        borderBottom: orientation === "horizontal" ? "1px solid rgba(255,255,255,0.1)" : "none",
        borderRight: orientation === "vertical" ? "1px solid rgba(255,255,255,0.1)" : "none"
      }
    };

    // Create tab content
    const tabContent = {
      id: `${id}-content`,
      type: "tabContent",
      activeTab: activeTab,
      tabs: tabs.map((tab, index) => ({
        id: tab.id || `tab-${index}`,
        label: tab.label,
        components: tab.components || [],
        style: tab.style || {}
      })),
      style: {
        flex: 1,
        padding: "15px",
        overflow: "auto"
      }
    };

    // Create main container
    const container = {
      id: id,
      type: "container",
      position: position,
      size: size,
      style: {
        ...finalStyle,
        display: "flex",
        flexDirection: orientation === "vertical" ? "row" : "column"
      },
      components: [
        tabNavigation,
        tabContent
      ]
    };

    return container;
  },

  // Create tab with specific configuration
  create: function(config) {
    return this.render(config);
  },

  // Tab navigation component
  navigation: {
    type: "tabNavigation",
    
    render: function(props) {
      const {
        id,
        tabs = [],
        activeTab = 0,
        orientation = "horizontal",
        style = {},
        onTabChange
      } = props;

      const navigationStyle = {
        display: "flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        gap: "2px",
        padding: "10px",
        borderBottom: orientation === "horizontal" ? "1px solid rgba(255,255,255,0.1)" : "none",
        borderRight: orientation === "vertical" ? "1px solid rgba(255,255,255,0.1)" : "none",
        ...style
      };

      const tabComponents = tabs.map((tab, index) => ({
        id: `${id}-tab-${index}`,
        type: "button",
        text: tab.label,
        icon: tab.icon,
        position: { x: "0%", y: "0%", anchor: "top-left" },
        size: { width: "auto", height: "auto" },
        style: {
          ...TabComponent.defaultProps.tabStyle,
          ...(index === activeTab ? TabComponent.defaultProps.activeTabStyle : {}),
          ...(tab.disabled ? { opacity: "0.5", cursor: "not-allowed" } : {})
        },
        events: {
          onClick: (e) => {
            if (!tab.disabled && onTabChange) {
              onTabChange(index, tab, e);
            }
          }
        }
      }));

      return {
        id: id,
        type: "container",
        style: navigationStyle,
        components: tabComponents
      };
    }
  },

  // Tab content component
  content: {
    type: "tabContent",
    
    render: function(props) {
      const {
        id,
        tabs = [],
        activeTab = 0,
        style = {}
      } = props;

      const contentStyle = {
        flex: 1,
        padding: "15px",
        overflow: "auto",
        ...style
      };

      // Only render active tab content
      const activeTabData = tabs[activeTab];
      const contentComponents = activeTabData ? activeTabData.components : [];

      return {
        id: id,
        type: "container",
        style: contentStyle,
        components: contentComponents
      };
    }
  },

  // Accordion component (vertical tabs)
  accordion: {
    type: "accordion",
    
    render: function(props) {
      const {
        id,
        sections = [],
        multiple = false, // Allow multiple sections open
        style = {},
        position = { x: "0%", y: "0%", anchor: "top-left" },
        size = { width: "100%", height: "100%" }
      } = props;

      const accordionStyle = {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        overflow: "hidden",
        ...style
      };

      const sectionComponents = sections.map((section, index) => ({
        id: `${id}-section-${index}`,
        type: "collapsibleSection",
        title: section.title,
        icon: section.icon,
        expanded: section.expanded || false,
        components: section.components || [],
        style: {
          borderBottom: index < sections.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none"
        }
      }));

      return {
        id: id,
        type: "container",
        position: position,
        size: size,
        style: accordionStyle,
        components: sectionComponents
      };
    }
  }
};

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TabComponent;
} else if (typeof window !== 'undefined') {
  window.TabComponent = TabComponent;
} 