// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Password strength
export const isStrongPassword = (password) => {
  return password.length >= 8;
};

// URL validation
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Form validation
export const validateLoginForm = (email, password) => {
  const errors = {};
  
  if (!email || email.trim() === '') {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email (e.g., john@example.com)';
  }
  
  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateRegisterForm = (formData, role) => {
  const errors = {};
  const { fullName, email, password, confirmPassword, mobile, companyName, website } = formData;
  
  if (!fullName || fullName.trim() === '') {
    errors.fullName = 'Full name is required';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  
  if (!email || email.trim() === '') {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email (e.g., john@example.com)';
  }
  
  if (!password || password.trim() === '') {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/[A-Z]/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter (A-Z)';
  } else if (!/[0-9]/.test(password)) {
    errors.password = 'Password must contain at least one number (0-9)';
  }
  
  if (!confirmPassword || confirmPassword.trim() === '') {
    errors.confirmPassword = 'Please confirm your password';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match. Please check and try again';
  }
  
  if (role === 'candidate' && mobile && !isValidPhone(mobile)) {
    errors.mobile = 'Please enter a valid phone number (e.g., +1-555-0123)';
  }
  
  if (role === 'employer') {
    if (!companyName || companyName.trim() === '') {
      errors.companyName = 'Company name is required';
    }
    if (website && !isValidURL(website)) {
      errors.website = 'Please enter a valid URL (e.g., https://example.com)';
    }
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateJobForm = (jobData) => {
  const errors = {};
  const { title, description, department } = jobData;
  
  if (!title || title.trim() === '') {
    errors.title = 'Job title is required';
  } else if (title.trim().length < 3) {
    errors.title = 'Job title must be at least 3 characters';
  }
  
  if (!description || description.trim() === '') {
    errors.description = 'Job description is required';
  } else if (description.trim().length < 20) {
    errors.description = 'Job description must be at least 20 characters';
  }
  
  if (!department || department.trim() === '') {
    errors.department = 'Department is required';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateCandidateForm = (candidateData) => {
  const errors = {};
  const { fullName, email, mobile } = candidateData;
  
  if (!fullName || fullName.trim() === '') {
    errors.fullName = 'Full name is required';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  
  if (!email || email.trim() === '') {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email (e.g., john@example.com)';
  }
  
  if (mobile && !isValidPhone(mobile)) {
    errors.mobile = 'Please enter a valid phone number (e.g., +1-555-0123)';
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
