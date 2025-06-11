import { configureStore } from "@reduxjs/toolkit"
import formReducer from "./features/form-slice"
import completedRegistrationsReducer from "./features/completed-registrations-slice"

export const store = configureStore({
  reducer: {
    form: formReducer,
    completedRegistrations: completedRegistrationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
