export type Role = 'Customer' | 'Driver' | 'Admin';

export type Screen =
  // Customer
  | 'Welcome'
  | 'Login'
  | 'Register'
  | 'ForgotPassword'
  | 'OTPVerification'
  | 'LivePhotoLogin'
  | 'PostLoginVerification'
  | 'ServiceSelection'
  | 'TripDetailsInput'
  | 'ScheduleRide'
  | 'CarRental'
  | 'AvailableCarsForRent'
  | 'CarRentDetails'
  | 'CarRentalConfirmation'
  | 'CompatibleShuttlesList'
  | 'ShuttleDriverDetails'
  | 'BookingConfirmation'
  | 'PaymentSelection'
  | 'PaymentProcessing'
  | 'TripTracking'
  | 'TripCompletionReceipt'
  | 'TripHistory'
  | 'TripDetailsView'
  | 'AccountProfile'
  | 'SavedPassengers'
  | 'EmergencyContacts'
  // Driver
  | 'DriverLogin'
  | 'DriverPasswordRecovery'
  | 'DriverRegistration'
  | 'DocumentUpload'
  | 'DriverDashboard'
  | 'ApplicationStatus'
  | 'TripRequest'
  | 'TripManagement'
  | 'DriverTripCompletion'
  | 'EarningsDashboard'
  // Admin
  | 'AdminLogin'
  | 'AdminPasswordRecovery'
  | 'AdminDashboard'
  | 'DriverManagement'
  | 'LiveOperations'
  | 'SystemConfig';
  
export interface NavigationProps {
    navigate: (screen: Screen) => void;
    logout?: () => void;
}