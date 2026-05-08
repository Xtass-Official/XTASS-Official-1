// SCREEN 2 UPDATED ONLY — All other screens remain untouched. Removed duplicate contact icons from the Welcome/Login screen.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Screen, NavigationProps } from '../types';
import { Button, Input, Select, Header, BottomNav, FloatingActionButtons, ScreenContainer, Toast, Modal } from './shared/UI';
import { UserIcon, LockIcon, PhoneIcon, MapPinIcon, UsersIcon, BriefcaseIcon, CalendarIcon, ClockIcon, CreditCardIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, ChevronLeftIcon, EyeIcon, EyeOffIcon, MailIcon, CameraIcon, ChevronDownIcon, ShieldIcon, GoogleIcon, AppleIcon, UploadCloudIcon, CarIcon, BabyIcon, BusIcon, SnowflakeIcon, FileTextIcon, StarIcon, GlobeIcon, BookingIcon, SettingsIcon, SearchIcon } from './Icons';

// Type for booking details from the landing page form
interface BookingDetails {
  rideType: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  pickupDateRental?: string;
  pickupTimeRental?: string;
  returnDateRental?: string;
  returnTimeRental?: string;
}

interface CustomerAppProps extends NavigationProps {
  screen: Screen;
  initialBookingDetails: BookingDetails | null;
  clearInitialBookingDetails: () => void;
}

// Define the Car type for better type safety
interface Car {
  class: string;
  driver: string;
  price: number;
  seed: string;
  description: string;
}

// Define Vehicle Class Info type
interface VehicleClassInfo {
    name: string;
    baseRate: number;
}

// Define Rental Details type
interface RentalDetails {
  pickupDateTime: string;
  returnDateTime: string;
  passengers: string;
  luggage: string;
  pickupLocation: string;
  dropoffLocation: string;
  renterAge: string;
  rentingPurpose: string;
}

const validateAndFormatDate = (value: string, previousValue: string): { newValue: string; error: string } => {
    // If user is backspacing from a locked, valid date, unlock the year.
    if (previousValue.endsWith('/2025') && value.length < previousValue.length) {
        value = value.slice(0, 5); // back to DD/MM
    }

    // Sanitize input: allow only numbers and forward slashes, then reformat.
    let digits = value.replace(/\D/g, '');
    let formatted = digits.slice(0, 2);
    if (digits.length > 2) {
        formatted += '/' + digits.slice(2, 4);
    }
    
    // Now validate
    const parts = formatted.split('/');
    const dayStr = parts[0];
    const monthStr = parts[1];
    let error = '';

    if (dayStr && dayStr.length === 2) {
        const day = parseInt(dayStr, 10);
        if (day === 0) error = 'Day cannot be 00.';
        else if (day > 31) error = 'Day must be between 01 and 31.';
    }

    if (monthStr && monthStr.length === 2) {
        const month = parseInt(monthStr, 10);
        if (month === 0) error = 'Month cannot be 00.';
        else if (month > 12) error = 'Month must be between 01 and 12.';
    }

    // Specific month/day validation for 2025 (a non-leap year)
    if (!error && dayStr?.length === 2 && monthStr?.length === 2) {
        const day = parseInt(dayStr, 10);
        const month = parseInt(monthStr, 10);
        const daysInMonths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (day > 0 && month > 0 && month <= 12 && day > daysInMonths[month]) {
            const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            error = `${monthNames[month]} has ${daysInMonths[month]} days in 2025.`;
        }
    }
    
    // If there's an error, the year is "unlocked" (not appended).
    // If no error and DD/MM is complete, lock the year.
    if (!error && formatted.length === 5) {
        return { newValue: formatted + '/2025', error: '' };
    }
    
    // Otherwise, return the formatted DD/MM part and any error found.
    return { newValue: formatted, error };
};

const getCurrentDate = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    // Forcing 2025 to match the application's current date logic
    return `${day}/${month}/2025`;
};

const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
};


function usePrevious(value: Screen): Screen | undefined {
    const ref = useRef<Screen | undefined>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({ screen, navigate, logout, initialBookingDetails, clearInitialBookingDetails }) => {
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [otpOrigin, setOtpOrigin] = useState<Screen>('Register');
  const [phoneForOTP, setPhoneForOTP] = useState({ phone: '241234567', code: '+233' });
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [selectedVehicleClassInfo, setSelectedVehicleClassInfo] = useState<VehicleClassInfo | null>(null);
  const [rentalDuration, setRentalDuration] = useState(0);
  const [currentFlow, setCurrentFlow] = useState<'instant' | 'schedule' | 'rental' | null>(null);
  const [shuttleFlowOrigin, setShuttleFlowOrigin] = useState<Screen>('TripDetailsInput');
  const [rentalDetails, setRentalDetails] = useState<RentalDetails | null>(null);
  const previousScreen = usePrevious(screen);
  const [rideDetails, setRideDetails] = useState<BookingDetails | null>(null);

  useEffect(() => {
    // If user is logged in and lands on service selection, check for pre-filled data from landing page
    if (screen === 'ServiceSelection' && initialBookingDetails) {
      setRideDetails(initialBookingDetails);
      if (initialBookingDetails.rideType === 'Instant Ride') {
        navigate('TripDetailsInput');
      } else if (initialBookingDetails.rideType === 'Scheduled Ride') {
        navigate('ScheduleRide');
      } else if (initialBookingDetails.rideType === 'Car Rental') {
        navigate('CarRental');
      }
      clearInitialBookingDetails();
    }
  }, [screen, initialBookingDetails, navigate, clearInitialBookingDetails]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };
    
  const renderScreen = () => {
    switch (screen) {
      case 'Login':
        return <AuthScreen navigate={navigate} isLogin logout={logout} setOtpOrigin={setOtpOrigin} />;
      case 'Register':
        return <AuthScreen 
            navigate={navigate}
            isLogin={false} 
            logout={logout}
            setOtpOrigin={setOtpOrigin}
        />;
      case 'ForgotPassword':
          return <ForgotPasswordScreen 
              navigate={(nextScreen: Screen) => {
                  if (nextScreen === 'OTPVerification') {
                      setOtpOrigin('ForgotPassword');
                  }
                  navigate(nextScreen);
              }}
              setPhoneForOTP={setPhoneForOTP}
          />;
      case 'OTPVerification':
          return <OTPScreen 
            navigate={navigate} 
            onBack={() => navigate(otpOrigin)} 
            showToast={(msg) => showToast(msg)}
            phoneDetails={phoneForOTP}
          />;
      case 'LivePhotoLogin':
          return <LivePhotoLoginScreen navigate={navigate} />;
      case 'PostLoginVerification':
          return <PostLoginVerificationScreen navigate={navigate} logout={logout} />;
      case 'ServiceSelection':
          return <ServiceSelectionScreen navigate={navigate} logout={logout} setFlow={setCurrentFlow} />;
      case 'TripDetailsInput':
          return <TripDetailsInputScreen 
              navigate={(nextScreen: Screen) => {
                  if (nextScreen === 'AvailableShuttles') {
                      setCurrentFlow('instant');
                      setShuttleFlowOrigin('TripDetailsInput');
                  }
                  navigate(nextScreen);
              }} 
              setVehicleTypeForFilter={setSelectedVehicleClassInfo}
              setRideDetails={setRideDetails}
              initialDetails={rideDetails}
          />;
      case 'ScheduleRide':
          return <ScheduleRideScreen 
              navigate={(nextScreen: Screen) => {
                  if (nextScreen === 'AvailableShuttles') {
                      setCurrentFlow('schedule');
                      setShuttleFlowOrigin('ScheduleRide');
                  }
                  navigate(nextScreen);
              }} 
              setVehicleTypeForFilter={setSelectedVehicleClassInfo}
              setRideDetails={setRideDetails}
              initialDetails={rideDetails}
          />;
      case 'CarRental':
          return <CarRentalScreen 
              navigate={(nextScreen: Screen) => {
                  if (nextScreen === 'AvailableShuttles') {
                      setCurrentFlow('rental');
                      setShuttleFlowOrigin('CarRental');
                  }
                  navigate(nextScreen);
              }} 
              setRentalDuration={setRentalDuration} 
              setVehicleTypeForFilter={setSelectedVehicleClassInfo} 
              setRentalDetails={setRentalDetails} 
              initialDetails={rideDetails} 
          />;
      case 'AvailableShuttles':
          return <AvailableShuttlesScreen 
              navigate={navigate} 
              onBack={() => navigate(currentFlow === 'rental' ? 'CarRental' : shuttleFlowOrigin)} 
              selectedClassInfo={selectedVehicleClassInfo} 
              flow={currentFlow} 
              onSelect={(vehicle) => {
                  setSelectedVehicle(vehicle);
                  if (currentFlow === 'rental') {
                      navigate('CarRentDetails');
                  } else {
                      navigate('ShuttleDriverDetails');
                  }
              }} 
          />;
      case 'AvailableCarsForRent':
          return <AvailableCarsForRentScreen navigate={navigate} onBack={() => navigate('CarRental')} onCarSelect={setSelectedVehicle} selectedClassInfo={selectedVehicleClassInfo} />;
      case 'CarRentDetails':
          return <CarRentDetailsScreen navigate={navigate} car={selectedVehicle} onBack={() => navigate('AvailableShuttles')} rentalDuration={rentalDuration} />;
      case 'CarRentalConfirmation':
          return <CarRentalConfirmationScreen navigate={navigate} car={selectedVehicle} rentalDetails={rentalDetails} rentalDuration={rentalDuration} onBack={() => navigate('CarRentDetails')} />;
      case 'ShuttleDriverDetails':
          return <ShuttleDriverDetailsScreen navigate={navigate} shuttle={selectedVehicle} />;
      case 'BookingConfirmation':
          return <BookingConfirmationScreen navigate={navigate} shuttle={selectedVehicle} rideDetails={rideDetails} />;
      case 'PaymentSelection':
          const paymentBackTarget = currentFlow === 'rental' ? 'CarRentalConfirmation' : 'BookingConfirmation';
// FIX: Resolve "Cannot find name" error by defining the component.
          return <PaymentSelectionScreen navigate={navigate} onBack={() => navigate(paymentBackTarget)} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'PaymentProcessing':
          return <PaymentProcessingScreen navigate={navigate} showToast={showToast} flow={currentFlow} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'TripTracking':
          return <TripTrackingScreen navigate={navigate} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'TripCompletionReceipt':
          return <TripCompletionReceiptScreen navigate={navigate} flow={currentFlow} car={selectedVehicle} duration={rentalDuration} showToast={showToast} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'TripHistory':
          return <TripHistoryScreen navigate={navigate} />;
      case 'MyBookings':
          return <MyBookingsScreen navigate={navigate} />;
      case 'MyBookingsInstant':
          return <MyBookingsScreen navigate={navigate} defaultFilter="Instant" />;
      case 'MyBookingsSchedule':
          return <MyBookingsScreen navigate={navigate} defaultFilter="Schedule" />;
      case 'MyBookingsRental':
          return <MyBookingsScreen navigate={navigate} defaultFilter="Rental" />;
      case 'TripDetailsView':
          return <TripDetailsViewScreen navigate={navigate} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'AccountProfile':
          return <AccountProfileScreen navigate={navigate} logout={logout} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'SavedPassengers':
          return <SavedPassengersScreen navigate={navigate} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'EmergencyContacts':
          return <EmergencyContactsScreen navigate={navigate} />;
      default:
        return <AuthScreen navigate={navigate} isLogin logout={logout} />;
    }
  };
  
  const showNav = ![
      'Login', 'Register', 'ForgotPassword', 'OTPVerification', 'LivePhotoLogin', 'PostLoginVerification'
  ].includes(screen);

  return (
    <div className="relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {renderScreen()}
      {showNav && <BottomNav navigate={navigate} activeScreen={screen} currentFlow={currentFlow} />}
      {showNav && <FloatingActionButtons />}
    </div>
  );
};

// --- Screen Components ---

const PasswordInput: React.FC<{
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    showStrength?: boolean;
    getStrengthColor?: () => string;
    passwordStrength?: number;
}> = ({ id, label, value, onChange, placeholder="••••••••", showStrength, getStrengthColor, passwordStrength }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    id={id}
                    type={showPassword ? "text" : "password"}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
            </div>
            {showStrength && getStrengthColor && passwordStrength !== undefined && (
                 <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded">
                        <div className={`h-2 rounded transition-all duration-300 ${getStrengthColor()}`} style={{width: `${passwordStrength * 20}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Password strength indicator</p>
                </div>
            )}
        </div>
    );
};

const countryCodes = [
    { code: '+233', name: 'GH' },
    { code: '+234', name: 'NG' },
    { code: '+1', name: 'US' },
    { code: '+44', name: 'UK' },
];

const AuthScreen: React.FC<{ navigate: (s: Screen) => void, isLogin: boolean, logout?: () => void, setOtpOrigin?: (s: Screen) => void }> = ({ navigate, isLogin, logout, setOtpOrigin }) => {
    const title = isLogin ? "Welcome to XTASS" : "Create Account";
    const subTitle = isLogin ? "Sign in to your account" : "Let's get you started";
    
    // State for multi-step registration
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        countryCode: '+233',
        phone: '241234567',
        email: 'customer@xtass.com',
        password: '',
        confirmPassword: '',
        agreedToTerms: false,
    });
    const [errors, setErrors] = useState({ email: '', passwordMatch: '' });
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // State for live photo capture
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateEmail = (email: string) => {
        if (email && !/\S+@\S+\.\S+/.test(email)) {
            setErrors(prev => ({ ...prev, email: 'Invalid email format.' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    useEffect(() => {
        if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
            setErrors(prev => ({ ...prev, passwordMatch: 'Passwords do not match.' }));
        } else {
            setErrors(prev => ({ ...prev, passwordMatch: '' }));
        }
    }, [formData.password, formData.confirmPassword]);
    
    const checkPasswordStrength = useCallback((pass: string) => {
        let score = 0;
        if (pass.length > 8) score++;
        if (pass.match(/[a-z]/)) score++;
        if (pass.match(/[A-Z]/)) score++;
        if (pass.match(/[0-9]/)) score++;
        if (pass.match(/[^a-zA-Z0-9]/)) score++;
        setPasswordStrength(score);
        handleInputChange('password', pass);
    }, []);

    const getStrengthColor = () => {
        switch (passwordStrength) {
            case 0: case 1: return 'bg-red-500';
            case 2: return 'bg-orange-500';
            case 3: return 'bg-yellow-500';
            case 4: return 'bg-blue-500';
            case 5: return 'bg-green-500';
            default: return 'bg-gray-200';
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 5));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));
    
    // Camera setup for registration step
    useEffect(() => {
        let stream: MediaStream | null = null;
        
        async function setupCamera() {
            if (step === 4 && !capturedImage) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    // Ignore or handle silently
                    alert("Camera access is required for this step. Please grant permission and try again.");
                    setStep(3); // Go back to previous step
                }
            }
        }

        setupCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [step, capturedImage]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                setCapturedImage(dataUrl);
                setIsVerifying(true);
                // Simulate verification
                setTimeout(() => {
                    setIsVerifying(false);
                }, 1500);

                // Stop camera stream
                if (video.srcObject) {
                    (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                }
            }
        }
    };
    
    const retakePhoto = () => {
        setCapturedImage(null);
        setIsVerifying(false);
    };


    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 overflow-x-hidden">
            <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Terms & Conditions">
                <div className="space-y-4 text-sm text-gray-600">
                    <p>Welcome to XTASS. These terms and conditions outline the rules and regulations for the use of our services.</p>
                    <p>By accessing this app we assume you accept these terms and conditions. Do not continue to use XTASS if you do not agree to take all of the terms and conditions stated on this page.</p>
                    <h4 className="font-semibold text-gray-800">1. Bookings</h4>
                    <p>All bookings are subject to vehicle availability. We reserve the right to decline any booking at our discretion.</p>
                    <h4 className="font-semibold text-gray-800">2. Payments</h4>
                    <p>Payments must be made in full at the time of booking through our available payment gateways. All payments are processed securely.</p>
                    <h4 className="font-semibold text-gray-800">3. Cancellations and Refunds</h4>
                    <p>Cancellations made 24 hours before the scheduled trip are eligible for a full refund. Cancellations made less than 24 hours may incur a fee.</p>
                </div>
            </Modal>
            
            <button onClick={() => isLogin && logout ? logout() : navigate('Login')} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-200 z-10 transition-colors duration-200" aria-label="Go back">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>

            <div className="w-full max-w-[100%] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[480px] bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-xl transition-all duration-500 my-auto">
                <h2 className="text-3xl font-bold font-display text-gray-900 text-center tracking-tight mb-2">{title}</h2>
                <p className="text-center text-gray-500 mb-8 text-base">{subTitle}</p>
                
                {isLogin ? (
                    <>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('PostLoginVerification'); }}>
                            <Input id="email-phone" label="Email or Phone Number" type="text" placeholder="customer@xtass.com" icon={<MailIcon className="w-5 h-5 text-gray-400" />} defaultValue="customer@xtass.com" />
                            <PasswordInput id="password-login" label="Password" value="password123" onChange={() => {}} />
                            <div className="pt-2">
                                <Button type="submit">Login</Button>
                            </div>
                        </form>
                        <div className="flex items-center justify-center my-4">
                            <div className="border-t border-gray-300 flex-grow"></div>
                            <span className="px-4 text-gray-500 text-sm">OR</span>
                            <div className="border-t border-gray-300 flex-grow"></div>
                        </div>
                        <div className="space-y-3">
                            <button onClick={() => navigate('PostLoginVerification')} className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[48px] transition-colors duration-200">
                                <GoogleIcon className="w-5 h-5"/>
                                <span>Continue with Google</span>
                            </button>
                            <button onClick={() => navigate('PostLoginVerification')} className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[48px] transition-colors duration-200">
                                <AppleIcon className="w-5 h-5 text-black"/>
                                <span>Continue with Apple ID</span>
                            </button>
                             <button onClick={() => { if(setOtpOrigin) setOtpOrigin('Login'); navigate('OTPVerification'); }} className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[48px] transition-colors duration-200">
                                 <PhoneIcon className="w-5 h-5 text-gray-600"/>
                                 <span>Continue with Phone OTP</span>
                             </button>
                             <button onClick={() => { if(setOtpOrigin) setOtpOrigin('Login'); navigate('OTPVerification'); }} className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[48px] transition-colors duration-200">
                                 <MailIcon className="w-5 h-5 text-gray-600"/>
                                 <span>Continue with Email OTP</span>
                             </button>
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            {[1, 2, 3, 4, 5].map(num => (
                                <React.Fragment key={num}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${step >= num ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {num}
                                    </div>
                                    {num < 5 && <div className={`flex-1 h-1 mx-2 transition-colors duration-300 ${step > num ? 'bg-primary' : 'bg-gray-200'}`}></div>}
                                </React.Fragment>
                            ))}
                        </div>
                        
                        {step === 1 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">Enter your phone number</h3>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="flex items-center">
                                    <div className="relative">
                                        <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-1 h-full bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3">
                                            <span>{formData.countryCode}</span>
                                            <ChevronDownIcon className="w-4 h-4 text-gray-600"/>
                                        </button>
                                        {isDropdownOpen && (
                                            <div className="absolute bottom-full mb-1 w-24 bg-white border rounded-md shadow-lg z-10">
                                                {countryCodes.map(c => (
                                                    <div key={c.code} onClick={() => { handleInputChange('countryCode', c.code); setIsDropdownOpen(false); }} className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">{c.name} ({c.code})</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input id="phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="block w-full px-4 py-3 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" required />
                                </div>
                            </div>
                        )}
                        {step === 2 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">Enter your email</h3>
                                <Input id="email" label="Email" type="email" placeholder="you@example.com" value={formData.email} onChange={e => { handleInputChange('email', e.target.value); validateEmail(e.target.value); }} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        )}
                        {step === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold mb-2 text-center">Create your password</h3>
                                <PasswordInput id="password" label="Password" value={formData.password} onChange={e => checkPasswordStrength(e.target.value)} showStrength getStrengthColor={getStrengthColor} passwordStrength={passwordStrength}/>
                                <PasswordInput id="confirmPassword" label="Confirm Password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} />
                                {errors.passwordMatch && <p className="text-red-500 text-xs mt-1">{errors.passwordMatch}</p>}
                            </div>
                        )}
                        {step === 4 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">Live Photo Verification</h3>
                                <p className="text-center text-sm text-gray-500 mb-4">Position your face in the frame.</p>
                                <div className="w-full aspect-square bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
                                    <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`}></video>
                                    <canvas ref={canvasRef} className="hidden"></canvas>
                                    {capturedImage && <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />}
                                    
                                    {isVerifying && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                                            <div className="w-12 h-12 border-4 border-t-white border-gray-500 rounded-full animate-spin"></div>
                                            <p className="text-white font-semibold mt-2">Verifying...</p>
                                        </div>
                                    )}
                                    {!isVerifying && capturedImage && (
                                         <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                                            <CheckCircleIcon className="w-16 h-16 text-white mb-2" />
                                            <p className="text-white font-semibold">Photo Verified!</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4">
                                    {!capturedImage ? (
                                        <Button type="button" onClick={handleCapture}>Capture Photo</Button>
                                    ) : (
                                        <Button type="button" variant="secondary" onClick={retakePhoto}>Retake Photo</Button>
                                    )}
                                </div>
                            </div>
                        )}
                        {step === 5 && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">Agree to our terms</h3>
                                <div className="flex items-start p-3 bg-gray-50 rounded-md">
                                    <input type="checkbox" id="terms" checked={formData.agreedToTerms} onChange={e => handleInputChange('agreedToTerms', e.target.checked)} className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded mt-0.5" />
                                    <label htmlFor="terms" className="ml-3 text-sm text-gray-600">I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="font-medium text-primary hover:underline">Terms and Conditions</button>.</label>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-2 pt-2">
                            {step > 1 && <Button type="button" variant="secondary" onClick={prevStep}>Back</Button>}
                            {step < 5 && <Button type="button" onClick={nextStep} disabled={(step === 3 && (!!errors.passwordMatch || !formData.password)) || (step === 4 && (!capturedImage || isVerifying))}>Next</Button>}
                            {step === 5 && <Button type="button" onClick={() => navigate('OTPVerification')} disabled={!formData.agreedToTerms} className="disabled:bg-gray-400 disabled:cursor-not-allowed hover:animate-pulse">Create Account</Button>}
                        </div>
                         {step === 2 && <button onClick={nextStep} className="w-full text-center text-primary font-medium mt-2 text-sm hover:underline">Skip for now</button>}
                    </div>
                )}

                <div className="text-sm text-center mt-4">
                    {isLogin ? (
                        <>
                            <a href="#" onClick={(e) => { e.preventDefault(); navigate('ForgotPassword'); }} className="font-medium text-primary hover:text-primary-hover">Forgot password?</a>
                            <p className="mt-2 text-gray-600">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); navigate('Register'); }} className="font-medium text-primary hover:text-primary-hover">Register</a></p>
                        </>
                    ) : (
                        <p className="text-gray-600">Already have an account? <a href="#" onClick={(e) => {e.preventDefault(); navigate('Login')}} className="font-medium text-primary hover:text-primary-hover">Log in</a></p>
                    )}
                </div>
            </div>
        </div>
    );
};

const ForgotPasswordScreen: React.FC<NavigationProps & { setPhoneForOTP: (details: {phone: string, code: string}) => void }> = ({ navigate, setPhoneForOTP }) => {
    const [countryCode, setCountryCode] = useState('+233');
    const [phone, setPhone] = useState('241234567');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    return (
        <div className="relative flex flex-col items-center justify-start md:justify-center min-h-screen bg-gray-100 p-4 md:p-8 overflow-x-hidden">
            <button onClick={() => navigate('Login')} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-200 z-10" aria-label="Back to Login">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <div className="w-full max-w-[98%] sm:max-w-[90%] md:max-w-md lg:max-w-sm bg-white p-6 sm:p-8 md:p-10 lg:p-8 rounded-xl shadow-lg text-center mt-12 md:mt-0 mb-8 md:mb-0 transition-all duration-500">
                <h2 className="text-2xl font-bold font-display text-gray-900">Forgot Password</h2>
                <p className="text-gray-500 mt-2 mb-6">Enter your phone number to receive a reset code.</p>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setPhoneForOTP({ phone, code: countryCode }); navigate('OTPVerification'); }}>
                    <div>
                        <label htmlFor="phone-reset" className="block text-sm font-medium text-gray-700 mb-1 text-left">Phone Number</label>
                        <div className="flex items-center">
                            <div className="relative">
                                <button type="button" onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-1 h-full bg-gray-100 border border-r-0 border-gray-300 rounded-l-md px-3">
                                    <span>{countryCode}</span>
                                    <ChevronDownIcon className="w-4 h-4 text-gray-600"/>
                                </button>
                                {isDropdownOpen && (
                                    <div className="absolute bottom-full mb-1 w-24 bg-white border rounded-md shadow-lg z-10">
                                        {countryCodes.map(c => (
                                            <div key={c.code} onClick={() => { setCountryCode(c.code); setIsDropdownOpen(false); }} className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">{c.name} ({c.code})</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input
                                id="phone-reset"
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                placeholder="24 123 4567"
                                required
                            />
                        </div>
                    </div>
                    <div className="pt-2">
                        <Button type="submit">Send Code</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const OTPScreen: React.FC<{ navigate: (s: Screen) => void, onBack: () => void, showToast: (msg: string) => void, phoneDetails: { phone: string; code: string } }> = ({ navigate, onBack, showToast, phoneDetails }) => {
    const [otp, setOtp] = useState<string[]>(['1', '2', '3', '4', '5', '6']);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timerId = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        }
    }, [countdown]);

    useEffect(() => {
        if (!isVerifying) {
            inputRefs.current[0]?.focus();
        }
    }, [isVerifying]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.nextSibling && element.value) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    
    const handleVerify = () => {
        setMessage(null);
        setIsVerifying(true);
        const code = otp.join("");

        setTimeout(() => {
            if (code === "235777" || code === "123456") {
                setMessage({ text: 'Redirecting you to the login page…', type: 'success' });
                setTimeout(() => {
                    navigate('Login');
                }, 2500);
            } else {
                setMessage({ text: '❌ The code you entered is incorrect or has expired. Please request a new one.', type: 'error' });
                setIsVerifying(false);
            }
        }, 1500);
    };

    const handleResend = () => {
        if (countdown > 0) return;
        showToast("A new code has been sent.");
        setOtp(new Array(6).fill(""));
        setMessage(null);
        setCountdown(60);
        inputRefs.current[0]?.focus();
    };

    const maskPhoneNumber = (code: string, phone: string) => {
        const lastFour = phone.slice(-4);
        return `${code} *** *** ${lastFour}`;
    };

    const isSuccess = message?.type === 'success';
    const messageColor = message?.type === 'error' ? 'text-red-600' : '';

    return (
        <div className="relative flex flex-col items-center justify-start md:justify-center min-h-screen bg-gray-50 p-4 md:p-8 overflow-x-hidden">
            <button onClick={onBack} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-100 z-10" aria-label="Go back">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
             <div className="text-center mb-6 mt-12 md:mt-0">
                <h1 className="text-3xl font-display font-bold text-primary">XTASS</h1>
            </div>
            <div className="w-full max-w-[98%] sm:max-w-[90%] md:max-w-md lg:max-w-sm bg-white p-6 sm:p-8 md:p-10 lg:p-8 rounded-2xl shadow-xl text-center mb-8 md:mb-0 transition-all duration-500">
                {isSuccess ? (
                    <div className="animate-fade-in">
                        <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto animate-pulse" />
                        <h2 className="text-2xl font-bold font-display text-gray-900 mt-4">Verification Successful!</h2>
                        <p className="text-gray-600 mt-2">{message.text}</p>
                    </div>
                ) : (
                    <>
                        <ShieldIcon className="w-16 h-16 text-primary mx-auto mb-4" />
                        <h2 className="text-2xl font-bold font-display text-gray-900">OTP Verification</h2>
                        <p className="text-gray-500 mt-2 mb-4">Enter the code sent to</p>
                        <div className="flex items-center justify-center font-semibold text-gray-800 bg-gray-100 py-2 px-4 rounded-lg mb-6">
                           <span>{maskPhoneNumber(phoneDetails.code, phoneDetails.phone)}</span>
                           <button onClick={onBack} className="ml-3 text-primary text-sm font-medium hover:underline">Edit</button>
                        </div>
                        
                        <div className="flex justify-center space-x-2 mb-6">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    maxLength={1}
                                    ref={el => { inputRefs.current[index] = el; }}
                                    className="w-12 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition"
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>

                        {message && (
                            <div className={`mt-4 text-sm font-semibold ${messageColor}`}>
                                {message.text}
                            </div>
                        )}
                        
                        <div className="mt-4">
                            <Button onClick={handleVerify} disabled={isVerifying || otp.join("").length !== 6}>
                                {isVerifying ? 'Verifying...' : 'Verify Account'}
                            </Button>
                        </div>
                        
                        <div className="mt-6 text-sm text-center text-gray-600">
                           <p>Didn't receive the code?</p>
                           <button 
                                onClick={handleResend} 
                                disabled={countdown > 0 || isVerifying}
                                className="font-medium text-primary hover:text-primary-hover disabled:text-gray-400 disabled:cursor-not-allowed"
                           >
                                {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                           </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const LivePhotoLoginScreen: React.FC<NavigationProps> = ({ navigate }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [captured, setCaptured] = React.useState(false);

    useEffect(() => {
        let stream: MediaStream;
        async function setupCamera() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    // Ignore or handle silently
                    alert("Could not access the camera. Please ensure permissions are granted.");
                    navigate('Login');
                }
            }
        }
        setupCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [navigate]);

    const handleCapture = () => {
        setCaptured(true);
        // Simulate login process
        setTimeout(() => {
            navigate('PostLoginVerification');
        }, 1500);
    };

    return (
        <ScreenContainer>
            <Header title="Live Photo Login" onBack={() => navigate('Login')} />
            <div className="p-4 flex flex-col items-center">
                <p className="text-gray-600 text-center mb-4">Position your face within the frame and capture a photo to log in.</p>
                <div className="w-full aspect-square bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                    {captured && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                            <CheckCircleIcon className="w-16 h-16 text-white mb-2" />
                            <p className="text-white font-semibold">Verifying...</p>
                        </div>
                    )}
                </div>
                <div className="mt-6 w-full max-w-xs">
                     <Button onClick={handleCapture} disabled={captured}>
                        {captured ? 'Verifying...' : 'Capture Photo & Login'}
                    </Button>
                </div>
            </div>
        </ScreenContainer>
    );
};

const PostLoginVerificationScreen: React.FC<NavigationProps> = ({ navigate, logout }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [captured, setCaptured] = React.useState(false);

    useEffect(() => {
        let stream: MediaStream;
        async function setupCamera() {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    // Ignore or handle silently
                    if(logout) logout();
                }
            }
        }
        setupCamera();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [logout]);

    const handleCapture = () => {
        setCaptured(true);
        // Simulate verification process
        setTimeout(() => {
            navigate('ServiceSelection');
        }, 1500);
    };

    return (
        <ScreenContainer>
            <Header title="Security Verification" onBack={logout} />
            <div className="p-4 flex flex-col items-center">
                <p className="text-gray-600 text-center mb-4">For your security, please capture a live photo to complete your login.</p>
                <div className="w-full aspect-square bg-black rounded-lg overflow-hidden relative flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                    {captured && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center">
                            <CheckCircleIcon className="w-16 h-16 text-white mb-2" />
                            <p className="text-white font-semibold">Verified! Redirecting...</p>
                        </div>
                    )}
                </div>
                <div className="mt-6 w-full max-w-xs">
                     <Button onClick={handleCapture} disabled={captured}>
                        {captured ? 'Verifying...' : 'Capture Photo'}
                    </Button>
                </div>
            </div>
        </ScreenContainer>
    );
};


const ServiceSelectionScreen: React.FC<NavigationProps & { setFlow: (flow: 'instant' | 'schedule' | 'rental') => void }> = ({ navigate, logout, setFlow }) => (
    <ScreenContainer>
        <Header title="Book a Ride" onBack={logout} />
        <div className="p-4 space-y-4">
            <div onClick={() => { setFlow('instant'); navigate('TripDetailsInput'); }} className="bg-primary text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-primary-hover transition-colors">
                <h3 className="text-2xl font-display font-bold">Instant Ride</h3>
                <p className="mt-1">Book the next available shuttle.</p>
            </div>
            <div onClick={() => { setFlow('schedule'); navigate('ScheduleRide'); }} className="bg-accent text-[#660032] p-6 rounded-lg shadow-lg cursor-pointer hover:bg-yellow-400 transition-colors">
                 <h3 className="text-2xl font-display font-bold">Schedule Ride</h3>
                <p className="mt-1">Plan your trip in advance.</p>
            </div>
            <div onClick={() => { setFlow('rental'); navigate('CarRental'); }} style={{backgroundColor: '#660032'}} className="text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-opacity-90 transition-all">
                <h3 className="text-2xl font-display font-bold">Car Rental</h3>
                <p className="mt-1">Your personal ride for the day.</p>
            </div>
        </div>
    </ScreenContainer>
);

interface TripDetailsInputScreenProps extends NavigationProps {
  setVehicleTypeForFilter: (info: VehicleClassInfo | null) => void;
  setRideDetails: (details: BookingDetails | null) => void;
  initialDetails: BookingDetails | null;
}
const TripDetailsInputScreen: React.FC<TripDetailsInputScreenProps> = ({ navigate, setVehicleTypeForFilter, setRideDetails, initialDetails }) => {
    const [pickup, setPickup] = useState(initialDetails?.pickup || "");
    const [destination, setDestination] = useState(initialDetails?.dropoff || "");
    const [date, setDate] = useState(getCurrentDate());
    const [time, setTime] = useState(getCurrentTime());
    const [passengers, setPassengers] = useState(initialDetails?.passengers || "1");
    const [bookerAge, setBookerAge] = useState("");
    const [luggage, setLuggage] = useState("");
    const [childSeat, setChildSeat] = useState(false);
    const [wheelchairAccess, setWheelchairAccess] = useState(false);
    const [vehicleType, setVehicleType] = useState<string | null>('Premium Class');
    const [dateError, setDateError] = useState('');
    const [documentType, setDocumentType] = useState('');
    const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [uploadedDocument, setUploadedDocument] = useState<File | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const vehicleTypes = {
        'Premium Class': { name: 'Premium Class', icon: <CarIcon/>, baseRate: 200 },
        'Business Class': { name: 'Business Class', icon: <CarIcon/>, baseRate: 150 },
        'Economy Class': { name: 'Economy Class', icon: <CarIcon/>, baseRate: 80 },
        'Basic Class': { name: 'Basic Class', icon: <CarIcon/>, baseRate: 50 },
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { newValue, error } = validateAndFormatDate(e.target.value, date);
        setDate(newValue);
        setDateError(error);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setUploadedDocument(event.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    useEffect(() => {
        let stream: MediaStream | null = null;
        const setupCamera = async () => {
            if (isCaptureModalOpen && !capturedImage) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    // Ignore or handle silently
                    alert("Camera access is required. Please grant permission.");
                    setIsCaptureModalOpen(false);
                }
            }
        };
        setupCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCaptureModalOpen, capturedImage]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                setCapturedImage(dataUrl);
                if (video.srcObject) {
                    (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
                }
            }
        }
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };
    
    return (
        <ScreenContainer>
            <Header title="Instant Ride" onBack={() => navigate('ServiceSelection')} onForward={() => {
                if (pickup && destination && passengers && date.length === 10 && !dateError && time) {
                    setRideDetails({
                        rideType: 'Instant Ride',
                        pickup,
                        dropoff: destination,
                        date,
                        time,
                        passengers
                    });
                    setVehicleTypeForFilter(vehicleTypes[vehicleType as keyof typeof vehicleTypes] || null);
                    navigate('AvailableShuttles');
                }
            }} />
            <div className="p-4 space-y-4">
                <div>
                    <h3 className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.values(vehicleTypes).map(v => (
                            <button key={v.name} onClick={() => setVehicleType(v.name)} className={`p-3 border rounded-lg text-center transition-colors ${vehicleType === v.name ? 'bg-primary text-white border-primary' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                {React.cloneElement(v.icon, {className: 'w-8 h-8 mx-auto mb-1'})}
                                <span className="text-sm font-semibold">{v.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <Input id="pickup" label="Pick Up Location" type="text" placeholder="Kotoka International Airport" value={pickup} onChange={e => setPickup(e.target.value)} icon={<MapPinIcon className="w-5 h-5 text-gray-400" />} />
                <Input id="destination" label="Drop Off Location" type="text" placeholder="Enter your destination" value={destination} onChange={e => setDestination(e.target.value)} icon={<MapPinIcon className="w-5 h-5 text-gray-400" />} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Input id="date" label="Select Date (DD/MM/2025)" type="tel" placeholder="DD/MM/2025" value={date} onChange={handleDateChange} icon={<CalendarIcon className="w-5 h-5 text-gray-400" />} maxLength={10} />
                        {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
                    </div>
                    <Input id="time" label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} icon={<ClockIcon className="w-5 h-5 text-gray-400" />} />
                </div>

                <Input id="passengers" label="Passengers" type="number" placeholder="1" value={passengers} onChange={e => setPassengers(e.target.value)} icon={<UsersIcon className="w-5 h-5 text-gray-400" />} />
                <Input id="bookerAge" label="Booker's Age (Optional)" type="number" placeholder="Enter age" value={bookerAge} onChange={e => setBookerAge(e.target.value)} icon={<UserIcon className="w-5 h-5 text-gray-400" />} />
                <Input id="luggage" label="Luggage" type="number" placeholder="1" value={luggage} onChange={e => setLuggage(e.target.value)} icon={<BriefcaseIcon className="w-5 h-5 text-gray-400" />} />
                
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                        <input type="checkbox" id="childSeat" checked={childSeat} onChange={e => setChildSeat(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <label htmlFor="childSeat" className="ml-2 block text-sm text-gray-900">Child Seat</label>
                    </div>
                    <div className="flex items-center">
                        <input type="checkbox" id="wheelchair" checked={wheelchairAccess} onChange={e => setWheelchairAccess(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <label htmlFor="wheelchair" className="ml-2 block text-sm text-gray-900">Wheelchair Access</label>
                    </div>
                </div>

                <div className="pt-2">
                    <Button 
                        onClick={() => {
                            setRideDetails({
                                rideType: 'Instant Ride',
                                pickup,
                                dropoff: destination,
                                date,
                                time,
                                passengers
                            });
                            if (vehicleType && vehicleTypes[vehicleType as keyof typeof vehicleTypes]) {
                                setVehicleTypeForFilter(vehicleTypes[vehicleType as keyof typeof vehicleTypes]);
                            } else {
                                setVehicleTypeForFilter(null);
                            }
                            navigate('AvailableShuttles');
                        }} 
                        disabled={!pickup || !destination || !passengers || date.length !== 10 || !!dateError || !time}
                    >
                        Select Ride
                    </Button>
                </div>
            </div>
        </ScreenContainer>
    );
};

interface ScheduleRideScreenProps extends NavigationProps {
  setVehicleTypeForFilter: (info: VehicleClassInfo | null) => void;
  setRideDetails: (details: BookingDetails | null) => void;
  initialDetails: BookingDetails | null;
}
const ScheduleRideScreen: React.FC<ScheduleRideScreenProps> = ({ navigate, setVehicleTypeForFilter, setRideDetails, initialDetails }) => {
    const [pickup, setPickup] = useState(initialDetails?.pickup || "");
    const [destination, setDestination] = useState(initialDetails?.dropoff || "");
    const [date, setDate] = useState(initialDetails?.date || getCurrentDate());
    const [time, setTime] = useState(initialDetails?.time || getCurrentTime());
    const [passengers, setPassengers] = useState(initialDetails?.passengers || "1");
    const [bookerAge, setBookerAge] = useState("");
    const [vehicleType, setVehicleType] = useState<string | null>('Business Class');
    const [dateError, setDateError] = useState('');

    const vehicleTypes = {
        'Premium Class': { name: 'Premium Class', icon: <CarIcon/>, baseRate: 200 },
        'Business Class': { name: 'Business Class', icon: <CarIcon/>, baseRate: 150 },
        'Economy Class': { name: 'Economy Class', icon: <CarIcon/>, baseRate: 80 },
        'Basic Class': { name: 'Basic Class', icon: <CarIcon/>, baseRate: 50 },
    };
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { newValue, error } = validateAndFormatDate(e.target.value, date);
        setDate(newValue);
        setDateError(error);
    };

    const handleFindRide = () => {
        setRideDetails({
            rideType: 'Scheduled Ride',
            pickup,
            dropoff: destination,
            date,
            time,
            passengers
        });
        if (vehicleType && vehicleTypes[vehicleType as keyof typeof vehicleTypes]) {
            setVehicleTypeForFilter(vehicleTypes[vehicleType as keyof typeof vehicleTypes]);
        } else {
            setVehicleTypeForFilter(null);
        }
        navigate('AvailableShuttles');
    };
    
    return (
        <ScreenContainer>
            <Header title="Schedule a Ride" onBack={() => navigate('ServiceSelection')} onForward={() => {
                 if (pickup && destination && passengers && date.length === 10 && !dateError && time) {
                    handleFindRide();
                 }
            }} />
            <div className="p-4 space-y-4">
                <div>
                    <h3 className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle Type</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.values(vehicleTypes).map(v => (
                            <button key={v.name} onClick={() => setVehicleType(v.name)} className={`p-3 border rounded-lg text-center transition-colors ${vehicleType === v.name ? 'bg-primary text-white border-primary' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                {React.cloneElement(v.icon, {className: 'w-8 h-8 mx-auto mb-1'})}
                                <span className="text-sm font-semibold">{v.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <Input id="pickup" label="Pick Up Location" type="text" placeholder="Kotoka International Airport" value={pickup} onChange={e => setPickup(e.target.value)} icon={<MapPinIcon className="w-5 h-5 text-gray-400" />} />
                <Input id="destination" label="Drop Off Location" type="text" placeholder="Enter your destination" value={destination} onChange={e => setDestination(e.target.value)} icon={<MapPinIcon className="w-5 h-5 text-gray-400" />} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Input id="date" label="Select Date (DD/MM/2025)" type="tel" placeholder="DD/MM/2025" value={date} onChange={handleDateChange} icon={<CalendarIcon className="w-5 h-5 text-gray-400" />} maxLength={10} />
                        {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
                    </div>
                    <Input id="time" label="Time" type="time" value={time} onChange={e => setTime(e.target.value)} icon={<ClockIcon className="w-5 h-5 text-gray-400" />} />
                </div>
                <Input id="passengers" label="Passengers" type="number" placeholder="1" value={passengers} onChange={e => setPassengers(e.target.value)} icon={<UsersIcon className="w-5 h-5 text-gray-400" />} />
                <Input id="bookerAge" label="Booker's Age (Optional)" type="number" placeholder="Enter age" value={bookerAge} onChange={e => setBookerAge(e.target.value)} icon={<UserIcon className="w-5 h-5 text-gray-400" />} />
                <div className="pt-2">
                    <Button onClick={handleFindRide} disabled={!pickup || !destination || !passengers || date.length !== 10 || !!dateError || !time}>Select Ride</Button>
                </div>
            </div>
        </ScreenContainer>
    );
};

interface CarRentalScreenProps extends NavigationProps {
    setRentalDuration: (duration: number) => void;
    setVehicleTypeForFilter: (info: VehicleClassInfo | null) => void;
    setRentalDetails: (details: RentalDetails | null) => void;
    initialDetails: BookingDetails | null;
}
const DetailsSection: React.FC<{
    title: string;
    section: string;
    data: any;
    onUpdate: (field: string, value: any) => void;
}> = ({ title, section, data, onUpdate }) => {
    return (
        <div className="space-y-4 pt-6 mt-6 border-t border-gray-200 animate-fade-in">
            <h3 className="text-xl font-bold font-display text-primary">{title}</h3>
            <Input 
                id={`${section}-name`} 
                label="Full Name" 
                value={data.fullName || ''} 
                onChange={e => onUpdate('fullName', e.target.value)} 
                icon={<UserIcon className="w-5 h-5 text-gray-400"/>} 
            />
            <Input 
                id={`${section}-phone`} 
                label="Phone Number" 
                type="tel"
                value={data.phone || ''} 
                onChange={e => onUpdate('phone', e.target.value)} 
                icon={<PhoneIcon className="w-5 h-5 text-gray-400"/>} 
            />
            <Input 
                id={`${section}-whatsapp`} 
                label="WhatsApp Number" 
                type="tel"
                value={data.whatsapp || ''} 
                onChange={e => onUpdate('whatsapp', e.target.value)} 
                icon={<PhoneIcon className="w-5 h-5 text-green-500"/>} 
            />
            <Input 
                id={`${section}-email`} 
                label="Email Address" 
                type="email"
                value={data.email || ''} 
                onChange={e => onUpdate('email', e.target.value)} 
                icon={<MailIcon className="w-5 h-5 text-gray-400"/>} 
            />
            
            <Input 
                id={`${section}-address`} 
                label="Residential Address" 
                value={data.address || ''} 
                onChange={e => onUpdate('address', e.target.value)} 
                icon={<MapPinIcon className="w-5 h-5 text-gray-400"/>} 
            />
            <Input 
                id={`${section}-digital-address`} 
                label="Digital Address (GhanaPostGPS format)" 
                placeholder="GA-123-4567"
                value={data.digitalAddress || ''} 
                onChange={e => onUpdate('digitalAddress', e.target.value)} 
                icon={<GlobeIcon className="w-5 h-5 text-gray-400"/>} 
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Identification Type</label>
                <div className="relative">
                    <select 
                        className="block w-full px-4 py-3.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm min-h-[48px] appearance-none"
                        value={data.idType || ''}
                        onChange={e => onUpdate('idType', e.target.value)}
                    >
                        <option value="">Select ID Type</option>
                        <option value="Ghana Card">Ghana Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driver's License">Driver's License</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <ChevronDownIcon className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <Input 
                id={`${section}-id-number`} 
                label="ID Number" 
                value={data.idNumber || ''} 
                onChange={e => onUpdate('idNumber', e.target.value)} 
                icon={<FileTextIcon className="w-5 h-5 text-gray-400"/>} 
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Front of ID Card</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer" onClick={() => document.getElementById(`${section}-front-upload`)?.click()}>
                    <div className="space-y-1 text-center">
                        <UploadCloudIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-hover">
                                Upload front image
                                <input id={`${section}-front-upload`} type="file" className="sr-only" onChange={e => {
                                    if(e.target.files?.[0]) onUpdate('frontId', e.target.files[0]);
                                }} />
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        {data.frontId && <p className="text-xs text-green-600 font-bold">{data.frontId.name}</p>}
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Back of ID Card</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors cursor-pointer" onClick={() => document.getElementById(`${section}-back-upload`)?.click()}>
                    <div className="space-y-1 text-center">
                        <UploadCloudIcon className="mx-auto h-10 w-10 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <span className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-hover">
                                Upload back image
                                <input id={`${section}-back-upload`} type="file" className="sr-only" onChange={e => {
                                   if(e.target.files?.[0]) onUpdate('backId', e.target.files[0]);
                                }} />
                            </span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        {data.backId && <p className="text-xs text-green-600 font-bold">{data.backId.name}</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CarRentalScreen: React.FC<CarRentalScreenProps> = ({ navigate, setRentalDuration, setVehicleTypeForFilter, setRentalDetails, initialDetails }) => {
    const [details, setDetails] = useState({
        pickupDate: initialDetails?.pickupDateRental || getCurrentDate(),
        pickupTime: initialDetails?.pickupTimeRental || getCurrentTime(),
        returnDate: initialDetails?.returnDateRental || getCurrentDate(),
        returnTime: initialDetails?.returnTimeRental || getCurrentTime(),
        passengers: initialDetails?.passengers || "",
        luggage: "",
        pickupLocation: "",
        dropoffLocation: "",
        renterAge: "",
        rentingPurpose: "Leisure / Personal Travel",
    });
    const [pickupDateError, setPickupDateError] = useState('');
    const [returnDateError, setReturnDateError] = useState('');
    const [isDriving, setIsDriving] = useState<boolean | null>(null);

    const initialDetailFields = {
        fullName: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        digitalAddress: '',
        idType: '',
        idNumber: '',
        frontId: null as File | null,
        backId: null as File | null,
    };

    const [renterDetails, setRenterDetails] = useState(initialDetailFields);
    const [driverDetails, setDriverDetails] = useState(initialDetailFields);
    const [yourDetails, setYourDetails] = useState(initialDetailFields);

    const handleDetailUpdate = (section: 'renter' | 'driver' | 'you', field: string, value: any) => {
        if (section === 'renter') setRenterDetails(prev => ({ ...prev, [field]: value }));
        else if (section === 'driver') setDriverDetails(prev => ({ ...prev, [field]: value }));
        else setYourDetails(prev => ({ ...prev, [field]: value }));
    };

    const handleInputChange = (field: keyof typeof details, value: string) => {
        setDetails(prev => ({ ...prev, [field]: value }));
    };

    const handlePickupDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { newValue, error } = validateAndFormatDate(e.target.value, details.pickupDate);
        handleInputChange('pickupDate', newValue);
        setPickupDateError(error);
    };

    const handleReturnDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { newValue, error } = validateAndFormatDate(e.target.value, details.returnDate);
        handleInputChange('returnDate', newValue);
        setReturnDateError(error);
    };

    const handleSubmit = () => {
        const { pickupDate, returnDate, pickupTime, returnTime } = details;
        if (!pickupDate || !returnDate || !pickupTime || !returnTime || pickupDate.length !== 10 || returnDate.length !== 10 || pickupDateError || returnDateError) {
            alert("Please fill in all date and time fields correctly.");
            return;
        }

        const pickupDateParts = pickupDate.split('/');
        const returnDateParts = returnDate.split('/');
        
        // Year is already in DD/MM/YYYY format from the helper
        const pickupDateTimeStr = `${pickupDateParts[2]}-${pickupDateParts[1]}-${pickupDateParts[0]}T${pickupTime}`;
        const returnDateTimeStr = `${returnDateParts[2]}-${returnDateParts[1]}-${returnDateParts[0]}T${returnTime}`;

        const pickup = new Date(pickupDateTimeStr);
        const ret = new Date(returnDateTimeStr);

        if (ret <= pickup) {
            setReturnDateError('Return date must be after pickup date.');
            return;
        }

        const durationHours = (ret.getTime() - pickup.getTime()) / (1000 * 60 * 60);
        setRentalDuration(Math.ceil(durationHours > 0 ? durationHours : 1));
        
        setRentalDetails({
            pickupDateTime: pickup.toISOString(),
            returnDateTime: ret.toISOString(),
            passengers: details.passengers,
            luggage: details.luggage,
            pickupLocation: details.pickupLocation,
            dropoffLocation: details.dropoffLocation,
            renterAge: details.renterAge,
            rentingPurpose: details.rentingPurpose,
        });
        setVehicleTypeForFilter(null); 
        // Force the flow to rental here just in case
        // and navigate to AvailableShuttles
        navigate('AvailableShuttles');
    };

    return (
        <ScreenContainer>
            <Header title="Car Rental" onBack={() => navigate('ServiceSelection')} onForward={() => {
                if (details.pickupDate && details.returnDate && details.pickupTime && details.returnTime) {
                    handleSubmit();
                }
            }} />
            <div className="p-4 space-y-4">
                <Input id="pickupLocation" label="Pickup Location" value={details.pickupLocation} onChange={e => handleInputChange('pickupLocation', e.target.value)} icon={<MapPinIcon className="w-5 h-5 text-gray-400"/>} />
                <Input id="dropoffLocation" label="Return Location" value={details.dropoffLocation} onChange={e => handleInputChange('dropoffLocation', e.target.value)} icon={<MapPinIcon className="w-5 h-5 text-gray-400"/>} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                         <Input id="pickupDate" label="Pickup Date" type="tel" placeholder="DD/MM/2025" value={details.pickupDate} onChange={handlePickupDateChange} icon={<CalendarIcon className="w-5 h-5 text-gray-400" />} maxLength={10} />
                         {pickupDateError && <p className="text-red-500 text-xs mt-1">{pickupDateError}</p>}
                    </div>
                    <Input id="pickupTime" label="Pickup Time" type="time" value={details.pickupTime} onChange={e => handleInputChange('pickupTime', e.target.value)} icon={<ClockIcon className="w-5 h-5 text-gray-400" />} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <Input id="returnDate" label="Return Date" type="tel" placeholder="DD/MM/2025" value={details.returnDate} onChange={handleReturnDateChange} icon={<CalendarIcon className="w-5 h-5 text-gray-400" />} maxLength={10} />
                        {returnDateError && <p className="text-red-500 text-xs mt-1">{returnDateError}</p>}
                    </div>
                    <Input id="returnTime" label="Return Time" type="time" value={details.returnTime} onChange={e => handleInputChange('returnTime', e.target.value)} icon={<ClockIcon className="w-5 h-5 text-gray-400" />} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input id="passengersRental" label="Passengers" type="number" value={details.passengers} onChange={e => handleInputChange('passengers', e.target.value)} icon={<UsersIcon className="w-5 h-5 text-gray-400"/>} />
                    <Input id="luggageRental" label="Luggage" type="number" value={details.luggage} onChange={e => handleInputChange('luggage', e.target.value)} icon={<BriefcaseIcon className="w-5 h-5 text-gray-400"/>} />
                </div>

                <Input id="renterAge" label="Renter's Age (Optional)" type="number" placeholder="Enter age" value={details.renterAge} onChange={e => handleInputChange('renterAge', e.target.value)} icon={<UserIcon className="w-5 h-5 text-gray-400" />} />
                
                <Select 
                    id="rentingPurpose" 
                    label="Purpose of Renting the Car" 
                    value={details.rentingPurpose} 
                    onChange={e => handleInputChange('rentingPurpose', e.target.value)} 
                    icon={<FileTextIcon className="w-5 h-5 text-gray-400" />}
                    options={[
                        { value: "Leisure / Personal Travel", label: "Leisure / Personal Travel" },
                        { value: "Business Travel", label: "Business Travel" },
                        { value: "Replacement for Personal Vehicle (Due to Accident, Warranty, or Repair Work)", label: "Replacement for Personal Vehicle (Due to Accident, Warranty, or Repair Work)" }
                    ]}
                />

                <div className="pt-4 border-t border-gray-100">
                    <p className="block text-sm font-medium text-gray-700 mb-3">Are you the one driving the car?</p>
                    <div className="flex gap-4">
                        <button 
                            type="button"
                            onClick={() => setIsDriving(true)}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-bold transition-all ${isDriving === true ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'}`}
                        >
                            Yes
                        </button>
                        <button 
                            type="button"
                            onClick={() => setIsDriving(false)}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 font-bold transition-all ${isDriving === false ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'}`}
                        >
                            No
                        </button>
                    </div>
                </div>

                {isDriving === true && (
                    <DetailsSection 
                        title="Your Details" 
                        section="you" 
                        data={yourDetails} 
                        onUpdate={(f, v) => handleDetailUpdate('you', f, v)} 
                    />
                )}

                {isDriving === false && (
                    <>
                        <DetailsSection 
                            title="Account Owner's Details" 
                            section="renter" 
                            data={renterDetails} 
                            onUpdate={(f, v) => handleDetailUpdate('renter', f, v)} 
                        />
                        <DetailsSection 
                            title="Driver's Details" 
                            section="driver" 
                            data={driverDetails} 
                            onUpdate={(f, v) => handleDetailUpdate('driver', f, v)} 
                        />
                    </>
                )}

                <Button onClick={handleSubmit} disabled={isDriving === null}>Select Ride</Button>
            </div>
        </ScreenContainer>
    );
};

interface Vehicle {
    id: string;
    name: string;
    class: string;
    type: string;
    passengers: number;
    luggage: number;
    pricePerDay: number;
    fuel: string;
    drive: string;
    rating: number;
    reviews: number;
    imageSeed: string;
    features: string[];
    driverName?: string;
    image?: string;
}

interface AvailableShuttlesScreenProps extends NavigationProps {
    onBack: () => void;
    selectedClassInfo: VehicleClassInfo | null;
    flow: 'instant' | 'schedule' | 'rental' | null;
    onSelect: (vehicle: Vehicle) => void;
}

const AvailableShuttlesScreen: React.FC<AvailableShuttlesScreenProps> = ({ navigate, onBack, selectedClassInfo, flow, onSelect }) => {
    const [filters, setFilters] = useState({
        class: selectedClassInfo ? [selectedClassInfo.name] : [] as string[],
        type: [] as string[],
        fuel: [] as string[],
        passengers: [] as number[],
        drive: [] as string[],
    });

    const [sortBy, setSortBy] = useState('price-low');
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const vehicles = [
        { id: '1', name: 'Mitsubishi Mirage or similar', class: 'Economy Class', type: 'Sedan', passengers: 4, luggage: 2, pricePerDay: 45, fuel: 'Gasoline', drive: '2WD', rating: 4.5, reviews: 128, imageSeed: 'car1', features: ['Automatic', 'Air Conditioning'] },
        { id: '2', name: 'Toyota Corolla or similar', class: 'Economy Class', type: 'Sedan', passengers: 5, luggage: 3, pricePerDay: 55, fuel: 'Gasoline', drive: '2WD', rating: 4.7, reviews: 245, imageSeed: 'car2', features: ['Automatic', 'Bluetooth', 'Reverse Camera'] },
        { id: '3', name: 'Ford Transit or similar', class: 'Business Class', type: 'Van', passengers: 12, luggage: 8, pricePerDay: 120, fuel: 'Diesel', drive: '2WD', rating: 4.8, reviews: 89, imageSeed: 'van1', features: ['Extra Legroom', 'WiFi', 'Charging Ports'] },
        { id: '4', name: 'Mercedes Sprinter or similar', class: 'Premium Class', type: 'Van', passengers: 15, luggage: 12, pricePerDay: 180, fuel: 'Diesel', drive: 'RWD', rating: 4.9, reviews: 56, imageSeed: 'van2', features: ['Luxury Interior', 'Entertainment System', 'Refreshments'] },
        { id: '5', name: 'Toyota Land Cruiser or similar', class: 'Premium Class', type: 'SUV', passengers: 7, luggage: 4, pricePerDay: 150, fuel: 'Gasoline', drive: '4WD', rating: 5.0, reviews: 34, imageSeed: 'suv1', features: ['All-Terrain', 'Panoramic Roof', 'Heated Seats'] },
        { id: '6', name: 'Suzuki Espresso or similar', class: 'Basic Class', type: 'Hatchback', passengers: 4, luggage: 1, pricePerDay: 30, fuel: 'Gasoline', drive: '2WD', rating: 4.2, reviews: 210, imageSeed: 'car3', features: ['Manual', 'Compact'] },
        { id: '7', name: 'Hyundai Staria or similar', class: 'Business Class', type: 'Van', passengers: 9, luggage: 6, pricePerDay: 110, fuel: 'Gasoline', drive: 'AWD', rating: 4.6, reviews: 72, imageSeed: 'van3', features: ['Spacious', 'Sliding Doors'] },
        { id: '8', name: 'BMW 5 Series or similar', class: 'Premium Class', type: 'Sedan', passengers: 5, luggage: 3, pricePerDay: 100, fuel: 'Gasoline', drive: 'AWD', rating: 4.9, reviews: 41, imageSeed: 'car4', features: ['Leather Seats', 'Premium Audio'] }
    ];

    const toggleFilter = (category: keyof typeof filters, value: any) => {
        setFilters(prev => {
            const current = prev[category] as any[];
            if (current.includes(value)) {
                return { ...prev, [category]: current.filter(v => v !== value) };
            } else {
                return { ...prev, [category]: [...current, value] };
            }
        });
    };

    const filteredVehicles = vehicles.filter(v => {
        if (filters.class.length > 0 && !filters.class.includes(v.class)) return false;
        if (filters.type.length > 0 && !filters.type.includes(v.type)) return false;
        if (filters.fuel.length > 0 && !filters.fuel.includes(v.fuel)) return false;
        if (filters.drive.length > 0 && !filters.drive.includes(v.drive)) return false;
        if (filters.passengers.length > 0 && !filters.passengers.some(p => v.passengers >= p)) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.pricePerDay - b.pricePerDay;
        if (sortBy === 'price-high') return b.pricePerDay - a.pricePerDay;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0;
    });

    const FilterSection = ({ title, options, category, multi = true }: { title: string, options: any[], category: keyof typeof filters, multi?: boolean }) => (
        <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">{title}</h4>
            <div className="space-y-2">
                {options.map(opt => (
                    <label key={opt.value} className="flex items-center group cursor-pointer">
                        <div 
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                (filters[category] as any[]).includes(opt.value) 
                                ? 'bg-primary border-primary shadow-sm' 
                                : 'bg-white border-gray-300 group-hover:border-primary'
                            }`}
                            onClick={() => toggleFilter(category, opt.value)}
                        >
                            {(filters[category] as any[]).includes(opt.value) && <CheckCircleIcon className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="ml-3 text-gray-700 text-sm group-hover:text-primary transition-colors">{opt.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <ScreenContainer>
            <Header 
                title="Available Shuttles" 
                onBack={onBack} 
                extra={
                    <button 
                        onClick={() => setShowMobileFilters(true)}
                        className="md:hidden p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                        <SettingsIcon className="w-6 h-6" />
                    </button>
                }
            />
            
            <div className="flex flex-col md:flex-row gap-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* Sidebar Filters */}
                <aside className="hidden md:block w-64 flex-shrink-0">
                    <div className="sticky top-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-primary mb-6 flex items-center">
                                <BusIcon className="w-5 h-5 mr-2" />
                                Filters
                            </h3>
                            
                            <FilterSection 
                                title="Car Class" 
                                category="class"
                                options={[
                                    { label: 'Premium Class', value: 'Premium Class' },
                                    { label: 'Business Class', value: 'Business Class' },
                                    { label: 'Economy Class', value: 'Economy Class' },
                                    { label: 'Basic Class', value: 'Basic Class' }
                                ]} 
                            />
                            
                            <FilterSection 
                                title="Car Type" 
                                category="type"
                                options={[
                                    { label: 'SUV', value: 'SUV' },
                                    { label: 'Sedan', value: 'Sedan' },
                                    { label: 'Van', value: 'Van' },
                                    { label: 'Hatchback', value: 'Hatchback' }
                                ]} 
                            />

                            <FilterSection 
                                title="Fuel" 
                                category="fuel"
                                options={[
                                    { label: 'Gasoline', value: 'Gasoline' },
                                    { label: 'Diesel', value: 'Diesel' },
                                ]} 
                            />

                            <FilterSection 
                                title="Passengers" 
                                category="passengers"
                                options={[
                                    { label: '2+', value: 2 },
                                    { label: '4+', value: 4 },
                                    { label: '5+', value: 5 },
                                    { label: '8+', value: 8 },
                                    { label: '12+', value: 12 },
                                ]} 
                            />

                            <FilterSection 
                                title="Drive Type" 
                                category="drive"
                                options={[
                                    { label: '2WD', value: '2WD' },
                                    { label: '4WD / AWD', value: '4WD' },
                                ]} 
                            />

                            <button 
                                onClick={() => setFilters({ class: [], type: [], fuel: [], passengers: [], drive: [] })}
                                className="w-full py-2.5 text-sm font-bold text-gray-500 hover:text-primary transition-colors border-t border-gray-100 mt-4"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Sort Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-600 font-medium tracking-tight">
                            Showing <span className="text-primary font-bold">{filteredVehicles.length}</span> vehicles
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 font-medium">Sort by:</span>
                            <div className="relative">
                                <select 
                                    className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm font-bold text-gray-700 hover:border-primary transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Listings */}
                    <div className="space-y-6">
                        {filteredVehicles.length > 0 ? (
                            filteredVehicles.map(v => (
                                <div key={v.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Image Section */}
                                        <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden bg-gray-50">
                                            <img 
                                                src={`https://picsum.photos/seed/${v.imageSeed}/400/250`} 
                                                alt={v.name} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-widest border border-primary/10">
                                                    {v.class}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Middle content */}
                                        <div className="flex-1 p-6">
                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{v.name}</h3>
                                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                                    <span className="font-bold text-gray-900">{v.rating}</span>
                                                    <span className="mx-1">·</span>
                                                    <span>{v.reviews} reviews</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                                                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                    <UsersIcon className="w-4 h-4 mr-2 text-primary/70" />
                                                    <span className="text-xs font-bold">{v.passengers} Adults</span>
                                                </div>
                                                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                    <BriefcaseIcon className="w-4 h-4 mr-2 text-primary/70" />
                                                    <span className="text-xs font-bold">{v.luggage} Bags</span>
                                                </div>
                                                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                    <SnowflakeIcon className="w-4 h-4 mr-2 text-primary/70" />
                                                    <span className="text-xs font-bold">A/C</span>
                                                </div>
                                                <div className="flex items-center text-gray-600 bg-gray-50 p-2 rounded-lg">
                                                    <GlobeIcon className="w-4 h-4 mr-2 text-primary/70" />
                                                    <span className="text-xs font-bold">{v.fuel}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {v.features.map(f => (
                                                    <span key={f} className="text-[10px] font-bold text-gray-400 bg-gray-100/50 px-2 py-1 rounded uppercase tracking-wider">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right Sidebar */}
                                        <div className="lg:w-64 p-6 bg-gray-50/50 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-bold">Total Price</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-2xl font-black text-gray-900">${v.pricePerDay.toFixed(2)}</span>
                                                    <span className="text-sm font-bold text-gray-500">/trip</span>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 flex flex-col gap-2">
                                                <Button 
                                                    onClick={() => onSelect(v)}
                                                    className="w-full group/btn"
                                                >
                                                    Select Ride
                                                    <ArrowRightIcon className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </Button>
                                                <p className="text-[10px] text-center text-gray-400 font-medium">Free cancellation up to 24h before</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                                <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No matching vehicles found</h3>
                                <p className="text-gray-500 mb-6 max-w-xs mx-auto">Try adjusting your filters or search criteria to see more available options.</p>
                                <Button variant="secondary" onClick={() => setFilters({ class: [], type: [], fuel: [], passengers: [], drive: [] })}>
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            <Modal isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)} title="Filter Results">
                <div className="space-y-6">
                    <FilterSection title="Car Class" category="class" options={[{ label: 'Premium Class', value: 'Premium Class' }, { label: 'Business Class', value: 'Business Class' }, { label: 'Economy Class', value: 'Economy Class' }, { label: 'Basic Class', value: 'Basic Class' }]} />
                    <FilterSection title="Car Type" category="type" options={[{ label: 'SUV', value: 'SUV' }, { label: 'Sedan', value: 'Sedan' }, { label: 'Van', value: 'Van' }, { label: 'Hatchback', value: 'Hatchback' }]} />
                    <FilterSection title="Fuel" category="fuel" options={[{ label: 'Gasoline', value: 'Gasoline' }, { label: 'Diesel', value: 'Diesel' }]} />
                    <FilterSection title="Drive" category="drive" options={[{ label: '2WD', value: '2WD' }, { label: '4WD', value: '4WD' }]} />
                    <Button onClick={() => setShowMobileFilters(false)} className="w-full mt-4">Apply Filters</Button>
                </div>
            </Modal>
        </ScreenContainer>
    );
};

interface AvailableCarsForRentScreenProps extends NavigationProps {
    onBack: () => void;
    onCarSelect: (car: Car) => void;
    selectedClassInfo: VehicleClassInfo | null;
}
const AvailableCarsForRentScreen: React.FC<AvailableCarsForRentScreenProps> = ({ navigate, onBack, onCarSelect }) => {
    const cars: Car[] = [
        { class: 'Economy', driver: 'John Doe', price: 50, seed: 'car1', description: 'Toyota Corolla or similar' },
        { class: 'Business', driver: 'Jane Smith', price: 80, seed: 'car2', description: 'Mercedes C-Class or similar' },
        { class: 'Premium', driver: 'Sam Wilson', price: 120, seed: 'car3', description: 'BMW 7 Series or similar' },
    ];
    const handleSelect = (car: Car) => {
        onCarSelect(car);
        navigate('CarRentDetails');
    };
    return (
        <ScreenContainer>
            <Header title="Available Cars" onBack={onBack} />
            <div className="p-4 space-y-3">
                {cars.map(car => (
                    <div key={car.seed} onClick={() => handleSelect(car)} className="p-4 border rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50">
                        <img src={`https://picsum.photos/seed/${car.seed}/80/80`} alt={car.class} className="w-20 h-20 rounded-md object-cover" />
                        <div>
                            <p className="font-bold text-lg">{car.class} Class</p>
                            <p className="text-sm text-gray-600">{car.description}</p>
                            <p className="font-semibold text-primary mt-1">${car.price}/hr</p>
                        </div>
                        <ArrowRightIcon className="w-6 h-6 text-gray-400 ml-auto" />
                    </div>
                ))}
            </div>
        </ScreenContainer>
    );
};

interface CarRentDetailsScreenProps extends NavigationProps {
    car: Car | null;
    onBack: () => void;
    rentalDuration: number;
}
const CarRentDetailsScreen: React.FC<CarRentDetailsScreenProps> = ({ navigate, car, onBack, rentalDuration }) => {
    if (!car) {
        return <ScreenContainer><Header title="Error" onBack={onBack} /><div className="p-4"><p>No car selected. Please go back.</p></div></ScreenContainer>;
    }
    const totalCost = car.price * rentalDuration;
    return (
        <ScreenContainer>
            <Header title={car.class + " Class"} onBack={onBack} />
            <img src={`https://picsum.photos/seed/${car.seed}/300/200`} alt={car.class} className="w-full h-40 object-cover" />
            <div className="p-4">
                <h2 className="text-2xl font-bold">{car.class} Class</h2>
                <p className="text-gray-600">{car.description}</p>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg text-left space-y-2">
                    <p><strong>Driver:</strong> {car.driver}</p>
                    <p><strong>Hourly Rate:</strong> ${car.price.toFixed(2)}</p>
                    <p><strong>Rental Duration:</strong> {rentalDuration} hours</p>
                    <p className="text-lg font-bold mt-2 pt-2 border-t">Total Cost: ${totalCost.toFixed(2)}</p>
                </div>
                <Button onClick={() => navigate('CarRentalConfirmation')} className="mt-6">Confirm Rental</Button>
            </div>
        </ScreenContainer>
    );
};

// --- FIX: Add definitions for missing screen components ---

interface CarRentalConfirmationScreenProps extends NavigationProps {
    car: Car | null;
    rentalDetails: RentalDetails | null;
    rentalDuration: number;
    onBack: () => void;
}
const CarRentalConfirmationScreen: React.FC<CarRentalConfirmationScreenProps> = ({ navigate, car, rentalDetails, rentalDuration, onBack }) => {
    if (!car || !rentalDetails) return <ScreenContainer><Header title="Error" onBack={onBack} /></ScreenContainer>;

    const totalCost = car.price * rentalDuration;

    return (
        <ScreenContainer>
            <Header title="Confirm Rental" onBack={onBack} />
            <div className="p-4 space-y-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-2">Your Rental Details</h3>
                    <img src={`https://picsum.photos/seed/${car.seed}/300/200`} alt={car.class} className="w-full h-40 object-cover rounded-md mb-4" />
                    <p className="font-bold text-xl">{car.class} Class</p>
                    <p className="text-sm text-gray-600">{car.description}</p>
                    <div className="mt-4 border-t pt-4 space-y-2">
                        <p><strong>Pickup:</strong> {rentalDetails.pickupLocation} on {new Date(rentalDetails.pickupDateTime).toLocaleString()}</p>
                        <p><strong>Return:</strong> {rentalDetails.dropoffLocation} on {new Date(rentalDetails.returnDateTime).toLocaleString()}</p>
                        <p><strong>Duration:</strong> {rentalDuration} hours</p>
                        <p><strong>Passengers:</strong> {rentalDetails.passengers}</p>
                        <p className="text-lg font-bold mt-2">Total: ${totalCost.toFixed(2)}</p>
                    </div>
                </div>
                <Button onClick={() => navigate('PaymentSelection')}>Proceed to Payment</Button>
            </div>
        </ScreenContainer>
    );
};

interface CompatibleShuttlesListScreenProps extends NavigationProps {
    onBack: () => void;
    selectedClassInfo: VehicleClassInfo | null;
}
const CompatibleShuttlesListScreen: React.FC<CompatibleShuttlesListScreenProps> = ({ navigate, onBack, selectedClassInfo }) => {
    const shuttles = [
        { id: 1, driver: 'Kofi Mensah', vehicle: 'Toyota Hiace', eta: 5, rating: 4.8, class: 'Economy Class' },
        { id: 2, driver: 'Ama Serwaa', vehicle: 'Ford Transit', eta: 8, rating: 4.9, class: 'Business Class' },
        { id: 3, driver: 'Yaw Frimpong', vehicle: 'Mercedes-Benz Sprinter', eta: 10, rating: 4.7, class: 'Premium Class' },
    ].filter(s => !selectedClassInfo || s.class === selectedClassInfo.name);

    return (
        <ScreenContainer>
            <Header title="Available Shuttles" onBack={onBack} />
            <div className="p-4 space-y-3">
                {shuttles.length > 0 ? shuttles.map(shuttle => (
                    <div key={shuttle.id} onClick={() => navigate('ShuttleDriverDetails')} className="p-4 border rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50">
                        <img src={`https://i.pravatar.cc/150?u=${shuttle.driver}`} alt={shuttle.driver} className="w-16 h-16 rounded-full" />
                        <div>
                            <p className="font-bold">{shuttle.driver}</p>
                            <p className="text-sm text-gray-600">{shuttle.vehicle}</p>
                            <div className="flex items-center text-sm mt-1">
                                <StarIcon className="w-4 h-4 text-yellow-500 mr-1" /> {shuttle.rating}
                            </div>
                        </div>
                        <div className="text-right ml-auto">
                            <p className="font-semibold">{shuttle.eta} min</p>
                            <p className="text-sm">ETA</p>
                        </div>
                    </div>
                )) : (
                    <div className="text-center p-8 text-gray-500">
                        <p>No shuttles available for "{selectedClassInfo?.name}". Try another class.</p>
                    </div>
                )}
            </div>
        </ScreenContainer>
    );
};

const ShuttleDriverDetailsScreen: React.FC<NavigationProps & { shuttle: any }> = ({ navigate, shuttle }) => {
    return (
        <ScreenContainer>
            <Header title="Driver Details" onBack={() => navigate('AvailableShuttles')} onForward={() => navigate('BookingConfirmation')} />
            <div className="p-4 text-center">
                <img src={shuttle?.image || "https://i.pravatar.cc/150?u=Kofi Mensah"} alt="Driver" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary object-cover" />
                <h2 className="text-2xl font-bold">{shuttle?.driverName || 'Kofi Mensah'}</h2>
                <div className="flex items-center justify-center text-lg mt-1">
                    <StarIcon className="w-5 h-5 text-yellow-500 mr-1" /> {shuttle?.rating || '4.8'}
                </div>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg text-left space-y-2">
                    <p><strong>Vehicle:</strong> {shuttle?.name || 'Toyota Hiace'}</p>
                    <p><strong>Class:</strong> {shuttle?.class || 'Premium Class'}</p>
                    <p><strong>License Plate:</strong> GT-1234-20</p>
                </div>
                <Button onClick={() => navigate('BookingConfirmation')} className="mt-6">Confirm Booking</Button>
            </div>
        </ScreenContainer>
    );
};

const BookingConfirmationScreen: React.FC<NavigationProps & { shuttle: any; rideDetails: any }> = ({ navigate, shuttle, rideDetails }) => {
    return (
        <ScreenContainer>
            <Header title="Confirm Booking" onBack={() => navigate('ShuttleDriverDetails')} onForward={() => navigate('PaymentSelection')} />
            <div className="p-4 space-y-4">
                 <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-2">Trip Summary</h3>
                    <div className="space-y-2 border-t pt-2">
                        <p><strong>From:</strong> {rideDetails?.pickup || 'Kotoka Int\'l Airport'}</p>
                        <p><strong>To:</strong> {rideDetails?.dropoff || 'Accra Mall'}</p>
                        <p><strong>Vehicle:</strong> {shuttle?.name || 'Toyota Hiace'}</p>
                        <p><strong>Est. Fare:</strong> ${shuttle?.pricePerDay?.toFixed(2) || '10.00'}</p>
                        <p><strong>Driver:</strong> {shuttle?.driverName || 'Kofi Mensah'}</p>
                    </div>
                </div>
                <Button onClick={() => navigate('PaymentSelection')}>Proceed to Payment</Button>
            </div>
        </ScreenContainer>
    );
};

interface PaymentSelectionScreenProps extends NavigationProps {
    onBack: () => void;
}
const PaymentSelectionScreen: React.FC<PaymentSelectionScreenProps> = ({ navigate, onBack }) => {
    return (
        <ScreenContainer>
            <Header title="Select Payment" onBack={onBack} onForward={() => navigate('PaymentProcessing')} />
            <div className="p-4 space-y-3">
                <div onClick={() => navigate('PaymentProcessing')} className="p-4 border rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50">
                    <CreditCardIcon className="w-8 h-8 text-primary" />
                    <div>
                        <p className="font-bold">Credit/Debit Card</p>
                        <p className="text-sm text-gray-500">**** **** **** 1234</p>
                    </div>
                </div>
                <div onClick={() => navigate('PaymentProcessing')} className="p-4 border rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-50">
                    <PhoneIcon className="w-8 h-8 text-primary" />
                    <div>
                        <p className="font-bold">Mobile Money</p>
                        <p className="text-sm text-gray-500">MTN, Vodafone, AirtelTigo</p>
                    </div>
                </div>
                 <div className="pt-2">
                    <Button variant="secondary">Add New Payment Method</Button>
                </div>
            </div>
        </ScreenContainer>
    );
};

interface PaymentProcessingScreenProps extends NavigationProps {
    showToast: (message: string, type?: 'success' | 'error') => void;
    flow: 'shuttle' | 'rental' | null;
}
const PaymentProcessingScreen: React.FC<PaymentProcessingScreenProps> = ({ navigate, showToast, flow }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            showToast('Payment successful!');
            navigate(flow === 'rental' ? 'TripCompletionReceipt' : 'TripTracking');
        }, 2500);
        return () => clearTimeout(timer);
    }, [navigate, showToast, flow]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary text-white p-4">
            <div className="w-20 h-20 border-4 border-t-white border-primary-active rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold mt-6">Processing Payment...</h2>
            <p className="mt-2">Please wait, do not close this page.</p>
        </div>
    );
};

const TripTrackingScreen: React.FC<NavigationProps> = ({ navigate }) => {
    return (
        <ScreenContainer>
            <Header title="Tracking Your Ride" onBack={() => navigate('ServiceSelection')} />
            <div className="relative h-[calc(100vh-120px)]">
                <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                    <p className="text-gray-500 font-semibold">Live Map Placeholder</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <div className="flex items-center space-x-4">
                            <img src="https://i.pravatar.cc/150?u=Kofi Mensah" alt="Driver" className="w-16 h-16 rounded-full" />
                            <div>
                                <p className="font-bold">Kofi Mensah is on the way</p>
                                <p className="text-gray-600">Arriving in <span className="font-bold text-primary">5 mins</span></p>
                                <p className="text-sm text-gray-500">Toyota Hiace - GT-1234-20</p>
                            </div>
                        </div>
                        <Button onClick={() => navigate('TripCompletionReceipt')} className="mt-4">Simulate Arrival</Button>
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <button onClick={() => navigate('MyBookings')} className="py-2 bg-gray-50 border border-gray-200 text-primary font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all">View</button>
                            <button onClick={() => navigate('MyBookings')} className="py-2 bg-gray-50 border border-gray-200 text-gray-800 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">Modify</button>
                            <button onClick={() => navigate('MyBookings')} className="py-2 bg-gray-50 border border-gray-200 text-red-600 font-bold text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </ScreenContainer>
    );
};

interface TripCompletionReceiptScreenProps extends NavigationProps {
    flow: 'shuttle' | 'rental' | null;
    car: Car | null;
    duration: number;
    showToast: (msg: string) => void;
}
const TripCompletionReceiptScreen: React.FC<TripCompletionReceiptScreenProps> = ({ navigate, flow, car, duration, showToast }) => {
    const [rating, setRating] = useState(0);

    const handleRating = (rate: number) => {
        setRating(rate);
        showToast("Thanks for your feedback!");
    };
    const fare = flow === 'rental' && car ? car.price * duration : 10;
    return (
        <ScreenContainer>
            <Header title="Trip Receipt" onBack={() => navigate('ServiceSelection')} />
            <div className="p-4 text-center">
                <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold font-display">{flow === 'rental' ? 'Rental Complete' : 'Trip Completed'}!</h2>
                <div className="bg-gray-50 p-4 rounded-lg my-6 text-left">
                    <h3 className="font-bold text-lg mb-2">Summary</h3>
                    <div className="flex justify-between"><span>Base Fare</span><span>${fare.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t"><span>Total Paid</span><span>${fare.toFixed(2)}</span></div>
                </div>
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Rate your experience</h3>
                    <div className="flex justify-center space-x-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => handleRating(star)}>
                                <StarIcon className={`w-8 h-8 transition-colors ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <Button variant="outline" onClick={() => navigate('MyBookings')} className="font-bold">View My Bookings</Button>
                    <Button onClick={() => navigate('ServiceSelection')} className="font-bold">Done</Button>
                </div>
            </div>
        </ScreenContainer>
    );
};

const TripHistoryScreen: React.FC<NavigationProps> = ({ navigate }) => {
    const trips = [
        { id: 1, date: '2025-10-26', from: "Kotoka Int'l Airport", to: 'Accra Mall', price: 10, type: 'Shuttle' },
        { id: 2, date: '2025-10-24', from: "Home", to: "Work", price: 15, type: 'Rental' },
        { id: 3, date: '2025-10-22', from: "Kotoka Int'l Airport", to: 'East Legon', price: 12, type: 'Shuttle' },
    ];
    return (
        <ScreenContainer>
            <Header title="Trip History" onBack={() => navigate('ServiceSelection')} onForward={() => navigate('AccountProfile')} />
            <div className="p-4 space-y-3">
                {trips.map(trip => (
                    <div key={trip.id} onClick={() => navigate('TripDetailsView')} className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold">{trip.to}</p>
                                <p className="text-sm text-gray-500">{new Date(trip.date).toDateString()}</p>
                            </div>
                            <p className="font-semibold text-primary">${trip.price.toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4">
                <Button variant="outline" onClick={() => navigate('MyBookings')} className="w-full">Manage My Bookings</Button>
            </div>
        </ScreenContainer>
    );
};

const MyBookingsScreen: React.FC<NavigationProps & { defaultFilter?: 'Instant' | 'Schedule' | 'Rental' }> = ({ navigate, defaultFilter }) => {
    const [serviceFilter, setServiceFilter] = useState<'Instant' | 'Schedule' | 'Rental'>(defaultFilter || 'Instant');
    const [selectedTab, setSelectedTab] = useState<'Upcoming' | 'Active' | 'Completed' | 'Cancelled'>('Upcoming');
    
    useEffect(() => {
        if (defaultFilter) {
            setServiceFilter(defaultFilter);
        }
    }, [defaultFilter]);
    
    const allBookings = [
        // Instant Rides
        { 
            id: 'XT-12345', 
            serviceType: 'Instant',
            type: 'Instant Ride', 
            pickup: 'Kotoka Int\'l Airport', 
            dropoff: 'East Legon', 
            date: '2025-05-15', 
            time: '02:30 PM', 
            passengers: 2, 
            vehicle: { type: 'Economy Sedan', plate: 'GW 123-25', color: 'Silver' }, 
            driver: { name: 'Kofi Mensah', rating: 4.8, phone: '+233 24 123 4567' },
            status: 'Upcoming',
            rideStatus: 'Confirmed'
        },
        { 
            id: 'XT-12346', 
            serviceType: 'Instant',
            type: 'Instant Ride', 
            pickup: 'Airport City', 
            dropoff: 'Labadi', 
            date: '2025-05-08', 
            time: '05:15 PM', 
            passengers: 1, 
            vehicle: { type: 'Comfort Class', plate: 'AS 445-23', color: 'White' }, 
            driver: { name: 'Ama Serwaa', rating: 4.9, phone: '+233 20 888 9999' },
            status: 'Active',
            rideStatus: 'En Route',
            eta: '4 min',
            progress: 45
        },
        { 
            id: 'XT-12347', 
            serviceType: 'Instant',
            type: 'Instant Ride', 
            pickup: 'The Octagon', 
            dropoff: 'Cantonments', 
            date: '2025-05-01', 
            time: '10:00 AM', 
            passengers: 1, 
            status: 'Completed',
            fare: 12.50
        },

        // Scheduled Rides
        { 
            id: 'XT-99001', 
            serviceType: 'Schedule',
            type: 'Scheduled Ride', 
            pickup: 'Osu', 
            dropoff: 'Airport Residential', 
            date: '2025-05-20', 
            time: '08:00 AM', 
            passengers: 1, 
            vehicleClass: 'Business Class',
            status: 'Upcoming',
            countdown: '3 days'
        },
        { 
            id: 'XT-99002', 
            serviceType: 'Schedule',
            type: 'Scheduled Ride', 
            pickup: 'Legon', 
            dropoff: 'Spintex', 
            date: '2025-05-18', 
            time: '09:00 AM', 
            passengers: 2, 
            vehicleClass: 'Executive',
            status: 'Upcoming',
            countdown: '1 day'
        },

        // Car Rentals
        { 
            id: 'XT-RC001', 
            serviceType: 'Rental',
            type: 'Car Rental', 
            pickup: 'Accra Mall', 
            dropoff: 'Accra Mall', 
            date: '2025-05-10', 
            time: '10:00 AM', 
            returnDate: '2025-05-15',
            returnTime: '10:00 AM',
            vehicle: 'Luxury SUV', 
            vehicleImage: 'https://i.ibb.co/zWN7ZHns/Airport-Pickup-1.jpg',
            status: 'Active',
            remainingDuration: '2 days',
            dailyRate: 150,
            totalRate: 750
        },
        { 
            id: 'XT-RC002', 
            serviceType: 'Rental',
            type: 'Car Rental', 
            pickup: 'Kotoka Airport', 
            dropoff: 'Kotoka Airport', 
            date: '2025-05-25', 
            time: '12:00 PM', 
            returnDate: '2025-05-30',
            returnTime: '12:00 PM',
            vehicle: 'Economy Sedan', 
            status: 'Upcoming'
        }
    ];

    const filteredBookings = allBookings.filter(b => b.serviceType === serviceFilter && b.status === selectedTab);

    const getTitle = () => {
        if (serviceFilter === 'Instant') return 'My Booking (Instant Ride)';
        if (serviceFilter === 'Schedule') return 'My Booking (Schedule A Ride)';
        return 'My Booking (Car Rental)';
    };

    const EmptyState = () => {
        const config = {
            Instant: {
                text: "No instant rides found. Need a ride now? Book an Instant Ride for immediate pickup.",
                cta: "Book Instant Ride",
                navigate: "TripDetailsInput"
            },
            Schedule: {
                text: "No scheduled rides found. Plan ahead and schedule your next ride for peace of mind.",
                cta: "Schedule a Ride",
                navigate: "ScheduleRide"
            },
            Rental: {
                text: "No rental bookings found. Experience the freedom of the open road with our premium rental fleet.",
                cta: "See Available Cars",
                navigate: "CarRental"
            }
        };
        const current = config[serviceFilter];
        return (
            <div className="py-20 text-center px-6">
                <div className="w-20 h-20 bg-gray-50 flex items-center justify-center text-gray-200 rounded-none mx-auto mb-4">
                    <BookingIcon className="w-10 h-10" />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs leading-relaxed mb-6">{current.text}</p>
                <Button variant="secondary" onClick={() => navigate(current.navigate as Screen)}>{current.cta}</Button>
            </div>
        );
    };

    return (
        <ScreenContainer>
            <Header title={getTitle()} onBack={() => navigate('ServiceSelection')} />
            
            {/* Service Type Selector */}
            {!defaultFilter && (
                <div className="bg-gray-100 p-1 flex gap-1 sticky top-0 z-20 border-b border-gray-200">
                    {(['Instant', 'Schedule', 'Rental'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setServiceFilter(type)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${serviceFilter === type ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {type === 'Schedule' ? 'Schedule' : type}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab Navigation */}
            <div className={`flex border-b overflow-x-auto scrollbar-hide bg-white sticky z-10 shadow-sm ${defaultFilter ? 'top-0' : 'top-[49px]'}`}>
                {(['Upcoming', 'Active', 'Completed', 'Cancelled'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab)}
                        className={`flex-1 py-4 px-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${selectedTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-400'}`}
                    >
                        {tab === 'Active' ? 'Active / Ongoing' : tab}
                    </button>
                ))}
            </div>

            <div className="p-4 space-y-4 pb-24">
                {filteredBookings.length > 0 ? (
                    filteredBookings.map(booking => (
                        <div key={booking.id} className={`bg-white border rounded-none shadow-sm overflow-hidden transition-all ${booking.status === 'Active' ? 'ring-1 ring-primary/20' : ''}`}>
                            {/* Card Header */}
                            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">ID: {booking.id}</span>
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-none uppercase tracking-widest ${
                                    booking.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                                    booking.status === 'Active' ? 'bg-green-600 text-white animate-pulse' :
                                    booking.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                                    'bg-red-100 text-red-700'
                                }`}>
                                    {booking.status === 'Active' && booking.serviceType === 'Instant' ? (booking as any).rideStatus : booking.status}
                                </span>
                            </div>

                            {/* Card Body - Contextual */}
                            <div className="p-5 space-y-4">
                                {serviceFilter === 'Instant' && (
                                    <InstantRideCard booking={booking} />
                                )}
                                {serviceFilter === 'Schedule' && (
                                    <ScheduleRideCard booking={booking} />
                                )}
                                {serviceFilter === 'Rental' && (
                                    <CarRentalCard booking={booking} />
                                )}
                            </div>
                            
                            {/* Actions - Contextual */}
                            <div className="p-4 bg-gray-50 border-t flex gap-2">
                                {serviceFilter === 'Instant' && booking.status === 'Active' ? (
                                    <>
                                        <button onClick={() => navigate('TripTracking')} className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all rounded-none">Track Live</button>
                                        <button className="flex-1 py-3 bg-white border border-gray-200 text-gray-800 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all rounded-none">Call</button>
                                    </>
                                ) : serviceFilter === 'Schedule' && booking.status === 'Upcoming' ? (
                                    <>
                                        <button onClick={() => navigate('TripDetailsView')} className="flex-1 py-3 bg-white border border-gray-200 text-gray-800 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all rounded-none">View Details</button>
                                        <button className="flex-1 py-3 bg-white border border-primary text-primary font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all rounded-none">Reschedule</button>
                                    </>
                                ) : serviceFilter === 'Rental' && booking.status === 'Active' ? (
                                    <>
                                        <button className="flex-1 py-3 bg-white border border-gray-200 text-gray-800 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all rounded-none">Agreement</button>
                                        <button className="flex-1 py-3 bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all rounded-none">Extend</button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => navigate('TripDetailsView')}
                                        className="flex-1 py-3 bg-white border border-gray-200 text-gray-800 font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all rounded-none"
                                    >
                                        View
                                    </button>
                                )}
                                
                                {booking.status === 'Upcoming' && (
                                    <button className="flex-1 py-3 bg-white border border-red-200 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-none">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <EmptyState />
                )}
            </div>
        </ScreenContainer>
    );
};

const InstantRideCard = ({ booking }: { booking: any }) => {
    return (
        <div className="space-y-4">
            {booking.status === 'Active' && (
                <div className="flex items-center gap-4 bg-primary/5 p-3 border border-primary/10">
                    <div className="w-10 h-10 bg-white rounded-full border-2 border-primary overflow-hidden flex-shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.driver.name}`} alt={booking.driver.name} />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Driver Assigned</p>
                        <p className="font-bold text-gray-900">{booking.driver.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Arriving In</p>
                        <p className="text-lg font-black text-primary">{booking.eta}</p>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                <div className="flex items-start gap-4">
                    <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20"></div>
                        <div className="w-px h-8 bg-gray-200 mx-auto my-1"></div>
                        <div className="w-2 h-2 rounded-full bg-accent ring-2 ring-accent/20"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Pick-up</p>
                            <p className="text-sm font-bold text-gray-800">{booking.pickup}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Drop-off</p>
                            <p className="text-sm font-bold text-gray-800">{booking.dropoff}</p>
                        </div>
                    </div>
                </div>
                
                {booking.status === 'Active' && (
                    <div className="pt-2">
                        <div className="h-1 w-full bg-gray-100 mb-1">
                            <div className="h-full bg-primary" style={{ width: `${booking.progress}%` }}></div>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trip Progress</p>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">{booking.rideStatus}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <CarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold">{booking.vehicle?.type || booking.vehicle}</span>
                </div>
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold">{booking.passengers} Pax</span>
                </div>
                {booking.status === 'Completed' && (
                    <div className="col-span-2 flex justify-between items-center bg-gray-50 p-2 border border-dashed border-gray-200 mt-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Final Fare Paid</span>
                        <span className="font-black text-primary font-display">${booking.fare?.toFixed(2)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const ScheduleRideCard = ({ booking }: { booking: any }) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-blue-50/50 p-4 border border-blue-100">
                <div>
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Scheduled for</p>
                    <p className="text-lg font-black text-blue-900 leading-none">{booking.date}</p>
                    <p className="text-sm font-bold text-blue-800 mt-1">{booking.time}</p>
                </div>
                {booking.status === 'Upcoming' && (
                    <div className="text-right">
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Countdown</p>
                        <p className="font-black text-blue-700 bg-white px-2 py-1 border border-blue-200">{booking.countdown}</p>
                    </div>
                )}
            </div>

            <div className="space-y-3 px-1">
                <div className="flex items-start gap-4">
                    <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 ring-2 ring-blue-500/20"></div>
                        <div className="w-px h-8 bg-gray-200 mx-auto my-1"></div>
                        <div className="w-2 h-2 rounded-full bg-accent ring-2 ring-accent/20"></div>
                    </div>
                    <div className="flex-1 space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Pick-up</p>
                            <p className="text-sm font-bold text-gray-800">{booking.pickup}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Drop-off</p>
                            <p className="text-sm font-bold text-gray-800">{booking.dropoff}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                    <ShieldIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold">{booking.vehicleClass}</span>
                </div>
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold">{booking.passengers} Pax</span>
                </div>
            </div>
        </div>
    );
};

const CarRentalCard = ({ booking }: { booking: any }) => {
    return (
        <div className="space-y-4">
            {booking.vehicleImage && (
                <div className="relative h-40 bg-gray-100 overflow-hidden border border-gray-200">
                    <img src={booking.vehicleImage} className="w-full h-full object-cover" alt={booking.vehicle} />
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest backdrop-blur-sm">
                        {booking.vehicle}
                    </div>
                    {booking.status === 'Active' && (
                        <div className="absolute bottom-2 right-2 bg-primary text-white text-[10px] font-black px-3 py-1 uppercase tracking-[0.2em] shadow-lg">
                            {booking.remainingDuration} Left
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="bg-gray-50 p-3 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Rental Start</p>
                    <p className="text-[11px] font-bold text-gray-800">{booking.date}</p>
                    <p className="text-[10px] font-medium text-gray-500">{booking.time}</p>
                </div>
                <div className="bg-gray-50 p-3 border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Rental Return</p>
                    <p className="text-[11px] font-bold text-gray-800">{booking.returnDate}</p>
                    <p className="text-[10px] font-medium text-gray-500">{booking.returnTime}</p>
                </div>
            </div>

            <div className="space-y-3 px-1">
                <div className="flex items-start gap-4">
                    <MapPinIcon className="w-4 h-4 text-primary mt-1 shrink-0" />
                    <div className="flex-1">
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Rental Hub</p>
                         <p className="text-sm font-bold text-gray-800">{booking.pickup}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                 <div className="flex items-center gap-2 text-xs font-bold">
                    <GlobeIcon className="w-4 h-4 text-gray-400" />
                    Free WiFi Included
                </div>
                <div className="flex justify-end items-center gap-1 font-display">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Total</span>
                    <span className="text-lg font-black text-primary">${booking.totalRate || 'TBD'}</span>
                </div>
            </div>
        </div>
    );
};


const TripDetailsViewScreen: React.FC<NavigationProps> = ({ navigate }) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [isModifying, setIsModifying] = useState(false);

    const booking = {
        id: 'XT-12345',
        type: 'Scheduled Ride',
        pickup: 'Kotoka Int\'l Airport',
        dropoff: 'East Legon',
        date: '2025-05-15',
        time: '02:30 PM',
        passengers: 2,
        vehicle: 'Economy Sedan',
        status: 'Upcoming',
        bookingFee: 2.00,
        estimatedFare: 13.00,
        total: 15.00
    };

    const handleCancel = () => {
        alert(`Booking cancelled. Reason: ${cancelReason || 'No reason provided'}`);
        setShowCancelModal(false);
        navigate('MyBookings');
    };

    const handleModify = (e: React.FormEvent) => {
        e.preventDefault();
        alert('Booking updated successfully!');
        setIsModifying(false);
        navigate('MyBookings');
    };

    if (isModifying) {
        return (
            <ScreenContainer>
                <Header title="Modify Booking" onBack={() => setIsModifying(false)} />
                <div className="p-6 space-y-6">
                    <div className="bg-primary/5 p-4 border border-primary/10">
                         <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 text-center">Modification Policy</p>
                         <p className="text-xs text-center text-gray-600 leading-relaxed">You can modify your booking details up to 2 hours before the scheduled time. Some changes may affect the final fare.</p>
                    </div>
                    
                    <form onSubmit={handleModify} className="space-y-5 pb-20">
                        <Input label="Pick-up Location" defaultValue={booking.pickup} />
                        <Input label="Drop-off Location" defaultValue={booking.dropoff} />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Date" type="date" defaultValue="2025-05-15" />
                            <Input label="Time" type="time" defaultValue="14:30" />
                        </div>
                        <Input label="Passengers" type="number" defaultValue={booking.passengers} />
                        
                        <div className="pt-6">
                            <Button type="submit">Update Booking</Button>
                            <button 
                                type="button" 
                                onClick={() => setIsModifying(false)}
                                className="w-full mt-3 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 underline"
                            >
                                Cancel Changes
                            </button>
                        </div>
                    </form>
                </div>
            </ScreenContainer>
        );
    }

    return (
        <ScreenContainer>
            <Header title="Booking Details" onBack={() => navigate('MyBookings')} />
            
            <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto">
                {/* Map Placeholder */}
                <div className="bg-gray-100 h-48 rounded-none border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://i.ibb.co/zWN7ZHns/Airport-Pickup-1.jpg')] bg-cover bg-center opacity-20"></div>
                    <MapPinIcon className="w-10 h-10 text-primary mb-2 relative z-10" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs relative z-10">Route Map Placeholder</p>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm z-10">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{booking.status}</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Main Details */}
                    <section className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 leading-none mb-1">{booking.type}</h2>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {booking.id}</p>
                            </div>
                            <div className="bg-gray-50 border border-gray-100 p-2 text-center min-w-[80px]">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-tight">Passengers</p>
                                <p className="font-black text-primary">{booking.passengers}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 flex flex-col items-center">
                                    <div className="w-2 h-2 rounded-none bg-primary"></div>
                                    <div className="w-px h-10 bg-gray-100 my-1"></div>
                                    <div className="w-2 h-2 rounded-none bg-accent"></div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Pick-up Location</p>
                                        <p className="text-sm font-bold text-gray-800">{booking.pickup}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Drop-off Location</p>
                                        <p className="text-sm font-bold text-gray-800">{booking.dropoff}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                                <p className="font-bold text-gray-900">{booking.date}</p>
                            </div>
                            <div className="bg-gray-50 p-4 border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Time</p>
                                <p className="font-bold text-gray-900">{booking.time}</p>
                            </div>
                        </div>
                    </section>

                    {/* Timeline */}
                    <section className="space-y-4">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Booking Timeline</h3>
                        <div className="space-y-4 px-2">
                             {[
                                { status: 'Booking Confirmed', time: '10 May, 09:00 AM', completed: true },
                                { status: 'Payment Processed', time: '10 May, 09:02 AM', completed: true },
                                { status: 'Driver Assigned', time: 'Pending', completed: false },
                                { status: 'Trip Started', time: 'Pending', completed: false },
                             ].map((step, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="mt-1.5 shrink-0">
                                        <div className={`w-3 h-3 rounded-full ${step.completed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-200'}`}></div>
                                    </div>
                                    <div className="flex-1 border-b border-gray-50 pb-2">
                                        <p className={`text-sm font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>{step.status}</p>
                                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">{step.time}</p>
                                    </div>
                                </div>
                             ))}
                        </div>
                    </section>

                    {/* Payment Summary */}
                    <section className="bg-gray-50 p-6 rounded-none border border-dashed border-gray-300">
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 text-center">Payment Summary</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-bold text-gray-600">
                                <span>Estimated Fare</span>
                                <span>${booking.estimatedFare.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-gray-600">
                                <span>Booking Fee</span>
                                <span>${booking.bookingFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black text-gray-900 border-t border-gray-200 pt-2 mt-2">
                                <span>Estimated Total</span>
                                <span className="text-primary font-display">${booking.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Contextual Actions */}
                    <section className="flex flex-col gap-3 py-6">
                        {booking.status === 'Upcoming' && (
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setIsModifying(true)}
                                    className="py-4 border border-gray-200 text-gray-800 font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all rounded-none"
                                >
                                    Modify
                                </button>
                                <button 
                                    onClick={() => setShowCancelModal(true)}
                                    className="py-4 border border-red-100 text-red-600 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-none"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                        <button className="py-4 bg-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-none opacity-50 cursor-not-allowed">
                            Download Receipt
                        </button>
                    </section>
                </div>
            </div>

            {/* Cancel Modal */}
                <Modal 
                    isOpen={showCancelModal} 
                    onClose={() => setShowCancelModal(false)}
                    title="Cancel Booking"
                >
                    <div className="space-y-6">
                        <div className="bg-red-50 p-4 border border-red-100 text-red-800 text-sm font-medium">
                            Are you sure you want to cancel this booking? This action cannot be undone.
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Reason for Cancellation (Optional)</label>
                            <textarea 
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Please let us know why you are cancelling..."
                                className="w-full p-4 border border-gray-200 rounded-none focus:border-primary focus:ring-0 min-h-[120px] text-sm"
                            ></textarea>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button 
                                onClick={handleCancel}
                                className="flex-1 py-4 bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all rounded-none shadow-lg shadow-red-600/20"
                            >
                                Confirm Cancellation
                            </button>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 py-4 bg-gray-100 text-gray-800 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all rounded-none"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </Modal>
        </ScreenContainer>
    );
};

const AccountProfileScreen: React.FC<NavigationProps> = ({ navigate, logout }) => {
    return (
        <ScreenContainer>
            <Header title="My Profile" onBack={() => navigate('ServiceSelection')} onForward={() => navigate('TripHistory')} />
            <div className="p-4">
                <div className="flex flex-col items-center mb-6">
                    <img src="https://i.pravatar.cc/150?u=customer" alt="Profile" className="w-24 h-24 rounded-full mb-2" />
                    <h2 className="text-xl font-bold">Ama Serwaa</h2>
                    <p className="text-gray-600">customer@xtass.com</p>
                </div>
                <div className="space-y-2">
                    <button onClick={() => navigate('MyBookings')} className="w-full text-left p-4 bg-gray-50 rounded-lg flex justify-between items-center font-bold text-primary border border-primary/10"><span>My Bookings</span> <ArrowRightIcon className="w-5 h-5"/></button>
                    <button onClick={() => navigate('SavedPassengers')} className="w-full text-left p-4 bg-gray-50 rounded-lg flex justify-between items-center"><span>Saved Passengers</span> <ArrowRightIcon className="w-5 h-5"/></button>
                    <button onClick={() => navigate('EmergencyContacts')} className="w-full text-left p-4 bg-gray-50 rounded-lg flex justify-between items-center"><span>Emergency Contacts</span> <ArrowRightIcon className="w-5 h-5"/></button>
                    <button className="w-full text-left p-4 bg-gray-50 rounded-lg flex justify-between items-center"><span>Payment Methods</span> <ArrowRightIcon className="w-5 h-5"/></button>
                </div>
                <Button variant="secondary" onClick={logout} className="mt-8">Logout</Button>
            </div>
        </ScreenContainer>
    );
};

const SavedPassengersScreen: React.FC<NavigationProps> = ({ navigate }) => {
    return (
        <ScreenContainer>
            <Header title="Saved Passengers" onBack={() => navigate('AccountProfile')} />
            <div className="p-4 text-center">
                <p>You have no saved passengers.</p>
                <Button className="mt-4">Add Passenger</Button>
            </div>
        </ScreenContainer>
    );
};

const EmergencyContactsScreen: React.FC<NavigationProps> = ({ navigate }) => {
    return (
        <ScreenContainer>
            <Header title="Emergency Contacts" onBack={() => navigate('AccountProfile')} />
            <div className="p-4 text-center">
                <p>You have no emergency contacts.</p>
                <Button className="mt-4">Add Contact</Button>
            </div>
        </ScreenContainer>
    );
};
