"use client"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import TicketingForm from "@/components/ticketing-form"

export default function Home() {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Singapore Global Network</h1>
              <p className="text-gray-600">Join our community of professionals worldwide</p>
            </div>
            <TicketingForm />
          </div>
        </div>
      </div>
    </Provider>
  )
}
