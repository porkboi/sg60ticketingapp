import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

export interface FormData {  // Form Control
  adultTickets: number
  childTickets: number
  proceedToRegistration: boolean
  acknowledgedIntro: boolean
  discount?: boolean
  adultForms?: FormData[]
  childForms?: FormData[]
  salutation: string
  firstName: string
  lastName: string
  email: string
  nationality: string
  otherNationality: string
  isPermanentResident: boolean | null
  countryOfResidence: string
  otherCountryResidence: string
  stateOfResidence: string
  cityOfResidence: string
  occupation: string
  otherOccupation: string
  school: string
  qualification: string
  otherQualification: string
  courseOfStudy: string
  otherCourseOfStudy: string
  graduationYear: string
  // Professional-specific fields
  industry: string
  otherIndustry: string
  financialSector: string
  jobFunction: string
  otherJobFunction: string
  contactNumber: string
}

export interface FormState {
  currentStep: number
  formData: FormData
  schema: Record<string, any>
  adultForms: FormData[]
  childForms: FormData[]
}

const initialAdultForm: FormData = {  // Adding FormData properties
  adultTickets: 1,
  childTickets: 0,
  proceedToRegistration: false,
  acknowledgedIntro: false,
  discount: false,
  adultForms: [],
  childForms: [],
  salutation: "",
  firstName: "",
  lastName: "",
  email: "",
  nationality: "",
  otherNationality: "",
  isPermanentResident: false,
  countryOfResidence: "",
  otherCountryResidence: "",
  stateOfResidence: "",
  cityOfResidence: "",
  occupation: "",
  otherOccupation: "",
  school: "",
  qualification: "",
  otherQualification: "",
  courseOfStudy: "",
  otherCourseOfStudy: "",
  graduationYear: "",
  industry: "",
  otherIndustry: "",
  financialSector: "",
  jobFunction: "",
  otherJobFunction: "",
  contactNumber: ""
};

const initialChildForm: FormData = {  // Adding FormData properties
  adultTickets: 0,
  childTickets: 1,
  proceedToRegistration: false,
  acknowledgedIntro: false,
  discount: false,
  adultForms: [],
  childForms: [],
  salutation: "",
  firstName: "",
  lastName: "",
  email: "",
  nationality: "",
  otherNationality: "",
  isPermanentResident: false,
  countryOfResidence: "",
  otherCountryResidence: "",
  stateOfResidence: "",
  cityOfResidence: "",
  occupation: "Student",
  otherOccupation: "",
  school: "",
  qualification: "",
  otherQualification: "",
  courseOfStudy: "",
  otherCourseOfStudy: "",
  graduationYear: "",
  industry: "",
  otherIndustry: "",
  financialSector: "",
  jobFunction: "",
  otherJobFunction: "",
  contactNumber: ""
};

const initialState: FormState = {
  currentStep: 1,
  formData: {
    ...initialAdultForm,
    adultTickets: 1,
    childTickets: 0,
    proceedToRegistration: false,
    acknowledgedIntro: false,
    discount: false,
    adultForms: [],
    childForms: []
  },
  schema: {},
  adultForms: [],
  childForms: []
};

const buildSchema = (formData: FormData) => {
  const schema: Record<string, any> = {}

  // Ticket information
  if (formData.adultTickets > 0) {
    schema.adultTickets = { type: "number", value: formData.adultTickets, price: 50 }
  }
  if (formData.childTickets > 0) {
    schema.childTickets = { type: "number", value: formData.childTickets, price: 25 }
  }

  // Calculate total cost
  const totalCost = formData.adultTickets * 50 + formData.childTickets * 25
  schema.totalCost = { type: "number", value: totalCost }

  if (formData.proceedToRegistration) {
    // Always include basic fields
    if (formData.acknowledgedIntro) schema.acknowledgedIntro = { type: "boolean", value: formData.acknowledgedIntro }
    if (formData.salutation) schema.salutation = { type: "string", value: formData.salutation }
    if (formData.firstName) schema.firstName = { type: "string", value: formData.firstName }
    if (formData.lastName) schema.lastName = { type: "string", value: formData.lastName }
    if (formData.email) schema.email = { type: "email", value: formData.email }

    // Nationality logic
    if (formData.nationality) {
      schema.nationality = { type: "string", value: formData.nationality }
      if (formData.nationality === "Others" && formData.otherNationality) {
        schema.otherNationality = { type: "string", value: formData.otherNationality }
      }
    }

    // PR status (only if nationality is Others)
    if (formData.nationality === "Others" && formData.isPermanentResident !== null) {
      schema.isPermanentResident = { type: "boolean", value: formData.isPermanentResident }
    }

    // Country of residence
    if (formData.countryOfResidence) {
      schema.countryOfResidence = { type: "string", value: formData.countryOfResidence }
      if (formData.countryOfResidence === "Others" && formData.otherCountryResidence) {
        schema.otherCountryResidence = { type: "string", value: formData.otherCountryResidence }
      }
    }

    // State and city (only if country is USA)
    if (formData.countryOfResidence === "United States of America") {
      if (formData.stateOfResidence) {
        schema.stateOfResidence = { type: "string", value: formData.stateOfResidence }
      }
      if (formData.cityOfResidence) {
        schema.cityOfResidence = { type: "string", value: formData.cityOfResidence }
      }
    }

    // Occupation
    if (formData.occupation) {
      schema.occupation = { type: "string", value: formData.occupation }
      if (formData.occupation === "Others" && formData.otherOccupation) {
        schema.otherOccupation = { type: "string", value: formData.otherOccupation }
      }
    }

    // Student-specific fields
    if (formData.occupation === "Student") {
      if (formData.school) {
        schema.school = { type: "string", value: formData.school }
      }
      if (formData.qualification) {
        schema.qualification = { type: "string", value: formData.qualification }
        if (formData.qualification === "Others" && formData.otherQualification) {
          schema.otherQualification = { type: "string", value: formData.otherQualification }
        }
      }
      if (formData.courseOfStudy) {
        schema.courseOfStudy = { type: "string", value: formData.courseOfStudy }
        if (formData.courseOfStudy === "Others" && formData.otherCourseOfStudy) {
          schema.otherCourseOfStudy = { type: "string", value: formData.otherCourseOfStudy }
        }
      }
      if (formData.graduationYear) {
        schema.graduationYear = { type: "string", value: formData.graduationYear }
      }
    }

    // Professional-specific fields (only if occupation is Working Professional or Business Owner)
    if (formData.occupation === "Working Professional" || formData.occupation === "Business Owner and Entrepreneur") {
      if (formData.industry) {
        schema.industry = { type: "string", value: formData.industry }
        if (formData.industry === "Others" && formData.otherIndustry) {
          schema.otherIndustry = { type: "string", value: formData.otherIndustry }
        }
      }

      // Financial sector (only if industry is Banking and Finance)
      if (formData.industry === "Banking and Finance" && formData.financialSector) {
        schema.financialSector = { type: "string", value: formData.financialSector }
      }

      if (formData.jobFunction) {
        schema.jobFunction = { type: "string", value: formData.jobFunction }
        if (formData.jobFunction === "Others" && formData.otherJobFunction) {
          schema.otherJobFunction = { type: "string", value: formData.otherJobFunction }
        }
      }
    }
  }

  return schema
}

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      state.currentStep -= 1;
    },    updateField: (state, action: PayloadAction<{ field: keyof FormData; value: any }>) => {
      const { field, value } = action.payload;
      (state.formData as any)[field] = value;
      state.schema = buildSchema(state.formData);
    },
    updateSchema: (state) => {
      state.schema = buildSchema(state.formData);
    },
    resetForm: (state) => {
      state.formData = initialAdultForm;
      state.currentStep = 1;
      state.schema = {};
      state.adultForms = [];
      state.childForms = [];
    },
    addAdultForm: (state) => {
      state.adultForms.push({ ...initialAdultForm });
    },
    addChildForm: (state) => {
      state.childForms.push({ ...initialChildForm });
    },
    removeAdultForm: (state, action: PayloadAction<number>) => {
      state.adultForms.splice(action.payload, 1);
    },
    removeChildForm: (state, action: PayloadAction<number>) => {
      state.childForms.splice(action.payload, 1);
    }
  }
});

export const { updateField, updateSchema, resetForm, addAdultForm, addChildForm, removeAdultForm, removeChildForm } = formSlice.actions
export default formSlice.reducer
