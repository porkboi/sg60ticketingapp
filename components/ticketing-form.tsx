"use client"

import { type ChangeEvent, useState, useEffect } from "react"
import { CheckCircle, Circle, Plus, Minus, Ticket } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import type { ButtonProps } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { RootState } from "@/lib/store"
import { updateField, resetForm } from "@/lib/features/form-slice"
import AdultRegistrationForm from "./AdultRegistrationForm"
import ChildRegistrationForm from "./ChildRegistrationForm"
import type { FormState, FormData } from "@/lib/features/form-slice"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addRegistration, clearRegistrations } from "@/lib/features/completed-registrations-slice"

interface Props {}

export default function TicketingForm({}: Props) {
  const dispatch = useDispatch()
  const { formData, schema } = useSelector((state: RootState) => {
    return {
      formData: state.form.formData as FormData,
      schema: state.form.schema
    }
  })
  const completedRegistrations = useSelector((state: RootState) => state.completedRegistrations.registrations)
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)

  const adultTickets = Number(formData.adultTickets) || 0
  const childTickets = Number(formData.childTickets) || 0

  const handleFieldUpdate = (field: keyof FormData, value: unknown, idx: number = currentPersonIndex) => {
    dispatch(updateField({ field: `${idx}.${field}`, value }))
  }
  const handleRadioChange = (value: string, field: keyof FormData) => {
    handleFieldUpdate(field, value)
  }

  const handleCheckboxChange = (checked: boolean, field: keyof FormData) => {
    handleFieldUpdate(field, checked)
  }

  const handleTicketChange = (type: "adult" | "child", increment: boolean) => {
    const currentValue = type === "adult" ? formData.adultTickets : formData.childTickets
    const newValue = increment ? currentValue + 1 : Math.max(1, currentValue - 1)
    handleFieldUpdate(type === "adult" ? "adultTickets" : "childTickets", newValue)
  }

  // Add explicit type for onValueChange handlers
  const handleValueChange = (field: keyof FormData) => (value: string) => {
    handleFieldUpdate(field, value)
  }

  // Add explicit type for onCheckedChange handlers
  const handleCheckedChange = (field: keyof FormData) => (checked: boolean) => {
    handleFieldUpdate(field, checked)
  }

  const getTotalCost = () => {
    return formData.adultTickets * 50 + formData.childTickets * 25
  }

  const isStepComplete = (step: string, idx: number = currentPersonIndex) => {
    switch (step) {
      case "tickets":
        return formData.adultTickets >= 1 || formData.childTickets >= 1
      case "intro":
        return formData[`${idx}.acknowledgedIntro`]
      case "salutation":
        return formData[`${idx}.salutation`] !== ""
      case "firstName":
        return formData[`${idx}.firstName`]?.trim() !== ""
      case "lastName":
        return formData[`${idx}.lastName`]?.trim() !== ""
      case "email":
        return formData[`${idx}.email`]?.trim() !== "" && formData[`${idx}.email`]?.includes("@")
      case "nationality":
        return (
          formData[`${idx}.nationality`] !== "" &&
          (formData[`${idx}.nationality`] === "Singapore" || formData[`${idx}.otherNationality`]?.trim() !== "")
        )
      case "pr":
        return formData[`${idx}.nationality`] !== "Others" || formData[`${idx}.isPermanentResident`] !== null
      case "country":
        return (
          formData[`${idx}.countryOfResidence`] !== "" &&
          (formData[`${idx}.countryOfResidence`] === "United States of America" || formData[`${idx}.otherCountryResidence`]?.trim() !== "")
        )
      case "state":
        return formData[`${idx}.countryOfResidence`] !== "United States of America" || formData[`${idx}.stateOfResidence`]?.trim() !== ""
      case "city":
        return formData[`${idx}.countryOfResidence`] !== "United States of America" || formData[`${idx}.cityOfResidence`]?.trim() !== ""
      case "occupation":
        return (
          formData[`${idx}.occupation`] !== "" && (formData[`${idx}.occupation`] !== "Others" || formData[`${idx}.otherOccupation`]?.trim() !== "")
        )
      case "school":
        return formData[`${idx}.occupation`] !== "Student" || formData[`${idx}.school`]?.trim() !== ""
      case "qualification":
        return (
          formData[`${idx}.occupation`] !== "Student" ||
          (formData[`${idx}.qualification`] !== "" &&
            (formData[`${idx}.qualification`] !== "Others" || formData[`${idx}.otherQualification`]?.trim() !== ""))
        )
      case "courseOfStudy":
        return (
          formData[`${idx}.occupation`] !== "Student" ||
          (formData[`${idx}.courseOfStudy`] !== "" &&
            (formData[`${idx}.courseOfStudy`] !== "Others" || formData[`${idx}.otherCourseOfStudy`]?.trim() !== ""))
        )
      case "graduationYear":
        return formData[`${idx}.occupation`] !== "Student" || formData[`${idx}.graduationYear`] !== ""
      case "industry":
        return (
          (formData[`${idx}.occupation`] !== "Working Professional" &&
            formData[`${idx}.occupation`] !== "Business Owner and Entrepreneur") ||
          (formData[`${idx}.industry`] !== "" && (formData[`${idx}.industry`] !== "Others" || formData[`${idx}.otherIndustry`]?.trim() !== ""))
        )
      case "financialSector":
        return formData[`${idx}.industry`] !== "Banking and Finance" || formData[`${idx}.financialSector`] !== ""
      case "jobFunction":
        return (
          (formData[`${idx}.occupation`] !== "Working Professional" &&
            formData[`${idx}.occupation`] !== "Business Owner and Entrepreneur") ||
          (formData[`${idx}.jobFunction`] !== "" &&
            (formData[`${idx}.jobFunction`] !== "Others" || formData[`${idx}.otherJobFunction`]?.trim() !== ""))
        )
      default:
        return false
    }
  }

  const shouldShowStep = (step: string) => {
    switch (step) {
      case "tickets":
        return true
      case "intro":
        return isStepComplete("tickets") && formData.proceedToRegistration
      case "salutation":
        return isStepComplete("intro")
      case "firstName":
        return isStepComplete("salutation")
      case "lastName":
        return isStepComplete("firstName")
      case "email":
        return isStepComplete("lastName")
      case "nationality":
        return isStepComplete("email")
      case "pr":
        return isStepComplete("nationality") && formData.nationality === "Others"
      case "country":
        return isStepComplete("nationality") && (formData.nationality !== "Others" || isStepComplete("pr"))
      case "state":
        return isStepComplete("country") && formData.countryOfResidence === "United States of America"
      case "city":
        return isStepComplete("state") && formData.countryOfResidence === "United States of America"
      case "occupation":
        return (
          isStepComplete("country") &&
          (formData.countryOfResidence !== "United States of America" ||
            (isStepComplete("state") && isStepComplete("city")))
        )
      case "school":
        return isStepComplete("occupation") && formData.occupation === "Student"
      case "qualification":
        return isStepComplete("school") && formData.occupation === "Student"
      case "courseOfStudy":
        return isStepComplete("qualification") && formData.occupation === "Student"
      case "graduationYear":
        return isStepComplete("courseOfStudy") && formData.occupation === "Student"
      case "industry":
        return (
          isStepComplete("occupation") &&
          (formData.occupation === "Working Professional" || formData.occupation === "Business Owner and Entrepreneur")
        )
      case "financialSector":
        return isStepComplete("industry") && formData.industry === "Banking and Finance"
      case "jobFunction":
        return (
          isStepComplete("industry") &&
          (formData.occupation === "Working Professional" ||
            formData.occupation === "Business Owner and Entrepreneur") &&
          (formData.industry !== "Banking and Finance" || isStepComplete("financialSector"))
        )
      case "complete":
        return (
          isStepComplete("occupation") &&
          (formData.occupation !== "Student" ||
            (isStepComplete("school") &&
              isStepComplete("qualification") &&
              isStepComplete("courseOfStudy") &&
              isStepComplete("graduationYear"))) &&
          ((formData.occupation !== "Working Professional" &&
            formData.occupation !== "Business Owner and Entrepreneur") ||
            (isStepComplete("industry") &&
              (formData.industry !== "Banking and Finance" || isStepComplete("financialSector")) &&
              isStepComplete("jobFunction")))
        )
      default:
        return false
    }
  }

  const getCompletedSteps = () => {
    const steps = ["tickets"]
    if (formData.proceedToRegistration) {
      steps.push("intro", "salutation", "firstName", "lastName", "email", "nationality")
      if (formData.nationality === "Others") steps.push("pr")
      steps.push("country")
      if (formData.countryOfResidence === "United States of America") {
        steps.push("state", "city")
      }
      steps.push("occupation")
      if (formData.occupation === "Student") {
        steps.push("school", "qualification", "courseOfStudy", "graduationYear")
      }
    }

    return steps.filter((step) => isStepComplete(step)).length
  }

  const getTotalSteps = () => {
    let total = 1 // tickets
    if (formData.proceedToRegistration) {
      total += 6 // intro, salutation, firstName, lastName, email, nationality
      if (formData.nationality === "Others") total += 1 // pr
      total += 1 // country
      if (formData.countryOfResidence === "United States of America") total += 2 // state, city
      total += 1 // occupation
      if (formData.occupation === "Student") total += 4 // school, qualification, courseOfStudy, graduationYear
    }
    return total
  }

  const isFormComplete = (idx: number) => {
    if (idx >= adultTickets + childTickets) return false
    if (idx < adultTickets) {
      return formData[`${idx}.otherJobFunction`] || formData[`${idx}.contactNumber`]
    }
  }

  const renderBubbles = () => (
    <div className="flex justify-center gap-4 mb-6">
      {Array.from({ length: adultTickets + childTickets }).map((_, idx) => {
        const isComplete = isFormComplete(idx)
        const isCurrent = idx === currentPersonIndex
        
        return (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentPersonIndex(idx)}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all",
              isCurrent
                ? "bg-blue-600 text-white border-blue-600 scale-110"
                : isComplete
                  ? idx < adultTickets
                    ? "bg-white text-blue-600 border-blue-300"
                    : "bg-white text-green-600 border-green-300"
                  : "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed",
            )}
            disabled={!isComplete && !isCurrent && idx !== getFirstIncompleteIndex()}
            title={idx < adultTickets ? `Adult ${idx + 1}` : `Child ${idx - adultTickets + 1}`}
          >
            {idx < adultTickets ? idx + 1 : String.fromCharCode(65 + (idx - adultTickets))}
          </button>
        )
      })}
    </div>
  )

  const getFirstIncompleteIndex = () => {
    for (let i = 0; i < adultTickets + childTickets; i++) {
      if (!isFormComplete(i)) return i
    }
    return adultTickets + childTickets - 1
  }

  const areAllFormsComplete = () => {
    for (let i = 0; i < adultTickets + childTickets; i++) {
      if (!isFormComplete(i)) return false
    }
    return true
  }

  // Replace the completion section with this dialog
  const renderCompletionDialog = () => (
    <Dialog open={showCompletion} onOpenChange={setShowCompletion}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Registration Complete!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-green-700">
            Thank you for joining the Singapore Global Network! All registrations have been completed successfully.
          </p>
          <div className="space-y-4">
            {completedRegistrations.map((registration) => (
              <div 
                key={registration.id} 
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <h3 className="font-semibold mb-2 text-gray-800">
                  {registration.type === "adult" ? "Adult" : "Child"} Registration
                </h3>
                <pre className="text-xs text-left overflow-auto bg-gray-50 p-2 rounded text-gray-700">
                  {JSON.stringify(registration.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                // Handle final submission
              }}
            >
              Submit All Registrations
            </Button>
            <Button
              className="border-green-300 text-green-700 hover:bg-green-50"
              onClick={() => {
                setShowCompletion(false)
                dispatch(clearRegistrations())
                dispatch(resetForm())
              }}
            >
              Start Over
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Update the form completion logic to show the dialog
  useEffect(() => {
    if (areAllFormsComplete()) {
      setShowCompletion(true)
    }
  }, [formData])

  // Modify the effect to add completed registrations
  useEffect(() => {
    if (isFormComplete(currentPersonIndex)) {
      const registrationData = currentPersonIndex < adultTickets 
        ? formData.adultForms?.[currentPersonIndex]
        : formData.childForms?.[currentPersonIndex - adultTickets]
      
      dispatch(addRegistration({
        id: `${currentPersonIndex}-${Date.now()}`,
        type: currentPersonIndex < adultTickets ? "adult" : "child",
        data: registrationData,
        timestamp: Date.now()
      }))

      if (currentPersonIndex === adultTickets + childTickets - 1) {
        setShowCompletion(true)
      }
    }
  }, [formData, currentPersonIndex])

  const renderConsolidatedForm = () => (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Registration for {currentPersonIndex < adultTickets ? `Adult ${currentPersonIndex + 1}` : `Child ${currentPersonIndex - adultTickets + 1}`}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Personal Information Section */}
        {shouldShowStep("salutation") && (
          <div className="space-y-3">
            <RadioGroup
              value={formData[`${currentPersonIndex}.salutation`]}
              onValueChange={(value) => handleFieldUpdate("salutation", value)}
            >
              {["Mr", "Mrs", "Ms", "Dr", "Prof"].map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="text-sm">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {/* First Name */}
        {shouldShowStep("firstName") && (
          <Input
            id="firstName"
            value={formData[`${currentPersonIndex}.firstName`]}
            onChange={(e) => handleFieldUpdate("firstName", e.target.value)}
            placeholder="First Name"
          />
        )}

        {/* Last Name */}
        {shouldShowStep("lastName") && (
          <Input
            id="lastName"
            value={formData[`${currentPersonIndex}.lastName`]}
            onChange={(e) => handleFieldUpdate("lastName", e.target.value)}
            placeholder="Last Name"
          />
        )}

        {/* Email */}
        {shouldShowStep("email") && (
          <Input
            id="email"
            value={formData[`${currentPersonIndex}.email`]}
            onChange={(e) => handleFieldUpdate("email", e.target.value)}
            placeholder="Email"
          />
        )}

        {/* Continue updating other form fields similarly... */}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {formData.proceedToRegistration ? "Registration Progress" : "Ticket Selection"}
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-800">
              {getCompletedSteps()} / {getTotalSteps()} Complete
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(getCompletedSteps() / getTotalSteps()) * 100}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Ticket Selection Section */}
      <Card className="transition-all duration-500 ease-in-out">
        <CardHeader>
          <div className="flex items-center gap-2">
            {isStepComplete("tickets") ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400" />
            )}
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-blue-600" />
              <CardTitle>SG:60 Legacy Event Tickets</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Select Your Tickets</h3>
              <p className="text-gray-600">Choose the number of tickets you'd like to purchase for the SG:60 Legacy event</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Adult Tickets */}
              <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="text-center">
                  <h4 className="font-semibold text-lg text-blue-900">Adult Tickets</h4>
                  <p className="text-2xl font-bold text-blue-700">$50</p>
                  <p className="text-sm text-blue-600">per ticket</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    className="h-10 w-10 p-0"
                    onClick={() => handleTicketChange("adult", false)}
                    disabled={formData.adultTickets <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{formData.adultTickets}</div>
                    <div className="text-xs text-blue-600">tickets</div>
                  </div>
                  <Button className="h-10 w-10 p-0" onClick={() => handleTicketChange("adult", true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center text-sm text-blue-700">
                  Subtotal: <span className="font-semibold">${formData.adultTickets * 50}</span>
                </div>
              </div>

              {/* Child Tickets */}
              <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                <div className="text-center">
                  <h4 className="font-semibold text-lg text-green-900">Child Tickets</h4>
                  <p className="text-2xl font-bold text-green-700">$25</p>
                  <p className="text-sm text-green-600">per ticket</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    className="h-10 w-10 p-0"
                    onClick={() => handleTicketChange("child", false)}
                    disabled={formData.childTickets <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900">{formData.childTickets}</div>
                    <div className="text-xs text-green-600">tickets</div>
                  </div>
                  <Button className="h-10 w-10 p-0" onClick={() => handleTicketChange("child", true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center text-sm text-green-700">
                  Subtotal: <span className="font-semibold">${formData.childTickets * 25}</span>
                </div>
              </div>
            </div>

            {/* Total and Proceed */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <div className="text-sm text-gray-600">Total Cost</div>
                <div className="text-3xl font-bold text-gray-900">${getTotalCost()}</div>
                <div className="text-sm text-gray-500">
                  {formData.adultTickets} adult{formData.adultTickets !== 1 ? "s" : ""} + {formData.childTickets} child
                  {formData.childTickets !== 1 ? "ren" : ""}
                </div>
              </div>

              {isStepComplete("tickets") && !formData.proceedToRegistration && (                <Button
                  onClick={() => handleFieldUpdate("proceedToRegistration", true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
                >
                  Proceed to Registration
                </Button>
              )}

              {formData.proceedToRegistration && (
                <div className="text-center text-green-600 font-medium">
                  ✓ Tickets selected - Continue with registration below
                </div>
              )}

              {/* Discount Checkbox */}
              <div className="flex items-center gap-2 mt-4">
                <Checkbox
                  id="discount"
                  checked={formData.discount || false}
                  onCheckedChange={handleCheckedChange("discount")}
                />
                <Label htmlFor="discount" className="text-sm">
                  Fill in my personal information for a 50% discount
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* After Ticket Selection - Adult and Child Registration Forms */}
      {formData.proceedToRegistration && formData.discount && (
        <div className="my-8">
          {renderBubbles()}
          {renderConsolidatedForm()}
          {isFormComplete(currentPersonIndex) && currentPersonIndex < (adultTickets + childTickets - 1) && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                  onClick={() => setCurrentPersonIndex(currentPersonIndex + 1)}
                >
                  Next Person
                </Button>
              )}
        </div>
      )}

      {/* Registrant Information */}
      {formData.proceedToRegistration && !formData.discount && (
        <div className="my-8">
          {renderBubbles()}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Registrant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldUpdate("firstName", e.target.value)}
                placeholder="First Name"
              />
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldUpdate("lastName", e.target.value)}
                placeholder="Last Name"
              />
              <Input
                id="email"
                value={formData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldUpdate("email", e.target.value)}
                placeholder="Email Address"
              />
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldUpdate("contactNumber", e.target.value)}
                placeholder="Contact Number"
              />
              {isFormComplete(currentPersonIndex) && currentPersonIndex < (adultTickets + childTickets - 1) && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                  onClick={() => setCurrentPersonIndex(currentPersonIndex + 1)}
                >
                  Next Person
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
