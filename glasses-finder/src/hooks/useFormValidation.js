import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for form validation and state management
 * @param {Object} initialValues - Initial form values
 * @param {Function} validationSchema - Function that returns validation errors
 * @param {Function} onSubmit - Form submission handler
 */
const useFormValidation = (initialValues, validationSchema, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    if (!validationSchema) return null;
    
    const fieldErrors = validationSchema({ ...values, [name]: value });
    return fieldErrors[name] || null;
  }, [values, validationSchema]);

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validationSchema) return {};
    return validationSchema(values);
  }, [values, validationSchema]);

  // Handle input change
  const handleChange = useCallback((event) => {
    const { name, value, type } = event.target;
    const finalValue = type === 'number' ? Number(value) : value;
    
    setValues(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear error when user starts typing
    if (errors[name] && touched[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors, touched]);

  // Handle input blur (for validation)
  const handleBlur = useCallback((event) => {
    const { name, value } = event.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const fieldError = validateField(name, value);
    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  }, [validateField]);

  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    setIsSubmitting(true);

    try {
      // Validate all fields
      const formErrors = validateForm();
      const errorKeys = Object.keys(formErrors).filter(key => formErrors[key]);

      if (errorKeys.length > 0) {
        setErrors(formErrors);
        setTouched(
          errorKeys.reduce((acc, key) => ({ ...acc, [key]: true }), touched)
        );
        return;
      }

      // Clear errors and submit
      setErrors({});
      await onSubmit(values);
    } catch (error) {
      // Handle submission errors
      if (error.message) {
        setErrors({ submit: error.message });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, values, touched, onSubmit]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set field value programmatically
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Check if form is valid
  const isValid = useMemo(() => {
    const formErrors = validateForm();
    return Object.keys(formErrors).every(key => !formErrors[key]);
  }, [validateForm]);

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key]);
  }, [values, initialValues]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    
    // Form handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Utility functions
    resetForm,
    setFieldValue,
    setFieldError,
    validateField,
    validateForm
  };
};

export default useFormValidation;