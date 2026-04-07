// Shared types for CV Tailor AI. These live in one place so the
// client form, the API routes, and the Claude helper all agree
// on the shape of the data.

export interface CVFormData {
  name: string
  email: string
  experience: string
  skills: string
  jobDescription: string
}

// Key used for stashing the form in sessionStorage while the
// user is off paying at Stripe Checkout.
export const CV_FORM_STORAGE_KEY = 'cv-tailor:form-data'
