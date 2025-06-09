"use client"

import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { updateField, resetForm } from "@/lib/features/form-slice"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Plus, Minus, Ticket } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TicketingForm() {
  const dispatch = useDispatch()
  const { formData, schema } = useSelector((state: RootState) => state.form)

  const handleFieldUpdate = (field: string, value: any) => {
    dispatch(updateField({ field, value }))
  }

  const handleTicketChange = (type: "adult" | "child", increment: boolean) => {
    const currentValue = type === "adult" ? formData.adultTickets : formData.childTickets
    const newValue = increment ? currentValue + 1 : Math.max(1, currentValue - 1)
    handleFieldUpdate(type === "adult" ? "adultTickets" : "childTickets", newValue)
  }

  const getTotalCost = () => {
    return formData.adultTickets * 50 + formData.childTickets * 25
  }

  const isStepComplete = (step: string) => {
    switch (step) {
      case "tickets":
        return formData.adultTickets >= 1 || formData.childTickets >= 1
      case "intro":
        return formData.acknowledgedIntro
      case "salutation":
        return formData.salutation !== ""
      case "firstName":
        return formData.firstName.trim() !== ""
      case "lastName":
        return formData.lastName.trim() !== ""
      case "email":
        return formData.email.trim() !== "" && formData.email.includes("@")
      case "nationality":
        return (
          formData.nationality !== "" &&
          (formData.nationality === "Singapore" || formData.otherNationality.trim() !== "")
        )
      case "pr":
        return formData.nationality !== "Others" || formData.isPermanentResident !== null
      case "country":
        return (
          formData.countryOfResidence !== "" &&
          (formData.countryOfResidence === "United States of America" || formData.otherCountryResidence.trim() !== "")
        )
      case "state":
        return formData.countryOfResidence !== "United States of America" || formData.stateOfResidence.trim() !== ""
      case "city":
        return formData.countryOfResidence !== "United States of America" || formData.cityOfResidence.trim() !== ""
      case "occupation":
        return (
          formData.occupation !== "" && (formData.occupation !== "Others" || formData.otherOccupation.trim() !== "")
        )
      case "school":
        return formData.occupation !== "Student" || formData.school.trim() !== ""
      case "qualification":
        return (
          formData.occupation !== "Student" ||
          (formData.qualification !== "" &&
            (formData.qualification !== "Others" || formData.otherQualification.trim() !== ""))
        )
      case "courseOfStudy":
        return (
          formData.occupation !== "Student" ||
          (formData.courseOfStudy !== "" &&
            (formData.courseOfStudy !== "Others" || formData.otherCourseOfStudy.trim() !== ""))
        )
      case "graduationYear":
        return formData.occupation !== "Student" || formData.graduationYear !== ""
      case "industry":
        return (
          (formData.occupation !== "Working Professional" &&
            formData.occupation !== "Business Owner and Entrepreneur") ||
          (formData.industry !== "" && (formData.industry !== "Others" || formData.otherIndustry.trim() !== ""))
        )
      case "financialSector":
        return formData.industry !== "Banking and Finance" || formData.financialSector !== ""
      case "jobFunction":
        return (
          (formData.occupation !== "Working Professional" &&
            formData.occupation !== "Business Owner and Entrepreneur") ||
          (formData.jobFunction !== "" &&
            (formData.jobFunction !== "Others" || formData.otherJobFunction.trim() !== ""))
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

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {formData.proceedToRegistration ? "Registration Progress" : "Ticket Selection"}
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
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
              <p className="text-gray-600">
                Choose the number of tickets you'd like to purchase for the SG:60 Legacy event
              </p>
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
                    variant="outline"
                    size="sm"
                    onClick={() => handleTicketChange("adult", false)}
                    disabled={formData.adultTickets <= 0}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{formData.adultTickets}</div>
                    <div className="text-xs text-blue-600">tickets</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTicketChange("adult", true)}
                    className="h-10 w-10 p-0"
                  >
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
                    variant="outline"
                    size="sm"
                    onClick={() => handleTicketChange("child", false)}
                    disabled={formData.childTickets <= 0}
                    className="h-10 w-10 p-0"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-900">{formData.childTickets}</div>
                    <div className="text-xs text-green-600">tickets</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTicketChange("child", true)}
                    className="h-10 w-10 p-0"
                  >
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

              {isStepComplete("tickets") && !formData.proceedToRegistration && (
                <Button
                  onClick={() => handleFieldUpdate("proceedToRegistration", true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  Proceed to Registration
                </Button>
              )}

              {formData.proceedToRegistration && (
                <div className="text-center text-green-600 font-medium">
                  ✓ Tickets selected - Continue with registration below
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Introduction Section */}
      {shouldShowStep("intro") && (
        <Card
          className={cn(
            "transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4",
            shouldShowStep("intro") ? "opacity-100 scale-100" : "opacity-50 scale-95",
          )}
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              {isStepComplete("intro") ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
              <CardTitle>Welcome to Singapore Global Network</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Singapore Global Network is a 130,000-strong community of professionals and friends seeking to deepen
                connections in Singapore and across the globe. Whether you're in London or Longyearbyen, Spain or
                Switzerland, you'll never be alone again.
              </p>
              {!isStepComplete("intro") && (
                <Button
                  onClick={() => handleFieldUpdate("acknowledgedIntro", true)}
                  className="w-full transition-all duration-300 hover:scale-105"
                >
                  Wonderful! Let's Get Started
                </Button>
              )}
              {isStepComplete("intro") && (
                <div className="text-center text-green-600 font-medium">✓ Ready to proceed with registration</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Information Section */}
      {shouldShowStep("salutation") && (
        <Card className="transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              {isStepComplete("occupation") &&
              (formData.occupation !== "Student" ||
                (isStepComplete("school") &&
                  isStepComplete("qualification") &&
                  isStepComplete("courseOfStudy") &&
                  isStepComplete("graduationYear"))) &&
              ((formData.occupation !== "Working Professional" &&
                formData.occupation !== "Business Owner and Entrepreneur") ||
                (isStepComplete("industry") &&
                  (formData.industry !== "Banking and Finance" || isStepComplete("financialSector")) &&
                  isStepComplete("jobFunction"))) ? (
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
                isStepComplete("salutation") ? "opacity-75" : "opacity-100",
              )}
            >
              <div className="flex items-center gap-2">
                {isStepComplete("salutation") ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-400" />
                )}
                <Label className="text-sm font-medium">Salutation</Label>
              </div>
              <RadioGroup
                value={formData.salutation}
                onValueChange={(value) => handleFieldUpdate("salutation", value)}
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
            {shouldShowStep("firstName") && (
              <div
                className={cn(
                  "space-y-2 transition-all duration-300 animate-in slide-in-from-right-2",
                  isStepComplete("firstName") ? "opacity-75" : "opacity-100",
                )}
              >
                <div className="flex items-center gap-2">
                  {isStepComplete("firstName") ? (
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
                  value={formData.firstName}
                  onChange={(e) => handleFieldUpdate("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
            )}

            {/* Last Name */}
            {shouldShowStep("lastName") && (
              <div
                className={cn(
                  "space-y-2 transition-all duration-300 animate-in slide-in-from-right-2",
                  isStepComplete("lastName") ? "opacity-75" : "opacity-100",
                )}
              >
                <div className="flex items-center gap-2">
                  {isStepComplete("lastName") ? (
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
                  value={formData.lastName}
                  onChange={(e) => handleFieldUpdate("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
            )}

            {/* Email */}
            {shouldShowStep("email") && (
              <div
                className={cn(
                  "space-y-2 transition-all duration-300 animate-in slide-in-from-right-2",
                  isStepComplete("email") ? "opacity-75" : "opacity-100",
                )}
              >
                <div className="flex items-center gap-2">
                  {isStepComplete("email") ? (
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
                  value={formData.email}
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
      {shouldShowStep("nationality") && (
        <Card className="transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              {isStepComplete("nationality") ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400" />
              )}
              <CardTitle>Nationality & Citizenship</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={formData.nationality} onValueChange={(value) => handleFieldUpdate("nationality", value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Singapore" id="singapore" />
                <Label htmlFor="singapore">Singapore</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Others" id="others" />
                <Label htmlFor="others">Others</Label>
              </div>
            </RadioGroup>

            {formData.nationality === "Others" && (
              <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                <Label htmlFor="otherNationality">Please specify your nationality</Label>
                <Input
                  id="otherNationality"
                  value={formData.otherNationality}
                  onChange={(e) => handleFieldUpdate("otherNationality", e.target.value)}
                  placeholder="Enter your nationality"
                  className="transition-all duration-200 focus:scale-105"
                />
              </div>
            )}

            {/* PR Status */}
            {shouldShowStep("pr") && (
              <div className="ml-6 space-y-4 p-4 bg-blue-50 rounded-lg animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2">
                  {isStepComplete("pr") ? (
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
                    checked={formData.isPermanentResident || false}
                    onCheckedChange={(checked) => handleFieldUpdate("isPermanentResident", checked)}
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
      {shouldShowStep("country") && (
        <Card className="transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              {isStepComplete("country") &&
              (formData.countryOfResidence !== "United States of America" ||
                (isStepComplete("state") && isStepComplete("city"))) ? (
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
                value={formData.countryOfResidence}
                onValueChange={(value) => handleFieldUpdate("countryOfResidence", value)}
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

              {formData.countryOfResidence === "Others" && (
                <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                  <Label htmlFor="otherCountryResidence">Please specify your country</Label>
                  <Input
                    id="otherCountryResidence"
                    value={formData.otherCountryResidence}
                    onChange={(e) => handleFieldUpdate("otherCountryResidence", e.target.value)}
                    placeholder="Enter your country of residence"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              )}
            </div>

            {/* US State and City */}
            {shouldShowStep("state") && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg animate-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isStepComplete("state") ? (
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
                    value={formData.stateOfResidence}
                    onChange={(e) => handleFieldUpdate("stateOfResidence", e.target.value)}
                    placeholder="California"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>

                {shouldShowStep("city") && (
                  <div className="space-y-2 animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-2">
                      {isStepComplete("city") ? (
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
                      value={formData.cityOfResidence}
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
      {shouldShowStep("occupation") && (
        <Card className="transition-all duration-500 ease-in-out animate-in slide-in-from-bottom-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              {isStepComplete("occupation") &&
              (formData.occupation !== "Student" ||
                (isStepComplete("school") &&
                  isStepComplete("qualification") &&
                  isStepComplete("courseOfStudy") &&
                  isStepComplete("graduationYear"))) &&
              ((formData.occupation !== "Working Professional" &&
                formData.occupation !== "Business Owner and Entrepreneur") ||
                (isStepComplete("industry") &&
                  (formData.industry !== "Banking and Finance" || isStepComplete("financialSector")) &&
                  isStepComplete("jobFunction"))) ? (
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
                value={formData.occupation}
                onValueChange={(value) => handleFieldUpdate("occupation", value)}
                className="space-y-2"
              >
                {["Student", "Working Professional", "Business Owner and Entrepreneur", "Others"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option.replace(/\s+/g, "")} />
                    <Label htmlFor={option.replace(/\s+/g, "")}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>

              {formData.occupation === "Others" && (
                <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                  <Label htmlFor="otherOccupation">Please specify your occupation</Label>
                  <Input
                    id="otherOccupation"
                    value={formData.otherOccupation}
                    onChange={(e) => handleFieldUpdate("otherOccupation", e.target.value)}
                    placeholder="Enter your occupation"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>
              )}
            </div>

            {/* Student-specific sections */}
            {shouldShowStep("school") && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg animate-in slide-in-from-bottom-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isStepComplete("school") ? (
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
                    value={formData.school}
                    onChange={(e) => handleFieldUpdate("school", e.target.value)}
                    placeholder="Enter your school or university name"
                    className="transition-all duration-200 focus:scale-105"
                  />
                </div>

                {shouldShowStep("qualification") && (
                  <div className="space-y-3 animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-2">
                      {isStepComplete("qualification") ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <Label className="font-medium">Qualification Currently Pursuing</Label>
                    </div>
                    <RadioGroup
                      value={formData.qualification}
                      onValueChange={(value) => handleFieldUpdate("qualification", value)}
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

                    {formData.qualification === "Others" && (
                      <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                        <Label htmlFor="otherQualification">Please specify your qualification</Label>
                        <Input
                          id="otherQualification"
                          value={formData.otherQualification}
                          onChange={(e) => handleFieldUpdate("otherQualification", e.target.value)}
                          placeholder="Enter your qualification"
                          className="transition-all duration-200 focus:scale-105"
                        />
                      </div>
                    )}
                  </div>
                )}

                {shouldShowStep("courseOfStudy") && (
                  <div className="space-y-3 animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-2">
                      {isStepComplete("courseOfStudy") ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <Label className="font-medium">Course of Study</Label>
                    </div>
                    <RadioGroup
                      value={formData.courseOfStudy}
                      onValueChange={(value) => handleFieldUpdate("courseOfStudy", value)}
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

                    {formData.courseOfStudy === "Others" && (
                      <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                        <Label htmlFor="otherCourseOfStudy">Please specify your course of study</Label>
                        <Input
                          id="otherCourseOfStudy"
                          value={formData.otherCourseOfStudy}
                          onChange={(e) => handleFieldUpdate("otherCourseOfStudy", e.target.value)}
                          placeholder="Enter your course of study"
                          className="transition-all duration-200 focus:scale-105"
                        />
                      </div>
                    )}
                  </div>
                )}

                {shouldShowStep("graduationYear") && (
                  <div className="space-y-2 animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-2">
                      {isStepComplete("graduationYear") ? (
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
                      value={formData.graduationYear}
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
            {shouldShowStep("industry") && (
              <div className="space-y-4 p-4 bg-purple-50 rounded-lg animate-in slide-in-from-bottom-2">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {isStepComplete("industry") ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                    <Label className="font-medium">Industry</Label>
                  </div>
                  <RadioGroup
                    value={formData.industry}
                    onValueChange={(value) => handleFieldUpdate("industry", value)}
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

                  {formData.industry === "Others" && (
                    <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                      <Label htmlFor="otherIndustry">Please specify your industry</Label>
                      <Input
                        id="otherIndustry"
                        value={formData.otherIndustry}
                        onChange={(e) => handleFieldUpdate("otherIndustry", e.target.value)}
                        placeholder="Enter your industry"
                        className="transition-all duration-200 focus:scale-105"
                      />
                    </div>
                  )}
                </div>

                {/* Financial Sector (only for Banking and Finance) */}
                {shouldShowStep("financialSector") && (
                  <div className="space-y-3 p-3 bg-blue-50 rounded-lg animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-2">
                      {isStepComplete("financialSector") ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <Label className="font-medium">Financial Sector</Label>
                    </div>
                    <RadioGroup
                      value={formData.financialSector}
                      onValueChange={(value) => handleFieldUpdate("financialSector", value)}
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
                {shouldShowStep("jobFunction") && (
                  <div className="space-y-3 animate-in slide-in-from-right-2">
                    <div className="flex items-center gap-2">
                      {isStepComplete("jobFunction") ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                      <Label className="font-medium">Job Function</Label>
                    </div>
                    <RadioGroup
                      value={formData.jobFunction}
                      onValueChange={(value) => handleFieldUpdate("jobFunction", value)}
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

                    {formData.jobFunction === "Others" && (
                      <div className="ml-6 space-y-2 animate-in slide-in-from-right-2">
                        <Label htmlFor="otherJobFunction">Please specify your job function</Label>
                        <Input
                          id="otherJobFunction"
                          value={formData.otherJobFunction}
                          onChange={(e) => handleFieldUpdate("otherJobFunction", e.target.value)}
                          placeholder="Enter your job function"
                          className="transition-all duration-200 focus:scale-105"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completion Section */}
      {shouldShowStep("complete") && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 animate-in slide-in-from-bottom-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <CardTitle className="text-green-800">Registration Complete!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-700">
              Thank you for joining the Singapore Global Network! Your registration has been completed successfully.
            </p>

            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold mb-2 text-green-800">Generated Schema:</h3>
              <pre className="text-xs text-left overflow-auto bg-gray-50 p-2 rounded text-gray-700">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">Submit Registration</Button>
              <Button
                variant="outline"
                onClick={() => dispatch(resetForm())}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                Start Over
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
