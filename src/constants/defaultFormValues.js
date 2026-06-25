/**
 * Default values for every field across all 8 steps.
 *
 * React Hook Form needs a complete default object so each field is controlled
 * from first render (no uncontrolled→controlled warnings) and so auto-save can
 * serialise/restore a consistent shape. Currency/number fields default to ''
 * (empty) so "required" validation fires; booleans default to false.
 */
export const defaultFormValues = {
  // Step 1 — Loan type & basics
  loanType: '',
  loanAmount: '',
  loanTenure: '',
  loanPurpose: '',
  referralCode: '',

  // Step 2 — Personal information
  fullName: '',
  dob: '',
  gender: '',
  maritalStatus: '',
  fatherName: '',
  motherName: '',
  email: '',
  mobile: '',
  altMobile: '',

  // Step 3 — KYC
  pan: '',
  panVerified: false,
  aadhaar: '',
  aadhaarVerified: false,
  aadhaarConsent: false,
  voterId: '',
  passport: '',

  // Step 4 — Address
  currentAddressLine1: '',
  currentAddressLine2: '',
  pinCode: '',
  city: '',
  state: '',
  residenceType: '',
  rentAmount: '',
  yearsAtCurrentAddress: '',
  previousAddressLine1: '',
  previousPinCode: '',
  sameAsPermanent: true,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentPinCode: '',
  permanentCity: '',
  permanentState: '',

  // Step 5 — Employment & income
  employmentType: '',
  companyName: '',
  designation: '',
  monthlyNetSalary: '',
  yearsOfExperience: '',
  businessName: '',
  businessType: '',
  annualTurnover: '',
  yearsInBusiness: '',
  monthlyIncome: '',
  gstNumber: '',
  officeAddress: '',

  // Step 6 — Co-applicant (conditional)
  coApplicantName: '',
  coApplicantRelationship: '',
  coApplicantPan: '',
  coApplicantPanVerified: false,
  coApplicantIncome: '',
  coApplicantConsent: false,
  coApplicantSignature: '',

  // Step 7 — Documents & e-signature
  documents: {}, // { [docId]: Array<{ name, size, type, dataUrl }> }
  eSignature: '', // base64 PNG data URL

  // Step 8 — Review & consents
  confirmAccurate: false,
  consentCredit: false,
  consentTerms: false,
  consentComms: false,
  affordabilityAck: false,
};
