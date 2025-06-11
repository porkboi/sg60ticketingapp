import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface CompletedRegistration {
  id: string
  type: "adult" | "child"
  data: any // Using any for flexibility with form data
  timestamp: number
}

interface CompletedRegistrationsState {
  registrations: CompletedRegistration[]
}

const initialState: CompletedRegistrationsState = {
  registrations: []
}

export const completedRegistrationsSlice = createSlice({
  name: "completedRegistrations",
  initialState,
  reducers: {
    addRegistration: (state, action: PayloadAction<CompletedRegistration>) => {
      state.registrations.push(action.payload)
    },
    clearRegistrations: (state) => {
      state.registrations = []
    }
  }
})

export const { addRegistration, clearRegistrations } = completedRegistrationsSlice.actions
export default completedRegistrationsSlice.reducer
