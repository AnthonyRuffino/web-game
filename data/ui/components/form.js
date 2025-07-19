// Form Component
// Form with various input types, validation, and submission handling

const FormComponent = {
  // Component definition
  type: "form",
  
  // Default properties
  defaultProps: {
    style: {
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      padding: "20px"
    },
    fieldStyle: {
      marginBottom: "15px"
    },
    labelStyle: {
      display: "block",
      marginBottom: "5px",
      color: "white",
      fontSize: "14px",
      fontWeight: "500"
    },
    inputStyle: {
      width: "100%",
      padding: "10px 12px",
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "4px",
      color: "white",
      fontSize: "14px",
      transition: "all 0.3s ease"
    },
    errorStyle: {
      color: "#e74c3c",
      fontSize: "12px",
      marginTop: "5px"
    }
  },

  // Form variants
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
        borderRadius: "12px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
      }
    },
    minimal: {
      style: {
        background: "transparent",
        border: "none",
        padding: "0"
      }
    }
  },

  // Input types
  inputTypes: {
    text: {
      type: "input",
      inputType: "text"
    },
    email: {
      type: "input",
      inputType: "email"
    },
    password: {
      type: "input",
      inputType: "password"
    },
    number: {
      type: "input",
      inputType: "number"
    },
    textarea: {
      type: "textarea"
    },
    select: {
      type: "select"
    },
    checkbox: {
      type: "checkbox"
    },
    radio: {
      type: "radio"
    },
    file: {
      type: "fileInput"
    },
    color: {
      type: "colorPicker"
    },
    date: {
      type: "input",
      inputType: "date"
    },
    time: {
      type: "input",
      inputType: "time"
    },
    range: {
      type: "slider"
    }
  },

  // Render function
  render: function(props) {
    const {
      id,
      fields = [],
      variant = "default",
      style = {},
      position = { x: "0%", y: "0%", anchor: "top-left" },
      size = { width: "100%", height: "100%" },
      onSubmit,
      onValidate,
      submitButton = {
        text: "Submit",
        style: {
          background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          cursor: "pointer"
        }
      }
    } = props;

    // Merge styles
    const baseStyle = { ...this.defaultProps.style };
    const variantStyle = this.variants[variant]?.style || {};
    const finalStyle = {
      ...baseStyle,
      ...variantStyle,
      ...style
    };

    // Create form fields
    const formFields = fields.map((field, index) => {
      const fieldId = `${id}-field-${index}`;
      
      // Create label
      const label = {
        id: `${fieldId}-label`,
        type: "label",
        text: field.label,
        style: {
          ...this.defaultProps.labelStyle,
          ...field.labelStyle
        }
      };

      // Create input based on type
      let input;
      const inputType = this.inputTypes[field.type] || this.inputTypes.text;
      
      switch (inputType.type) {
        case "input":
          input = {
            id: `${fieldId}-input`,
            type: "input",
            inputType: inputType.inputType,
            placeholder: field.placeholder,
            value: field.value || "",
            required: field.required || false,
            disabled: field.disabled || false,
            style: {
              ...this.defaultProps.inputStyle,
              ...field.inputStyle
            },
            events: {
              onChange: field.onChange,
              onFocus: field.onFocus,
              onBlur: field.onBlur,
              onKeyPress: field.onKeyPress
            }
          };
          break;
          
        case "textarea":
          input = {
            id: `${fieldId}-textarea`,
            type: "textarea",
            placeholder: field.placeholder,
            value: field.value || "",
            rows: field.rows || 3,
            required: field.required || false,
            disabled: field.disabled || false,
            style: {
              ...this.defaultProps.inputStyle,
              resize: "vertical",
              minHeight: "80px",
              ...field.inputStyle
            },
            events: {
              onChange: field.onChange,
              onFocus: field.onFocus,
              onBlur: field.onBlur
            }
          };
          break;
          
        case "select":
          input = {
            id: `${fieldId}-select`,
            type: "select",
            options: field.options || [],
            value: field.value || "",
            required: field.required || false,
            disabled: field.disabled || false,
            style: {
              ...this.defaultProps.inputStyle,
              ...field.inputStyle
            },
            events: {
              onChange: field.onChange
            }
          };
          break;
          
        case "checkbox":
          input = {
            id: `${fieldId}-checkbox`,
            type: "checkbox",
            label: field.label,
            checked: field.checked || false,
            required: field.required || false,
            disabled: field.disabled || false,
            style: {
              ...field.inputStyle
            },
            events: {
              onChange: field.onChange
            }
          };
          break;
          
        case "radio":
          input = {
            id: `${fieldId}-radio`,
            type: "radio",
            label: field.label,
            checked: field.checked || false,
            required: field.required || false,
            disabled: field.disabled || false,
            style: {
              ...field.inputStyle
            },
            events: {
              onChange: field.onChange
            }
          };
          break;
          
        case "fileInput":
          input = {
            id: `${fieldId}-file`,
            type: "fileInput",
            accept: field.accept || "*/*",
            multiple: field.multiple || false,
            required: field.required || false,
            disabled: field.disabled || false,
            style: {
              ...this.defaultProps.inputStyle,
              ...field.inputStyle
            },
            events: {
              onChange: field.onChange
            }
          };
          break;
          
        case "colorPicker":
          input = {
            id: `${fieldId}-color`,
            type: "colorPicker",
            value: field.value || "#ffffff",
            required: field.required || false,
            disabled: field.disabled || false,
            style: {
              ...field.inputStyle
            },
            events: {
              onChange: field.onChange
            }
          };
          break;
          
        case "slider":
          input = {
            id: `${fieldId}-slider`,
            type: "slider",
            min: field.min || 0,
            max: field.max || 100,
            value: field.value || 50,
            step: field.step || 1,
            required: field.required || false,
            disabled: field.disabled || false,
            style: {
              ...field.inputStyle
            },
            events: {
              onChange: field.onChange
            }
          };
          break;
      }

      // Create error message placeholder
      const error = {
        id: `${fieldId}-error`,
        type: "label",
        text: "",
        style: {
          ...this.defaultProps.errorStyle,
          display: "none"
        }
      };

      // Create field container
      const fieldContainer = {
        id: fieldId,
        type: "container",
        style: {
          ...this.defaultProps.fieldStyle,
          ...field.fieldStyle
        },
        components: [label, input, error]
      };

      return fieldContainer;
    });

    // Create submit button
    const submitBtn = {
      id: `${id}-submit`,
      type: "button",
      text: submitButton.text,
      style: {
        ...submitButton.style
      },
      events: {
        onClick: (e) => {
          if (onSubmit) {
            const formData = this.getFormData(id);
            onSubmit(formData, e);
          }
        }
      }
    };

    // Create form container
    const form = {
      id: id,
      type: "container",
      position: position,
      size: size,
      style: finalStyle,
      components: [
        ...formFields,
        submitBtn
      ],
      events: {
        onSubmit: (e) => {
          e.preventDefault();
          if (onSubmit) {
            const formData = this.getFormData(id);
            onSubmit(formData, e);
          }
        }
      }
    };

    return form;
  },

  // Get form data
  getFormData: function(formId) {
    const formData = {};
    // This would be implemented to collect data from all form fields
    return formData;
  },

  // Validate form
  validateForm: function(formId, validationRules) {
    const errors = {};
    // This would be implemented to validate form fields
    return errors;
  },

  // Create form with specific configuration
  create: function(config) {
    return this.render(config);
  },

  // Field group component
  fieldGroup: {
    type: "fieldGroup",
    
    render: function(props) {
      const {
        id,
        title,
        fields = [],
        collapsed = false,
        style = {},
        position = { x: "0%", y: "0%", anchor: "top-left" },
        size = { width: "100%", height: "auto" }
      } = props;

      const groupStyle = {
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "6px",
        marginBottom: "20px",
        ...style
      };

      const titleComponent = {
        id: `${id}-title`,
        type: "label",
        text: title,
        style: {
          background: "rgba(255,255,255,0.05)",
          padding: "10px 15px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          fontWeight: "bold",
          color: "white"
        }
      };

      const fieldsContainer = {
        id: `${id}-fields`,
        type: "container",
        style: {
          padding: "15px",
          display: collapsed ? "none" : "block"
        },
        components: fields
      };

      return {
        id: id,
        type: "container",
        position: position,
        size: size,
        style: groupStyle,
        components: [titleComponent, fieldsContainer]
      };
    }
  },

  // Wizard form component
  wizard: {
    type: "wizardForm",
    
    render: function(props) {
      const {
        id,
        steps = [],
        currentStep = 0,
        style = {},
        position = { x: "0%", y: "0%", anchor: "top-left" },
        size = { width: "100%", height: "100%" },
        onStepChange,
        onComplete
      } = props;

      const wizardStyle = {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        ...style
      };

      // Create step indicator
      const stepIndicator = {
        id: `${id}-indicator`,
        type: "container",
        style: {
          display: "flex",
          justifyContent: "center",
          padding: "20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        },
        components: steps.map((step, index) => ({
          id: `${id}-step-${index}`,
          type: "container",
          style: {
            display: "flex",
            alignItems: "center",
            margin: "0 10px"
          },
          components: [
            {
              id: `${id}-step-number-${index}`,
              type: "label",
              text: (index + 1).toString(),
              style: {
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: index <= currentStep ? "#667eea" : "rgba(255,255,255,0.2)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold"
              }
            },
            {
              id: `${id}-step-label-${index}`,
              type: "label",
              text: step.title,
              style: {
                marginLeft: "10px",
                color: index <= currentStep ? "white" : "rgba(255,255,255,0.6)"
              }
            }
          ]
        }))
      };

      // Create current step content
      const currentStepData = steps[currentStep];
      const stepContent = {
        id: `${id}-content`,
        type: "container",
        style: {
          padding: "20px"
        },
        components: currentStepData ? currentStepData.fields : []
      };

      // Create navigation buttons
      const navigation = {
        id: `${id}-navigation`,
        type: "container",
        style: {
          display: "flex",
          justifyContent: "space-between",
          padding: "20px",
          borderTop: "1px solid rgba(255,255,255,0.1)"
        },
        components: [
          {
            id: `${id}-prev`,
            type: "button",
            text: "Previous",
            style: {
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "4px",
              color: "white",
              padding: "10px 20px",
              cursor: currentStep > 0 ? "pointer" : "not-allowed",
              opacity: currentStep > 0 ? 1 : 0.5
            },
            events: {
              onClick: () => {
                if (currentStep > 0 && onStepChange) {
                  onStepChange(currentStep - 1);
                }
              }
            }
          },
          {
            id: `${id}-next`,
            type: "button",
            text: currentStep === steps.length - 1 ? "Complete" : "Next",
            style: {
              background: "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
              border: "none",
              borderRadius: "4px",
              color: "white",
              padding: "10px 20px",
              cursor: "pointer"
            },
            events: {
              onClick: () => {
                if (currentStep === steps.length - 1) {
                  if (onComplete) onComplete();
                } else if (onStepChange) {
                  onStepChange(currentStep + 1);
                }
              }
            }
          }
        ]
      };

      return {
        id: id,
        type: "container",
        position: position,
        size: size,
        style: wizardStyle,
        components: [stepIndicator, stepContent, navigation]
      };
    }
  }
};

// Export the component
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FormComponent;
} else if (typeof window !== 'undefined') {
  window.FormComponent = FormComponent;
} 