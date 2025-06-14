import { createSlice, PayloadAction } from "@reduxjs/toolkit"

export interface FormData {
  // Ticket selection
  adultTickets: number
  childTickets: number
  proceedToRegistration: boolean
  discount: boolean

  // Dynamic fields for each registrant
  [key: string]: any // Allows for dynamic field names like "0.firstName", "1.email", etc.
}

export interface FormSchema {
  fields: {
    [key: string]: {
      type: string
      required: boolean
      options?: string[]
    }
  }
}

export interface FormState {
  formData: FormData
  schema: FormSchema
  errors: { [key: string]: string }
}

const initialState: FormState = {
  formData: {
    adultTickets: 1,
    childTickets: 0,
    proceedToRegistration: false,
    discount: false
  },
  schema: {
    fields: {
      // Basic registration fields
      firstName: { type: "text", required: true },
      lastName: { type: "text", required: true },
      email: { type: "email", required: true },
      contactNumber: { type: "text", required: true },

      // Full registration fields
      acknowledgedIntro: { type: "boolean", required: true },
      salutation: { 
        type: "radio", 
        required: true,
        options: ["Mr", "Mrs", "Ms", "Dr", "Prof"]
      },
      nationality: {
        type: "radio",
        required: true,
        options: ["Singapore", "Others"]
      },
      isPermanentResident: { type: "boolean", required: false },
      countryOfResidence: {
        type: "radio",
        required: true,
        options: ["United States of America", "Others"]
      },
      occupation: {
        type: "radio",
        required: true,
        options: ["Student", "Working Professional", "Business Owner and Entrepreneur", "Others"]
      },
      industry: {
        type: "radio",
        required: false,
        options: [
          "Aerospace & Defense",
          "Arts, Entertainment and Hospitality",
          "Banking and Finance",
          "Built Environment",
          "Consumer and Retail",
          "Education",
          "Energy and Natural Resources",
          "Government and Non-profit",
          "Healthcare",
          "Information and Communication Technology",
          "Life Sciences",
          "Manufacturing",
          "Professional Services",
          "Real Estate",
          "Social Services",
          "Sports",
          "Others"
        ]
      },
      privacyConsent: { type: "boolean", required: true }
    }
  },
  errors: {}
}

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    updateField: (
      state,
      action: PayloadAction<{ field: string; value: unknown }>
    ) => {
      const { field, value } = action.payload
      state.formData = {
        ...state.formData,
        [field]: value
      }
    },

    updateFormData: (
      state,
      action: PayloadAction<Partial<FormData>>
    ) => {
      state.formData = {
        ...state.formData,
        ...action.payload
      }
    },

    setError: (
      state,
      action: PayloadAction<{ field: string; message: string }>
    ) => {
      const { field, message } = action.payload
      state.errors[field] = message
    },

    clearError: (state, action: PayloadAction<string>) => {
      const field = action.payload
      delete state.errors[field]
    },

    clearErrors: (state) => {
      state.errors = {}
    },

    resetForm: (state) => {
      state.formData = initialState.formData
      state.errors = {}
    },

    updateSchema: (state, action: PayloadAction<FormSchema>) => {
      state.schema = action.payload
    }
  }
})

export const {
  updateField,
  updateFormData,
  setError,
  clearError,
  clearErrors,
  resetForm,
  updateSchema
} = formSlice.actions

export default formSlice.reducer
