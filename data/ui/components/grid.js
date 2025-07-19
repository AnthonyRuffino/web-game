// Grid Component
// Flexible grid layout with responsive design

const GridComponent = {
  // Component definition
  type: "grid",
  
  // Default properties
  defaultProps: {
    style: {
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "6px"
    },
    cellStyle: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "4px",
      padding: "10px"
    }
  },

  // Grid variants
  variants: {
    default: {
      style: {
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.1)"
      }
    },
    card: {
      style: {
        background: "rgba(0,0,0,0.1)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
      },
      cellStyle: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        padding: "15px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }
    },
    minimal: {
      style: {
        background: "transparent",
        border: "none"
      },
      cellStyle: {
        background: "transparent",
        border: "none",
        padding: "5px"
      }
    },
    table: {
      style: {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        overflow: "hidden"
      },
      cellStyle: {
        background: "transparent",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "8px 12px",
        textAlign: "left"
      }
    }
  },

  // Render function
  render: function(props) {
    const {
      id,
      columns = 1,
      rows = 1,
      gap = "10px",
      variant = "default",
      style = {},
      cellStyle = {},
      position = { x: "0%", y: "0%", anchor: "top-left" },
      size = { width: "100%", height: "100%" },
      cells = [],
      responsive = {
        breakpoints: {
          small: { columns: 1, rows: "auto" },
          medium: { columns: 2, rows: "auto" },
          large: { columns: 3, rows: "auto" }
        }
      }
    } = props;

    // Merge styles
    const baseStyle = { ...this.defaultProps.style };
    const variantStyle = this.variants[variant]?.style || {};
    const finalStyle = {
      ...baseStyle,
      ...variantStyle,
      ...style,
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gridTemplateRows: typeof rows === "number" ? `repeat(${rows}, 1fr)` : rows,
      gap: gap
    };

    // Merge cell styles
    const baseCellStyle = { ...this.defaultProps.cellStyle };
    const variantCellStyle = this.variants[variant]?.cellStyle || {};
    const finalCellStyle = {
      ...baseCellStyle,
      ...variantCellStyle,
      ...cellStyle
    };

    // Create grid cells
    const gridCells = [];
    const totalCells = columns * (typeof rows === "number" ? rows : 1);

    for (let i = 0; i < totalCells; i++) {
      const cellData = cells[i] || {};
      const cell = {
        id: `${id}-cell-${i}`,
        type: "gridCell",
        position: { x: "0%", y: "0%", anchor: "top-left" },
        size: { width: "100%", height: "100%" },
        style: {
          ...finalCellStyle,
          ...cellData.style
        },
        components: cellData.components || [],
        properties: {
          gridColumn: cellData.column || "auto",
          gridRow: cellData.row || "auto",
          columnSpan: cellData.columnSpan || 1,
          rowSpan: cellData.rowSpan || 1
        }
      };
      gridCells.push(cell);
    }

    // Create main grid container
    const grid = {
      id: id,
      type: "container",
      position: position,
      size: size,
      style: finalStyle,
      components: gridCells,
      properties: {
        columns: columns,
        rows: rows,
        gap: gap,
        variant: variant,
        responsive: responsive
      }
    };

    return grid;
  },

  // Create grid with specific configuration
  create: function(config) {
    return this.render(config);
  },

  // Grid cell component
  cell: {
    type: "gridCell",
    
    render: function(props) {
      const {
        id,
        components = [],
        style = {},
        properties = {},
        position = { x: "0%", y: "0%", anchor: "top-left" },
        size = { width: "100%", height: "100%" }
      } = props;

      const cellStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "flex-start",
        overflow: "hidden",
        ...style
      };

      // Apply grid positioning
      if (properties.gridColumn) {
        cellStyle.gridColumn = properties.gridColumn;
      }
      if (properties.gridRow) {
        cellStyle.gridRow = properties.gridRow;
      }
      if (properties.columnSpan) {
        cellStyle.gridColumn = `span ${properties.columnSpan}`;
      }
      if (properties.rowSpan) {
        cellStyle.gridRow = `span ${properties.rowSpan}`;
      }

      return {
        id: id,
        type: "container",
        position: position,
        size: size,
        style: cellStyle,
        components: components
      };
    }
  },

  // Data grid component
  dataGrid: {
    type: "dataGrid",
    
    render: function(props) {
      const {
        id,
        data = [],
        columns = [],
        sortable = true,
        filterable = true,
        selectable = false,
        style = {},
        position = { x: "0%", y: "0%", anchor: "top-left" },
        size = { width: "100%", height: "100%" }
      } = props;

      // Create header row
      const headerCells = columns.map((column, index) => ({
        id: `${id}-header-${index}`,
        type: "label",
        text: column.label,
        style: {
          fontWeight: "bold",
          background: "rgba(255,255,255,0.1)",
          padding: "10px",
          borderBottom: "2px solid rgba(255,255,255,0.2)"
        }
      }));

      // Create data rows
      const dataRows = data.map((row, rowIndex) => {
        const rowCells = columns.map((column, colIndex) => ({
          id: `${id}-cell-${rowIndex}-${colIndex}`,
          type: "label",
          text: row[column.key] || "",
          style: {
            padding: "8px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }
        }));
        return rowCells;
      });

      const gridStyle = {
        display: "grid",
        gridTemplateColumns: columns.map(col => col.width || "1fr").join(" "),
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        overflow: "hidden",
        ...style
      };

      return {
        id: id,
        type: "container",
        position: position,
        size: size,
        style: gridStyle,
        components: [
          {
            id: `${id}-header`,
            type: "container",
            style: {
              display: "contents"
            },
            components: headerCells
          },
          ...dataRows.flat().map(cell => ({
            ...cell,
            style: {
              ...cell.style,
              display: "contents"
            }
          }))
        ]
      };
    }
  },

  // Masonry grid component
  masonry: {
    type: "masonryGrid",
    
    render: function(props) {
      const {
        id,
        items = [],
        columns = 3,
        gap = "10px",
        style = {},
        position = { x: "0%", y: "0%", anchor: "top-left" },
        size = { width: "100%", height: "100%" }
      } = props;

      const masonryStyle = {
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gap,
        alignItems: "start",
        ...style
      };

      const itemComponents = items.map((item, index) => ({
        id: `${id}-item-${index}`,
        type: "container",
        style: {
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "6px",
          padding: "15px",
          breakInside: "avoid"
        },
        components: item.components || []
      }));

      return {
        id: id,
        type: "container",
        position: position,
        size: size,
        style: masonryStyle,
        components: itemComponents
      };
    }
  }
};

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GridComponent;
} else if (typeof window !== 'undefined') {
  window.GridComponent = GridComponent;
} 