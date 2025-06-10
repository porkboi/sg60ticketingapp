import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface FormData {
  adultTickets: number
  childTickets: number
  proceedToRegistration: boolean
  acknowledgedIntro: boolean
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

interface FormState {
  currentStep: number
  formData: FormData
  schema: Record<string, any>
  adultForms: FormData[]
  childForms: FormData[]
}

const initialAdultForm = {
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
  contactNumber: "",
};

const initialChildForm = {
  firstName: "",
  lastName: "",
  email: "",
  contactNumber: "",
  occupation: "Student",
  school: "",
  qualification: "",
  courseOfStudy: "",
  graduationYear: "",
};

const initialState = {
  currentStep: 1,
  formData: {
    ...initialAdultForm,
    ...initialChildForm,
    adultTickets: 1,
    childTickets: 0,
  },
  schema: {},
  adultForms: [{ ...initialAdultForm }], // at least one object for the default ticket
  childForms: [],
}

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
  name: "form",
  initialState,
  reducers: {
    nextStep: (state) => {
      state.currentStep += 1
      state.schema = buildSchema(state.formData)
    },
    prevStep: (state) => {
      state.currentStep = Math.max(1, state.currentStep - 1)
    },
    updateField: (state, action) => {
      const { field, value } = action.payload;
      if (field === "adultTickets") {
        const newCount = Number(value);
        state.adultTickets = newCount;
        // Adjust adultForms array
        while (state.adultForms.length < newCount) {
          state.adultForms.push({ ...initialAdultForm });
        }
        while (state.adultForms.length > newCount) {
          state.adultForms.pop();
        }
        return;
      }
      if (field === "childTickets") {
        const newCount = Number(value);
        state.childTickets = newCount;
        // Adjust childForms array
        while (state.childForms.length < newCount) {
          state.childForms.push({ ...initialChildForm });
        }
        while (state.childForms.length > newCount) {
          state.childForms.pop();
        }
        return;
      }
      state[field] = value;
    },
    updateAdultForm: (state, action) => {
      const { index, data } = action.payload;
      state.adultForms[index] = { ...state.adultForms[index], ...data };
    },
    updateChildForm: (state, action) => {
      const { index, data } = action.payload;
      state.childForms[index] = { ...state.childForms[index], ...data };
    },
    resetForm: (state) => {
      state.currentStep = 1
      state.formData = {
        adultTickets: 1,
        childTickets: 0,
        proceedToRegistration: false,
        acknowledgedIntro: false,
        salutation: "",
        firstName: "",
        lastName: "",
        email: "",
        nationality: "",
        otherNationality: "",
        isPermanentResident: null,
        countryOfResidence: "",
        otherCountryResidence: "",
        stateOfResidence: "California",
        cityOfResidence: "San Francisco",
        occupation: "",
        otherOccupation: "",
        school: "",
        qualification: "",
        otherQualification: "",
        courseOfStudy: "",
        otherCourseOfStudy: "",
        graduationYear: "",
        // Professional defaults
        industry: "",
        otherIndustry: "",
        financialSector: "",
        jobFunction: "",
        otherJobFunction: "",
      }
      state.schema = {}
    },
  },
})

export const { updateField, updateAdultForm, updateChildForm, resetForm } = formSlice.actions
export default formSlice.reducer
