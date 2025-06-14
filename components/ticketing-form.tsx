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
    const formDataWithDefaults = new Proxy(state.form.formData as FormData, {
      get: (target, prop) => {
        // If the property doesn't exist, return empty string as default
        if (typeof prop === 'string' && !(prop in target)) {
          return ''
        }
        return target[prop as keyof typeof target]
      }
    })

    return {
      formData: formDataWithDefaults,
      schema: state.form.schema
    }
  })
  const completedRegistrations = useSelector((state: RootState) => state.completedRegistrations.registrations)
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)

  const adultTickets = Number(formData.adultTickets) || 0
  const childTickets = Number(formData.childTickets) || 0

  const handleFieldUpdate = (field: keyof FormData, value: unknown) => {
  dispatch(updateField({ 
    field: `${currentPersonIndex}.${field}`, 
    value 
  }))
}

  const handleSingleFieldUpdate = (field: keyof FormData, value: unknown) => {
    dispatch(updateField({ field, value }))
  }

  const handleRadioChange = (value: string, field: keyof FormData) => {
    handleSingleFieldUpdate(field, value)
  }

  const handleCheckboxChange = (checked: boolean, field: keyof FormData) => {
    handleSingleFieldUpdate(field, checked)
  }

  const handleTicketChange = (type: "adult" | "child", increment: boolean) => {
    const currentValue = type === "adult" ? formData.adultTickets : formData.childTickets
    const newValue = increment ? currentValue + 1 : Math.max(1, currentValue - 1)
    handleSingleFieldUpdate(type === "adult" ? "adultTickets" : "childTickets", newValue)
  }

  // Add explicit type for onValueChange handlers
  const handleValueChange = (field: keyof FormData) => (value: string) => {
    handleFieldUpdate(field, value)
  }

  // Add explicit type for onCheckedChange handlers
  const handleCheckedChange = (field: keyof FormData) => (checked: boolean) => {
    handleSingleFieldUpdate(field, checked)
  }

  const handleSingleCheckedChange = (field: keyof FormData) => (checked: boolean) => {
    handleFieldUpdate(field, checked)
  }

  const getTotalCost = () => {
    return formData.adultTickets * 50 + formData.childTickets * 25
  }

  const isStepComplete = (idx: number, step: string) => {
    switch (step) {
      case "tickets":
        return formData.adultTickets >= 1 || formData.childTickets >= 1
      case "intro":
        return formData[`${currentPersonIndex}.acknowledgedIntro`]
      case "salutation":
        return formData[`${currentPersonIndex}.salutation`] !== ""
      case "firstName":
        return formData[`${currentPersonIndex}.firstName`]?.trim() !== ""
      case "lastName":
        return formData[`${currentPersonIndex}.lastName`]?.trim() !== ""
      case "email":
        return formData[`${currentPersonIndex}.email`]?.trim() !== "" && formData[`${currentPersonIndex}.email`]?.includes("@")
      case "nationality":
        return (
          formData[`${currentPersonIndex}.nationality`] !== "" ||
          (formData[`${currentPersonIndex}.nationality`] === "Singapore" || formData[`${currentPersonIndex}.otherNationality`]?.trim() !== "")
        )
      case "pr":
        return formData[`${currentPersonIndex}.nationality`] !== "Others" || formData[`${currentPersonIndex}.isPermanentResident`] !== null
      case "country":
        return (
          formData[`${currentPersonIndex}.countryOfResidence`] !== "" &&
          (formData[`${currentPersonIndex}.countryOfResidence`] === "United States of America" || formData[`${currentPersonIndex}.otherCountryResidence`]?.trim() !== "")
        )
      case "state":
        return formData[`${currentPersonIndex}.countryOfResidence`] !== "United States of America" || formData[`${currentPersonIndex}.stateOfResidence`]?.trim() !== ""
      case "city":
        return formData[`${currentPersonIndex}.countryOfResidence`] !== "United States of America" || formData[`${currentPersonIndex}.cityOfResidence`]?.trim() !== ""
      case "occupation":
        return (
          formData[`${currentPersonIndex}.occupation`] !== "" && (formData[`${currentPersonIndex}.occupation`] !== "Others" || formData[`${currentPersonIndex}.otherOccupation`]?.trim() !== "")
        )
      case "school":
        return formData[`${currentPersonIndex}.occupation`] !== "Student" || formData[`${currentPersonIndex}.school`]?.trim() !== ""
      case "qualification":
        return (
          formData[`${currentPersonIndex}.occupation`] !== "Student" ||
          (formData[`${currentPersonIndex}.qualification`] !== "" &&
            (formData[`${currentPersonIndex}.qualification`] !== "Others" || formData[`${currentPersonIndex}.otherQualification`]?.trim() !== ""))
        )
      case "courseOfStudy":
        return (
          formData[`${currentPersonIndex}.occupation`] !== "Student" ||
          (formData[`${currentPersonIndex}.courseOfStudy`] !== "" &&
            (formData[`${currentPersonIndex}.courseOfStudy`] !== "Others" || formData[`${currentPersonIndex}.otherCourseOfStudy`]?.trim() !== ""))
        )
      case "graduationYear":
        return formData[`${currentPersonIndex}.occupation`] === "Student" && formData[`${currentPersonIndex}.graduationYear`] !== ""
      case "industry":
        return (
          (formData[`${currentPersonIndex}.occupation`] !== "Working Professional" &&
            formData[`${currentPersonIndex}.occupation`] !== "Business Owner and Entrepreneur") ||
          (formData[`${currentPersonIndex}.industry`] !== "" && (formData[`${currentPersonIndex}.industry`] !== "Others" || formData[`${currentPersonIndex}.otherIndustry`]?.trim() !== ""))
        )
      case "financialSector":
        return formData[`${currentPersonIndex}.industry`] !== "Banking and Finance" || formData[`${currentPersonIndex}.financialSector`] !== ""
      case "jobFunction":
        return (
          (formData[`${currentPersonIndex}.occupation`] !== "Working Professional" &&
            formData[`${currentPersonIndex}.occupation`] !== "Business Owner and Entrepreneur") ||
          (formData[`${currentPersonIndex}.jobFunction`] !== "" &&
            (formData[`${currentPersonIndex}.jobFunction`] !== "Others" || formData[`${currentPersonIndex}.otherJobFunction`]?.trim() !== ""))
        )
      case "specialization":
        return formData[`${currentPersonIndex}.jobFunction`] === "Technology" && 
               formData[`${currentPersonIndex}.specialization`] !== ""
      case "jobLevel":
        return formData[`${currentPersonIndex}.jobLevel`] !== ""
      case "jobTitle":
        return formData[`${currentPersonIndex}.jobTitle`]?.trim() !== ""
      case "companyName":
        return formData[`${currentPersonIndex}.companyName`]?.trim() !== ""
      case "employmentStatus":
        return formData[`${currentPersonIndex}.occupation`] !== "Others" || 
               formData[`${currentPersonIndex}.employmentStatus`] !== ""
      case "employmentDescription":
        return formData[`${currentPersonIndex}.employmentStatus`] === "No" ||
               formData[`${currentPersonIndex}.employmentDescription`] !== "" 
      case "otherEmploymentDescription":
        return formData[`${currentPersonIndex}.employmentDescription`] === "Other" ||
               formData[`${currentPersonIndex}.otherEmploymentDescription`]?.trim() !== ""
      case "privacyConsent":
        return formData[`${currentPersonIndex}.privacyConsent`] === true
      default:
        return false
    }
  }

  const shouldShowStep = (idx: number, step: string) => {
    switch (step) {
      case "tickets":
        return true
      case "intro":
        return isStepComplete(currentPersonIndex, "tickets") && formData.proceedToRegistration
      case "salutation":
        return isStepComplete(currentPersonIndex, "intro")
      case "firstName":
        return isStepComplete(currentPersonIndex, "salutation")
      case "lastName":
        return isStepComplete(currentPersonIndex, "firstName")
      case "email":
        return isStepComplete(currentPersonIndex, "lastName")
      case "nationality":
        return isStepComplete(currentPersonIndex, "email")
      case "pr":
        return isStepComplete(currentPersonIndex,"nationality") && formData[`${currentPersonIndex}.nationality`] === "Others"
      case "country":
        return isStepComplete(currentPersonIndex, "nationality") || (formData[`${currentPersonIndex}.nationality`] == "Others" && isStepComplete(currentPersonIndex, "pr"))
      case "state":
        return isStepComplete(currentPersonIndex, "country") && formData[`${currentPersonIndex}.countryOfResidence`] === "United States of America"
      case "city":
        return isStepComplete(currentPersonIndex, "state") && formData[`${currentPersonIndex}.countryOfResidence`] === "United States of America"
      case "occupation":
        return (
          isStepComplete(currentPersonIndex, "country") &&
          (formData[`${currentPersonIndex}.countryOfResidence`] !== "United States of America" ||
            (isStepComplete(currentPersonIndex, "state") && isStepComplete(currentPersonIndex, "city")))
        )
      case "school":
        return isStepComplete(currentPersonIndex, "occupation") && formData[`${currentPersonIndex}.occupation`] === "Student"
      case "qualification":
        return isStepComplete(currentPersonIndex, "school") && formData[`${currentPersonIndex}.occupation`] === "Student"
      case "courseOfStudy":
        return isStepComplete(currentPersonIndex, "qualification") && formData[`${currentPersonIndex}.occupation`] === "Student"
      case "graduationYear":
        return isStepComplete(currentPersonIndex, "courseOfStudy") && formData[`${currentPersonIndex}.occupation`] === "Student"
      case "industry":
        return (
          isStepComplete(currentPersonIndex, "occupation") &&
          (formData[`${currentPersonIndex}.occupation`] === "Working Professional" || formData[`${currentPersonIndex}.occupation`] === "Business Owner and Entrepreneur")
        )
      case "financialSector":
        return isStepComplete(currentPersonIndex, "industry") && formData[`${currentPersonIndex}.industry`] === "Banking and Finance"
      case "jobFunction":
        return (
          isStepComplete(currentPersonIndex, "industry") &&
          (formData[`${currentPersonIndex}.occupation`] === "Working Professional" ||
            formData[`${currentPersonIndex}.occupation`] === "Business Owner and Entrepreneur") &&
          (formData[`${currentPersonIndex}.industry`] !== "Banking and Finance" || isStepComplete(currentPersonIndex, "financialSector"))
        )
      case "complete":
        return (
          isStepComplete(currentPersonIndex, "privacyConsent")
        )
      case "employmentStatus":
        return formData[`${currentPersonIndex}.occupation`] !== "Others" || 
               formData[`${currentPersonIndex}.employmentStatus`] !== ""
      case "employmentDescription":
        return formData[`${currentPersonIndex}.employmentStatus`] === "No" ||
               formData[`${currentPersonIndex}.employmentDescription`] !== "" 
      case "otherEmploymentDescription":
        return formData[`${currentPersonIndex}.employmentDescription`] !== "Other" ||
               formData[`${currentPersonIndex}.otherEmploymentDescription`]?.trim() !== ""
      case "privacyConsent":
        return isStepComplete(currentPersonIndex, "employmentDescription") || isStepComplete(currentPersonIndex, "otherEmploymentDescription") || isStepComplete(currentPersonIndex, "graduationYear") || isStepComplete(currentPersonIndex, "specialization")
      case "specialization":
        return isStepComplete(currentPersonIndex, "jobFunction") && formData[`${currentPersonIndex}.jobFunction`] === "Technology"
      default:
        return false
    }
  }

  const getCompletedSteps = () => {
    const idx = currentPersonIndex
    const steps = ["tickets"]
    if (formData.proceedToRegistration) {
      steps.push("intro", "salutation", "firstName", "lastName", "email", "nationality")
      if (formData[`${currentPersonIndex}.nationality`] === "Others") steps.push("pr")
      steps.push("country")
      if (formData[`${currentPersonIndex}.countryOfResidence`] === "United States of America") {
        steps.push("state", "city")
      }
      steps.push("occupation")
      if (formData[`${currentPersonIndex}.occupation`] === "Student") {
        steps.push("school", "qualification", "courseOfStudy", "graduationYear")
      }
    }

    return steps.filter((step) => isStepComplete(currentPersonIndex, step)).length
  }

  const getTotalSteps = () => {
    let total = 1 // tickets
    const idx = currentPersonIndex
    if (formData.proceedToRegistration) {
      total += 6 // intro, salutation, firstName, lastName, email, nationality
      if (formData[`${currentPersonIndex}.nationality`] === "Others") total += 1 // pr
      total += 1 // country
      if (formData[`${currentPersonIndex}.countryOfResidence`] === "United States of America") total += 2 // state, city
      total += 1 // occupation
      if (formData[`${currentPersonIndex}.occupation`] === "Student") total += 4 // school, qualification, courseOfStudy, graduationYear
    }
    return total
  }

  const isFormComplete = (idx: number) => {
    if (idx >= adultTickets + childTickets) return false
    if (idx < adultTickets) {
      return formData[`${currentPersonIndex}.otherJobFunction`] || formData[`${currentPersonIndex}.contactNumber`]
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
        ? formData[`${currentPersonIndex}.adultForms`]?.[currentPersonIndex]
        : formData[`${currentPersonIndex}.childForms`]?.[currentPersonIndex - adultTickets]
      
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
        <CardTitle>Registration</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Introduction Section */}
        {shouldShowStep(currentPersonIndex, "intro") && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Welcome to Singapore Global Network</h3>
            <p className="text-gray-600 mb-2">
              Singapore Global Network is a 130,000-strong community of professionals and friends seeking to deepen
              connections in Singapore and across the globe. Whether you're in London or Longyearbyen, Spain or
              Switzerland, you'll never be alone again.
            </p>
            {!isStepComplete(currentPersonIndex, "intro") && (
              <Button
                onClick={() => handleFieldUpdate("acknowledgedIntro", true)}
                className="w-full transition-all duration-300 hover:scale-105"
              >
                Wonderful! Let's Get Started
              </Button>
            )}
            {isStepComplete(currentPersonIndex, "intro") && (
              <div className="text-center text-green-600 font-medium">✓ Ready to proceed with registration</div>
            )}
          </div>
        )}

        {/* Personal Information Section */}
        {shouldShowStep(currentPersonIndex, "salutation") && (
          <Card className="transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                {isStepComplete(currentPersonIndex, "occupation") &&
                (formData[`${currentPersonIndex}.occupation`] !== "Student" ||
                  (isStepComplete(currentPersonIndex, "school") &&
                    isStepComplete(currentPersonIndex, "qualification") &&
                    isStepComplete(currentPersonIndex, "courseOfStudy") &&
                    isStepComplete(currentPersonIndex, "graduationYear"))) &&
                ((formData[`${currentPersonIndex}.occupation`] !== "Working Professional" &&
                  formData[`${currentPersonIndex}.occupation`] !== "Business Owner and Entrepreneur") ||
                  (isStepComplete(currentPersonIndex, "industry") &&
                    (formData[`${currentPersonIndex}.industry`] !== "Banking and Finance" || isStepComplete(currentPersonIndex, "financialSector")) &&
                    isStepComplete(currentPersonIndex, "jobFunction"))) ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                <CardTitle>Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Salutation */}
              <div
                className={cn(
                  "space-y-3 transition-all duration-300",
                  isStepComplete(currentPersonIndex, "salutation") ? "opacity-75" : "opacity-100",
                )}
              >
                <div className="flex items-center gap-2">
                  {isStepComplete(currentPersonIndex, "salutation") ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400" />
                  )}
                  <Label className="text-sm font-medium">Salutation</Label>
                </div>
                <RadioGroup
                  value={formData[`${currentPersonIndex}.salutation`]}
                  onValueChange={handleValueChange("salutation")}
                  className="grid grid-cols-5 gap-2"
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

              {/* First Name */}
              {shouldShowStep(currentPersonIndex, "firstName") && (
                <div
                  className={cn(
                    "space-y-2 transition-all duration-300 animate-in slide-in-from-right-2",
                    isStepComplete(currentPersonIndex, "firstName") ? "opacity-75" : "opacity-100",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isStepComplete(currentPersonIndex, "firstName") ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                  </div>
                  <Input
                    id="firstName"
                    value={formData[`${currentPersonIndex}.firstName`]}
                    onChange={(e) => handleFieldUpdate("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              )}

              {/* Last Name */}
              {shouldShowStep(currentPersonIndex, "lastName") && (
                <div
                  className={cn(
                    "space-y-2 transition-all duration-300 animate-in slide-in-from-right-2",
                    isStepComplete(currentPersonIndex, "lastName") ? "opacity-75" : "opacity-100",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isStepComplete(currentPersonIndex, "lastName") ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                  </div>
                  <Input
                    id="lastName"
                    value={formData[`${currentPersonIndex}.lastName`]}
                    onChange={(e) => handleFieldUpdate("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              )}

              {/* Email */}
              {shouldShowStep(currentPersonIndex, "email") && (
                <div
                  className={cn(
                    "space-y-2 transition-all duration-300 animate-in slide-in-from-right-2",
                    isStepComplete(currentPersonIndex, "email") ? "opacity-75" : "opacity-100",
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isStepComplete(currentPersonIndex, "email") ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={formData[`${currentPersonIndex}.email`]}
                    onChange={(e) => handleFieldUpdate("email", e.target.value)}
                    placeholder="Enter your email address"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Nationality Section */}
        {shouldShowStep(currentPersonIndex, "nationality") && (
          <Card className="transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                {isStepComplete(currentPersonIndex, "nationality") ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                <CardTitle>Nationality & Citizenship</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">              <RadioGroup value={formData[`${currentPersonIndex}.nationality`]} onValueChange={handleValueChange("nationality")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Singapore" id="singapore" />
                  <Label htmlFor="singapore">Singapore</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Others" id="others" />
                  <Label htmlFor="others">Others</Label>
                </div>
              </RadioGroup>

              {formData[`${currentPersonIndex}.nationality`] === "Others" && (
                <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                  <Label htmlFor="otherNationality">Please specify your nationality</Label>
                  <Input
                    id="otherNationality"
                    value={formData[`${currentPersonIndex}.otherNationality`]}
                    onChange={(e) => handleFieldUpdate("otherNationality", e.target.value)}
                    placeholder="Enter your nationality"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              )}

              {/* PR Status */}
              {shouldShowStep(currentPersonIndex, "pr") && (
                <div className="ml-6 space-y-4 p-4 bg-blue-50 rounded-lg animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2">
                    {isStepComplete(currentPersonIndex, "pr") ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <Label className="font-medium">Permanent Resident Status</Label>
                  </div>
                  <p className="text-sm text-gray-600">Are you a Singaporean Permanent Resident?</p>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isPR"
                      checked={formData[`${currentPersonIndex}.isPermanentResident`] || false}
                      onCheckedChange={handleSingleCheckedChange("isPermanentResident")}
                    />
                    <Label htmlFor="isPR" className="text-sm">
                      Yes, I am a Singaporean Permanent Resident
                    </Label>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Residence Section */}
        {shouldShowStep(currentPersonIndex, "country") && (
          <Card className="transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                {isStepComplete(currentPersonIndex, "country") &&
                (formData[`${currentPersonIndex}.countryOfResidence`] !== "United States of America" ||
                  (isStepComplete(currentPersonIndex, "state") && isStepComplete(currentPersonIndex, "city"))) ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                <CardTitle>Residence Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="font-medium">Country of Residence</Label>
                <RadioGroup
                  value={formData[`${currentPersonIndex}.countryOfResidence`]}
                  onValueChange={handleValueChange("countryOfResidence")}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="United States of America" id="usa" />
                    <Label htmlFor="usa">United States of America</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Others" id="otherCountry" />
                    <Label htmlFor="otherCountry">Others</Label>
                  </div>
                </RadioGroup>

                {formData[`${currentPersonIndex}.countryOfResidence`] === "Others" && (
                  <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                    <Label htmlFor="otherCountryResidence">Please specify your country</Label>
                    <Input
                      id="otherCountryResidence"
                      value={formData[`${currentPersonIndex}.otherCountryResidence`]}
                      onChange={(e) => handleFieldUpdate("otherCountryResidence", e.target.value)}
                      placeholder="Enter your country of residence"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                )}
              </div>

              {/* US State and City */}
              {shouldShowStep(currentPersonIndex, "state") && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg animate-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {isStepComplete(currentPersonIndex, "state") ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <Label htmlFor="state" className="font-medium">
                        State of Residence
                      </Label>
                    </div>
                    <Input
                      id="state"
                      value={formData[`${currentPersonIndex}.stateOfResidence`]}
                      onChange={(e) => handleFieldUpdate("stateOfResidence", e.target.value)}
                      placeholder="California"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>

                  {shouldShowStep(currentPersonIndex, "city") && (
                    <div className="space-y-2 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "city") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label htmlFor="city" className="font-medium">
                          City of Residence
                        </Label>
                      </div>
                      <Input
                        id="city"
                        value={formData[`${currentPersonIndex}.cityOfResidence`]}
                        onChange={(e) => handleFieldUpdate("cityOfResidence", e.target.value)}
                        placeholder="San Francisco"
                        className="transition-all duration-200 focus:scale-105"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Occupation Section */}
        {shouldShowStep(currentPersonIndex, "occupation") && (
          <Card className="transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                {isStepComplete(currentPersonIndex, "occupation") &&
                (formData[`${currentPersonIndex}.occupation`] !== "Student" ||
                  (isStepComplete(currentPersonIndex, "school") &&
                    isStepComplete(currentPersonIndex, "qualification") &&
                    isStepComplete(currentPersonIndex, "courseOfStudy") &&
                    isStepComplete(currentPersonIndex, "graduationYear"))) &&
                ((formData[`${currentPersonIndex}.occupation`] !== "Working Professional" &&
                  formData[`${currentPersonIndex}.occupation`] !== "Business Owner and Entrepreneur") ||
                  (isStepComplete(currentPersonIndex, "industry") &&
                    (formData[`${currentPersonIndex}.industry`] !== "Banking and Finance" || isStepComplete(currentPersonIndex, "financialSector")) &&
                    isStepComplete(currentPersonIndex, "jobFunction"))) ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                <CardTitle>Professional Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="font-medium">Occupation</Label>
                <RadioGroup
                  value={formData[`${currentPersonIndex}.occupation`]}
                  onValueChange={handleValueChange("occupation")}
                  className="space-y-2"
                >
                  {["Student", "Working Professional", "Business Owner and Entrepreneur", "Others"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option.replace(/\s+/g, "")} />
                      <Label htmlFor={option.replace(/\s+/g, "")}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {formData[`${currentPersonIndex}.occupation`] === "Others" && (
                  <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                    <Label htmlFor="otherOccupation">Please specify your occupation</Label>
                    <Input
                      id="otherOccupation"
                      value={formData[`${currentPersonIndex}.otherOccupation`]}
                      onChange={(e) => handleFieldUpdate("otherOccupation", e.target.value)}
                      placeholder="Enter your occupation"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                )}
              </div>

              {/* Student-specific sections */}
              {shouldShowStep(currentPersonIndex, "school") && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg animate-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {isStepComplete(currentPersonIndex, "school") ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <Label htmlFor="school" className="font-medium">
                        School/University
                      </Label>
                    </div>
                    <Input
                      id="school"
                      value={formData[`${currentPersonIndex}.school`]}
                      onChange={(e) => handleFieldUpdate("school", e.target.value)}
                      placeholder="Enter your school or university name"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>

                  {shouldShowStep(currentPersonIndex, "qualification") && (
                    <div className="space-y-3 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "qualification") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label className="font-medium">Qualification Currently Pursuing</Label>
                      </div>
                      <RadioGroup
                        value={formData[`${currentPersonIndex}.qualification`]}
                        onValueChange={handleValueChange("qualification")}
                        className="space-y-2"
                      >
                        {[
                          "Diploma and Other Professional Qualifications",
                          "Bachelor's or Equivalent",
                          "Postgraduate Diploma / Certificate (Excluding Master's and Doctorate)",
                          "Master's and Doctorate or Equivalent",
                          "Others",
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                            <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {formData[`${currentPersonIndex}.qualification`] === "Others" && (
                        <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                          <Label htmlFor="otherQualification">Please specify your qualification</Label>
                          <Input
                            id="otherQualification"
                            value={formData[`${currentPersonIndex}.otherQualification`]}
                            onChange={(e) => handleFieldUpdate("otherQualification", e.target.value)}
                            placeholder="Enter your qualification"
                            className="transition-all duration-200 focus:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {shouldShowStep(currentPersonIndex, "courseOfStudy") && (
                    <div className="space-y-3 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "courseOfStudy") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label className="font-medium">Course of Study</Label>
                      </div>
                      <RadioGroup
                        value={formData[`${currentPersonIndex}.courseOfStudy`]}
                        onValueChange={handleValueChange("courseOfStudy")}
                        className="space-y-2 max-h-48 overflow-y-auto"
                      >
                        {[
                          "Architecture, Building and Real Estate",
                          "Business and Administration",
                          "Education",
                          "Engineering Sciences",
                          "Engineering, Manufacturing and Related Trades",
                          "Fine and Applied Arts",
                          "Generic Programmes and Qualifications",
                          "Health Sciences",
                          "Humanities and Social Sciences",
                          "Information Technology",
                          "Law",
                          "Mass Communication and Information Science",
                          "Natural, Physical, Chemical and Mathematical Sciences",
                          "Services",
                          "Others",
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                            <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {formData[`${currentPersonIndex}.courseOfStudy`] === "Others" && (
                        <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                          <Label htmlFor="otherCourseOfStudy">Please specify your course of study</Label>
                          <Input
                            id="otherCourseOfStudy"
                            value={formData[`${currentPersonIndex}.otherCourseOfStudy`]}
                            onChange={(e) => handleFieldUpdate("otherCourseOfStudy", e.target.value)}
                            placeholder="Enter your course of study"
                            className="transition-all duration-200 focus:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {shouldShowStep(currentPersonIndex, "graduationYear") && (
                    <div className="space-y-2 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "graduationYear") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label htmlFor="graduationYear" className="font-medium">
                          Year of Graduation
                        </Label>
                      </div>
                      <select
                        id="graduationYear"
                        value={formData[`${currentPersonIndex}.graduationYear`]}
                        onChange={(e) => handleFieldUpdate("graduationYear", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select graduation year</option>
                        {Array.from({ length: 10 }, (_, i) => 2025 + i).map((year) => (
                          <option key={year} value={year.toString()}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Professional-specific sections */}
              {shouldShowStep(currentPersonIndex, "industry") && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg animate-in slide-in-from-bottom-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {isStepComplete(currentPersonIndex, "industry") ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <Label className="font-medium">Industry</Label>
                    </div>
                    <RadioGroup
                      value={formData[`${currentPersonIndex}.industry`]}
                      onValueChange={handleValueChange("industry")}
                      className="space-y-2 max-h-48 overflow-y-auto"
                    >
                      {[
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
                        "Others",
                      ].map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                          <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")} className="text-sm">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    {formData[`${currentPersonIndex}.industry`] === "Others" && (
                      <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                        <Label htmlFor="otherIndustry">Please specify your industry</Label>
                        <Input
                          id="otherIndustry"
                          value={formData[`${currentPersonIndex}.otherIndustry`]}
                          onChange={(e) => handleFieldUpdate("otherIndustry", e.target.value)}
                          placeholder="Enter your industry"
                          className="transition-all duration-200 focus:scale-105"
                        />
                      </div>
                    )}
                  </div>

                  {/* Financial Sector (only for Banking and Finance) */}
                  {shouldShowStep(currentPersonIndex, "financialSector") && (
                    <div className="space-y-3 p-3 bg-blue-50 rounded-lg animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "financialSector") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label className="font-medium">Financial Sector</Label>
                      </div>
                      <RadioGroup
                        value={formData[`${currentPersonIndex}.financialSector`]}
                        onValueChange={handleValueChange("financialSector")}
                        className="space-y-2"
                      >
                        {[
                          "Asset Management",
                          "Corporate Banking",
                          "Enterprise",
                          "Insurance",
                          "Investment Banking",
                          "Private Banking and Wealth Management",
                          "Retail Banking",
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                            <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Job Function */}
                  {shouldShowStep(currentPersonIndex, "jobFunction") && (
                    <div className="space-y-3 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "jobFunction") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label className="font-medium">Job Function</Label>
                      </div>
                      <RadioGroup
                        value={formData[`${currentPersonIndex}.jobFunction`]}
                        onValueChange={handleValueChange("jobFunction")}
                        className="space-y-2 max-h-48 overflow-y-auto"
                      >
                        {[
                          "Accounting",
                          "Administrative & Human Resources",
                          "Community and Social Work",
                          "Consulting, Strategy and Market Research",
                          "Data Science or Analytics",
                          "Design",
                          "Education and Training",
                          "Engineering",
                          "Entrepreneurship",
                          "Finance",
                          "Healthcare Services",
                          "Legal",
                          "Marketing and Communications",
                          "Operations",
                          "Product Management",
                          "Research and Innovation",
                          "Sales and Business Development",
                          "Sustainability",
                          "Technology",
                          "Others",
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                            <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>

                      {formData[`${currentPersonIndex}.jobFunction`] === "Others" && (
                        <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                          <Label htmlFor="otherJobFunction">Please specify your job function</Label>
                          <Input
                            id="otherJobFunction"
                            value={formData[`${currentPersonIndex}.otherJobFunction`]}
                            onChange={(e) => handleFieldUpdate("otherJobFunction", e.target.value)}
                            placeholder="Enter your job function"
                            className="transition-all duration-200 focus:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Technology Specialization */}
                  {shouldShowStep(currentPersonIndex, "specialization") && (
                    <div className="space-y-3 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "specialization") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label className="font-medium">Area of Specialization</Label>
                      </div>
                      <RadioGroup
                        value={formData[`${currentPersonIndex}.specialization`]
                        }
                        onValueChange={handleValueChange("specialization")}
                        className="space-y-2"
                      >
                        {[
                          "Artificial Intelligence",
                          "Block Chain",
                          "Cloud Computing",
                          "Cybersecurity",
                          "Network Engineering",
                          "Robotics",
                          "Software Development",
                          "Systems Administration",
                          "Web or Application Development"
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                            <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Job Level */}
                  {shouldShowStep(currentPersonIndex, "jobLevel") && (
                    <div className="space-y-3 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "jobLevel") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label className="font-medium">Job Level/Title</Label>
                      </div>
                      <RadioGroup
                        value={formData[`${currentPersonIndex}.jobLevel`]}
                        onValueChange={handleValueChange("jobLevel")}
                        className="space-y-2"
                      >
                        {[
                          "C-Suite",
                          "EVP/ SVP/ VP/ Director/ Lead Specialist",
                          "Manager/ Senior Specialist",
                          "Associate/ Executive/ Junior Specialist"
                        ].map((option) => (
                          <div key={option} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                            <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")} className="text-sm">
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {/* Job Title */}
                  {shouldShowStep(currentPersonIndex, "jobTitle") && (
                    <div className="space-y-3 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "jobTitle") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label className="font-medium">Job Title</Label>
                      </div>
                      <Input
                        id="jobTitle"
                        value={formData[`${currentPersonIndex}.jobTitle`]}
                        onChange={(e) => handleFieldUpdate("jobTitle", e.target.value)}
                        placeholder="Enter your job title"
                        className="transition-all duration-200 focus:scale-105"
                      />
                    </div>
                  )}

                  {/* Company Name */}
                  {shouldShowStep(currentPersonIndex, "companyName") && (
                    <div className="space-y-3 animate-in slide-in-from-right-2">
                      <div className="flex items-center gap-2">
                        {isStepComplete(currentPersonIndex, "companyName") ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <Label className="font-medium">Company Name</Label>
                      </div>
                      <Input
                        id="companyName"
                        value={formData[`${currentPersonIndex}.companyName`]}
                        onChange={(e) => handleFieldUpdate("companyName", e.target.value)}
                        placeholder="Enter your company name"
                        className="transition-all duration-200 focus:scale-105"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employment Section - Shown only if occupation is "Others" */}
        {formData[`${currentPersonIndex}.occupation`] === "Others" && (
          <div className="space-y-4 p-4 bg-purple-50 rounded-lg animate-in slide-in-from-bottom-2">
            {/* Employment Status */}
            <div className="space-y-3">
              <Label className="font-medium">Are you currently employed?</Label>
              <RadioGroup
                value={formData[`${currentPersonIndex}.employmentStatus`]}
                onValueChange={handleValueChange("employmentStatus")}
                className="space-y-2"
              >
                {["Yes Part time", "Yes Full time", "No"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                    <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Employment Description */}
            {shouldShowStep(currentPersonIndex, "employmentDescription") && (
              <div className="space-y-3">
                <Label className="font-medium">Which best describes you?</Label>
                <RadioGroup
                  value={formData[`${currentPersonIndex}.employmentDescription`]}
                  onValueChange={handleValueChange("employmentDescription")}
                  className="space-y-2"
                >
                  {["Freelancer", "Retiree", "Homemaker", "In Transition or Job Searching", "Other"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option.replace(/[^a-zA-Z0-9]/g, "")} />
                      <Label htmlFor={option.replace(/[^a-zA-Z0-9]/g, "")}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {formData[`${currentPersonIndex}.employmentDescription`] === "Other" && (
                  <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                    <Input
                      value={formData[`${currentPersonIndex}.otherEmploymentDescription`]}
                      onChange={(e) => handleFieldUpdate("otherEmploymentDescription", e.target.value)}
                      placeholder="Please specify"
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Privacy Consent - Add just before the final completion card */}
        {shouldShowStep(currentPersonIndex, "privacyConsent") && (
          <Card className="mt-4 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacyConsent"
                  checked={formData[`${currentPersonIndex}.privacyConsent`] || false}
                  onCheckedChange={(checked) => handleFieldUpdate("privacyConsent", checked)}
                />
                <Label htmlFor="privacyConsent" className="text-sm">
                  To continue receiving news of events like this, the Singapore Global Network warmly invites you to be a part of our vibrant and exciting global network of family, friends and fans of Singapore. Apart from e-newsletters, SGN organises regular social and professional get-togethers and events in various cities around the world. Please tick the checkbox below to join our mailing list and confirm you agree to our privacy statement at 
                  <a 
                    href="https://singaporeglobalnetwork.gov.sg/privacy-statement/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://singaporeglobalnetwork.gov.sg/privacy-statement/
                  </a>
                   I have read and understood Singapore Global Network's Privacy Statement, and agree to receive updates and exclusive invitations from Singapore Global Network.
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Section */}
        {shouldShowStep(currentPersonIndex, "complete") && (
          <div className="mt-8">
            <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 animate-in slide-in-from-bottom-4">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <CardTitle className="text-green-800">
                    {currentPersonIndex === adultTickets + childTickets - 1 
                      ? "All Registrations Complete!" 
                      : "Section Complete!"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentPersonIndex === adultTickets + childTickets - 1 ? (
                  <>
                    <p className="text-green-700">
                      Thank you for completing all registrations! Please review your submission below.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold mb-2 text-green-800">Registration Data:</h3>
                      <pre className="text-xs text-left overflow-auto bg-gray-50 p-2 rounded text-gray-700">
                        {JSON.stringify(formData, null, 2)}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        Submit All Registrations
                      </Button>
                      <Button
                        className="border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => dispatch(resetForm())}
                      >
                        Start Over
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-green-700">
                      Great! You've completed this section. Ready to move on to the next person?
                    </p>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setCurrentPersonIndex(currentPersonIndex + 1)}
                    >
                      Next Person
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
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
            {isStepComplete(currentPersonIndex, "tickets") ? (
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

              {isStepComplete(currentPersonIndex, "tickets") && !formData.proceedToRegistration && (                <Button
                  onClick={() => handleSingleFieldUpdate("proceedToRegistration", true)}
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
                value={formData[`${currentPersonIndex}.firstName`]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldUpdate("firstName", e.target.value)}
                placeholder="First Name"
              />
              <Input
                id="lastName"
                value={formData[`${currentPersonIndex}.lastName`]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldUpdate("lastName", e.target.value)}
                placeholder="Last Name"
              />
              <Input
                id="email"
                value={formData[`${currentPersonIndex}.email`]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldUpdate("email", e.target.value)}
                placeholder="Email Address"
              />
              <Input
                id="contactNumber"
                value={formData[`${currentPersonIndex}.contactNumber`]}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleFieldUpdate("contactNumber", e.target.value)}
                placeholder="Contact Number"
              />
              {formData[`${currentPersonIndex}.contactNumber`] !== "" && currentPersonIndex < (adultTickets + childTickets - 1) && (
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
