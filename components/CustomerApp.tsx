// SCREEN 2 UPDATED ONLY — All other screens remain untouched. Removed duplicate contact icons from the Welcome/Login screen.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Screen, NavigationProps } from '../types';
import { Button, Input, Header, BottomNav, FloatingActionButtons, ScreenContainer, Toast, Modal } from './shared/UI';
import { UserIcon, LockIcon, PhoneIcon, MapPinIcon, UsersIcon, BriefcaseIcon, CalendarIcon, ClockIcon, CreditCardIcon, ArrowRightIcon, CheckCircleIcon, XCircleIcon, ChevronLeftIcon, EyeIcon, EyeOffIcon, MailIcon, CameraIcon, ChevronDownIcon, ShieldIcon, GoogleIcon, UploadCloudIcon, CarIcon, BabyIcon, BusIcon, SnowflakeIcon, FileTextIcon, StarIcon } from './Icons';

// Type for booking details from the landing page form
interface BookingDetails {
  rideType: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
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
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [selectedVehicleClassInfo, setSelectedVehicleClassInfo] = useState<VehicleClassInfo | null>(null);
  const [rentalDuration, setRentalDuration] = useState(0);
  const [currentFlow, setCurrentFlow] = useState<'shuttle' | 'rental' | null>(null);
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
        return <AuthScreen navigate={navigate} isLogin logout={logout} />;
      case 'Register':
        return <AuthScreen 
            navigate={(nextScreen: Screen) => {
                if (nextScreen === 'OTPVerification') {
                    setOtpOrigin('Register');
                }
                navigate(nextScreen);
            }} 
            isLogin={false} 
            logout={logout}
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
                  if (nextScreen === 'CompatibleShuttlesList') {
                      setShuttleFlowOrigin('TripDetailsInput');
                  }
                  navigate(nextScreen);
              }} 
              setVehicleTypeForFilter={setSelectedVehicleClassInfo}
              initialDetails={rideDetails}
          />;
      case 'ScheduleRide':
          return <ScheduleRideScreen 
              navigate={(nextScreen: Screen) => {
                  if (nextScreen === 'CompatibleShuttlesList') {
                      setShuttleFlowOrigin('ScheduleRide');
                  }
                  navigate(nextScreen);
              }} 
              setVehicleTypeForFilter={setSelectedVehicleClassInfo}
              initialDetails={rideDetails}
          />;
      case 'CarRental':
          return <CarRentalScreen navigate={navigate} setRentalDuration={setRentalDuration} setVehicleTypeForFilter={setSelectedVehicleClassInfo} setRentalDetails={setRentalDetails} />;
      case 'AvailableCarsForRent':
          return <AvailableCarsForRentScreen navigate={navigate} onBack={() => navigate('CarRental')} onCarSelect={setSelectedCar} selectedClassInfo={selectedVehicleClassInfo} />;
      case 'CarRentDetails':
          return <CarRentDetailsScreen navigate={navigate} car={selectedCar} onBack={() => navigate('AvailableCarsForRent')} rentalDuration={rentalDuration} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'CarRentalConfirmation':
          return <CarRentalConfirmationScreen navigate={navigate} car={selectedCar} rentalDetails={rentalDetails} rentalDuration={rentalDuration} onBack={() => navigate('CarRentDetails')} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'CompatibleShuttlesList':
          return <CompatibleShuttlesListScreen navigate={navigate} onBack={() => navigate(shuttleFlowOrigin)} selectedClassInfo={selectedVehicleClassInfo} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'ShuttleDriverDetails':
          return <ShuttleDriverDetailsScreen navigate={navigate} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'BookingConfirmation':
          return <BookingConfirmationScreen navigate={navigate} />;
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
          return <TripCompletionReceiptScreen navigate={navigate} flow={currentFlow} car={selectedCar} duration={rentalDuration} showToast={showToast} />;
// FIX: Resolve "Cannot find name" error by defining the component.
      case 'TripHistory':
          return <TripHistoryScreen navigate={navigate} />;
// FIX: Resolve "Cannot find name" error by defining the component.
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
      {showNav && <BottomNav navigate={navigate} activeScreen={screen} />}
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

const AuthScreen: React.FC<{ navigate: (s: Screen) => void, isLogin: boolean, logout?: () => void }> = ({ navigate, isLogin, logout }) => {
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
        <div className="relative flex flex-col items-center justify-start md:justify-center min-h-screen bg-gray-100 p-4 md:p-8 overflow-x-hidden">
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
            
            <button onClick={() => isLogin && logout ? logout() : navigate('Login')} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-200 z-10" aria-label="Go back">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <div className="w-full max-w-[98%] sm:max-w-[90%] md:max-w-md lg:max-w-sm bg-white p-6 sm:p-8 md:p-10 lg:p-8 rounded-xl shadow-lg mt-12 md:mt-0 mb-8 md:mb-0 transition-all duration-500">
                <h2 className="text-2xl font-bold font-display text-gray-900 text-center">{title}</h2>
                <p className="text-center text-gray-500 mb-6">{subTitle}</p>
                
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
                            <button onClick={() => navigate('PostLoginVerification')} className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[48px]">
                                <GoogleIcon className="w-5 h-5"/>
                                <span>Login with Gmail</span>
                            </button>
                            <button onClick={() => navigate('LivePhotoLogin')} className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 min-h-[48px]">
                                <CameraIcon className="w-5 h-5 text-primary"/>
                                <span>Login with Live Photo Capture</span>
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
                                <h3 className="text-lg font-semibold mb-4 text-center">Enter your email (optional)</h3>
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
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
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
            if (code === "235777") {
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


const ServiceSelectionScreen: React.FC<NavigationProps & { setFlow: (flow: 'shuttle' | 'rental') => void }> = ({ navigate, logout, setFlow }) => (
    <ScreenContainer>
        <Header title="Book a Ride" onBack={logout} />
        <div className="p-4 space-y-4">
            <div onClick={() => { setFlow('shuttle'); navigate('TripDetailsInput'); }} className="bg-primary text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-primary-hover transition-colors">
                <h3 className="text-2xl font-display font-bold">Instant Ride</h3>
                <p className="mt-1">Book the next available shuttle.</p>
            </div>
            <div onClick={() => { setFlow('shuttle'); navigate('ScheduleRide'); }} className="bg-accent text-[#660032] p-6 rounded-lg shadow-lg cursor-pointer hover:bg-yellow-400 transition-colors">
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
  initialDetails: BookingDetails | null;
}
const TripDetailsInputScreen: React.FC<TripDetailsInputScreenProps> = ({ navigate, setVehicleTypeForFilter, initialDetails }) => {
    const [pickup, setPickup] = useState(initialDetails?.pickup || "Kotoka Int'l Airport, Terminal 3");
    const [destination, setDestination] = useState(initialDetails?.dropoff || '');
    const [passengers, setPassengers] = useState(initialDetails?.passengers || '');
    const [luggage, setLuggage] = useState('');
    const [childSeat, setChildSeat] = useState(false);
    const [wheelchairAccess, setWheelchairAccess] = useState(false);
    const [vehicleType, setVehicleType] = useState<string | null>(null);
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
            <Header title="Instant Ride" onBack={() => navigate('ServiceSelection')} />
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
                <Input id="passengers" label="Passengers" type="number" placeholder="1" value={passengers} onChange={e => setPassengers(e.target.value)} icon={<UsersIcon className="w-5 h-5 text-gray-400" />} />
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
                            if (vehicleType && vehicleTypes[vehicleType as keyof typeof vehicleTypes]) {
                                setVehicleTypeForFilter(vehicleTypes[vehicleType as keyof typeof vehicleTypes]);
                            } else {
                                setVehicleTypeForFilter(null);
                            }
                            navigate('CompatibleShuttlesList');
                        }} 
                        disabled={!pickup || !destination || !passengers}
                    >
                        Find Ride
                    </Button>
                </div>
            </div>
        </ScreenContainer>
    );
};

interface ScheduleRideScreenProps extends NavigationProps {
  setVehicleTypeForFilter: (info: VehicleClassInfo | null) => void;
  initialDetails: BookingDetails | null;
}
const ScheduleRideScreen: React.FC<ScheduleRideScreenProps> = ({ navigate, setVehicleTypeForFilter, initialDetails }) => {
    const [pickup, setPickup] = useState(initialDetails?.pickup || "Kotoka Int'l Airport, Terminal 3");
    const [destination, setDestination] = useState(initialDetails?.dropoff || '');
    const [date, setDate] = useState(initialDetails?.date || '');
    const [time, setTime] = useState(initialDetails?.time || '');
    const [passengers, setPassengers] = useState(initialDetails?.passengers || '');
    const [vehicleType, setVehicleType] = useState<string | null>(null);
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
        if (vehicleType && vehicleTypes[vehicleType as keyof typeof vehicleTypes]) {
            setVehicleTypeForFilter(vehicleTypes[vehicleType as keyof typeof vehicleTypes]);
        } else {
            setVehicleTypeForFilter(null);
        }
        navigate('CompatibleShuttlesList');
    };
    
    return (
        <ScreenContainer>
            <Header title="Schedule a Ride" onBack={() => navigate('ServiceSelection')} />
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
                <div className="pt-2">
                    <Button onClick={handleFindRide} disabled={!pickup || !destination || !passengers || date.length !== 10 || !!dateError || !time}>Find Ride</Button>
                </div>
            </div>
        </ScreenContainer>
    );
};

interface CarRentalScreenProps extends NavigationProps {
    setRentalDuration: (duration: number) => void;
    setVehicleTypeForFilter: (info: VehicleClassInfo | null) => void;
    setRentalDetails: (details: RentalDetails | null) => void;
}
const CarRentalScreen: React.FC<CarRentalScreenProps> = ({ navigate, setRentalDuration, setVehicleTypeForFilter, setRentalDetails }) => {
    const [details, setDetails] = useState({
        pickupDate: '',
        pickupTime: '',
        returnDate: '',
        returnTime: '',
        passengers: '1',
        luggage: '1',
        pickupLocation: "Kotoka Int'l Airport, Terminal 3",
        dropoffLocation: "Kotoka Int'l Airport, Terminal 3",
    });
    const [pickupDateError, setPickupDateError] = useState('');
    const [returnDateError, setReturnDateError] = useState('');

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

        const pickupDateParts = pickupDate.split('/'); // DD/MM/YYYY
        const returnDateParts = returnDate.split('/');
        
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
        });
        setVehicleTypeForFilter(null); 
        navigate('AvailableCarsForRent');
    };

    return (
        <ScreenContainer>
            <Header title="Car Rental" onBack={() => navigate('ServiceSelection')} />
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
                <Button onClick={handleSubmit}>See Available Cars</Button>
            </div>
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

const ShuttleDriverDetailsScreen: React.FC<NavigationProps> = ({ navigate }) => {
    return (
        <ScreenContainer>
            <Header title="Driver Details" onBack={() => navigate('CompatibleShuttlesList')} />
            <div className="p-4 text-center">
                <img src="https://i.pravatar.cc/150?u=Kofi Mensah" alt="Driver" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-primary" />
                <h2 className="text-2xl font-bold">Kofi Mensah</h2>
                <div className="flex items-center justify-center text-lg mt-1">
                    <StarIcon className="w-5 h-5 text-yellow-500 mr-1" /> 4.8
                </div>
                <div className="mt-4 bg-gray-50 p-4 rounded-lg text-left space-y-2">
                    <p><strong>Vehicle:</strong> Toyota Hiace</p>
                    <p><strong>License Plate:</strong> GT-1234-20</p>
                    <p><strong>Member Since:</strong> 2023</p>
                </div>
                <Button onClick={() => navigate('BookingConfirmation')} className="mt-6">Confirm Booking</Button>
            </div>
        </ScreenContainer>
    );
};

const BookingConfirmationScreen: React.FC<NavigationProps> = ({ navigate }) => {
    return (
        <ScreenContainer>
            <Header title="Confirm Booking" onBack={() => navigate('ShuttleDriverDetails')} />
            <div className="p-4 space-y-4">
                 <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-2">Trip Summary</h3>
                    <div className="space-y-2 border-t pt-2">
                        <p><strong>From:</strong> Kotoka Int'l Airport</p>
                        <p><strong>To:</strong> Accra Mall</p>
                        <p><strong>Est. Fare:</strong> $10.00</p>
                        <p><strong>Driver:</strong> Kofi Mensah</p>
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
            <Header title="Select Payment" onBack={onBack} />
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
                <Button onClick={() => navigate('ServiceSelection')} className="mt-6">Done</Button>
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
            <Header title="Trip History" />
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
        </ScreenContainer>
    );
};

const TripDetailsViewScreen: React.FC<NavigationProps> = ({ navigate }) => {
    return (
        <ScreenContainer>
            <Header title="Trip Details" onBack={() => navigate('TripHistory')} />
            <div className="p-4 space-y-4">
                <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center"><p>Map Placeholder</p></div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p><strong>Date:</strong> {new Date('2025-10-26').toLocaleString()}</p>
                    <p><strong>From:</strong> Kotoka Int'l Airport</p>
                    <p><strong>To:</strong> Accra Mall</p>
                    <p><strong>Driver:</strong> Kofi Mensah</p>
                    <p><strong>Fare:</strong> $10.00</p>
                </div>
            </div>
        </ScreenContainer>
    );
};

const AccountProfileScreen: React.FC<NavigationProps> = ({ navigate, logout }) => {
    return (
        <ScreenContainer>
            <Header title="My Profile" />
            <div className="p-4">
                <div className="flex flex-col items-center mb-6">
                    <img src="https://i.pravatar.cc/150?u=customer" alt="Profile" className="w-24 h-24 rounded-full mb-2" />
                    <h2 className="text-xl font-bold">Ama Serwaa</h2>
                    <p className="text-gray-600">customer@xtass.com</p>
                </div>
                <div className="space-y-2">
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
