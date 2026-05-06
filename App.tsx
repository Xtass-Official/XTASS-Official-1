import React, { useState, useCallback, useRef } from 'react';
import { CustomerApp } from './components/CustomerApp';
import { DriverApp } from './components/DriverApp';
import { AdminPanel } from './components/AdminPanel';
import { AuthDropdown } from './components/shared/AuthDropdown';
import type { Role, Screen } from './types';
import { 
  SearchIcon, CheckCircleIcon, BookingIcon, CarIcon, ChevronDownIcon, MapPinIcon, 
  CalendarIcon, ClockIcon, ShieldIcon, StarIcon, DollarSignIcon, UploadCloudIcon,
  PhoneIcon, FacebookIcon, InstagramIcon, TikTokIcon, YoutubeIcon, PinterestIcon, 
  TwitterIcon, ChevronRightIcon, BriefcaseIcon, BarChart2Icon, GraduationCapIcon, CompassIcon,
  UserIcon, MailIcon, ArrowRightIcon, FileTextIcon, MessageSquareIcon, TrophyIcon,
  GlobeIcon, AwardIcon, UserCheckIcon, TrendingDownIcon
} from './components/Icons';
import { motion, AnimatePresence } from 'motion/react';

// Type for booking details from the landing page form
interface BookingDetails {
  rideType: string;
  pickup: string;
  dropoff: string;

  date: string;
  time: string;
  passengers: string;
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


const App: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [screen, setScreen] = useState<Screen>('Welcome');
  const [initialBookingDetails, setInitialBookingDetails] = useState<BookingDetails | null>(null);

  const navigate = useCallback((newScreen: Screen) => {
    setScreen(newScreen);
  }, []);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    switch (selectedRole) {
      case 'Customer':
        navigate('Login');
        break;
      case 'Driver':
        navigate('DriverLogin');
        break;
      case 'Admin':
        navigate('AdminLogin');
        break;
    }
  };
  
  const logout = () => {
    setRole(null);
    setScreen('Welcome');
    setInitialBookingDetails(null);
  };

  const renderContent = () => {
    if (!role) {
      return <WelcomeScreen onRoleSelect={handleRoleSelect} setInitialBookingDetails={setInitialBookingDetails} />;
    }

    switch (role) {
      case 'Customer':
        return <CustomerApp screen={screen} navigate={navigate} logout={logout} initialBookingDetails={initialBookingDetails} clearInitialBookingDetails={() => setInitialBookingDetails(null)} />;
      case 'Driver':
        return <DriverApp screen={screen} navigate={navigate} logout={logout} />;
      case 'Admin':
        return <AdminPanel screen={screen} navigate={navigate} logout={logout} />;
      default:
        return <WelcomeScreen onRoleSelect={handleRoleSelect} setInitialBookingDetails={setInitialBookingDetails} />;
    }
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {renderContent()}
    </div>
  );
};

interface WelcomeScreenProps {
  onRoleSelect: (role: Role) => void;
  setInitialBookingDetails: (details: BookingDetails | null) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onRoleSelect, setInitialBookingDetails }) => {
  const [view, setView] = useState('home');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openFullFaq, setOpenFullFaq] = useState<number | null>(0);
  
  // State for landing page booking form
  const [rideType, setRideType] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [passengers, setPassengers] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');


  // State for Report an Issue form
  const [reportIssueData, setReportIssueData] = useState({
      fullName: '',
      email: '',
      phone: '',
      tripDate: '',
      tripType: '',
      issueType: '',
      description: '',
  });
  const [reportFile, setReportFile] = useState<File | null>(null);

  // State for Lost & Found form
  const [lostAndFoundData, setLostAndFoundData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tripDate: '',
    tripType: '',
    description: '',
  });
  const [lostAndFoundFile, setLostAndFoundFile] = useState<File | null>(null);


  const handleReportIssueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setReportIssueData(prev => ({ ...prev, [name]: value }));
  };

  const handleReportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setReportFile(e.target.files[0]);
      } else {
          setReportFile(null);
      }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert('Thank you for your report. Our team will review it and get back to you shortly.');
      // Reset form
      setReportIssueData({
          fullName: '',
          email: '',
          phone: '',
          tripDate: '',
          tripType: '',
          issueType: '',
          description: '',
      });
      setReportFile(null);
  };

  const handleLostAndFoundChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLostAndFoundData(prev => ({ ...prev, [name]: value }));
  };

  const handleLostAndFoundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setLostAndFoundFile(e.target.files[0]);
      } else {
          setLostAndFoundFile(null);
      }
  };

  const handleLostAndFoundSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert('Your lost item report has been submitted. We will contact you shortly.');
      // Reset form
      setLostAndFoundData({
          fullName: '',
          email: '',
          phone: '',
          tripDate: '',
          tripType: '',
          description: '',
      });
      setLostAndFoundFile(null);
  };


  const NavLink: React.FC<{href: string; children: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void}> = ({ href, children, onClick }) => (
    <a href={href} onClick={(e) => { e.preventDefault(); onClick?.(e); }} className="text-gray-800 hover:text-primary transition-colors">{children}</a>
  );

  const NavLinkRed: React.FC<{children: React.ReactNode; onClick: () => void; active?: boolean}> = ({ children, onClick, active }) => (
    <button 
      onClick={onClick} 
      className={`h-full px-6 flex items-center text-sm font-bold transition-all ${active ? 'text-accent' : 'text-white hover:text-accent'}`}
    >
      {children}
    </button>
  );

  const DropdownLink: React.FC<{children: React.ReactNode; onClick?: () => void}> = ({ children, onClick }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }} className="text-gray-600 hover:text-primary transition-colors text-sm font-medium py-2 px-6 rounded-none whitespace-nowrap block">
      {children}
    </a>
  );

  const SocialIcon: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <a href="#" onClick={(e) => e.preventDefault()} className="text-white hover:text-accent transition-colors p-1 opacity-90 hover:opacity-100">
      {children}
    </a>
  );

  const MobileNavLink: React.FC<{children: React.ReactNode; onClick: () => void}> = ({ children, onClick }) => (
    <button onClick={onClick} className="w-full text-left py-3 text-lg font-bold text-gray-800 border-b border-gray-100">
      {children}
    </button>
  );

  const DropdownLinkMobile: React.FC<{children: React.ReactNode; onClick?: () => void}> = ({ children, onClick }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }} className="text-gray-600 hover:text-primary font-medium py-2 text-base transition-colors">
      {children}
    </a>
  );
  
  const faqs = [
    { q: 'Can I book rides in both my departure and arrival cities?', a: 'Yes. When you book with XTASS, you can schedule all four legs of your trip with rides to and from the airport in both your home city and your destination. One booking takes care of it all.' },
    { q: 'What happens if my flight is delayed or cancelled?', a: 'We track your flight status to adjust pickup times accordingly. If your flight is cancelled, please contact our support to reschedule or cancel your ride.' },
    { q: 'How do I know if you operate at my airport?', a: 'We operate at all major airports across Ghana. You can check the "Where We Go" section on our homepage or enter your airport in the booking form to confirm.' },
    { q: 'What kind of vehicles do you use for airport transportation?', a: 'We offer a wide range of vehicles to suit your needs, including sedans, SUVs, and vans for larger groups. All vehicles are clean, modern, and regularly inspected for safety.' },
  ];

  const fullFaqs = [
    {
      q: '1. What is XTASS?',
      a: 'XTASS is a professional airport and city transportation service that provides safe, reliable, and comfortable rides for travelers across Ghana. Customers can book instant rides, schedule trips in advance, or rent vehicles with drivers for hours or days — all through a convenient online platform.'
    },
    {
      q: '2. What types of rides does XTASS offer?',
      a: 'XTASS offers three main ride types: <strong>Instant Ride</strong>, <strong>Scheduled Ride</strong>, and <strong>Rental Ride</strong>. Instant Ride is for immediate pick-up requests, Scheduled Ride lets you pre-book for a specific time, and Rental Ride allows you to hire a car with a driver for a set number of hours or a full day.'
    },
    {
      q: '3. Can I book a ride in advance?',
      a: 'Yes. With <strong>XTASS Scheduled Rides</strong>, you can plan your trip days or even weeks ahead. This feature is especially helpful for airport drop-offs, business meetings, and important events where timing is critical.'
    },
    {
      q: '4. How do I book a ride?',
      a: 'You can easily book your ride using our <strong>secure online booking system</strong>, available 24/7. Simply choose your pickup and drop-off locations, select your ride type and service level, and confirm your booking. You’ll receive instant confirmation and ride details via email and SMS.'
    },
    {
      q: '5. What areas does XTASS operate in?',
      a: 'XTASS currently serves major cities and airports across <strong>Ghana</strong>, including <strong>Accra</strong> and surrounding regions, with plans to expand across Africa and beyond. Our services cover airport transfers, city commutes, and intercity trips.'
    },
    {
      q: '6. Is XTASS available 24/7?',
      a: 'Yes. XTASS operates <strong>24 hours a day, 7 days a week</strong>, including weekends and holidays. You can request or schedule a ride anytime.'
    },
    {
      q: '7. How safe are XTASS rides?',
      a: 'Safety is our <strong>top priority</strong>. All XTASS drivers undergo strict background checks and continuous monitoring. Vehicles are regularly inspected, cleaned, and maintained to meet high safety standards. We partner only with <strong>trusted, verified local operators</strong> to ensure your well-being on every trip.'
    },
    {
      q: '8. What types of vehicles are available?',
      a: 'XTASS provides a range of vehicles across different service levels — from <strong>Premium and Business class rides</strong> for executives and comfort seekers to <strong>Economy and Basic options</strong> for everyday, budget-friendly travel. Whether you need a sedan, SUV, or van for a group, there’s always a suitable option available.'
    },
    {
      q: '9. Can I book a round-trip?',
      a: 'Yes. XTASS allows both <strong>one-way</strong> and <strong>round-trip</strong> bookings. You can plan your return ride in advance for added convenience.'
    },
    {
      q: '10. Can I use XTASS for group or family travel?',
      a: 'Absolutely. XTASS offers <strong>group travel options</strong> designed for families, tour groups, and corporate teams. Larger vehicles or multi-seat vans are available to ensure everyone rides together comfortably.'
    },
    {
      q: '11. Does XTASS provide airport transfer services?',
      a: 'Yes. <strong>Airport transfers</strong> are one of our core services. You can book a pickup or drop-off to and from the airport anytime. We also use <strong>flight tracking technology</strong> to ensure your driver arrives on time, even if your flight is delayed or rescheduled.'
    },
    {
      q: '12. What payment methods does XTASS accept?',
      a: 'XTASS accepts multiple payment options, including <strong>credit/debit cards, mobile money</strong>, and other secure online payment methods. You’ll receive a payment confirmation immediately after booking.'
    },
    {
      q: '13. Will I receive a receipt after payment?',
      a: 'Yes. You’ll receive a <strong>payment notification</strong> immediately after your booking is confirmed, and an <strong>official receipt</strong> after the trip is completed. Both are sent to your email and stored in your account’s ride history.'
    },
    {
      q: '14. Can I change or cancel my booking?',
      a: 'Yes. Bookings can be <strong>modified or canceled</strong> depending on the ride type and timing. Cancellations made early may be free, while last-minute cancellations might attract a small fee. Details are shown clearly during the booking process.'
    },
    {
      q: '15. How do I contact XTASS for support?',
      a: 'You can reach our <strong>customer support team</strong> directly through the app or website via chat, phone, or email. We’re always available to assist you with bookings, inquiries, or special requests.'
    },
    {
      q: '16. Does XTASS operate internationally?',
      a: 'XTASS currently operates in <strong>Ghana</strong> but is actively expanding across <strong>Africa</strong>. Our goal is to build a connected network of smart, safe, and efficient transportation services across the continent.'
    },
    {
      q: '17. What makes XTASS different from other transport services?',
      a: 'XTASS stands out for its <strong>uncompromising safety standards</strong>, consistent quality, and <strong>ease of booking</strong>. With multiple ride options, flexible scheduling, and transparent pricing, XTASS ensures every customer enjoys a <strong>stress-free, reliable, and high-quality travel experience.</strong>'
    }
  ];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { newValue, error } = validateAndFormatDate(e.target.value, date);
    setDate(newValue);
    setDateError(error);
  };

  const validateTime = (val: string, setError: (err: string) => void): boolean => {
    if (!val) {
        setError('Please select a time.');
        return false;
    }
    setError('');
    return true;
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTime(value);
    validateTime(value, setTimeError);
  };

  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour % 12 === 0 ? 12 : hour % 12;
        const m = minute.toString().padStart(2, '0');
        const ampm = hour < 12 ? 'AM' : 'PM';
        times.push(`${h}:${m} ${ampm}`);
      }
    }
    return times;
  };
  const timeOptions = generateTimeOptions();

  const handleBookNow = () => {
    if (rideType === 'Scheduled Ride') {
      const isDateValid = date.length === 10 && !dateError;
      const isTimeValid = validateTime(time, setTimeError);

      if (!isDateValid || !isTimeValid) {
        if (!isDateValid) setDateError(dateError || "Please enter a valid date.");
        if (!isTimeValid) setTimeError(timeError || "Please select a time.");
        alert('Please enter a valid date and time.');
        return;
      }
    }

    if (rideType) {
      setInitialBookingDetails({
        rideType,
        pickup,
        dropoff,
        date: date,
        time,
        passengers,
      });
    } else {
      setInitialBookingDetails(null);
    }
    onRoleSelect('Customer');
  };
  
  const StartCarReservationPage: React.FC<{
    setView: (v: string) => void;
    onRoleSelect: (role: Role) => void;
    commonFooter: React.ReactNode;
  }> = ({ setView, onRoleSelect, commonFooter }) => {
    return (
      <main className="bg-white min-h-screen font-sans">
        {/* HERO SECTION - Premium Split Layout */}
        <section className="bg-primary overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(128,0,32,1)_0%,rgba(77,0,17,1)_100%)]"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch relative z-10">
            {/* Left Content Box */}
            <div className="flex-1 p-8 md:p-16 lg:p-24 flex flex-col justify-center text-left">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-block bg-accent/20 border border-accent/30 text-accent text-xs font-bold px-4 py-1.5 rounded-none uppercase tracking-widest mb-6">
                  Online Reservation
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold text-white mb-8 leading-[1.1]">
                  Renting a Ride <br className="hidden lg:block"/> with <span className="text-accent">XTASS</span>
                </h1>
                <div className="space-y-6 text-white/90 text-base md:text-lg leading-relaxed max-w-2xl font-light">
                  <p>
                    With operations across Ghana's airports and major cities, XTASS makes hiring a vehicle seamless so you can get right on your way. Make a vehicle reservation online or through the XTASS booking platform with access to professional drivers and a well-maintained fleet.
                  </p>
                  <p>
                    Hire a vehicle that fits your travel needs with a selection of sedans, SUVs, and vans. Start your reservation online and only pay when you travel. We offer a flexible <span className="text-accent font-medium">no-cancellation fee</span> guarantee.
                  </p>
                </div>
              </motion.div>
            </div>
            {/* Right Image Container */}
            <div className="flex-1 hidden md:block relative">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] hover:scale-110" 
                style={{backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')"}}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-transparent"></div>
              {/* Floating badge */}
              <div className="absolute bottom-12 right-12 bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-none shadow-2xl">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-none flex items-center justify-center text-primary">
                       <CheckCircleIcon className="w-7 h-7" />
                    </div>
                    <div className="text-white">
                       <p className="text-xs font-bold uppercase tracking-wider text-accent">Verified Fleet</p>
                       <p className="font-display font-bold">Safe & Clean Rides</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* URGENCY BANNER - Using theme Gold */}
        <div className="max-w-5xl mx-auto px-4 -mt-6 relative z-20">
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-accent border border-primary/10 py-4 px-8 rounded-none flex items-center justify-center gap-4 shadow-[0_10px_30px_rgba(255,215,0,0.3)]"
           >
              <div className="w-10 h-10 bg-primary/10 rounded-none flex items-center justify-center text-primary animate-pulse">
                <ClockIcon className="w-5 h-5" />
              </div>
              <p className="text-sm md:text-base font-bold text-primary">
                Hurry! High-demand dates are approaching. <span className="hidden sm:inline font-normal text-primary/70 ml-2">Secure your vehicle today to guarantee availability.</span>
              </p>
           </motion.div>
        </div>

        {/* RESERVATION SEARCH BOX */}
        <section className="py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-white rounded-none shadow-[0_30px_80px_rgba(128,0,32,0.08)] border border-gray-100 p-8 md:p-14 text-center">
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-none tracking-tight">Reserve a Vehicle</h2>
                <div className="flex items-center gap-4">
                  <span className="text-gray-300 text-xs font-black uppercase tracking-[0.2em] hidden md:block">OR</span>
                  <button 
                    onClick={() => setView('manage-reservation')}
                    className="text-primary font-bold hover:text-primary-hover transition-colors flex items-center group relative"
                  >
                    View / Modify / Cancel Reservation
                    <ChevronRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></div>
                  </button>
                </div>
              </div>

              <div className="max-w-3xl mx-auto space-y-10">
                <div className="text-left">
                  <div className="flex justify-between items-end mb-4 px-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <MapPinIcon className="w-4 h-4 text-primary" />
                       Pick-Up & Return Location (City or Airport)*
                    </label>
                    <span className="text-[10px] text-gray-300 font-normal italic uppercase tracking-tighter">* Required Field</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gray-50 flex items-center justify-center text-gray-400 group-focus-within:text-primary transition-colors border-r border-gray-100">
                      <SearchIcon className="w-6 h-6" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. Accra Mall or Kotoka International Airport"
                      className="w-full pl-20 pr-8 py-7 bg-gray-50/20 border border-gray-200 rounded-none focus:bg-white focus:ring-0 focus:border-primary focus:outline-none text-xl font-medium transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50/30 p-6 rounded-none border border-gray-100 text-left hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      id="different-location"
                      className="peer w-6 h-6 rounded-none border-2 border-gray-200 text-primary focus:ring-0 cursor-pointer appearance-none checked:bg-primary checked:border-primary transition-all"
                    />
                    <CheckCircleIcon className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <label htmlFor="different-location" className="text-base font-bold text-gray-600 cursor-pointer flex items-center gap-2 group-hover:text-primary transition-colors">
                    Return to a different location 
                    <div className="w-5 h-5 rounded-none bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold hover:bg-accent hover:text-primary transition-all">?</div>
                  </label>
                </div>

                <button 
                  onClick={() => onRoleSelect('Customer')}
                  className="w-full py-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-none shadow-2xl shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all text-xl md:text-2xl flex items-center justify-center gap-4 group"
                >
                  Search Available Vehicles
                  <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* INFO CARDS SECTION */}
        <section className="py-24 bg-gray-50/50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16">
               {[
                 {
                   title: "Ride Type FAQs",
                   desc: "Detailed information about Instant, Scheduled, and Rental Rides to help you choose the best fit.",
                   img: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=2071&auto=format&fit=crop",
                   btn: "View Ride FAQs"
                 },
                 {
                   type: "special",
                   title: "Our Standard of Care",
                   desc: "The XTASS promise: every vehicle is sanitised, safety-checked, and meticulously maintained.",
                   btn: "Learn More"
                 },
                 {
                   title: "Plan Your Trip",
                   desc: "Explore travel guides and destination inspiration for your next journey across the region.",
                   img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop",
                   btn: "See Inspirations"
                 }
               ].map((card, i) => (
                 <motion.div 
                   key={i}
                   whileHover={{ y: -8 }}
                   className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full group hover:shadow-2xl hover:shadow-primary/5 transition-all"
                 >
                   {card.type === 'special' ? (
                     <div className="h-60 bg-primary flex items-center justify-center p-8 relative overflow-hidden">
                        {/* Abstract background pattern */}
                        <div className="absolute inset-0 opacity-10">
                           <div className="absolute top-0 right-0 w-40 h-40 bg-accent rounded-none -mr-20 -mt-20"></div>
                           <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent rounded-none -ml-16 -mb-16"></div>
                        </div>
                        <div className="border-4 border-accent p-8 text-white text-center relative z-10 transform -rotate-1 group-hover:rotate-0 transition-transform duration-500">
                           <p className="text-[10px] font-black tracking-[0.4em] uppercase mb-1 text-accent">Standard of</p>
                           <p className="text-5xl font-black italic tracking-tighter mb-2">CARE</p>
                           <div className="w-16 h-1.5 bg-accent mx-auto mb-4 rounded-none"></div>
                           <CheckCircleIcon className="w-10 h-10 mx-auto text-accent" />
                        </div>
                     </div>
                   ) : (
                     <div className="h-60 bg-cover bg-center overflow-hidden relative">
                       <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                       <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent"></div>
                     </div>
                   )}
                   <div className="p-10 flex-1 flex flex-col">
                     <h3 className="text-2xl font-display font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">{card.title}</h3>
                     <p className="text-gray-500 leading-relaxed mb-10 flex-1 font-light">{card.desc}</p>
                     <button className="w-full py-4 bg-gray-900 text-white font-bold rounded-none hover:bg-primary active:scale-95 transition-all text-xs uppercase tracking-[0.2em]">
                       {card.btn}
                     </button>
                   </div>
                 </motion.div>
               ))}
            </div>

            {/* Bottom Row: Service Highlight Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
               {[
                 {
                   title: "Fleet Categories",
                   desc: "Discover our full range of reliable vehicles, from compact sedans to executive SUVs.",
                   img: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop",
                   btn: "View All Vehicles",
                   theme: "light"
                 },
                 {
                   title: "Service Locations",
                   desc: "XTASS operates across Ghana's major airports and cities with 24/7 support availability.",
                   img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
                   btn: "See All Locations",
                   theme: "dark"
                 },
                 {
                   title: "Exclusive Deals",
                   desc: "Unlock corporate rates and early booking discounts across our entire network.",
                   img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop",
                   btn: "Browse Offers",
                   theme: "light"
                 }
               ].map((card, i) => (
                 <div key={i} className={`rounded-none overflow-hidden flex flex-col border shadow-sm transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 ${card.theme === 'dark' ? 'bg-primary text-white border-primary-active' : 'bg-white border-gray-100'}`}>
                   <div className="h-64 overflow-hidden relative">
                     <img src={card.img} alt={card.title} className="w-full h-full object-cover" />
                     {card.theme === 'dark' && <div className="absolute inset-0 bg-primary/40 mix-blend-multiply"></div>}
                   </div>
                   <div className="p-10 flex-1 flex flex-col">
                     <h3 className={`text-2xl font-display font-bold mb-4 ${card.theme === 'dark' ? 'text-accent' : 'text-gray-900'}`}>{card.title}</h3>
                     <p className={`leading-relaxed mb-10 flex-1 ${card.theme === 'dark' ? 'text-white/70 font-light italic' : 'text-gray-500 font-light'}`}>{card.desc}</p>
                     <button className={`py-4 px-10 rounded-none font-black transition-all border-2 text-sm uppercase tracking-widest ${card.theme === 'dark' ? 'bg-accent text-primary border-accent hover:bg-white hover:border-white shadow-lg shadow-accent/10' : 'bg-primary text-white border-primary hover:bg-primary-hover hover:border-primary-hover shadow-lg shadow-primary/10'}`}>
                       {card.btn}
                     </button>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* NETWORK & HUBS SECTION */}
        <section className="py-32 bg-white relative overflow-hidden">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 -mr-64 -mt-64 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
           <div className="absolute bottom-0 left-0 -ml-64 -mb-64 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px]"></div>
           
           <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24 items-start">
                 <div className="md:col-span-4">
                    <div className="sticky top-40">
                       <h4 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 tracking-tighter">
                          Popular Hubs <br className="hidden lg:block"/> & Cities
                       </h4>
                       <div className="w-20 h-2 bg-accent mb-8 rounded-none"></div>
                       <p className="text-gray-500 text-lg leading-relaxed mb-10 font-light italic">
                          "Operating across Ghana's transport arteries, connecting people to progress."
                       </p>
                       <div className="bg-gray-50 border border-gray-100 p-8 rounded-none">
                          <p className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">24/7 Availability</p>
                          <p className="text-gray-600 text-sm leading-relaxed">
                             Our airport hubs are open around the clock to ensure you have a ride regardless of your arrival time.
                          </p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Cities Card */}
                    <div className="bg-white p-10 rounded-none border border-gray-100 shadow-xl shadow-gray-200/40">
                       <h5 className="text-2xl font-display font-bold text-gray-900 mb-8 border-b-2 border-accent pb-4 inline-block">Key Metropolitan Areas</h5>
                       <ul className="space-y-6">
                          {['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Wa', 'Sunyani'].map(city => (
                             <li key={city} className="flex items-center group cursor-pointer">
                                <div className="w-10 h-10 rounded-none bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all mr-4 transform -rotate-3 group-hover:rotate-0">
                                   <MapPinIcon className="w-5 h-5" />
                                </div>
                                <div>
                                   <p className="text-gray-900 font-bold group-hover:text-primary transition-colors">{city}</p>
                                   <p className="text-xs text-gray-400 uppercase tracking-widest font-black">Region Hub</p>
                                </div>
                                <ChevronRightIcon className="w-4 h-4 ml-auto text-gray-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                             </li>
                          ))}
                       </ul>
                    </div>

                    {/* Airports List */}
                    <div className="space-y-8">
                       {[
                          { code: 'ACC', name: 'Kotoka International', city: 'Accra', status: 'Main Hub' },
                          { code: 'KMS', name: 'Kumasi Airport', city: 'Kumasi', status: 'Domestic' },
                          { code: 'TML', name: 'Tamale Airport', city: 'Tamale', status: 'Domestic' },
                          { code: 'TKD', name: 'Takoradi Airport', city: 'Takoradi', status: 'Domestic' }
                       ].map(airport => (
                          <div key={airport.code} className="flex gap-6 p-6 rounded-none bg-gray-50 border border-transparent hover:border-accent hover:bg-white transition-all group cursor-pointer shadow-sm hover:shadow-2xl">
                             <div className="bg-primary text-accent text-sm font-black w-14 h-14 rounded-none flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                {airport.code}
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-1">
                                   <p className="font-bold text-gray-900 group-hover:text-primary transition-colors underline decoration-accent/30 decoration-2 underline-offset-4">{airport.name}</p>
                                   <span className="text-[10px] bg-accent/20 text-primary px-2 py-0.5 rounded-none font-black uppercase">{airport.status}</span>
                                </div>
                                <p className="text-sm text-gray-500 font-medium">{airport.city}, Ghana</p>
                             </div>
                          </div>
                       ))}
                       <button className="w-full py-5 border-2 border-primary text-primary font-black rounded-none hover:bg-primary hover:text-white transition-all text-xs uppercase tracking-widest shadow-xl shadow-primary/5">
                          See All XTASS Locations
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* BOTTOM RIDE OPTIONS - Luxury Dark Design */}
        <section className="py-32 bg-gray-900 text-white relative">
           {/* Gold Accent Top Bar */}
           <div className="absolute top-0 left-0 w-full h-2 bg-accent opacity-80 shadow-[0_0_20px_rgba(255,215,0,0.5)]"></div>
           
           <div className="max-w-7xl mx-auto px-4 relative z-10">
              <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                 <div className="text-left">
                    <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tighter">Your Journey, <br className="hidden md:block"/> <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">Your Choice</span></h2>
                    <p className="text-white/40 text-lg max-w-xl font-light italic">"From the moment of booking to the final destination, we prioritise your comfort and convenience."</p>
                 </div>
                 <div className="bg-white/5 border border-white/10 px-8 py-6 rounded-none backdrop-blur-sm self-start">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-accent mb-2">Available 24/7</p>
                    <p className="text-3xl font-display font-bold">128+ <span className="text-sm text-white/50 font-sans tracking-normal uppercase">Active Vehicles</span></p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 {[
                   {
                     title: "Instant Pickup",
                     desc: "Seamless same-day reservations across our terminal hubs.",
                     img: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=2071&auto=format&fit=crop",
                     cta: "Explore Immediate Rides",
                     action: () => onRoleSelect('Customer')
                   },
                   {
                     title: "Corporate Hire",
                     desc: "Optimized for long-term work assignments and business mobility.",
                     img: "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2072&auto=format&fit=crop",
                     cta: "Business Solutions",
                     action: () => setView('long-term-rental')
                   },
                   {
                     title: "Weekend Escapes",
                     desc: "Premium transport for family getaways and special weekend travels.",
                     img: "https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?q=80&w=2070&auto=format&fit=crop",
                     cta: "Start Your Escape",
                     action: () => onRoleSelect('Customer')
                   }
                 ].map((opt, i) => (
                   <motion.div 
                     key={i} 
                     whileHover={{ scale: 1.02 }}
                     className="flex flex-col bg-white/5 border border-white/10 rounded-none overflow-hidden group hover:border-accent transition-all duration-700 shadow-2xl"
                   >
                      <div className="h-80 overflow-hidden relative">
                         <img src={opt.img} alt={opt.title} className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-[1500ms]" />
                         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent"></div>
                         <div className="absolute bottom-10 left-10 right-10">
                            <h4 className="text-3xl font-display font-bold text-white group-hover:text-accent transition-colors tracking-tight">{opt.title}</h4>
                            <div className="w-12 h-1.5 bg-accent mt-3 rounded-none opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                         </div>
                      </div>
                      <div className="p-12 flex-1 flex flex-col text-center">
                         <p className="text-white/60 leading-relaxed mb-12 flex-1 font-light italic text-lg px-2">
                            "{opt.desc}"
                         </p>
                         <button 
                           onClick={opt.action}
                           className="py-5 px-10 bg-accent text-primary font-black rounded-none hover:bg-white transition-all shadow-xl shadow-accent/10 text-xs uppercase tracking-[0.2em]"
                         >
                            {opt.cta}
                         </button>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

        {commonFooter}
      </main>
    );
  };

  const DealsAndCouponsPage: React.FC<{
    setView: (v: string) => void;
    onRoleSelect: (role: Role) => void;
    commonFooter: React.ReactNode;
  }> = ({ setView, onRoleSelect, commonFooter }) => {
    return (
      <main className="bg-[#f9fafb] min-h-screen font-sans text-left">
        {/* Navigation / Breadcrumbs */}
        <nav className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
            <button onClick={() => setView('home')} className="text-primary hover:underline border-b border-transparent hover:border-primary transition-all">Home</button>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-primary font-medium">Car Rental</span>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-gray-900 font-bold">Deals & Promotions</span>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-display font-medium text-gray-900 mb-10">Featured Deals</h1>

          {/* FEATURED DEAL CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-none shadow-sm border border-gray-100 overflow-hidden mb-24 group"
          >
            <div className="h-64 md:h-96 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=2071&auto=format&fit=crop" 
                alt="Happy family traveling" 
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
              />
            </div>
            <div className="p-10 md:p-14 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Enjoy Up To 15% Off</h2>
              <p className="text-gray-600 text-lg mb-10 font-light">
                Save up to 15% off the base fare (time and mileage) on your next hire of 3 days or more.
              </p>
              <button 
                onClick={() => setView('start-reservation')}
                className="bg-primary text-white font-bold py-4 px-12 rounded-none hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-sm"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          {/* EXCLUSIVE OFFERS SECTION */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Exclusive Offers from XTASS</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-light text-lg">
              Explore our current deals and promotions below, or start a reservation to find the right vehicle at our everyday low rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
            {/* Specials Card */}
            <div className="bg-white rounded-none border border-gray-100 p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-primary/5 rounded-none flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all transform -rotate-3 group-hover:rotate-0">
                <MailIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 decoration-accent decoration-2 underline-offset-4 group-hover:underline mb-4">
                Sign Up for Specials <ChevronRightIcon className="inline w-4 h-4 ml-1" />
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                Get the latest transport discounts, great rates and special offers delivered directly to your inbox. Sign up today and be the first to know about exclusive XTASS promotions.
              </p>
            </div>

            {/* Loyalty Card */}
            <div className="bg-white rounded-none border border-gray-100 p-10 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-primary/5 rounded-none flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all transform rotate-3 group-hover:rotate-0">
                <StarIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 decoration-accent decoration-2 underline-offset-4 group-hover:underline mb-4">
                XTASS Loyalty Programme <ChevronRightIcon className="inline w-4 h-4 ml-1" />
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                You could be earning points toward free travel days. Every trip you take with XTASS counts. Earn points on every booking and redeem them for discounts, free rides, and exclusive rewards. What are you waiting for?
              </p>
            </div>
          </div>

          {/* MORE DEALS SECTION */}
          <div className="mb-24">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-10 border-b border-gray-200 pb-4 inline-block">More Deals</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden flex flex-col group">
                <div className="h-48 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop" 
                    alt="Vehicle Deal" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </div>
                <div className="p-8 flex-1 flex flex-col text-center">
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-4 px-2">Loyalty Member Discounts</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-1 font-light">
                    Special rates for XTASS loyalty members. Sign up for the XTASS loyalty programme today to access exclusive member pricing across all service levels. Terms apply.
                  </p>
                  <button 
                    onClick={() => setView('start-reservation')}
                    className="w-full py-4 bg-primary text-white font-bold rounded-none hover:bg-primary-hover transition-all text-xs uppercase tracking-widest shadow-lg shadow-primary/20"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH EVERYDAY LOW RATES SECTION */}
          <div className="text-center mb-16 pt-12 border-t border-gray-100">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Search Our Everyday Low Rates</h2>
            <p className="text-gray-500 font-light text-lg">
              If none of our current promotions fit your needs, start a new reservation to view our standard low rates.
            </p>
          </div>

          {/* INLINE BOOKING FORM BOX */}
          <div className="max-w-4xl mx-auto">
            {/* Urgency Banner */}
            <div className="bg-primary/5 border border-primary/10 py-4 px-8 rounded-t-3xl flex items-center justify-center gap-4">
              <ClockIcon className="w-5 h-5 text-primary" />
              <p className="text-sm font-bold text-gray-800">
                Hurry! Availability is limited during peak season. Reserve now to lock in your rate.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white rounded-none shadow-2xl border border-gray-100 p-8 md:p-14 text-center">
              <div className="flex flex-col md:flex-row items-baseline justify-center gap-4 mb-10">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Reserve a Vehicle</h2>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 text-xs italic">or</span>
                  <button 
                    onClick={() => setView('manage-reservation')}
                    className="text-primary font-bold hover:underline underline-offset-4 decoration-accent decoration-2"
                  >
                    View / Modify / Cancel Reservation
                  </button>
                </div>
              </div>

              <div className="space-y-10 max-w-2xl mx-auto">
                <div className="text-left">
                  <div className="flex justify-between items-end mb-4 px-1">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <MapPinIcon className="w-4 h-4 text-primary" />
                       Pick-Up & Return Location (City or Airport)*
                    </label>
                    <span className="text-[10px] text-gray-300 font-normal italic uppercase tracking-tighter">* Required Field</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-gray-50 flex items-center justify-center text-gray-400 group-focus-within:text-primary transition-colors border-r border-gray-100">
                      <SearchIcon className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. Accra Mall or Kotoka"
                      className="w-full pl-16 pr-6 py-6 bg-gray-50/20 border border-gray-200 rounded-none focus:bg-white focus:ring-0 focus:border-primary focus:outline-none text-xl font-medium transition-all placeholder:text-gray-300 shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left p-4 bg-gray-50/30 border border-gray-100 rounded-none group">
                  <input 
                    type="checkbox" 
                    id="different-location-low-rates"
                    className="w-6 h-6 rounded-none border-gray-300 text-primary focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="different-location-low-rates" className="text-base font-bold text-gray-600 cursor-pointer flex items-center gap-2 group-hover:text-primary transition-colors">
                    Return to a different location 
                    <div className="w-5 h-5 rounded-none bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold">i</div>
                  </label>
                </div>

                <button 
                  onClick={() => onRoleSelect('Customer')}
                  className="w-full py-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-none shadow-2xl shadow-primary/20 transition-all text-xl md:text-2xl flex items-center justify-center gap-4 group"
                >
                  Search / Book Now
                  <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {commonFooter}
      </main>
    );
  };
  
  const CareerRegistrationForm: React.FC = () => {
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      phone: '',
      location: '',
      position: '',
      experience: '',
      employmentStatus: '',
      skills: '',
      qualification: '',
      fieldOfStudy: '',
      whyUs: '',
      availability: '',
    });
    const [cv, setCv] = useState<File | null>(null);
    const [coverLetter, setCoverLetter] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    };

    const validate = () => {
      const newErrors: Record<string, string> = {};
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.location) newErrors.location = 'Location is required';
      if (!formData.position) newErrors.position = 'Please select a position';
      if (!formData.experience) newErrors.experience = 'Experience level is required';
      if (!formData.qualification) newErrors.qualification = 'Highest qualification is required';
      if (!cv) newErrors.cv = 'Please upload your CV/Resume';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      }, 2000);
    };

    if (isSuccess) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2 font-display">Application Submitted!</h3>
          <p className="text-green-700">
            Thank you for your interest in XTASS. We've received your application and will review it shortly. Our team will contact you via email if your profile matches our requirements.
          </p>
          <button 
             onClick={() => setIsSuccess(false)}
             className="mt-6 text-green-600 font-semibold hover:underline"
          >
            Apply for another position
          </button>
        </motion.div>
      );
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm transition-all focus-within:border-primary/30">
        <div className="border-b border-gray-100 pb-6">
            <h2 className="text-3xl font-display font-bold text-gray-900">Apply Now</h2>
            <p className="text-gray-500 mt-1">Fill out the form below to become part of the XTASS team.</p>
        </div>

        {/* Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
             <UserIcon className="w-4 h-4" />
             <span>Personal Information</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.fullName ? 'border-red-500 ring-red-100 ring-4' : 'border-gray-200 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address *</label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.email ? 'border-red-500 ring-red-100 ring-4' : 'border-gray-200 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">Phone Number *</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.phone ? 'border-red-500 ring-red-100 ring-4' : 'border-gray-200 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all`}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700">Location (City, Country) *</label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.location ? 'border-red-500 ring-red-100 ring-4' : 'border-gray-200 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all`}
                  placeholder="Accra, Ghana"
                />
              </div>
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
             <BriefcaseIcon className="w-4 h-4" />
             <span>Professional Details</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="position" className="block text-sm font-semibold text-gray-700">Position Applying For *</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.position ? 'border-red-500 ring-red-100 ring-4' : 'border-gray-200 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all bg-white`}
              >
                <option value="">Select a position</option>
                <option value="driver">Professional Driver</option>
                <option value="logistics">Logistics Coordinator</option>
                <option value="tech">Technology Team</option>
                <option value="support">Customer Support Agent</option>
                <option value="other">Other</option>
              </select>
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="experience" className="block text-sm font-semibold text-gray-700">Years of Experience *</label>
              <input
                id="experience"
                name="experience"
                type="number"
                value={formData.experience}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.experience ? 'border-red-500 ring-red-100 ring-4' : 'border-gray-200 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all`}
                placeholder="2"
                min="0"
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="employmentStatus" className="block text-sm font-semibold text-gray-700">Current Employment Status</label>
              <input
                id="employmentStatus"
                name="employmentStatus"
                type="text"
                value={formData.employmentStatus}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-primary/10 focus:outline-none focus:ring-4 transition-all"
                placeholder="Full-time / Freelance / Unemployed"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="skills" className="block text-sm font-semibold text-gray-700">Key Skills</label>
              <input
                id="skills"
                name="skills"
                type="text"
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-primary/10 focus:outline-none focus:ring-4 transition-all"
                placeholder="Driving, Communication, Map Navigation..."
              />
            </div>
          </div>
        </div>

        {/* Education */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
             <GraduationCapIcon className="w-4 h-4" />
             <span>Education</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="qualification" className="block text-sm font-semibold text-gray-700">Highest Qualification *</label>
              <input
                id="qualification"
                name="qualification"
                type="text"
                value={formData.qualification}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.qualification ? 'border-red-500 ring-red-100 ring-4' : 'border-gray-200 focus:border-primary focus:ring-primary/10'} focus:outline-none focus:ring-4 transition-all`}
                placeholder="BSc / HND / Senior High School"
              />
              {errors.qualification && <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="fieldOfStudy" className="block text-sm font-semibold text-gray-700">Field of Study</label>
              <input
                id="fieldOfStudy"
                name="fieldOfStudy"
                type="text"
                value={formData.fieldOfStudy}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-primary/10 focus:outline-none focus:ring-4 transition-all"
                placeholder="Business Administration, Logistics, etc."
              />
            </div>
          </div>
        </div>

        {/* Document Uploads */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-wider text-sm">
             <UploadCloudIcon className="w-4 h-4" />
             <span>Document Uploads</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Upload CV/Resume *</label>
              <div className={`relative group border-2 border-dashed ${errors.cv ? 'border-red-300' : 'border-gray-300'} rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer`}>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setCv(file);
                    if (errors.cv && file) {
                      setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors.cv;
                        return newErrors;
                      });
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx"
                />
                <div className="text-center">
                  <FileTextIcon className="w-8 h-8 text-gray-400 mx-auto group-hover:text-primary transition-colors" />
                  <p className="mt-2 text-sm text-gray-600">
                    {cv ? cv.name : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              </div>
              {errors.cv && <p className="text-red-500 text-xs mt-1">{errors.cv}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Upload Cover Letter (Optional)</label>
              <div className="relative group border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={(e) => setCoverLetter(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx"
                />
                <div className="text-center">
                  <FileTextIcon className="w-8 h-8 text-gray-400 mx-auto group-hover:text-primary transition-colors" />
                  <p className="mt-2 text-sm text-gray-600">
                    {coverLetter ? coverLetter.name : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-gray-400">PDF, DOC, DOCX (Max 5MB)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6 pt-4">
          <div className="space-y-1.5">
            <label htmlFor="whyUs" className="block text-sm font-semibold text-gray-700">Why do you want to work with us?</label>
            <textarea
              id="whyUs"
              name="whyUs"
              rows={4}
              value={formData.whyUs}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-primary/10 focus:outline-none focus:ring-4 transition-all"
              placeholder="Tell us about your motivation..."
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="availability" className="block text-sm font-semibold text-gray-700">Availability</label>
            <select
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-primary/10 focus:outline-none focus:ring-4 transition-all bg-white"
            >
              <option value="">Select availability</option>
              <option value="immediate">Immediate</option>
              <option value="1week">1 Week Notice</option>
              <option value="2weeks">2 Weeks Notice</option>
              <option value="1month">1 Month Notice</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover active:bg-primary-active hover:-translate-y-0.5 active:translate-y-0'}`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <span>Submit Application</span>
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    );
  };

  const CareersPage: React.FC<{ commonFooter: React.ReactNode }> = ({ commonFooter }) => {
    return (
      <main>
        {/* Careers Hero */}
        <div className="relative bg-primary text-white">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30" 
            style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold">Careers</h1>
            <p className="mt-4 text-lg text-white/90 max-w-3xl mx-auto">
              Join a team that is transforming travel across Ghana and Africa.
            </p>
          </div>
        </div>

        {/* Introduction Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-8">
              <div>
                <p>
                  XTASS is a growing transport company built on the principles of safety, quality, and service excellence. As we continue to expand our operations across Ghana and into new African markets, we are constantly looking for talented, motivated individuals who share our commitment to professionalism and customer care.
                </p>
                <p>
                  Working at XTASS means being part of a team that is transforming how people travel. From our professional drivers and logistics coordinators to our technology team and customer support agents, every member of the XTASS workforce plays a critical role in delivering the reliable, high-quality service that our customers depend on every day.
                </p>
              </div>

              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-display font-bold text-gray-800 mb-6 font-sans">Why Work With Us</h2>
                <ul className="not-prose space-y-4">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                    <span>Be part of a pioneering transport brand in Ghana and across Africa</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                    <span>Work in a professional, supportive, and growth-oriented environment</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                    <span>Competitive compensation and benefits package</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                    <span>Ongoing training and development opportunities</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                    <span>Clear career progression pathways</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-primary mr-3 shrink-0 mt-0.5" />
                    <span>Contribute to a company that puts safety and community first</span>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-gray-800 mb-6 font-sans">How to Apply</h2>
                <p>
                  Interested candidates are invited to reach out to the XTASS team via our support email at <a href="mailto:support@xtass.com" className="text-primary font-bold hover:underline">support@xtass.com</a> with the subject line 'Career Enquiry', or contact us through our website.
                </p>
                <p>
                  As new positions become available, they will be listed on this page. We welcome applications from individuals who are passionate about transport, customer service, safety, and building something meaningful.
                </p>
              </div>

              {/* Application Form */}
              <div id="apply" className="pt-12">
                <CareerRegistrationForm />
              </div>
            </div>
          </div>
        </section>

        {commonFooter}
      </main>
    );
  };

  const LongTermRentalPage: React.FC<{
    setView: (v: string) => void;
    commonFooter: React.ReactNode;
    onRoleSelect: (role: Role) => void;
  }> = ({ setView, commonFooter, onRoleSelect }) => {
    return (
      <main className="bg-[#f9fafb] min-h-screen font-sans text-left pb-10">
        {/* Navigation / Breadcrumbs */}
        <nav className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
            <button onClick={() => setView('home')} className="text-primary hover:underline border-b border-transparent hover:border-primary transition-all">Home</button>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-primary font-medium">Car Rental</span>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-gray-900 font-bold">Long-Term Car Rental</span>
          </div>
        </nav>

        {/* HERO / HEADER SECTION */}
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 lg:max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-display font-medium text-gray-900 leading-tight">
              Take Advantage of Weekly & Monthly Rates
            </h1>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 hidden lg:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=2070&auto=format&fit=crop" 
              alt="Premium Car" 
              className="w-full h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* BOOKING FORM SECTION */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="bg-white rounded-none shadow-2xl border border-gray-100 overflow-hidden">
            {/* Urgency Banner */}
            <div className="bg-[#f0f9ff] border-b border-[#bae6fd] py-4 px-8 flex items-center justify-center gap-3">
              <ClockIcon className="w-5 h-5 text-primary" />
              <p className="text-sm font-bold text-gray-800">
                Plan ahead! Long-term rentals require advance verification for guaranteed availability.
              </p>
            </div>

            <div className="p-8 md:p-14">
              <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-12">
                <div className="flex flex-col gap-2 items-start">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Start Your Long-Term Rental</h2>
                  <div className="h-1.5 w-24 bg-accent mt-2"></div>
                </div>
                <button 
                  onClick={() => setView('manage-reservation')}
                  className="text-primary font-bold hover:underline underline-offset-4 decoration-accent decoration-2 text-sm"
                >
                  or View / Modify / Cancel Reservation
                </button>
              </div>

              <div className="space-y-12 max-w-3xl">
                <div className="text-left space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <MapPinIcon className="w-4 h-4 text-primary" />
                       Pick-Up & Return Location (City or Airport)*
                    </label>
                    <span className="text-[10px] text-gray-300 font-normal italic uppercase tracking-tighter">* Required Field</span>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-gray-50 flex items-center justify-center text-gray-400 group-focus-within:text-primary transition-colors border-r border-gray-100">
                      <SearchIcon className="w-5 h-5" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="e.g. Accra Mall or City Center"
                      className="w-full pl-16 pr-6 py-6 bg-gray-50/30 border border-gray-200 rounded-none focus:bg-white focus:ring-0 focus:border-primary focus:outline-none text-xl font-medium transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left p-4 bg-gray-50/30 border border-gray-100 rounded-none group hover:border-primary/20 transition-all cursor-pointer">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      id="different-location-long-term"
                      className="peer w-6 h-6 rounded-none border-2 border-gray-200 text-primary focus:ring-0 cursor-pointer appearance-none checked:bg-primary checked:border-primary transition-all"
                    />
                    <CheckCircleIcon className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                  </div>
                  <label htmlFor="different-location-long-term" className="text-base font-bold text-gray-600 cursor-pointer flex items-center gap-2 group-hover:text-primary transition-colors">
                    Return to a different location 
                    <div className="w-5 h-5 rounded-none bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold hover:bg-accent hover:text-primary transition-all">?</div>
                  </label>
                </div>

                <button 
                  onClick={() => onRoleSelect('Customer')}
                  className="w-full md:w-auto px-16 py-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-none shadow-2xl shadow-primary/20 transition-all text-xl md:text-2xl flex items-center justify-center gap-4 group"
                >
                  Search Available Vehicles
                  <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                </button>

                <p className="text-sm font-medium text-gray-400 mt-8">
                  Renting for less than 28 days? <button onClick={() => setView('start-reservation')} className="text-primary hover:underline underline-offset-4 decoration-accent decoration-2">Book at everyday low rates &rsaquo;</button>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* KEY FEATURES SECTION */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 28 Day Hire Rates */}
            <div className="bg-white p-10 rounded-none border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-primary/5 rounded-none flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all transform -rotate-3 group-hover:rotate-0">
                <CalendarIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-4">28 Day Hire Rates</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                Long-term hire rates begin with rental amounting to more than 28 days.
              </p>
            </div>

            {/* Unlimited Mileage */}
            <div className="bg-white p-10 rounded-none border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-primary/5 rounded-none flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all transform rotate-3 group-hover:rotate-0">
                <TrophyIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-4">Unlimited Mileage</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                While some providers may limit you on mileage, there is no mileage limit for most vehicle classes on our long-term hires.
              </p>
            </div>

            {/* Multiple Locations */}
            <div className="bg-white p-10 rounded-none border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-primary/5 rounded-none flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all transform -rotate-3 group-hover:rotate-0">
                <MapPinIcon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-4">Multiple Locations</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                With operations across Ghana's major airports and cities, you're sure to find a branch near you.
              </p>
            </div>
          </div>
        </section>

        {/* POPULAR VEHICLE TYPES */}
        <section className="bg-white py-24 mb-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Popular Long-Term Hire Vehicle Types</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-light text-lg mb-10">
              From compact sedans to spacious SUVs and vans, we offer a large range of reliable vehicles to suit your long-term hire needs.
            </p>
            <button 
              onClick={() => onRoleSelect('Customer')}
              className="py-4 px-10 border-2 border-primary text-primary font-bold rounded-none hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-xs mb-16"
            >
              View All Hire Vehicles
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              {[
                { 
                  type: 'Sedan', 
                  suitable: '1–3 passengers. Ideal for solo business travelers, couples, or point-to-point city transfers.',
                  img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2072&auto=format&fit=crop'
                },
                { 
                  type: 'SUV', 
                  suitable: '1–4 passengers with luggage. Well suited for airport transfers with large bags or small family groups.',
                  img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop'
                },
                { 
                  type: 'Van / Minivan', 
                  suitable: '5–8 passengers. Ideal for group travel, family trips, and corporate team transfers.',
                  img: 'https://images.unsplash.com/photo-1549411223-28956903d3f9?q=80&w=2074&auto=format&fit=crop'
                }
              ].map((v, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="h-48 overflow-hidden rounded-none mb-6">
                    <img src={v.img} alt={v.type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{v.type}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">{v.suitable}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REASONS TO HIRE SECTION */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-white rounded-none border border-gray-100 shadow-xl overflow-hidden flex flex-col lg:flex-row">
            <div className="flex-1 p-10 md:p-20 text-left">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8">Reasons to Hire a Vehicle Long-Term</h2>
              <p className="text-gray-500 mb-10 font-light text-lg">There are several common reasons for hiring a vehicle long term:</p>
              
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="w-1.5 h-1.5 bg-primary rounded-none mt-2.5 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Preserve the value of your personal vehicle</h4>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      Taking an extended trip or heading to a secondary residence for the season? Hiring a vehicle for the duration of your trip prevents you from having to put mileage on your personal vehicle and reduces wear and tear.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-1.5 h-1.5 bg-primary rounded-none mt-2.5 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Hire a van for larger, long-term work projects</h4>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      Renting a vehicle by the month for work projects as needed is a great option. XTASS's range of vans and SUVs is well suited for extended professional engagements.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-1.5 h-1.5 bg-primary rounded-none mt-2.5 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Transportation solution while your vehicle is in the shop</h4>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      Whether you've had an accident or have a major repair on your personal vehicle, a long-term hire is a great way to get back on the road without missing a beat.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onRoleSelect('Customer')}
                className="mt-16 bg-primary text-white font-bold py-5 px-12 rounded-none hover:bg-primary-hover transition-all shadow-2xl shadow-primary/20 text-lg"
              >
                Reserve Now
              </button>
            </div>
            <div className="flex-1 min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop" 
                alt="Long-term rental service" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="max-w-4xl mx-auto px-6 mb-24 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-10">Short-Term Lease vs. Long-Term Vehicle Hire</h2>
          <div className="space-y-6 text-gray-600 font-light text-lg leading-relaxed">
            <p>
              Some vehicle dealerships may allow you to lease a vehicle for several months at a time, but terms tend to be limited and may include a minimum number of days and mileage restrictions.
            </p>
            <p>
              With an XTASS long-term hire, you can rent a vehicle for as long as needed, whether it's several weeks, a month, or longer. Additionally, there is no mileage limit for most vehicle classes.
            </p>
          </div>
        </section>

        {commonFooter}
      </main>
    );
  };

  const OneWayRentalPage: React.FC<{
    setView: (v: string) => void;
    commonFooter: React.ReactNode;
    onRoleSelect: (role: Role) => void;
  }> = ({ setView, commonFooter, onRoleSelect }) => {
    return (
      <main className="bg-[#f9fafb] min-h-screen font-sans text-left pb-10">
        {/* Navigation / Breadcrumbs */}
        <nav className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
            <button onClick={() => setView('home')} className="text-primary hover:underline border-b border-transparent hover:border-primary transition-all">Home</button>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-primary font-medium">Car Rental</span>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-gray-900 font-bold">One Way Car Rental</span>
          </div>
        </nav>

        {/* HERO / HEADER SECTION */}
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 lg:max-w-2xl"
          >
            <h1 className="text-4xl md:text-6xl font-display font-medium text-gray-900 leading-tight">
              Flexible One Way <br/> Car Rentals
            </h1>
            <p className="mt-8 text-lg text-gray-600 font-light leading-relaxed">
              Experience the ultimate freedom with XTASS's one-way car rental services. Pick up your vehicle at one location and drop it off at another, perfect for road trips or changing plans.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 hidden lg:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1464851707681-f9d5fdaccea8?q=80&w=2070&auto=format&fit=crop" 
              alt="Road Trip" 
              className="w-full h-auto drop-shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
            />
          </motion.div>
        </div>

        {/* BOOKING FORM SECTION */}
        <section className="max-w-5xl mx-auto px-6 mb-24">
          <div className="bg-white rounded-none shadow-2xl border border-gray-100 overflow-hidden">
            {/* Urgency Banner */}
            <div className="bg-[#fffbeb] border-b border-[#fef3c7] py-4 px-8 flex items-center justify-center gap-3">
              <ClockIcon className="w-5 h-5 text-accent" />
              <p className="text-sm font-bold text-gray-800">
                Adventure awaits! One-way availability is filling up fast for the upcoming season.
              </p>
            </div>

            <div className="p-8 md:p-14">
              <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-12">
                <div className="flex flex-col gap-2 items-start">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Book Your One Way Trip</h2>
                  <div className="h-1.5 w-24 bg-accent mt-2"></div>
                </div>
              </div>

              <div className="space-y-12 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-left space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <MapPinIcon className="w-4 h-4 text-primary" />
                       Pick-Up Location*
                    </label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="City or Airport"
                        className="w-full px-6 py-5 bg-gray-50/30 border border-gray-200 rounded-none focus:bg-white focus:ring-0 focus:border-primary focus:outline-none text-xl font-medium transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                  <div className="text-left space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <MapPinIcon className="w-4 h-4 text-accent" />
                       Drop-Off Location*
                    </label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="Different City or Airport"
                        className="w-full px-6 py-5 bg-gray-50/30 border border-gray-200 rounded-none focus:bg-white focus:ring-0 focus:border-primary focus:outline-none text-xl font-medium transition-all placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <button 
                    onClick={() => onRoleSelect('Customer')}
                    className="flex-1 py-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-none shadow-2xl shadow-primary/20 transition-all text-xl flex items-center justify-center gap-4 group"
                  >
                    Search Vehicles
                    <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button 
                    onClick={() => setView('manage-reservation')}
                    className="py-6 px-10 border-2 border-gray-200 text-gray-600 font-bold rounded-none hover:border-primary hover:text-primary transition-all text-sm uppercase tracking-widest"
                  >
                    Manage Existing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ONE WAY BENEFITS */}
        <section className="max-w-7xl mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Airport to City', icon: MapPinIcon, desc: 'Pick up at the airport and drop off at your hotel or city office.' },
              { title: 'City to City', icon: GlobeIcon, desc: 'Travel between Accra, Kumasi and other major metropolises with ease.' },
              { title: 'No Backtracking', icon: CompassIcon, desc: 'Save time and fuel by not having to return to your starting point.' },
              { title: 'Ultimate Freedom', icon: TrophyIcon, desc: 'Design your own itinerary without geographical constraints.' }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-10 border border-gray-100 rounded-none shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-primary/5 text-primary flex items-center justify-center mb-8 rounded-none group-hover:bg-primary group-hover:text-white transition-all transform -rotate-3 group-hover:rotate-0">
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900 mb-4">{benefit.title}</h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* POPULAR VEHICLE TYPES */}
        <section className="bg-white py-24 mb-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">Popular One Way Trip Vehicle Types</h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-light text-lg mb-10">
              Pick the perfect ride for your cross-country journey from our extensive one-way fleet.
            </p>
            <button 
              onClick={() => onRoleSelect('Customer')}
              className="py-4 px-10 border-2 border-primary text-primary font-bold rounded-none hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-xs mb-16"
            >
              View Available Vehicles
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              {[
                { 
                  type: 'Sedan', 
                  suitable: '1–3 passengers. Ideal for solo business travelers, couples, or point-to-point city transfers.',
                  img: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=2072&auto=format&fit=crop'
                },
                { 
                  type: 'SUV', 
                  suitable: '1–4 passengers with luggage. Well suited for airport transfers with large bags or small family groups.',
                  img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=2070&auto=format&fit=crop'
                },
                { 
                  type: 'Van / Minivan', 
                  suitable: '5–8 passengers. Ideal for group travel, family trips, and corporate team transfers.',
                  img: 'https://images.unsplash.com/photo-1549411223-28956903d3f9?q=80&w=2074&auto=format&fit=crop'
                }
              ].map((v, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="h-48 overflow-hidden rounded-none mb-6">
                    <img src={v.img} alt={v.type} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{v.type}</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed">{v.suitable}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ONE WAY TRIP BENEFITS SECTION */}
        <section className="max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-white rounded-none border border-gray-100 shadow-xl overflow-hidden flex flex-col lg:flex-row">
            <div className="flex-1 p-10 md:p-20 text-left">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8">One Way Trip Benefits</h2>
              <p className="text-gray-500 mb-10 font-light text-lg">Experience these advantages when booking one-way with XTASS:</p>
              
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="w-1.5 h-1.5 bg-primary rounded-none mt-2.5 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Total Flexibility</h4>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      Plan your journey around your needs, not your return trip.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-1.5 h-1.5 bg-primary rounded-none mt-2.5 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Time Saving</h4>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      Optimized routes for multi-city business trips or one-way regional travels.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-1.5 h-1.5 bg-primary rounded-none mt-2.5 shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-2">Airport to City Transitions</h4>
                    <p className="text-gray-500 text-sm font-light leading-relaxed">
                      Arrive at an airport and drop off at your city destination without returning to the hub.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => onRoleSelect('Customer')}
                className="mt-16 bg-primary text-white font-bold py-5 px-12 rounded-none hover:bg-primary-hover transition-all shadow-2xl shadow-primary/20 text-lg"
              >
                Reserve Now
              </button>
            </div>
            <div className="flex-1 min-h-[400px]">
              <img 
                src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=2070&auto=format&fit=crop" 
                alt="Long-term rental service" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* COMPARISON SECTION */}
        <section className="max-w-4xl mx-auto px-6 mb-24 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-10">Short-Term Lease vs. Long-Term Vehicle Hire</h2>
          <div className="space-y-6 text-gray-600 font-light text-lg leading-relaxed">
            <p>
              Some vehicle dealerships may allow you to lease a vehicle for several months at a time, but terms tend to be limited and may include a minimum number of days and mileage restrictions.
            </p>
            <p>
              With an XTASS long-term hire, you can rent a vehicle for as long as needed, whether it's several weeks, a month, or longer. Additionally, there is no mileage limit for most vehicle classes.
            </p>
          </div>
        </section>

        {/* FOOTER SECTION: SEARCH EVERYDAY LOW RATES */}
        <section className="max-w-5xl mx-auto px-6 py-16 border-t border-gray-100 text-center">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">Search Our Everyday Low Rates</h2>
          <p className="text-gray-500 font-light text-lg mb-10">
            If none of our current promotions fit your needs, start a new reservation to view our standard low rates.
          </p>
          <button 
            onClick={() => setView('start-reservation')}
            className="bg-primary text-white font-bold py-5 px-14 rounded-none hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
          >
            Start a New Reservation
          </button>
        </section>

        {commonFooter}
      </main>
    );
  };

  const BusinessSolutionsPage: React.FC<{
    setView: (v: string) => void;
    commonFooter: React.ReactNode;
    onRoleSelect: (role: Role) => void;
  }> = ({ setView, commonFooter, onRoleSelect }) => {
    return (
      <main className="bg-[#f9fafb] min-h-screen font-sans text-left">
        {/* Navigation / Breadcrumbs */}
        <nav className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
            <button onClick={() => setView('home')} className="text-primary hover:underline border-b border-transparent hover:border-primary transition-all">Home</button>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-primary font-medium">Car Rental</span>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-gray-900 font-bold">Solutions for Business</span>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="relative h-[600px] overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
              alt="Business Transport" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center relative z-10 text-white">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-none mb-6"
              >
                Business Transport
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-display font-medium leading-tight mb-6"
              >
                Join Our Business Transport Programme
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-white/80 font-light mb-10 leading-relaxed max-w-2xl"
              >
                XTASS offers businesses unmatched value with competitive rates, a professionally managed fleet, and thousands of airport and neighbourhood service locations.
              </motion.p>
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={() => onRoleSelect('Customer')}
                className="bg-primary hover:bg-primary-hover text-white font-bold py-5 px-12 rounded-none shadow-2xl transition-all text-lg"
              >
                Sign Up Now
              </motion.button>
            </div>
          </div>
        </section>

        {/* GET STARTED IN 3 SIMPLE STEPS */}
        <section className="py-24 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-gray-900 mb-16">Get Started in 3 Simple Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { step: '1. Sign Up Today', detail: 'Complete our simple form to tell us about your business.' },
                { step: '2. Get Started Fast', detail: 'Qualified businesses receive an account number so you can start booking almost immediately.' },
                { step: '3. Start Saving Now', detail: 'Get up to 20% off base rates with unlimited mileage on most vehicle classes.' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-none flex items-center justify-center text-primary font-display font-black text-2xl mb-8 border border-gray-100 shadow-sm">
                    {i + 1}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{s.step}</h3>
                  <p className="text-gray-500 font-light leading-relaxed">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RESERVE WITH CORPORATE ACCOUNT FORM */}
        <section className="py-24 max-w-5xl mx-auto px-6">
          <div className="bg-white rounded-none shadow-2xl border border-gray-100 overflow-hidden text-left">
            <div className="p-8 md:p-14">
              <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-4">
                <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900">Reserve a Vehicle with Your Corporate Account</h2>
                <button 
                  onClick={() => setView('manage-reservation')}
                  className="text-primary font-bold hover:underline underline-offset-4 decoration-accent decoration-2 text-sm"
                >
                  or View / Modify / Cancel Reservation
                </button>
              </div>

              <div className="space-y-8 mt-10">
                <div className="text-left">
                  <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       Pick-Up & Return Location (City or Airport)*
                    </label>
                    <span className="text-[10px] text-gray-300 font-normal italic uppercase tracking-tighter">* Required Field</span>
                  </div>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Provide a Location"
                      className="w-full pl-6 pr-6 py-5 bg-gray-50/50 border border-gray-200 rounded-none focus:bg-white focus:ring-4 focus:ring-primary/5 focus:border-primary focus:outline-none text-xl font-medium transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left px-2">
                  <input 
                    type="checkbox" 
                    id="different-location-corporate"
                    className="w-6 h-6 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <label htmlFor="different-location-corporate" className="text-sm md:text-base font-bold text-gray-600 cursor-pointer flex items-center gap-2 group hover:text-primary transition-colors">
                    Return to a different location 
                    <div className="w-5 h-5 rounded-none bg-gray-200 flex items-center justify-center text-[10px] text-gray-500 font-bold">i</div>
                  </label>
                </div>

                <button 
                  onClick={() => onRoleSelect('Customer')}
                  className="w-full md:w-auto px-16 py-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-none shadow-2xl shadow-primary/20 transition-all text-xl"
                >
                  Search / Book Now
                </button>

                <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm font-medium">
                  <p className="text-gray-500">
                    Can't find your Corporate Account Number? Contact your Travel Management Team.
                  </p>
                  <button onClick={() => onRoleSelect('Customer')} className="text-primary font-bold hover:underline">
                    Not yet enrolled? Sign up now.
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* EXCLUSIVE BENEFITS */}
        <section className="bg-white py-24 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-16">Exclusive Benefits for Your Business</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { icon: <GlobeIcon className="w-8 h-8" />, title: 'Wide Coverage', detail: 'Thousands of locations, whether around the corner or across the globe.' },
                { icon: <CarIcon className="w-8 h-8" />, title: 'Diverse Fleet', detail: 'Diverse fleet of reliable, well-maintained vehicles.' },
                { icon: <AwardIcon className="w-8 h-8" />, title: 'Competitive Rates', detail: 'Competitive rates with contracted business pricing honoured globally.' },
                { icon: <UserCheckIcon className="w-8 h-8" />, title: 'Exceptional Service', detail: 'Exceptional service from a team that knows your business.' },
                { icon: <TrendingDownIcon className="w-8 h-8" />, title: 'Cost-Effective', detail: 'A cost-effective alternative to mileage reimbursement that offers significant savings per trip.' },
              ].map((b, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <div className="w-16 h-16 bg-primary/5 rounded-none flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all transform rotate-3 group-hover:rotate-0">
                    {b.icon}
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3">{b.title}</h4>
                  <p className="text-gray-500 text-xs leading-relaxed font-light">{b.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INDUSTRY-LEADING PROGRAMME */}
        <section className="py-24 bg-[#f9fafb]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-16">Industry-Leading Programme</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Comprehensive Mobility Offerings */}
              <div className="bg-white p-10 rounded-none border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all text-left">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 font-display">Comprehensive Mobility Offerings</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">
                    We're more than just transport. Our portfolio of solutions includes Truck Rental, Fleet Management, Carsharing, and Vanpooling. We'll listen to your business challenges, then customise a solution that meets your needs.
                  </p>
                </div>
                <button className="w-fit bg-primary text-white font-bold py-3 px-8 rounded-none hover:bg-primary-hover transition-all text-sm">
                  Learn More
                </button>
              </div>

              {/* Duty of Care */}
              <div className="bg-white p-10 rounded-none border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all text-left">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 font-display">Duty of Care</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">
                    Customer safety is our top priority, and we want both you and your employees to feel confident when they travel. From our corporate infrastructure to our customer-first policies, we've got you covered.
                  </p>
                </div>
                <button className="w-fit bg-primary text-white font-bold py-3 px-8 rounded-none hover:bg-primary-hover transition-all text-sm">
                  Learn More
                </button>
              </div>

              {/* Business Transport Resource Centre */}
              <div className="bg-white p-10 rounded-none border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all text-left">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 font-display">Business Transport Resource Centre</h3>
                  <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">
                    Find a variety of articles, white papers and more to reference as you develop, rethink, and possibly revise your company's travel policies and programmes.
                  </p>
                </div>
                <button className="w-fit bg-primary text-white font-bold py-3 px-8 rounded-none hover:bg-primary-hover transition-all text-sm">
                  Go Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* MANAGEMENT TOOLS */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-gray-900 mb-16">Business Transport Programme Management Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  title: 'Travel Management Tool', 
                  desc: "Book and manage vehicle hires on behalf of your company's travelers.",
                  img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop'
                },
                { 
                  title: 'Trip Optimiser — Rent or Reimburse?', 
                  desc: 'Our complimentary tool allows you to quickly compare driving a rental versus a personal vehicle.',
                  img: 'https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop'
                },
                { 
                  title: 'Entertainment & Production Rentals', 
                  desc: 'Vehicle and van rental for TV and film production, concerts, sporting events, and more.',
                  img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2070&auto=format&fit=crop'
                },
                { 
                  title: 'FBO Delivery Service', 
                  desc: 'Vehicle service waiting for you at Fixed Base Operators across Ghana.',
                  img: 'https://images.unsplash.com/photo-1549411223-28956903d3f9?q=80&w=2074&auto=format&fit=crop'
                },
              ].map((tool, i) => (
                <div key={i} className="flex flex-col group cursor-pointer bg-gray-50 rounded-none overflow-hidden border border-gray-100 hover:shadow-2xl transition-all">
                  <div className="h-48 overflow-hidden">
                    <img src={tool.img} alt={tool.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-between items-start">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-primary transition-colors">{tool.title}</h4>
                      <p className="text-gray-500 text-sm font-light leading-relaxed mb-8">{tool.desc}</p>
                    </div>
                    <button className="bg-primary text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-hover transition-all text-xs">
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {commonFooter}
      </main>
    );
  };

  const CorporateServicesPage: React.FC<{
    setView: (v: string) => void;
    commonFooter: React.ReactNode;
    onRoleSelect: (role: Role) => void;
  }> = ({ setView, commonFooter, onRoleSelect }) => {
    return (
      <main className="bg-[#f9fafb] min-h-screen font-sans text-left">
        {/* Navigation / Breadcrumbs */}
        <nav className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
            <button onClick={() => setView('home')} className="text-primary hover:underline border-b border-transparent hover:border-primary transition-all">Home</button>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-primary font-medium">Business</span>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-gray-900 font-bold">Corporate Services</span>
          </div>
        </nav>

        {/* HERO SECTION */}
        <section className="bg-primary text-white py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-display font-bold mb-6"
            >
              Corporate Services
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-white/80 font-light max-w-3xl leading-relaxed"
            >
              XTASS understands the specific demands of corporate travel. Business travelers need transport that is punctual, professional, and hassle-free. XTASS's Business and Premium service levels are designed precisely for this purpose, offering executive-grade vehicles and professionally presented drivers who prioritise punctuality and discretion.
            </motion.p>
          </div>
        </section>

        {/* CORPORATE BOOKING MANAGEMENT */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 border-b-2 border-accent pb-4 inline-block">Managed Transport Solutions</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8 font-light">
                  Companies looking to manage transport for their teams, clients, or visiting executives can work with XTASS to set up dedicated booking arrangements. Group bookings, recurring transfers, and event transport can all be coordinated through a single point of contact.
                </p>
                <button 
                  onClick={() => onRoleSelect('Customer')}
                  className="bg-primary text-white font-bold py-4 px-10 rounded-none hover:bg-primary-hover shadow-xl shadow-primary/10 transition-all font-sans"
                >
                  Contact Business Team
                </button>
              </div>
              <div className="rounded-none overflow-hidden shadow-2xl relative">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
                  alt="Corporate Office"
                  className="w-full h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* TOURISM & SIGHTSEEING */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-12 text-center uppercase tracking-tight">Tourism & Sightseeing</h2>
            <div className="bg-white rounded-none p-10 md:p-16 border border-gray-100 shadow-xl flex flex-col md:flex-row gap-12 items-center">
              <div className="w-full md:w-1/3">
                 <div className="bg-primary/5 rounded-none p-8 border border-primary/10 text-center">
                    <GlobeIcon className="w-16 h-16 text-primary mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-primary italic mb-2">Rental Ride</h3>
                    <p className="text-gray-500 font-medium">Multi-destination options</p>
                 </div>
              </div>
              <div className="flex-1 space-y-6">
                <p className="text-gray-600 leading-relaxed text-lg font-light">
                  For visitors exploring Ghana, XTASS's Rental Ride option provides a dedicated vehicle and driver for the duration of a sightseeing tour or multi-destination day trip. 
                </p>
                <p className="text-gray-600 leading-relaxed text-lg font-light">
                  Drivers are knowledgeable about key tourist destinations, cultural sites, and local areas of interest, providing a comfortable and informative transport experience for both domestic and international visitors.
                </p>
                <button 
                  onClick={() => setView('start-reservation')}
                  className="inline-flex items-center gap-3 text-primary font-bold hover:underline"
                >
                  Explore Sightseeing Options <ArrowRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {commonFooter}
      </main>
    );
  };



  const ManageReservationPage: React.FC<{
    setView: (v: string) => void;
    onRoleSelect: (role: Role) => void;
    commonFooter: React.ReactNode;
  }> = ({ setView, onRoleSelect, commonFooter }) => {
    return (
      <main className="bg-[#f9fafb] min-h-screen font-sans">
        {/* Navigation / Breadcrumbs */}
        <nav className="bg-white border-b border-gray-100 py-4">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-2 text-sm text-gray-500 font-medium">
            <button onClick={() => setView('home')} className="text-primary hover:underline border-b border-transparent hover:border-primary transition-all">Home</button>
            <ChevronRightIcon className="w-3 h-3" />
            <button onClick={() => setView('start-reservation')} className="text-primary hover:underline border-b border-transparent hover:border-primary transition-all">Reserve</button>
            <ChevronRightIcon className="w-3 h-3" />
            <span className="text-gray-900 font-bold">Modify a Car Rental Reservation</span>
          </div>
        </nav>

        {/* Header Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 md:pt-20">
          <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-gray-900 leading-tight">
              Manage Your Reservation
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm italic">or</span>
              <button 
                onClick={() => setView('start-reservation')}
                className="text-primary font-bold hover:underline underline-offset-4 decoration-2 decoration-primary/30"
              >
                Reserve a Vehicle
              </button>
            </div>
          </div>
          <p className="text-lg text-gray-600 font-light mt-4 mb-12 max-w-2xl leading-relaxed">
            Quickly view, modify, or cancel your upcoming XTASS journey. Please provide your booking details below.
          </p>

          <div className="bg-white p-6 sm:p-8 md:p-12 border border-gray-100 shadow-2xl rounded-none mb-24 max-w-4xl">
            <form className="space-y-8 sm:space-y-10" onSubmit={(e) => e.preventDefault()}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <ShieldIcon className="w-4 h-4 text-primary" />
                       Confirmation Number*
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. XT-998822"
                      className="w-full px-6 py-5 bg-gray-50/30 border border-gray-200 rounded-none focus:bg-white focus:ring-0 focus:border-primary focus:outline-none text-xl font-medium transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <UserIcon className="w-4 h-4 text-primary" />
                       Last Name*
                    </label>
                    <input 
                      type="text" 
                      placeholder="As listed on booking"
                      className="w-full px-6 py-5 bg-gray-50/30 border border-gray-200 rounded-none focus:bg-white focus:ring-0 focus:border-primary focus:outline-none text-xl font-medium transition-all placeholder:text-gray-300"
                    />
                  </div>
               </div>
               
               <div className="pt-4">
                  <button 
                    onClick={() => onRoleSelect('Customer')}
                    className="bg-primary text-white font-bold py-5 px-16 rounded-none hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 text-lg flex items-center justify-center gap-4 group"
                  >
                    Look Up Reservation
                    <SearchIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                  <p className="mt-6 text-xs text-gray-400 font-medium">* Required components are verified against our secure database.</p>
               </div>
            </form>
          </div>

          <p className="text-lg text-gray-600 font-light mb-10">
            More reservation options:
          </p>

          {/* Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {/* Option 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-100 p-8 rounded-none flex flex-col justify-between shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-gray-50 rounded-none flex items-center justify-center text-gray-900 group-hover:bg-primary group-hover:text-white transition-all transform -rotate-3 group-hover:rotate-0 mb-6">
                  <CarIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-gray-900">Active Rentals</h3>
                <p className="mt-3 text-gray-500 text-sm font-light leading-relaxed">View details for vehicles you have already picked up.</p>
              </div>
              <button className="bg-gray-900 text-white font-bold py-3 px-8 rounded-none hover:bg-primary transition-all text-sm uppercase tracking-widest">
                Manage Active →
              </button>
            </motion.div>

            {/* Option 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="bg-white border border-gray-100 p-8 rounded-none flex flex-col justify-between shadow-sm hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="mb-8">
                <div className="w-16 h-16 bg-gray-50 rounded-none flex items-center justify-center text-gray-900 group-hover:bg-primary group-hover:text-white transition-all transform rotate-3 group-hover:rotate-0 mb-6">
                  <ClockIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-display font-bold text-gray-900">Upcoming Trips</h3>
                <p className="mt-3 text-gray-500 text-sm font-light leading-relaxed">Modify or cancel reservations scheduled for a future date.</p>
              </div>
              <button className="bg-gray-900 text-white font-bold py-3 px-8 rounded-none hover:bg-primary transition-all text-sm uppercase tracking-widest">
                Manage Upcoming →
              </button>
            </motion.div>
          </div>
        </div>

        {/* Page Usage Notes Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 border-t border-gray-200">
          <div className="space-y-8">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-6">Reservation Management</h4>
            <div className="space-y-6 text-gray-600 leading-relaxed font-light text-base sm:text-lg">
              <p>
                Customers who have an active ride or an upcoming reservation can use this page to view full trip details, make modifications such as changing pickup time, location, or vehicle type, or cancel the reservation entirely. All modifications and cancellations are subject to XTASS's booking terms and conditions, which are clearly communicated during the booking process.
              </p>
              <p>
                Cancellations made well in advance are generally free of charge. Cancellations made close to the scheduled pickup time may incur a modest fee. All terms are clearly displayed during the booking process so customers can make informed decisions.
              </p>
            </div>
          </div>

          {/* Support Section */}
          <div className="bg-white p-6 sm:p-10 rounded-none border border-gray-100 shadow-2xl relative overflow-hidden h-fit">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-none -mr-16 -mt-16 blur-2xl"></div>
            <h4 className="text-xl font-display font-bold text-gray-900 mb-8 border-b-2 border-accent pb-4 inline-block">Need Support?</h4>
            <div className="space-y-6">
              <p className="text-gray-500 font-light text-sm sm:text-base mb-8 leading-relaxed font-sans">
                Customers requiring assistance with modifying or cancelling a booking can also contact the XTASS customer support team directly via phone, email, or WhatsApp.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-none flex items-center justify-center text-primary shrink-0">
                    <PhoneIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-1">Phone</p>
                    <p className="font-bold text-gray-800">+233 XXX XXX XXX</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-none flex items-center justify-center text-primary shrink-0">
                    <MailIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-1">Email</p>
                    <p className="font-bold text-gray-800">support@xtass.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-none flex items-center justify-center text-primary shrink-0">
                    <MessageSquareIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-1">WhatsApp</p>
                    <p className="font-bold text-gray-800">Available via website</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-none flex items-center justify-center text-primary shrink-0">
                    <ClockIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary/40 mb-1">Hours</p>
                    <p className="font-bold text-gray-800 leading-tight">24/7 Support</p>
                    <p className="text-[10px] text-gray-400">365 days a year</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {commonFooter}
      </main>
    );
  };
  const commonFooter = (
      <footer className="text-white" style={{ backgroundColor: '#1A0006' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* About Us Column */}
            <div className="col-span-1">
              <h4 className="font-bold text-lg mb-6 border-b border-white/10 pb-2">About Us</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Why Choose XTASS</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
                <li><button onClick={() => setView('careers')} className="hover:text-white transition-colors">Careers</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Press & Media</a></li>
              </ul>
            </div>
            
            {/* Our Services Column */}
            <div>
              <h4 className="font-bold text-lg mb-4">Our Services</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Instant Pickup</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Scheduled Rides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Airport Transfers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Group Transportation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Special Needs Transport</a></li>
                <li><a href="#" className="hover:text-white transition-colors">24/7 Availability</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Service Areas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing Information</a></li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-bold text-lg mb-4">Support</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Help Center / FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li>Customer Support:</li>
                <li>+233 XXX XXX XXX</li>
                <li>Email: support@xtass.com</li>
                <li><a href="#" className="hover:text-white transition-colors">WhatsApp Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Emergency Hotline</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('report-issue')}} className="hover:text-white transition-colors">Report an Issue</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('lost-and-found')}} className="hover:text-white transition-colors">Lost & Found</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('accessibility')}} className="hover:text-white underline transition-colors">Accessibility Services</a></li>
              </ul>
            </div>
            
            {/* Legal Column */}
            <div>
              <h4 className="font-bold text-lg mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('terms')}} className="hover:text-white transition-colors">Terms & Conditions</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('privacy')}} className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('cookie')}} className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('refund')}} className="hover:text-white transition-colors">Refund & Cancellation Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Driver Agreement</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('community')}} className="hover:text-white transition-colors">Community Guidelines</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('data-protection')}} className="hover:text-white transition-colors">Data Protection</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('compliance')}} className="hover:text-white transition-colors">Compliance & Safety</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('licensing')}} className="hover:text-white transition-colors">Licensing Information</a></li>
                <li><a href="#" onClick={(e) => {e.preventDefault(); setView('insurance')}} className="hover:text-white transition-colors">Insurance Coverage</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-black py-4 border-t border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm space-y-1">
              <p>© 2025 XTASS. All rights reserved. Made with in Ghana</p>
              <p className="mt-1">Available at: Kotoka Int'l Airport | Kumasi Airport | Tamale Airport</p>
          </div>
        </div>
      </footer>
  );

  const [isReservationsOpen, setIsReservationsOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeCategory, setActiveCategory] = useState<'Car Rental' | 'Business'>('Car Rental');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileReservationsOpen, setIsMobileReservationsOpen] = useState(false);
  const [isAuthDropdownOpen, setIsAuthDropdownOpen] = useState(false);

  return (
    <div className="bg-white text-gray-800">
      {/* Two-Layer Header */}
      <header className="sticky top-0 z-50">
        {/* Top Header (White) */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center flex-shrink-0">
              <img 
                src="https://i.ibb.co/6JVrf2Bt/XTASS-Logo.png" 
                alt="XTASS Logo" 
                className="h-8 sm:h-10 md:h-12 w-auto cursor-pointer transition-all" 
                onClick={() => setView('home')} 
              />
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-6 md:space-x-10">
              <div className="hidden md:flex items-center text-gray-800">
                <div className="bg-primary/5 p-2 rounded-full mr-3">
                  <PhoneIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 leading-none mb-1">Call Us</span>
                  <span className="text-sm font-bold">00233 123 456 789</span>
                </div>
              </div>
              
              <div className="hidden md:block relative">
                <button 
                  onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)} 
                  className="text-sm font-bold text-gray-800 hover:text-primary transition-colors py-2 flex items-center"
                >
                  Sign In | Register
                  <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isAuthDropdownOpen ? 'rotate-180': ''}`} />
                </button>
                <AuthDropdown 
                  isOpen={isAuthDropdownOpen} 
                  onClose={() => setIsAuthDropdownOpen(false)} 
                  onLoginSuccess={() => onRoleSelect('Customer')}
                />
              </div>
              
              <button 
                onClick={handleBookNow} 
                className="bg-[#FFD100] text-primary font-bold py-2 md:py-3 px-3 sm:px-6 md:px-8 rounded-sm hover:bg-[#FFC400] transition-colors shadow-sm text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                Book Now
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-primary hover:bg-gray-100 rounded-md transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 flex flex-col justify-around">
                  <span className={`block h-[2px] w-full bg-current transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
                  <span className={`block h-[2px] w-full bg-current transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                  <span className={`block h-[2px] w-full bg-current transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar (Red Bar) - Desktop */}
        <div className="bg-primary text-white shadow-md hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-[50px]">
            <nav className="flex items-center h-full">
              <div className="flex items-center space-x-0 h-full">
                <NavLinkRed active={view === 'home'} onClick={() => setView('home')}>Home</NavLinkRed>
                <NavLinkRed active={view === 'about'} onClick={() => setView('about')}>Who We Are</NavLinkRed>
                <NavLinkRed active={view === 'services'} onClick={() => setView('services')}>What We Do</NavLinkRed>
                <NavLinkRed active={view === 'hospitality'} onClick={() => setView('hospitality')}>Hospitality</NavLinkRed>
                
                {/* Reservations Dropdown Trigger */}
                <div 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                    setIsReservationsOpen(true);
                  }}
                  onMouseLeave={() => {
                    hoverTimeoutRef.current = setTimeout(() => {
                      setIsReservationsOpen(false);
                    }, 150);
                  }}
                >
                  <button className={`h-full px-6 text-sm font-bold transition-all flex items-center group outline-none ${isReservationsOpen ? 'text-accent' : 'text-white hover:text-accent'}`}>
                    Reservations
                    <ChevronDownIcon className={`ml-2 w-4 h-4 transition-transform duration-300 ${isReservationsOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Mega Dropdown */}
                  <AnimatePresence>
                    {isReservationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onMouseEnter={() => {
                          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                        }}
                        className="absolute top-full left-0 w-max bg-white text-gray-800 shadow-2xl border-t-2 border-primary overflow-hidden z-50 flex"
                      >
                        {/* Left Column (Main Sub-Categories) */}
                        <div className="w-max min-w-[160px] bg-gray-50 flex flex-col border-r border-gray-100">
                          <button 
                            onMouseEnter={() => setActiveCategory('Car Rental')}
                            className={`flex items-center justify-between group font-bold text-sm text-left p-4 pr-10 whitespace-nowrap transition-colors ${activeCategory === 'Car Rental' ? 'text-primary bg-white' : 'text-gray-600 hover:text-primary'}`}
                          >
                            Car Rental
                            <ChevronRightIcon className={`w-4 h-4 ml-4 transition-opacity ${activeCategory === 'Car Rental' ? 'opacity-100' : 'opacity-0'}`} />
                          </button>
                          <button 
                            onMouseEnter={() => setActiveCategory('Business')}
                            className={`flex items-center justify-between group font-bold text-sm text-left p-4 pr-10 whitespace-nowrap transition-colors ${activeCategory === 'Business' ? 'text-primary bg-white' : 'text-gray-600 hover:text-primary'}`}
                          >
                            Business
                            <ChevronRightIcon className={`w-4 h-4 ml-4 transition-opacity ${activeCategory === 'Business' ? 'opacity-100' : 'opacity-0'}`} />
                          </button>
                        </div>

                        {/* Right Column (Specific Actions) */}
                        <div className="flex-1 p-4 flex flex-col space-y-1 min-w-[240px]">
                          {activeCategory === 'Car Rental' && (
                            <>
                              <DropdownLink onClick={() => { setView('start-reservation'); setIsReservationsOpen(false); }}>Start A Car Reservation</DropdownLink>
                              <DropdownLink onClick={() => { setView('manage-reservation'); setIsReservationsOpen(false); }}>View / Modify / Cancel</DropdownLink>
                              <DropdownLink onClick={() => { setView('deals-and-coupons'); setIsReservationsOpen(false); }}>All Deals And Coupons</DropdownLink>

                              <DropdownLink onClick={() => { setView('one-way-rental'); setIsReservationsOpen(false); }}>One Way Car Rental</DropdownLink>
                              <DropdownLink onClick={() => { setView('long-term-rental'); setIsReservationsOpen(false); }}>Long-Term Car Rental</DropdownLink>
                            </>
                          )}
                          {activeCategory === 'Business' && (
                            <>
                              <DropdownLink onClick={() => { setView('business-solutions'); setIsReservationsOpen(false); }}>Solutions for Business</DropdownLink>
                              <DropdownLink onClick={() => { setView('corporate-services'); setIsReservationsOpen(false); }}>Corporate Services</DropdownLink>

                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <NavLinkRed active={view === 'careers'} onClick={() => setView('careers')}>Careers</NavLinkRed>
                <NavLinkRed active={view === 'contact'} onClick={() => {}}>Contact Us</NavLinkRed>
              </div>
            </nav>

            {/* Social Icons */}
            <div className="hidden lg:flex items-center space-x-4">
              <SocialIcon><FacebookIcon className="w-4 h-4" /></SocialIcon>
              <SocialIcon><InstagramIcon className="w-4 h-4" /></SocialIcon>
              <SocialIcon><TikTokIcon className="w-4 h-4" /></SocialIcon>
              <SocialIcon><YoutubeIcon className="w-4 h-4" /></SocialIcon>
              <SocialIcon><PinterestIcon className="w-4 h-4" /></SocialIcon>
              <SocialIcon><TwitterIcon className="w-4 h-4" /></SocialIcon>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed inset-0 top-[60px] sm:top-[73px] md:top-[81px] bg-white z-40 flex flex-col overflow-y-auto pb-10"
            >
              <div className="flex flex-col p-6 space-y-4">
                <MobileNavLink onClick={() => { setView('home'); setIsMobileMenuOpen(false); }}>Home</MobileNavLink>
                <MobileNavLink onClick={() => { setView('about'); setIsMobileMenuOpen(false); }}>Who We Are</MobileNavLink>
                <MobileNavLink onClick={() => { setView('services'); setIsMobileMenuOpen(false); }}>What We Do</MobileNavLink>
                <MobileNavLink onClick={() => { setView('hospitality'); setIsMobileMenuOpen(false); }}>Hospitality</MobileNavLink>
                
                {/* Mobile Reservations Accordion */}
                <div className="flex flex-col">
                  <button 
                    onClick={() => setIsMobileReservationsOpen(!isMobileReservationsOpen)}
                    className="flex items-center justify-between py-3 text-lg font-bold text-gray-800 border-b border-gray-100"
                  >
                    Reservations
                    <ChevronDownIcon className={`w-5 h-5 transition-transform ${isMobileReservationsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isMobileReservationsOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-gray-50 flex flex-col px-4"
                      >
                        <div className="py-4 flex flex-col space-y-4">
                          <p className="text-primary font-bold text-sm uppercase tracking-wider">Car Rental</p>
                          <DropdownLinkMobile onClick={() => { setView('start-reservation'); setIsMobileMenuOpen(false); }}>Start A Car Reservation</DropdownLinkMobile>
                          <DropdownLinkMobile onClick={() => { setView('manage-reservation'); setIsMobileMenuOpen(false); }}>View / Modify / Cancel</DropdownLinkMobile>
                          <DropdownLinkMobile onClick={() => { setView('deals-and-coupons'); setIsMobileMenuOpen(false); }}>All Deals And Coupons</DropdownLinkMobile>
                          
                          <p className="text-primary font-bold text-sm uppercase tracking-wider pt-2 border-t border-gray-200">Business</p>

                          <DropdownLinkMobile onClick={() => { setView('one-way-rental'); setIsMobileMenuOpen(false); }}>One Way Car Rental</DropdownLinkMobile>
                          <DropdownLinkMobile onClick={() => { setView('long-term-rental'); setIsMobileMenuOpen(false); }}>Long-Term Car Rental</DropdownLinkMobile>
                          <DropdownLinkMobile onClick={() => { setView('business-solutions'); setIsMobileMenuOpen(false); }}>Solutions for Business</DropdownLinkMobile>
                          <DropdownLinkMobile onClick={() => { setView('corporate-services'); setIsMobileMenuOpen(false); }}>Corporate Services</DropdownLinkMobile>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <MobileNavLink onClick={() => { setView('careers'); setIsMobileMenuOpen(false); }}>Careers</MobileNavLink>
                <MobileNavLink onClick={() => setIsMobileMenuOpen(false)}>Contact Us</MobileNavLink>
                
                <div className="pt-8 flex justify-center space-x-6 text-primary">
                  <FacebookIcon className="w-6 h-6" />
                  <InstagramIcon className="w-6 h-6" />
                  <TikTokIcon className="w-6 h-6" />
                  <TwitterIcon className="w-6 h-6" />
                </div>

                <div className="pt-10 relative">
                  <button 
                    onClick={() => setIsAuthDropdownOpen(!isAuthDropdownOpen)} 
                    className="w-full bg-primary text-white font-bold py-4 rounded-lg shadow-lg flex justify-center items-center"
                  >
                    Sign In | Register
                    <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${isAuthDropdownOpen ? 'rotate-180': ''}`} />
                  </button>
                  <AuthDropdown 
                    isOpen={isAuthDropdownOpen} 
                    onClose={() => setIsAuthDropdownOpen(false)} 
                    onLoginSuccess={() => onRoleSelect('Customer')}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {view === 'corporate-services' && (
        <CorporateServicesPage setView={setView} commonFooter={commonFooter} onRoleSelect={onRoleSelect} />
      )}


      {view === 'home' && (
         <main>
          <div className="relative">
            {/* Hero background and text */}
            <div className="relative bg-black text-white">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[.85]" 
                style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
              </div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-36 md:pt-52 pb-32 sm:pb-40 md:pb-52 text-center">
                <p className="font-display text-sm md:text-base font-medium text-white/80 uppercase tracking-widest">Welcome to</p>
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mt-4 leading-tight italic tracking-tight">XCELLENT TRANSPORT & <br className="hidden sm:block" /> SHUTTLE SERVICES</h1>
                <p className="text-base md:text-lg lg:text-xl mt-6 max-w-3xl mx-auto text-white/90 font-light leading-relaxed">Trusted Transport Services for Every Traveler</p>
              </div>
            </div>

            {/* Form - positioned to overlap */}
            <div className="relative z-10 -mt-20 sm:-mt-24 md:-mt-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white p-6 sm:p-8 shadow-2xl text-left text-gray-800 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Types of Ride */}
                    <div>
                      <label htmlFor="rideType" className="block text-lg font-semibold text-gray-800 mb-2">Types of Ride</label>
                      <div className="relative">
                        <select
                          id="rideType"
                          value={rideType}
                          onChange={(e) => setRideType(e.target.value)}
                          className={`w-full p-3 pl-4 pr-4 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-accent appearance-none bg-white ${!rideType ? 'text-gray-500' : 'text-gray-800'}`}
                          required
                        >
                          <option value="" disabled>Select your ride</option>
                          <option value="Instant Ride">Instant Ride</option>
                          <option value="Scheduled Ride">Scheduled Ride</option>
                        </select>
                      </div>
                    </div>
                    {/* Pick Up Location */}
                    <div>
                      <label htmlFor="pickup" className="block text-lg font-semibold text-gray-800 mb-2">Pick Up Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="pickup"
                          placeholder="Kotoka International Airport, Ghana."
                          className="w-full p-3 pl-4 pr-4 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-accent placeholder-gray-500"
                          value={pickup}
                          onChange={e => setPickup(e.target.value)}
                        />
                      </div>
                    </div>
                    {/* Drop Off Location */}
                    <div>
                      <label htmlFor="dropoff" className="block text-lg font-semibold text-gray-800 mb-2">Drop Off Location</label>
                      <div className="relative">
                        <input
                          type="text"
                          id="dropoff"
                          placeholder="East Legon, Accra."
                          className="w-full p-3 pl-4 pr-4 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-accent placeholder-gray-500"
                          value={dropoff}
                          onChange={e => setDropoff(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={`mt-6 grid grid-cols-1 sm:grid-cols-2 ${rideType === 'Scheduled Ride' ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-6 items-end`}>
                    {rideType === 'Scheduled Ride' && (
                      <>
                        {/* Date */}
                        <div>
                          <label htmlFor="date" className="block text-lg font-semibold text-gray-800 mb-2">Select Date (DD/MM/2025)</label>
                          <input
                            type="tel"
                            id="date"
                            placeholder="DD/MM/2025"
                            className="w-full p-3 pl-4 pr-4 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-accent text-gray-800 placeholder-gray-500"
                            value={date}
                            onChange={handleDateChange}
                            maxLength={10}
                          />
                           {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
                        </div>
                        {/* Time */}
                        <div>
                          <label htmlFor="time" className="block text-lg font-semibold text-gray-800 mb-2">Time</label>
                          <select
                            id="time"
                            className={`w-full p-3 pl-4 pr-4 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-accent appearance-none bg-white ${!time ? 'text-gray-500' : 'text-gray-800'}`}
                            value={time}
                            onChange={handleTimeChange}
                          >
                            <option value="" disabled>Select Time</option>
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          {timeError && <p className="text-red-500 text-xs mt-1">{timeError}</p>}
                        </div>
                      </>
                    )}
                    {/* Passaengers */}
                    <div>
                      <label htmlFor="passengers" className="block text-lg font-semibold text-gray-800 mb-2">Passaengers</label>
                      <input
                        type="number"
                        id="passengers"
                        placeholder="No. of Passangers"
                        className="w-full p-3 pl-4 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-accent placeholder-gray-500"
                        value={passengers}
                        onChange={e => setPassengers(e.target.value)}
                      />
                    </div>
                    {/* Book Now Button */}
                    <div>
                      <button onClick={handleBookNow} className="w-full bg-accent text-primary font-bold py-3 px-6 hover:bg-yellow-400 transition-colors text-lg">Book Now</button>
                    </div>
                  </div>
                </div>
            </div>
          </div>


          {/* Airport Transportation Section */}
          <section className="pt-24 pb-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="relative flex flex-col md:flex-row items-center">
                <div className="md:w-3/5 w-full">
                  <img src="https://i.ibb.co/S7HBYCvk/Airport-Transportation.jpg" alt="Airport Transportation" className="shadow-2xl w-full h-auto object-cover border border-gray-100"/>
                </div>
                <div className="md:w-1/2 w-full bg-white p-6 sm:p-10 md:p-12 shadow-2xl md:-ml-24 mt-[-2rem] md:mt-0 relative z-10">
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 leading-tight italic tracking-tight">Airport Transportation</h2>
                  <hr className="my-6 border-gray-800 w-24 border-t-2" />
                  <p className="mt-4 text-base sm:text-lg text-gray-600 font-light">Reserve shared ride or private airport transportation in your departure and destination city. Vans, sedans, or SUVs.</p>
                  <button onClick={() => onRoleSelect('Customer')} className="mt-8 bg-primary text-white font-bold py-4 px-10 hover:bg-primary-hover transition-all shadow-xl shadow-primary/10">AIRPORT RIDES</button>
                </div>
              </div>
            </div>
          </section>

          {/* Private Car Service Section */}
            <section className="py-16" style={{ backgroundColor: '#660032' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative flex flex-col-reverse md:flex-row items-center">
                    <div className="md:w-1/2 w-full bg-white p-6 sm:p-10 md:p-12 shadow-2xl relative z-10 md:mt-0 mt-[-2rem] border border-gray-50">
                        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-800 leading-tight italic tracking-tight">Private Car Service</h2>
                        <hr className="my-6 border-gray-800 w-24 border-t-2" />
                        <p className="mt-4 text-base sm:text-lg text-gray-600 font-light">Travel on your schedule with a private driver. Book by the hour or choose point-to-point transfers.</p>
                        <button onClick={() => onRoleSelect('Customer')} className="mt-8 bg-primary text-white font-bold py-4 px-10 hover:bg-primary-hover transition-all shadow-xl shadow-primary/10 uppercase tracking-widest text-sm">PRIVATE CAR SERVICE</button>
                    </div>
                    <div className="md:w-3/5 w-full md:-ml-24 md:p-0">
                        <img src="https://i.ibb.co/99HNcLqx/Private-Car-Service.png" alt="Private Car Service" className="shadow-2xl w-full h-auto object-cover border border-gray-100"/>
                    </div>
                    </div>
                </div>
            </section>

          {/* Features Section */}
          <section className="py-12 sm:py-16" style={{ backgroundColor: '#EEE3E9' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <h3 className="text-2xl font-display font-bold text-primary">Door-to-Door Airport Transportation</h3>
                <p className="mt-4">XTASS has been providing affordable, convenient, and safe shared ride and private airport transfers. We pioneered the shared ride concept with specialization in grouping and routing passengers traveling in the same direction together in an airport shuttle. Since then, we’ve expanded our ground transportation services beyond shared ride vans to include: airport car service, point to point transfers, and group transportation for special events. We’re not just about getting from point A to point B, but about enhancing your entire travel experience.</p>
                <p className="mt-4">XTASS is a national brand that partners with trusted local transportation providers in each city, so you get the convenience of a national network with the service of a local expert. Our operators provide door-to-door airport pickups and drop offs from your home, office, hotel, or anywhere you desire. We use flight tracking software so we know if your flight is delayed or arriving early.</p>
                <p className="mt-4">Booking with XTASS means choosing an organization that values safety, affordability, and convenience. With transparent fares, and the assurance of reliable transport, we’ll not only meet your travel demands, but exceed them.</p>
                <p className="mt-4 font-semibold">Book your ride with us today!</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white text-primary p-6 border border-primary">
                  <h4 className="font-bold font-display">Upfront Pricing</h4>
                  <p className="mt-2 text-sm">All inclusive fares with no hidden fees or additional charges for reserving in advance. No surge pricing during peak travel times or inclement weather.</p>
                </div>
                <div className="text-white p-6" style={{ backgroundColor: '#660032' }}>
                  <h4 className="font-bold font-display">Departure & Destination</h4>
                  <p className="mt-2 text-sm">Book transportation for all four legs of your journey in your departure and destination cities at the same time – making airport travel easy.</p>
                </div>
                <div className="text-white p-6" style={{ backgroundColor: '#660032' }}>
                  <h4 className="font-bold font-display">Available 24/7</h4>
                  <p className="mt-2 text-sm">Book airport rides, around town transportation, or tours and attractions securely with the device of your choice.</p>
                </div>
                <div className="bg-white text-primary p-6 border border-primary">
                  <h4 className="font-bold font-display">Safety First</h4>
                  <p className="mt-2 text-sm">From background and safety checks to deep cleaning standards, we're doing our part to ensure that your ride is a safe one.</p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="relative py-12 sm:py-16 text-white overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center" 
              style={{backgroundImage: "url('https://i.ibb.co/wFXkyNhy/How-it-works-background-section-image.png')"}}>
            </div>
            <div className="absolute inset-0 bg-primary opacity-70"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-display font-bold">How It Works</h2>
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex flex-col items-center">
                  <div className="border-4 border-accent text-accent p-3 mb-4 rounded-full"><SearchIcon className="w-8 h-8"/></div>
                  <h4 className="font-bold text-xl">1. Search</h4>
                  <p>Tell us where you're going.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="border-4 border-accent text-accent p-3 mb-4 rounded-full"><CheckCircleIcon className="w-8 h-8"/></div>
                  <h4 className="font-bold text-xl">2. Select</h4>
                  <p>Choose your ride type.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="border-4 border-accent text-accent p-3 mb-4 rounded-full"><BookingIcon className="w-8 h-8"/></div>
                  <h4 className="font-bold text-xl">3. Book</h4>
                  <p>Confirm your ride.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="border-4 border-accent text-accent p-3 mb-4 rounded-full"><CarIcon className="w-8 h-8"/></div>
                  <h4 className="font-bold text-xl">4. GO</h4>
                  <p>Your driver meets you curbside.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Where We Go */}
          <section className="py-12 sm:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-primary italic tracking-tight">Where We Go</h2>
              <p className="mt-4 text-base sm:text-lg max-w-2xl mx-auto text-gray-600 font-light">Connecting you to major airports across Ghana. Your journey, our priority.</p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <button className="text-white p-4 hover:bg-primary-hover" style={{ backgroundColor: '#660032' }}>Kotoka Int'l Airport</button>
                <button className="text-white p-4 hover:bg-primary-hover" style={{ backgroundColor: '#660032' }}>Tamale Airport</button>
                <button className="text-white p-4 hover:bg-primary-hover" style={{ backgroundColor: '#660032' }}>Takoradi Airport</button>
                <button className="text-white p-4 hover:bg-primary-hover" style={{ backgroundColor: '#660032' }}>Kumasi Airport</button>
                <button className="text-white p-4 hover:bg-primary-hover" style={{ backgroundColor: '#660032' }}>Wa Airport</button>
                <button className="text-white p-4 hover:bg-primary-hover" style={{ backgroundColor: '#660032' }}>Sunyani Airport</button>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16" style={{ backgroundColor: '#660032' }}>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-display font-bold text-white text-center">Frequently Asked Questions</h2>
              <div className="mt-12 space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center text-left text-xl font-semibold text-white">
                      <span>{faq.q}</span>
                      <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`}/>
                    </button>
                    {openFaq === index && (
                      <div className="mt-4 text-white/90 text-left pr-8">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {commonFooter}

        </main>
      )}

      {view === 'about' && (
        <main>
          {/* Hero for About Us page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">About Us</h1>
              <p className="mt-4 text-lg text-white/90">Learn more about our mission and commitment to excellence.</p>
            </div>
          </div>

          {/* About XTASS Section */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="prose lg:prose-lg max-w-none text-gray-600 space-y-4">
                  <h2 className="text-3xl font-display font-bold text-gray-800">About XTASS</h2>
                  <p>XTASS has been provides affordable, convenient, and reliable airport and city transportation services to travelers in Ghana since its launch. Customers can choose how they want to ride with Instant Ride, Scheduled Ride and Rental Ride. In every location, XTASS delivers a safe and comfortable way to get to and from the airport, your hotel, tourist destinations or anywhere preferably.</p>
                  <p>XTASS offers airport transfers, private car service, and group travel options, including premium, Business, Economy and Basic services that can be reserved by the hour for personalized, around-town rides.</p>
                </div>
                <div>
                  <img src="https://i.ibb.co/99HNcLqx/Private-Car-Service.png" alt="XTASS Car" className="rounded-lg shadow-xl w-full h-auto object-cover"/>
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose XTASS Section */}
          <section className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-display font-bold text-gray-800">Why Choose XTASS</h2>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {/* Safety Card */}
                <div className="bg-white p-8 shadow-lg rounded-lg">
                  <ShieldIcon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold font-display text-gray-800">Safety</h3>
                  <p className="mt-2 text-gray-600">At XTASS, safety has always been and will always be our top priority. We implement strict background checks, continuous driver monitoring, and high vehicle maintenance standards across our trusted local partners. When you ride with XTASS, you ride with confidence knowing we prioritize your well-being every step of the way.</p>
                </div>
                {/* Consistent Quality Card */}
                <div className="bg-white p-8 shadow-lg rounded-lg">
                  <StarIcon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold font-display text-gray-800">Consistent Quality</h3>
                  <p className="mt-2 text-gray-600">We take pride in delivering the same friendly, dependable, and affordable service in every city through our growing network of trusted affiliates.</p>
                </div>
                {/* Easy to Book Card */}
                <div className="bg-white p-8 shadow-lg rounded-lg">
                  <BookingIcon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold font-display text-gray-800">Easy to Book</h3>
                  <p className="mt-2 text-gray-600">Our secure online booking system is available 24/7, allowing you to schedule or request rides anytime, anywhere. XTASS can be booked for one-way or round-trip transportation at both departure and destination cities. Whether you’re traveling for business, vacation, or daily commutes, XTASS makes ground transportation simple and stress-free.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final Section */}
          <section className="py-16 md:py-20" style={{ backgroundColor: '#EEE3E9' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed">Follow us as we expand across Africa and beyond, introducing smarter, safer, and more efficient travel experiences for everyone.</p>
              <p className="mt-4 text-lg md:text-xl text-gray-700 leading-relaxed">Let XTASS be your go-to for all your airport and city transportation needs locally and internationally.</p>
            </div>
          </section>
          
          {commonFooter}
        </main>
      )}

      {view === 'services' && (
        <main>
          {/* Hero for Services page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Our Services</h1>
              <p className="mt-4 text-lg text-white/90">A complete range of airport and city transportation options.</p>
            </div>
          </div>

          {/* XTASS Services Section */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="prose lg:prose-lg max-w-none text-gray-600 space-y-4">
                  <h2 className="text-3xl font-display font-bold text-gray-800">XTASS Services</h2>
                  <p>XTASS provides a complete range of airport and city transportation options designed to meet the needs of every traveler. Whether you’re looking for a quick airport transfer, a private car for business, or a rental ride for a day of sightseeing, XTASS ensures a smooth, reliable, and comfortable experience from start to finish.</p>
                  <h4 className="font-bold text-gray-800">Ride Options</h4>
                  <p>XTASS offers three main ride types — <strong>Instant Ride, Scheduled Ride, and Rental Ride</strong>. Instant Ride allows customers to request a ride on demand whenever they need to move immediately. This is perfect for travelers with sudden schedule changes or urgent transportation needs. Scheduled Ride lets customers book a vehicle in advance for a specific time and date, offering peace of mind for planned airport drop-offs, meetings, or special occasions. Rental Ride provides the flexibility to hire a vehicle with a professional driver for several hours or the entire day, ideal for those who have multiple stops, sightseeing plans, or business errands around town.</p>
                  <h4 className="font-bold text-gray-800">Service Types</h4>
                   <p>The platform caters to different travel needs with options including <strong>Airport Transfers, Private Car Services, and Group Travel</strong>. Airport Transfers ensure smooth and timely trips to and from the airport, eliminating the stress of catching or missing a flight. Private Car Services are tailored for individuals or small groups who value comfort, privacy, and exclusivity. Group Travel services accommodate larger groups, making them ideal for family trips, corporate travel, or tourist groups moving together.</p>
                   <h4 className="font-bold text-gray-800">Service Levels</h4>
                  <p>XTASS understands that every traveler has unique expectations, so it provides four service tiers: <strong>Premium, Business, Economy, and Basic.</strong> The Premium service delivers a top-tier experience with luxury vehicles, professional drivers, and additional comforts such as onboard Wi-Fi and refreshments. Business service provides high-quality vehicles and professional service at a slightly more affordable rate, perfect for executives and professionals. Economy service focuses on comfort and affordability, offering clean and reliable rides for everyday use. For those who only need essential, budget-friendly transportation, the Basic service ensures safety and reliability without extra frills.</p>
                </div>
                <div>
                  <img src="https://i.ibb.co/S7HBYCvk/Airport-Transportation.jpg" alt="XTASS Airport Service" className="rounded-lg shadow-xl w-full h-auto object-cover"/>
                </div>
              </div>
            </div>
          </section>
          
          {/* Our Commitment Section */}
          <section className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-display font-bold text-gray-800">Our Commitment to You</h2>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                {/* Booking Flexibility Card */}
                <div className="bg-white p-8 shadow-lg rounded-lg">
                  <BookingIcon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold font-display text-gray-800">Booking Flexibility</h3>
                  <p className="mt-2 text-gray-600">XTASS makes it easy to plan and manage your rides with a secure 24/7 online booking system. Customers can choose <strong>one-way or round-trip</strong> options depending on their travel needs. The service accommodates <strong>pick-ups and drop-offs from airports, hotels, tourist destinations, or any address within the operating city.</strong> Whether booking in advance or at the last minute, XTASS ensures convenience and flexibility every time.</p>
                </div>
                {/* Safety and Quality Card */}
                <div className="bg-white p-8 shadow-lg rounded-lg">
                  <ShieldIcon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold font-display text-gray-800">Safety and Quality Assurance</h3>
                  <p className="mt-2 text-gray-600">Safety remains the foundation of XTASS operations. Every driver undergoes <strong>thorough background checks and continuous monitoring</strong> to ensure high standards of professionalism. Vehicles are regularly inspected and maintained to guarantee reliability and comfort. XTASS also partners with trusted local affiliates to maintain consistent quality and safety across all its service areas. When you ride with XTASS, you can be confident that your <strong>safety and satisfaction come first.</strong></p>
                </div>
                {/* Pricing and Value Card */}
                <div className="bg-white p-8 shadow-lg rounded-lg">
                  <DollarSignIcon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold font-display text-gray-800">Pricing and Value</h3>
                  <p className="mt-2 text-gray-600">Pricing for XTASS services is based on several factors including the <strong>type of service selected, distance, duration, and vehicle category.</strong> Premium and Business rides offer added comfort at higher rates, while Economy and Basic options remain cost-effective without compromising safety. Customers also have the choice between <strong>Instant, Scheduled, or Rental</strong> modes, ensuring that every budget and travel style is accommodated.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Final Section */}
          <section className="py-16 md:py-20" style={{ backgroundColor: '#EEE3E9' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center prose lg:prose-lg max-w-none text-gray-700 space-y-4">
              <h4 className="font-bold text-gray-800">Coverage and Use Cases</h4>
              <p className="leading-relaxed">XTASS serves a wide range of transportation needs, from <strong>airport pick-ups and city commutes to intercity travel and group transportation.</strong> It is ideal for business travelers heading to meetings, tourists exploring local attractions, families traveling together, and individuals who simply want dependable rides for daily movement. The rental option makes it easy to move between multiple locations without the stress of finding new rides throughout the day.</p>
              <h4 className="font-bold text-gray-800">In Summary</h4>
              <p className="leading-relaxed">XTASS brings together <strong>comfort, flexibility, safety, and affordability</strong> in one platform. Whether you need an airport transfer, city ride, or hourly rental, XTASS ensures that every journey is easy to book, safe to ride, and consistently high in quality. As the company expands across Africa and beyond, XTASS continues to redefine how travelers experience ground transportation — <strong>one reliable ride at a time.</strong></p>
            </div>
          </section>
          
          {commonFooter}
        </main>
      )}
      
      {view === 'faq' && (
        <main>
          {/* Hero for FAQ page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Frequently Asked Questions</h1>
              <p className="mt-4 text-lg text-white/90">Your questions, answered.</p>
            </div>
          </div>
          
          {/* Full FAQ Section */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="space-y-6">
                {fullFaqs.map((faq, index) => (
                  <div key={index} className="border-b pb-6">
                    <button 
                      onClick={() => setOpenFullFaq(openFullFaq === index ? null : index)} 
                      className="w-full flex justify-between items-center text-left text-xl font-semibold text-gray-800 hover:text-primary"
                    >
                      <span dangerouslySetInnerHTML={{ __html: faq.q }}></span>
                      <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${openFullFaq === index ? 'rotate-180' : ''}`}/>
                    </button>
                    {openFullFaq === index && (
                      <div 
                        className="mt-4 text-gray-600 text-left pr-8 prose"
                        dangerouslySetInnerHTML={{ __html: faq.a }}
                      >
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'terms' && (
        <main>
          {/* Hero for Terms page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Terms & Conditions</h1>
              <p className="mt-4 text-lg text-white/90">Please read our terms carefully before using our services.</p>
            </div>
          </div>
          
          {/* Terms and Conditions Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h4>1. Introduction</h4>
                  <p>Welcome to XTASS. These Terms and Conditions govern your access to and use of our transportation services, including instant rides, scheduled rides, rental rides, and any related features or platforms provided by XTASS. By using our website, mobile app, or booking services, you agree to be bound by these Terms. If you do not agree, please do not use our services.</p>
                  <p>XTASS operates as a professional airport and city transportation service in Ghana, connecting customers with verified drivers and vehicles for safe, reliable, and convenient travel.</p>

                  <h4>2. Definitions</h4>
                  <p>“XTASS,” “we,” “us,” or “our” refers to XTASS, its affiliates, and authorized service partners.<br/>
                  “Customer,” “you,” or “user” refers to anyone who books, uses, or accesses XTASS services.<br/>
                  “Driver” refers to any individual or partner who provides transportation under the XTASS platform.<br/>
                  “Service” refers to any transportation or related service offered by XTASS, including Instant Ride, Scheduled Ride, and Rental Ride.</p>

                  <h4>3. Service Use</h4>
                  <p>You agree to use XTASS services only for lawful purposes and in accordance with these Terms. When booking a ride, you are responsible for providing accurate information such as pickup location, destination, and contact details.</p>
                  <p>XTASS may refuse or cancel bookings if the information provided is false, incomplete, or suspected of misuse. Misbehavior toward drivers or misuse of vehicles may result in suspension or termination of your account.</p>

                  <h4>4. Booking and Confirmation</h4>
                  <p>Bookings can be made through the XTASS website or mobile application. Once a booking is completed, you will receive a confirmation message via email or SMS containing the ride details.</p>
                  <ul>
                    <li>For <strong>Scheduled Rides</strong>, your driver will arrive at the confirmed time and location.</li>
                    <li>For <strong>Instant Rides</strong>, the system automatically assigns the nearest available driver.</li>
                    <li>For <strong>Rental Rides</strong>, the service includes a dedicated driver for the agreed duration.</li>
                  </ul>
                  <p>XTASS reserves the right to reassign or cancel bookings in case of operational issues, safety concerns, or driver unavailability.</p>

                  <h4>5. Payments and Pricing</h4>
                  <p>XTASS offers transparent and competitive pricing across all service tiers — Premium, Business, Economy, and Basic.</p>
                  <ul>
                    <li>All fares are displayed before booking confirmation.</li>
                    <li>Prices may vary depending on distance, duration, time of day, and service type.</li>
                    <li>Payments can be made via credit/debit cards, mobile money, or other approved online payment methods.</li>
                    <li>Once a ride is completed, customers receive a payment notification immediately and a receipt afterward via email or app.</li>
                    <li>Any unpaid or disputed charges must be resolved promptly with XTASS customer support.</li>
                  </ul>

                  <h4>6. Cancellations and Refunds</h4>
                  <ul>
                    <li><strong>Free cancellation:</strong> Available if done before the driver is dispatched or within the allowed time frame.</li>
                    <li><strong>Late cancellation:</strong> May result in a small cancellation fee.</li>
                    <li><strong>No-show:</strong> If the driver arrives and the customer is not present after a waiting period, the full fare may be charged.</li>
                  </ul>
                  <p>Refunds, where applicable, will be processed within a reasonable period after verification.</p>

                  <h4>7. Safety and Conduct</h4>
                  <p>XTASS prioritizes the safety of both passengers and drivers.</p>
                  <ul>
                    <li>All drivers undergo strict background checks and continuous monitoring.</li>
                    <li>Vehicles are regularly maintained to meet high safety standards.</li>
                    <li>Customers are expected to behave respectfully toward drivers and other passengers.</li>
                  </ul>
                  <p>XTASS reserves the right to deny service or block users who engage in inappropriate, unsafe, or unlawful behavior.</p>

                  <h4>8. Liability</h4>
                  <p>XTASS acts as a transportation service facilitator. While we take every measure to ensure reliability and safety, XTASS is not liable for any:</p>
                  <ul>
                    <li>Delays due to traffic, weather, or unforeseen circumstances.</li>
                    <li>Lost or damaged personal belongings during rides.</li>
                    <li>Indirect, incidental, or consequential damages resulting from use of the service.</li>
                  </ul>
                  <p>However, XTASS will make reasonable efforts to assist customers in resolving any issues that occur during their trip.</p>

                  <h4>9. Account and Data Protection</h4>
                  <p>If you create an account on the XTASS platform, you are responsible for maintaining the confidentiality of your login details. You agree not to share your credentials with others or use another person’s account without permission.</p>
                  <p>XTASS values your privacy and handles all personal data in accordance with applicable data protection laws. Personal information such as name, contact details, and payment information is securely stored and never shared with unauthorized parties.</p>

                  <h4>10. Service Modifications</h4>
                  <p>XTASS may modify, update, or discontinue certain features or services at any time to improve performance, security, or customer experience. Notice will be provided in cases of major updates that affect how the service operates.</p>

                  <h4>11. Intellectual Property</h4>
                  <p>All content, trademarks, logos, designs, and materials on the XTASS platform are the property of XTASS. You may not copy, reproduce, or distribute any materials without written consent.</p>

                  <h4>12. Governing Law</h4>
                  <p>These Terms and Conditions are governed by the laws of the Republic of Ghana. Any disputes arising from the use of XTASS services shall be resolved under Ghanaian jurisdiction.</p>

                  <h4>13. Limitation of Use</h4>
                  <p>Users must not use XTASS for unlawful activities, transport of illegal goods, or any action that violates national laws or public safety regulations. Misuse of the platform may result in account suspension or legal action.</p>

                  <h4>14. Feedback and Complaints</h4>
                  <p>XTASS welcomes customer feedback to continually improve our services. For any complaints, lost item reports, or refund requests, please contact our customer support team through the website, app, or official email. We aim to resolve all issues fairly and promptly.</p>

                  <h4>15. Changes to Terms</h4>
                  <p>XTASS reserves the right to update these Terms & Conditions at any time. Revised terms will take effect upon publication on our website or app. Continued use of our services after updates implies your acceptance of the new terms.</p>

                  <h4>16. Contact Information</h4>
                  <p>XTASS Customer Support<br/>
                  📧 Email: <a href="mailto:support@xtass.com">support@xtass.com</a><br/>
                  📞 Phone: +233 XXX XXX XXX<br/>
                  🌐 Website: <a href="https://www.xtass.com" target="_blank" rel="noopener noreferrer">www.xtass.com</a></p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'privacy' && (
        <main>
          {/* Hero for Privacy Policy page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Privacy Policy</h1>
              <p className="mt-4 text-lg text-white/90">Your privacy is important to us.</p>
            </div>
          </div>
          
          {/* Privacy Policy Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h4>1. Introduction</h4>
                  <p>XTASS respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our website, mobile app, or any XTASS transportation services. By using XTASS, you agree to the terms of this Privacy Policy. If you do not agree, please discontinue use of our services.</p>

                  <h4>2. Information We Collect</h4>
                  <p>XTASS collects personal and non-personal information to provide and improve our services. The information we collect includes:</p>
                  <h5>a. Personal Information</h5>
                  <ul>
                    <li>Full name, phone number, and email address</li>
                    <li>Pickup and drop-off locations</li>
                    <li>Payment information (e.g., card details, mobile money number)</li>
                    <li>Profile picture or ID (if applicable)</li>
                    <li>Communication preferences and booking history</li>
                  </ul>
                  <h5>b. Technical and Usage Data</h5>
                  <ul>
                    <li>Device type, IP address, and browser information</li>
                    <li>App usage statistics and access logs</li>
                    <li>Location data (GPS) when using ride services</li>
                    <li>Cookies and similar technologies for analytics and personalization</li>
                  </ul>
                  
                  <h4>3. How We Use Your Information</h4>
                  <p>XTASS uses your data to deliver safe, efficient, and personalized services. Specifically, we use your information to:</p>
                  <ul>
                    <li>Process ride bookings, payments, and confirmations</li>
                    <li>Connect you with drivers and provide navigation assistance</li>
                    <li>Communicate trip updates, notifications, and customer support responses</li>
                    <li>Improve our platform’s features, performance, and user experience</li>
                    <li>Ensure safety and compliance through background checks and fraud prevention</li>
                    <li>Send promotional offers, service updates, and newsletters (only with your consent)</li>
                  </ul>

                  <h4>4. Location Data</h4>
                  <p>XTASS relies on location information to operate effectively.</p>
                  <ul>
                    <li>Your real-time GPS location helps assign the nearest driver and estimate arrival times.</li>
                    <li>Drivers’ locations are tracked during trips to ensure safety and trip accuracy.</li>
                  </ul>
                  <p>You can disable location access in your device settings, but doing so may limit the functionality of the XTASS app.</p>
                  
                  <h4>5. Payment Information</h4>
                  <p>XTASS processes all payments through secure, encrypted channels. We do not store full card or mobile money details on our servers. Payment processing is handled by trusted third-party providers who comply with international data security standards (PCI-DSS).</p>

                  <h4>6. Data Sharing and Disclosure</h4>
                  <p>XTASS does not sell or rent your personal data. However, we may share necessary information in the following cases:</p>
                  <ul>
                      <li><strong>With Drivers:</strong> To complete your trip (e.g., pickup location, name, contact).</li>
                      <li><strong>With Payment Providers:</strong> For secure payment processing.</li>
                      <li><strong>With Law Enforcement:</strong> If required by law, regulation, or court order.</li>
                      <li><strong>With Service Partners:</strong> For analytics, app improvement, and customer support under strict confidentiality agreements.</li>
                  </ul>
                  <p>All third parties handling your data are required to maintain the same level of security and privacy as XTASS.</p>

                  <h4>7. Data Retention</h4>
                  <p>We retain your information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, or resolve disputes. After this period, data is securely deleted or anonymized.</p>

                  <h4>8. Data Security</h4>
                  <p>XTASS employs advanced security measures to protect your data against unauthorized access, loss, or misuse. This includes:</p>
                  <ul>
                    <li>Secure servers and encryption protocols (SSL/TLS)</li>
                    <li>Access control and regular security audits</li>
                    <li>Continuous monitoring for suspicious activities</li>
                  </ul>
                  <p>However, no system is 100% secure, and XTASS cannot guarantee absolute security. Users are advised to safeguard their login details and report any suspicious activity immediately.</p>
                  
                  <h4>9. Your Rights</h4>
                  <p>As a user, you have the right to:</p>
                  <ul>
                    <li>Access and review your personal information</li>
                    <li>Request correction of inaccurate or outdated data</li>
                    <li>Withdraw consent for data processing</li>
                    <li>Request deletion of your account and personal data</li>
                    <li>Opt out of marketing communications at any time</li>
                  </ul>
                  <p>To exercise these rights, contact XTASS through the details provided below.</p>

                  <h4>10. Cookies and Tracking Technologies</h4>
                  <p>XTASS uses cookies and tracking tools to enhance user experience, analyze site traffic, and personalize content. You can manage or disable cookies through your browser settings, but some site features may not function properly without them.</p>

                  <h4>11. Children’s Privacy</h4>
                  <p>XTASS services are not directed at individuals under the age of 18. We do not knowingly collect personal data from minors. If a child’s information is discovered, it will be deleted promptly.</p>

                  <h4>12. International Data Transfers</h4>
                  <p>If XTASS expands outside Ghana, your information may be processed in other countries where data protection laws differ. In such cases, XTASS ensures all transfers are secured and compliant with applicable regulations.</p>

                  <h4>13. Policy Updates</h4>
                  <p>XTASS may update this Privacy Policy periodically to reflect legal, operational, or service changes. Any updates will be posted on our website and mobile app. The “Last Updated” date will indicate when the latest version took effect. Continued use of our services after any update means you accept the revised terms.</p>

                  <h4>14. Contact Us</h4>
                  <p>If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:</p>
                  <p><strong>XTASS Privacy Office</strong><br/>
                  📧 Email: <a href="mailto:privacy@xtass.com">privacy@xtass.com</a><br/>
                  📞 Phone: +233 XXX XXX XXX<br/>
                  🌐 Website: <a href="https://www.xtass.com" target="_blank" rel="noopener noreferrer">www.xtass.com</a></p>

                  <h4>15. Effective Date</h4>
                  <p>This Privacy Policy is effective as of October 27, 2023 and applies to all users of XTASS services in Ghana and future regions of operation.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'cookie' && (
        <main>
          {/* Hero for Cookie Policy page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Cookie Policy</h1>
              <p className="mt-4 text-lg text-white/90">How we use cookies to improve your experience.</p>
            </div>
          </div>
          
          {/* Cookie Policy Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h4>1. Introduction</h4>
                  <p>This Cookie Policy explains how XTASS (“we,” “our,” or “us”) uses cookies and similar tracking technologies on our website, mobile application, and digital platforms. It outlines what cookies are, how we use them, and how you can manage your preferences. By continuing to browse or use XTASS services, you agree to our use of cookies as described in this policy.</p>

                  <h4>2. What Are Cookies?</h4>
                  <p>Cookies are small text files that are stored on your computer, smartphone, or other device when you visit a website or use an app. They help websites function properly, improve performance, and remember your preferences. Some cookies are temporary (session cookies) and are deleted when you close your browser, while others are stored for longer periods (persistent cookies).</p>
                  
                  <h4>3. How XTASS Uses Cookies</h4>
                  <p>XTASS uses cookies to provide a smooth, secure, and personalized experience. The main purposes include:</p>
                  <h5>a. Essential Cookies</h5>
                  <p>These are necessary for the website or app to function correctly. They enable basic features such as secure login, ride booking, and payment processing. Without these cookies, certain parts of the XTASS platform may not work properly.</p>
                  <h5>b. Performance and Analytics Cookies</h5>
                  <p>These cookies help us understand how users interact with our platform by collecting data such as pages visited, time spent, and actions taken. This allows us to improve performance, optimize loading speed, and enhance usability.</p>
                  <h5>c. Functional Cookies</h5>
                  <p>These cookies allow XTASS to remember your preferences, such as saved locations, selected language, ride type, or login details, so you don’t have to re-enter them each time you visit.</p>
                  <h5>d. Advertising and Marketing Cookies</h5>
                  <p>XTASS may use these cookies to deliver relevant advertisements or promotional offers based on your browsing activity. They also help us measure the effectiveness of our marketing campaigns.</p>
                  <h5>e. Security Cookies</h5>
                  <p>These cookies help detect fraud, protect your account, and ensure your data is used safely.</p>

                  <h4>4. Third-Party Cookies</h4>
                  <p>Some cookies on XTASS may come from trusted third-party services we use for analytics, advertising, or functionality enhancement — for example, Google Analytics, Meta (Facebook) Pixel, or payment gateways. These third parties may collect information about your online behavior to improve their own services. XTASS does not control these cookies and recommends reviewing their respective privacy and cookie policies for more details.</p>

                  <h4>5. Managing Cookies</h4>
                  <p>You have full control over how cookies are used on your device. You can:</p>
                  <ul>
                    <li>Accept or reject cookies through the cookie consent banner displayed on the XTASS website or app.</li>
                    <li>Adjust your browser or mobile settings to block, restrict, or delete cookies.</li>
                    <li>Clear your browser’s cookie cache at any time.</li>
                  </ul>
                  <p>Please note that disabling certain cookies may affect the functionality of XTASS services, such as preventing secure logins or saving your ride preferences.</p>

                  <h4>6. Your Consent</h4>
                  <p>When you first visit the XTASS website or use the app, you will see a cookie consent banner allowing you to accept or customize cookie settings. By clicking “Accept All” or continuing to use our services, you consent to our use of cookies in accordance with this policy.</p>

                  <h4>7. Updates to This Cookie Policy</h4>
                  <p>XTASS may update this Cookie Policy periodically to reflect changes in technology, applicable laws, or our operational practices. Updated versions will be posted on our website with a revised “Last Updated” date. We encourage users to review this policy regularly to stay informed.</p>
                  
                  <h4>8. Contact Us</h4>
                  <p>If you have questions or concerns about our use of cookies or this policy, please contact us at:</p>
                  <p><strong>XTASS Privacy Office</strong><br/>
                  Email: <a href="mailto:privacy@xtass.com">privacy@xtass.com</a><br/>
                  Phone: +233 XXX XXX XXX<br/>
                  Website: <a href="https://www.xtass.com" target="_blank" rel="noopener noreferrer">www.xtass.com</a></p>

                  <h4>9. Effective Date</h4>
                  <p>This Cookie Policy is effective as of October 27, 2023 and applies to all visitors and users of XTASS online services.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'refund' && (
        <main>
          {/* Hero for Refund & Cancellation Policy page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Refund & Cancellation Policy</h1>
              <p className="mt-4 text-lg text-white/90">Details on how we handle refunds and cancellations.</p>
            </div>
          </div>
          
          {/* Refund Policy Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h4>1. Introduction</h4>
                  <p>This Refund and Cancellation Policy explains how XTASS (“we,” “our,” or “us”) handles ride cancellations, refunds, and booking modifications. By booking a ride with XTASS through our website, mobile app, or digital channels, you agree to the terms outlined in this policy.</p>

                  <h4>2. Ride Cancellation by Customers</h4>
                  <h5>a. Instant Rides:</h5>
                  <p>Once an instant ride is confirmed and a driver has been assigned, cancellation by the customer may incur a cancellation fee. The fee depends on how long after booking the cancellation is made.</p>
                  <h5>b. Scheduled Rides:</h5>
                  <p>Customers may cancel a scheduled ride up to 30 minutes before the pickup time without penalty. Cancellations made within 30 minutes of the pickup time may result in a partial charge or forfeiture of the booking amount.</p>
                  <h5>c. Rental Rides:</h5>
                  <p>For hourly or daily rental rides, customers must cancel at least 2 hours before the scheduled start time to receive a full refund. Late cancellations may attract a 20%–50% cancellation fee depending on the time of cancellation.</p>

                  <h4>3. Refund Eligibility</h4>
                  <p>Refunds are issued under the following conditions:</p>
                  <ul>
                    <li>The ride was canceled by XTASS or the assigned driver due to operational issues.</li>
                    <li>The customer canceled within the free cancellation window.</li>
                    <li>Duplicate bookings were made due to a technical error.</li>
                    <li>Payment was made, but no driver was assigned or service not delivered.</li>
                  </ul>
                  <p>Refunds will not be issued for:</p>
                  <ul>
                    <li>Late cancellations outside the allowed window.</li>
                    <li>No-shows or when the driver arrives but the customer fails to appear.</li>
                    <li>Service dissatisfaction caused by factors outside XTASS’s control (e.g., traffic delays, weather).</li>
                  </ul>

                  <h4>4. Refund Process</h4>
                  <p>Refund requests should be submitted through the XTASS mobile app, website contact form, or customer service email (support@xtass.com). Approved refunds will be processed to the original payment method within 5–10 business days, depending on your bank or payment provider. XTASS will notify you by email once your refund has been processed.</p>

                  <h4>5. Cancellations by XTASS or Drivers</h4>
                  <p>In rare circumstances (vehicle breakdown, safety issues, or driver unavailability), XTASS or the driver may cancel your ride. If this occurs, customers are entitled to:</p>
                  <ul>
                    <li>A full refund of the fare amount, or</li>
                    <li>A free reschedule of the ride at the earliest available time.</li>
                  </ul>
                  <p>XTASS is not liable for any indirect losses (such as missed flights or appointments) resulting from such cancellations.</p>

                  <h4>6. Modifying a Booking</h4>
                  <p>Customers can modify pickup time or drop-off location before a driver is assigned, depending on availability. If a modification increases trip distance or duration, fare adjustments will apply. Once a driver is on the way, modification may be treated as a cancellation and rebooking.</p>

                  <h4>7. Payment Disputes</h4>
                  <p>If you notice an incorrect charge or have a concern about a transaction, please contact our billing support at billing@xtass.com within 7 days of the ride completion. XTASS will investigate and, if applicable, issue a correction or refund.</p>
                  
                  <h4>8. Non-Refundable Items</h4>
                  <p>Certain fees are non-refundable, including:</p>
                  <ul>
                    <li>Service fees and transaction charges.</li>
                    <li>Late cancellation or no-show penalties.</li>
                    <li>Promotional or discounted rides unless canceled by XTASS.</li>
                  </ul>

                  <h4>9. Contact Us</h4>
                  <p>For all refund or cancellation-related inquiries, please contact:</p>
                  <p><strong>XTASS Customer Care</strong><br/>
                  Email: <a href="mailto:support@xtass.com">support@xtass.com</a><br/>
                  Phone: +233 XXX XXX XXX<br/>
                  Website: <a href="https://www.xtass.com" target="_blank" rel="noopener noreferrer">www.xtass.com</a></p>

                  <h4>10. Updates to This Policy</h4>
                  <p>XTASS may update this Refund and Cancellation Policy from time to time to reflect changes in service terms, legal requirements, or operational processes. Updated versions will be posted on our website with a revised “Last Updated” date.</p>

                  <h4>11. Effective Date</h4>
                  <p>This Refund & Cancellation Policy is effective as of October 27, 2023 and applies to all XTASS customers and services.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'community' && (
        <main>
          {/* Hero for Community Guidelines page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Community Guidelines</h1>
              <p className="mt-4 text-lg text-white/90">Our commitment to a safe and respectful community.</p>
            </div>
          </div>
          
          {/* Community Guidelines Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h4>1. Introduction</h4>
                  <p>At XTASS, our mission is to provide safe, respectful, and reliable transportation experiences for everyone. These Community Guidelines outline the standards of behavior expected from all customers, drivers, and partners using the XTASS platform. By using XTASS services, you agree to follow these guidelines and promote a safe, professional, and welcoming community.</p>

                  <h4>2. Respect and Courtesy</h4>
                  <p>XTASS values respect and courtesy at all times. All users — passengers, drivers, and support staff — must treat one another with professionalism and kindness.</p>
                  <ul>
                    <li>Be polite and use respectful language.</li>
                    <li>Avoid insults, discrimination, or offensive gestures.</li>
                    <li>Treat vehicles, property, and people with care.</li>
                    <li>Maintain calm communication, even in case of delays or misunderstandings.</li>
                  </ul>
                  <p>Disrespectful, threatening, or abusive behavior may result in temporary or permanent suspension of your account.</p>

                  <h4>3. Safety Comes First</h4>
                  <p>Safety is the foundation of every XTASS trip. To protect both drivers and riders:</p>
                  <ul>
                    <li>Always wear your seatbelt.</li>
                    <li>Follow all local traffic laws and safety regulations.</li>
                    <li>Do not ask or pressure the driver to speed, break rules, or take unsafe shortcuts.</li>
                    <li>Passengers should not distract the driver or interfere with driving.</li>
                    <li>Drivers must ensure their vehicle is roadworthy, clean, and properly maintained.</li>
                    <li>No weapons, drugs, or illegal items are permitted in the vehicle.</li>
                  </ul>
                  <p>If you ever feel unsafe, contact XTASS support immediately or use the emergency contact feature in the app.</p>

                  <h4>4. Honesty and Fair Use</h4>
                  <p>XTASS is built on trust. Dishonest or fraudulent behavior harms the entire community. Users must not:</p>
                  <ul>
                    <li>Create fake or duplicate accounts.</li>
                    <li>Provide false information or impersonate others.</li>
                    <li>Book rides without intent to travel or repeatedly cancel trips.</li>
                    <li>Manipulate pricing, ratings, or referral systems.</li>
                    <li>Request payment outside the XTASS platform.</li>
                  </ul>
                  <p>Fraudulent or deceptive activities may result in account deactivation and possible legal action.</p>

                  <h4>5. Cleanliness and Care</h4>
                  <p>All XTASS users should help maintain a clean and pleasant environment.</p>
                  <ul>
                    <li><strong>Drivers:</strong> Keep your vehicle tidy, free of odors, and in good condition.</li>
                    <li><strong>Riders:</strong> Avoid littering, eating messy foods, or causing damage to the vehicle.</li>
                  </ul>
                  <p>Both parties should leave the vehicle as they found it. If damage occurs, the responsible party may be charged a cleaning or repair fee.</p>

                  <h4>6. Ratings and Feedback</h4>
                  <p>XTASS uses a rating system to ensure quality service and accountability. When rating a trip:</p>
                  <ul>
                    <li>Be fair and objective — rate based on the overall experience, not unrelated issues.</li>
                    <li>Use feedback constructively to help improve service quality.</li>
                    <li>Repeated false or malicious reviews will be investigated and may lead to removal.</li>
                  </ul>

                  <h4>7. Zero Tolerance Policy</h4>
                  <p>XTASS has zero tolerance for:</p>
                  <ul>
                    <li>Harassment or discrimination based on race, religion, gender, or background.</li>
                    <li>Physical or verbal abuse.</li>
                    <li>Use of alcohol or drugs while driving.</li>
                    <li>Unsafe, reckless, or illegal driving behavior.</li>
                    <li>Soliciting inappropriate or personal favors.</li>
                  </ul>
                  <p>Any user found violating these standards will face immediate suspension or permanent removal from the platform.</p>

                  <h4>8. Lost and Found</h4>
                  <p>If you leave an item in a vehicle, contact the driver through the XTASS app or our support team. XTASS will make reasonable efforts to help recover lost items, though we cannot guarantee retrieval.</p>

                  <h4>9. Reporting and Enforcement</h4>
                  <p>If you experience misconduct or unsafe behavior, report it through the XTASS app or contact support@xtass.com. All reports are treated seriously and investigated confidentially. XTASS reserves the right to take action, including warnings, suspensions, or permanent bans.</p>

                  <h4>10. Updates to These Guidelines</h4>
                  <p>XTASS may update these Community Guidelines periodically to reflect policy changes or local regulations. Updated versions will be published on our website with a revised “Last Updated” date. We encourage users to review these guidelines regularly.</p>

                  <h4>11. Contact Us</h4>
                  <p>For questions, reports, or feedback related to these guidelines, please contact:</p>
                  <p><strong>XTASS Support Team</strong><br/>
                  Email: <a href="mailto:support@xtass.com">support@xtass.com</a><br/>
                  Phone: +233 XXX XXX XXX<br/>
                  Website: <a href="https://www.xtass.com" target="_blank" rel="noopener noreferrer">www.xtass.com</a></p>
                  
                  <h4>12. Effective Date</h4>
                  <p>These Community Guidelines are effective as of October 27, 2023 and apply to all XTASS users and service partners.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'data-protection' && (
        <main>
          {/* Hero for Data Protection Policy page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Data Protection Policy</h1>
              <p className="mt-4 text-lg text-white/90">Our commitment to safeguarding your data.</p>
            </div>
          </div>
          
          {/* Data Protection Policy Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h4>1. Introduction</h4>
                  <p>XTASS is committed to protecting your personal data and ensuring that your privacy is respected at all times. This Data Protection Policy outlines how XTASS (“we,” “our,” or “us”) collects, processes, stores, and secures the personal information of customers, drivers, employees, and partners in compliance with applicable data protection laws, including the Ghana Data Protection Act, 2012 (Act 843) and other relevant international standards.</p>
                  <p>By using XTASS services — whether through our website, mobile app, or customer channels — you consent to the data practices described in this policy.</p>

                  <h4>2. Purpose of Data Collection</h4>
                  <p>We collect and process personal data to:</p>
                  <ul>
                    <li>Deliver safe, efficient, and personalized transportation services.</li>
                    <li>Verify identities and ensure account security.</li>
                    <li>Enable ride bookings, payments, and communication between users.</li>
                    <li>Improve our platform functionality and customer experience.</li>
                    <li>Comply with legal obligations, law enforcement, or regulatory requirements.</li>
                    <li>Support analytics, research, and service optimization.</li>
                  </ul>

                  <h4>3. Types of Data We Collect</h4>
                  <p>XTASS may collect the following categories of information:</p>
                  <h5>a. Personal Identification Data</h5>
                  <ul>
                    <li>Name, phone number, email, and address.</li>
                    <li>Government-issued ID (e.g., driver’s license, national ID, or passport).</li>
                  </ul>
                  <h5>b. Account and Transaction Data</h5>
                  <ul>
                    <li>Payment details (processed securely via third-party gateways).</li>
                    <li>Trip history, ride preferences, and service feedback.</li>
                  </ul>
                  <h5>c. Device and Usage Data</h5>
                  <ul>
                    <li>IP address, device information, operating system, and app activity.</li>
                    <li>Location data (for pickup, drop-off, and navigation).</li>
                  </ul>
                  <h5>d. Communications Data</h5>
                  <ul>
                    <li>Messages or calls made through XTASS’s in-app chat or support system.</li>
                    <li>Customer service inquiries and feedback forms.</li>
                  </ul>

                  <h4>4. Legal Basis for Processing Data</h4>
                  <p>XTASS processes personal data under the following legal grounds:</p>
                  <ul>
                    <li><strong>Consent</strong> — when you voluntarily provide information or agree to data use.</li>
                    <li><strong>Contractual necessity</strong> — when processing is required to deliver XTASS services.</li>
                    <li><strong>Legal obligation</strong> — when required by law or government regulation.</li>
                    <li><strong>Legitimate interest</strong> — for business operations, analytics, and fraud prevention.</li>
                  </ul>

                  <h4>5. Data Sharing and Disclosure</h4>
                  <p>XTASS will never sell your personal data. However, we may share information only when necessary and secure:</p>
                  <ul>
                    <li>With drivers and riders for service delivery.</li>
                    <li>With payment processors to facilitate secure transactions.</li>
                    <li>With law enforcement or regulators when required by law.</li>
                    <li>With third-party service providers (e.g., cloud hosting, analytics) under strict confidentiality agreements.</li>
                  </ul>
                  <p>All partners and vendors must comply with XTASS’s data protection standards.</p>

                  <h4>6. Data Storage and Security</h4>
                  <p>XTASS implements industry-standard security measures to safeguard data from unauthorized access, loss, or misuse. These include:</p>
                  <ul>
                    <li>Encrypted storage and secure servers.</li>
                    <li>Access controls and authentication systems.</li>
                    <li>Regular audits, vulnerability testing, and employee training.</li>
                    <li>Limited data access based on user roles and business necessity.</li>
                  </ul>
                  <p>If a data breach occurs, XTASS will notify affected users and relevant authorities in accordance with applicable law.</p>

                  <h4>7. Data Retention</h4>
                  <p>XTASS retains personal data only for as long as necessary to fulfill service purposes or comply with legal obligations. When data is no longer required, it is securely deleted or anonymized.</p>
                  <p>Retention periods may vary depending on:</p>
                  <ul>
                    <li>Legal and financial record-keeping requirements.</li>
                    <li>Dispute resolution or fraud prevention needs.</li>
                    <li>Operational and contractual obligations.</li>
                  </ul>
                  
                  <h4>8. Your Rights</h4>
                  <p>As an XTASS user, you have the right to:</p>
                  <ul>
                    <li>Access your personal data.</li>
                    <li>Request correction of inaccurate or incomplete data.</li>
                    <li>Withdraw consent for data processing (where applicable).</li>
                    <li>Request deletion of your data when no longer necessary.</li>
                    <li>Restrict or object to certain processing activities.</li>
                    <li>Receive a copy of your data in a portable format.</li>
                  </ul>
                  <p>To exercise these rights, contact the XTASS Privacy Office at privacy@xtass.com.</p>
                  
                  <h4>9. International Data Transfers</h4>
                  <p>If XTASS transfers data outside Ghana, it ensures the receiving country or service provider maintains adequate data protection standards consistent with Ghana’s Data Protection Act and international privacy principles.</p>

                  <h4>10. Children’s Data</h4>
                  <p>XTASS does not knowingly collect personal data from individuals under 18 years old. If such data is discovered, it will be promptly deleted unless parental consent is verified.</p>
                  
                  <h4>11. Updates to This Policy</h4>
                  <p>XTASS may update this Data Protection Policy periodically to reflect changes in our technology, business operations, or legal requirements. All updates will be posted on our website with a revised “Last Updated” date. We encourage users to review this policy regularly to stay informed.</p>
                  
                  <h4>12. Contact Us</h4>
                  <p>For inquiries, requests, or complaints related to data protection, please contact:</p>
                  <p><strong>XTASS Privacy Office</strong><br/>
                  Email: <a href="mailto:privacy@xtass.com">privacy@xtass.com</a><br/>
                  Phone: +233 XXX XXX XXX<br/>
                  Website: <a href="https://www.xtass.com" target="_blank" rel="noopener noreferrer">www.xtass.com</a></p>

                  <h4>13. Effective Date</h4>
                  <p>This Data Protection Policy is effective as of October 27, 2023 and applies to all XTASS platforms, users, and partners.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'compliance' && (
        <main>
          {/* Hero for Compliance & Safety page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Compliance & Safety Policy</h1>
              <p className="mt-4 text-lg text-white/90">Our commitment to ensuring safety, trust, and compliance.</p>
            </div>
          </div>
          
          {/* Compliance & Safety Policy Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h4>1. Introduction</h4>
                  <p>This Compliance & Safety Policy explains XTASS’s commitment to ensuring safety, trust, and compliance across all operations. It defines the standards, processes, and responsibilities that guide our transport and shuttle services in full accordance with Ghanaian laws and international best practices.</p>
                  <p>XTASS prioritizes passenger and driver safety, data protection, and ethical conduct in every ride and interaction.</p>

                  <h4>2. Legal and Regulatory Compliance</h4>
                  <p>XTASS fully complies with applicable Ghanaian laws, including:</p>
                  <ul>
                      <li>Road Traffic Act, 2004 (Act 683)</li>
                      <li>Road Traffic Regulations, 2012 (L.I. 2180)</li>
                      <li>Data Protection Act, 2012 (Act 843)</li>
                      <li>Consumer and Public Safety Regulations</li>
                  </ul>
                  <p>All operations — from vehicle licensing to payment processing — are performed within legal and regulatory frameworks.</p>

                  <h4>3. Driver Compliance and Verification</h4>
                  <p>XTASS drivers must pass through strict onboarding and verification before activation. This includes:</p>
                  <ul>
                      <li>Valid driver’s license and ID verification</li>
                      <li>Vehicle inspection and insurance confirmation</li>
                      <li>Background and criminal record checks</li>
                      <li>Mandatory customer service and safety training</li>
                  </ul>
                  <p>Non-compliant drivers are suspended until review or removal.</p>

                  <h4>4. Vehicle Standards and Maintenance</h4>
                  <p>All vehicles on XTASS must:</p>
                  <ul>
                      <li>Pass roadworthiness and safety inspections</li>
                      <li>Be clean, insured, and fitted with functioning seatbelts</li>
                      <li>Have first-aid kits and emergency tools</li>
                      <li>Be regularly maintained and inspected</li>
                  </ul>
                  <p>Non-compliant vehicles are deactivated until issues are resolved.</p>

                  <h4>5. Passenger Safety</h4>
                  <p>Passenger safety is ensured through:</p>
                  <ul>
                      <li>GPS tracking of all rides</li>
                      <li>Verified driver identity and trip information</li>
                      <li>In-app emergency contact button</li>
                      <li>24/7 support for incident reporting</li>
                      <li>Full trip record and monitoring</li>
                  </ul>
                  <p>Passengers are advised to verify driver details before boarding.</p>

                  <h4>6. Data and Privacy Safety</h4>
                  <p>XTASS protects user data according to its Data Protection Policy. We apply encryption, access controls, and monitoring systems to prevent unauthorized data access, leaks, or misuse.</p>

                  <h4>7. Health and Hygiene Standards</h4>
                  <p>XTASS maintains hygiene standards for all vehicles and drivers:</p>
                  <ul>
                      <li>Clean vehicles and interiors</li>
                      <li>Respect for passenger comfort</li>
                      <li>Adherence to public health measures during outbreaks</li>
                  </ul>
                  <p>Passengers are expected to maintain mutual respect and cleanliness during rides.</p>

                  <h4>8. Emergency Response and Incident Management</h4>
                  <p>In any accident or emergency:</p>
                  <ul>
                      <li>Drivers must contact the XTASS Emergency Line or the nearest authority.</li>
                      <li>The XTASS Response Team assists with coordination and medical or legal support.</li>
                      <li>Incidents are logged, reviewed, and followed up for resolution and safety improvement.</li>
                  </ul>

                  <h4>9. Anti-Fraud and Misconduct</h4>
                  <p>XTASS enforces zero tolerance for fraud or misconduct, including:</p>
                  <ul>
                      <li>Fake profiles, trip manipulation, or unauthorized payments</li>
                      <li>Harassment, discrimination, or unsafe conduct</li>
                  </ul>
                  <p>Violations result in suspension or permanent removal, with possible legal action.</p>

                  <h4>10. Continuous Training and Monitoring</h4>
                  <p>Drivers and XTASS staff undergo continuous training on:</p>
                  <ul>
                      <li>Road and passenger safety</li>
                      <li>Data security</li>
                      <li>Emergency handling</li>
                      <li>Service quality</li>
                  </ul>
                  <p>Monitoring tools identify unsafe driving patterns for proactive intervention.</p>
                  
                  <h4>11. Reporting Safety Concerns</h4>
                  <p>Reports can be submitted to:</p>
                  <p><strong>XTASS Safety & Compliance Desk</strong><br/>
                  📧 Email: <a href="mailto:safety@xtass.com">safety@xtass.com</a><br/>
                  📞 Phone: +233 XXX XXX XXX<br/>
                  🌐 Website: <a href="#" onClick={(e) => e.preventDefault()}>www.xtass.com/safety</a></p>

                  <h4>12. Policy Updates</h4>
                  <p>XTASS may update this policy to reflect new laws, technologies, or internal standards. Updated versions will be published with a revised “Last Updated” date.</p>
                  
                  <h4>13. Effective Date</h4>
                  <p>This policy is effective as of October 27, 2023 and applies to all XTASS users, drivers, and employees.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'licensing' && (
        <main>
          {/* Hero for Licensing Information page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Licensing Information</h1>
              <p className="mt-4 text-lg text-white/90">Details about our operational authorizations and compliance.</p>
            </div>
          </div>
          
          {/* Licensing Information Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h2 className="text-3xl font-display font-bold text-gray-800 text-center">XTASS — Licensing Information</h2>

                  <h4>1. Introduction</h4>
                  <p>This Licensing Information page provides details about XTASS’s official authorization, certifications, and operational compliance under Ghanaian transport and technology regulations. XTASS operates with full legal recognition and licensing to provide airport and city shuttle services, ride bookings, and vehicle rentals across Ghana.</p>

                  <h4>2. Company Registration</h4>
                  <p>XTASS is a registered transport and technology service provider under the laws of the Republic of Ghana.</p>
                  <p><strong>Registered Company Name:</strong> XTASS</p>
                  <p><strong>Registration Type:</strong> Private Limited Liability Company</p>
                  <p><strong>Registrar of Companies:</strong> Registrar General’s Department, Accra, Ghana</p>
                  <p><strong>Company Registration Number:</strong> [Insert Number]</p>
                  <p><strong>Date of Incorporation:</strong> [Insert Date]</p>
                  <p><strong>Registered Office Address:</strong> [Insert Office Address]</p>

                  <h4>3. Business and Operational Licenses</h4>
                  <p>XTASS operates under the following licenses and permits:</p>
                  <ul>
                    <li>a. Transport Operations License — issued by the Driver and Vehicle Licensing Authority (DVLA).</li>
                    <li>b. Digital Platform Service Permit — issued under the Communications Service Regulatory Framework.</li>
                    <li>c. Airport Transport Authorization — in compliance with Ghana Civil Aviation Authority (GCAA) and Airport Operations Guidelines.</li>
                    <li>d. Business Operating Permit — issued by the Accra Metropolitan Assembly (AMA).</li>
                  </ul>
                  <p>All licenses are renewed periodically to maintain compliance with national and municipal standards.</p>

                  <h4>4. Driver Licensing and Verification</h4>
                  <p>Every XTASS driver must hold:</p>
                  <ul>
                    <li>A valid Ghanaian driver’s license for commercial passenger vehicles.</li>
                    <li>Proof of identity (National ID, Passport, or Voter’s ID).</li>
                    <li>Completed XTASS onboarding and verification checks.</li>
                  </ul>
                  <p>Driver profiles are reviewed regularly to ensure license validity and adherence to safety and compliance policies.</p>

                  <h4>5. Vehicle Licensing and Roadworthiness</h4>
                  <p>All vehicles used on the XTASS platform are:</p>
                  <ul>
                    <li>Registered and licensed by the DVLA.</li>
                    <li>Covered by comprehensive insurance policies.</li>
                    <li>Periodically inspected to ensure roadworthiness and safety compliance.</li>
                    <li>Maintained in line with Ghana’s Road Traffic Regulations (L.I. 2180).</li>
                  </ul>
                  <p>Vehicles that fail inspections or license renewal are deactivated from the XTASS platform until compliance is restored.</p>

                  <h4>6. Technology and Data Licensing</h4>
                  <p>XTASS digital systems and software are operated under:</p>
                  <ul>
                    <li>Valid software licenses and data protection compliance agreements.</li>
                    <li>Ghana’s Data Protection Act, 2012 (Act 843).</li>
                    <li>Applicable intellectual property laws ensuring the protection of proprietary software and databases.</li>
                  </ul>
                  <p>XTASS does not use unlicensed software or technology in its operations.</p>

                  <h4>7. Partnership and Affiliate Licensing</h4>
                  <p>XTASS partners with third-party service providers and affiliates who are:</p>
                  <ul>
                    <li>Legally registered and authorized under Ghanaian law.</li>
                    <li>Compliant with XTASS’s internal safety, data protection, and service standards.</li>
                    <li>Verified through formal agreements outlining licensing and regulatory adherence.</li>
                  </ul>

                  <h4>8. License Verification and Contact</h4>
                  <p>For verification or inquiries about XTASS licensing, please contact:</p>
                  <p><strong>XTASS Legal & Compliance Department</strong><br/>
                  📧 Email: <a href="mailto:compliance@xtass.com">compliance@xtass.com</a><br/>
                  📞 Phone: +233 XXX XXX XXX<br/>
                  🌐 Website: <a href="#" onClick={(e) => {e.preventDefault(); setView('compliance')}}>www.xtass.com/compliance</a><br/>
                  📍 Address: [Insert Registered Office Address]</p>
                  <p>Requests for documentation or verification will be processed within 7 working days of submission.</p>

                  <h4>9. Updates to Licensing Information</h4>
                  <p>XTASS reviews and updates this Licensing Information page whenever regulatory or operational changes occur. Updated versions will reflect the new “Last Updated” date at the bottom of this page.</p>

                  <h4>10. Effective Date</h4>
                  <p>This Licensing Information page is effective as of [Insert Date] and applies to all XTASS users, drivers, and partners.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'insurance' && (
        <main>
          {/* Hero for Insurance Coverage page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Insurance Coverage</h1>
              <p className="mt-4 text-lg text-white/90">Our commitment to the safety and security of every passenger and driver.</p>
            </div>
          </div>
          
          {/* Insurance Coverage Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h2 className="text-3xl font-display font-bold text-gray-800 text-center">XTASS — Insurance Coverage</h2>
                  
                  <h4>1. Introduction</h4>
                  <p>XTASS prioritizes the safety, security, and peace of mind of every passenger and driver. This Insurance Coverage Policy outlines the protection measures in place for rides, vehicles, and individuals who use XTASS services. It explains the types of insurance coverage provided, how claims are handled, and the responsibilities of both XTASS and its users.</p>

                  <h4>2. Purpose of Insurance</h4>
                  <p>Our insurance policy ensures that passengers, drivers, and vehicles are protected against accidents, injuries, and damages that may occur during XTASS rides, whether Instant, Scheduled, or Car Rental. It is part of XTASS’s commitment to operating a safe, trustworthy, and transparent transport service in Ghana and beyond.</p>

                  <h4>3. Scope of Coverage</h4>
                  <p>XTASS’s insurance covers three key areas:</p>
                  <h5>a. Passenger Insurance</h5>
                  <p>All passengers riding with XTASS are covered for:</p>
                  <ul>
                    <li>Accidental injury or loss of life during an XTASS trip.</li>
                    <li>Medical expenses resulting from a verified road incident.</li>
                    <li>Personal property loss due to verified vehicle-related incidents.</li>
                  </ul>
                  <h5>b. Driver Insurance</h5>
                  <p>All XTASS-approved drivers are protected by:</p>
                  <ul>
                    <li>Personal accident insurance during active trips.</li>
                    <li>Third-party liability coverage for injury or damage caused while on duty.</li>
                    <li>Loss of income coverage (where applicable) for extended recovery periods after verified accidents.</li>
                  </ul>
                  <h5>c. Vehicle Insurance</h5>
                  <p>All vehicles operating under XTASS are required to maintain:</p>
                  <ul>
                    <li>Comprehensive insurance that includes theft, fire, and damage.</li>
                    <li>Third-party liability insurance as mandated by the National Insurance Commission (NIC) of Ghana.</li>
                    <li>Coverage for passengers as part of the commercial transport requirement.</li>
                  </ul>
                  
                  <h4>4. Insurance Partners</h4>
                  <p>XTASS partners with certified and licensed insurance providers regulated by the National Insurance Commission (NIC). Our partners ensure all vehicles are adequately insured before activation on the XTASS platform. Only vehicles with valid insurance certificates are allowed to provide rides.</p>

                  <h4>5. Passenger Responsibilities</h4>
                  <p>To benefit from XTASS insurance coverage, passengers must:</p>
                  <ul>
                    <li>Book rides exclusively through the XTASS app or official channels.</li>
                    <li>Provide accurate personal information when booking.</li>
                    <li>Report incidents within 24 hours of occurrence using the in-app report feature or support email.</li>
                  </ul>
                  <p>Failure to comply with these requirements may affect eligibility for insurance compensation.</p>

                  <h4>6. Claim Process</h4>
                  <p>If an incident occurs during an XTASS trip:</p>
                  <ul>
                    <li>The driver and passenger should ensure immediate safety.</li>
                    <li>Contact emergency services (if needed).</li>
                    <li>Report the incident to XTASS Customer Support or via the app’s “Report an Incident” section.</li>
                    <li>XTASS will initiate a verification process and liaise with the insurance provider.</li>
                    <li>Approved claims will be processed by the insurer according to Ghana’s insurance regulations.</li>
                  </ul>
                  <p>Claims typically take 7–14 working days to process, depending on the case complexity.</p>

                  <h4>7. Exclusions and Limitations</h4>
                  <p>Insurance coverage does not apply in the following situations:</p>
                  <ul>
                    <li>Rides not booked or recorded through the XTASS app.</li>
                    <li>Incidents caused by deliberate negligence or unlawful behavior.</li>
                    <li>Losses unrelated to vehicle use (e.g., personal negligence).</li>
                    <li>Unverified or fraudulent claims.</li>
                  </ul>
                  
                  <h4>8. Proof of Insurance</h4>
                  <p>Each XTASS vehicle is required to upload and maintain a valid insurance certificate in the XTASS system. Passengers can request to view proof of insurance for their assigned vehicle via the XTASS app’s “Vehicle Info” section.</p>

                  <h4>9. Legal and Regulatory Compliance</h4>
                  <p>XTASS complies with all Ghanaian insurance regulations under the National Insurance Act, 2006 (Act 724). All insurance contracts are underwritten by insurers licensed by the National Insurance Commission (NIC).</p>

                  <h4>10. Contact Information</h4>
                  <p>For insurance-related questions or claims, please contact:</p>
                  <p><strong>XTASS Insurance & Claims Department</strong><br/>
                  📧 Email: <a href="mailto:insurance@xtass.com">insurance@xtass.com</a><br/>
                  📞 Phone: +233 XXX XXX XXX<br/>
                  🌐 Website: <a href="#" onClick={(e) => {e.preventDefault(); setView('insurance')}}>www.xtass.com/insurance</a><br/>
                  📍 Address: [Insert Office Address]</p>

                  <h4>11. Updates to This Policy</h4>
                  <p>XTASS may review and update this Insurance Coverage Policy periodically. Any changes will be reflected on this page with a revised “Last Updated” date.</p>

                  <h4>12. Effective Date</h4>
                  <p>This Insurance Coverage Policy is effective as of [Insert Date] and applies to all XTASS passengers, drivers, and vehicles.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}
      
      {view === 'report-issue' && (
        <main>
          {/* Hero for Report an Issue page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Report an Issue</h1>
              <p className="mt-4 text-lg text-white/90">Your feedback helps us improve. Let us know what happened.</p>
            </div>
          </div>
          
          {/* Report an Issue Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h2 className="text-3xl font-display font-bold text-gray-800 text-center">XTASS — Report an Issue</h2>
                  
                  <h4>1. Introduction</h4>
                  <p>At XTASS, we take customer feedback seriously. Your safety, comfort, and satisfaction are our top priorities. This page allows passengers and drivers to report any issue experienced during or after a ride so we can investigate and resolve it quickly.</p>
                  <p>You can report problems related to rides, payments, safety, drivers, vehicles, or the XTASS app.</p>
                  
                  <h4>2. Types of Issues You Can Report</h4>
                  <p>You can use this form or contact our support team for any of the following:</p>
                  <h5>a. Ride Issues</h5>
                  <ul>
                    <li>Driver didn’t arrive or cancelled unexpectedly.</li>
                    <li>Trip route changed without reason.</li>
                    <li>Vehicle didn’t match the one shown in the app.</li>
                    <li>Overcharging or incorrect fare.</li>
                  </ul>
                  <h5>b. Safety Concerns</h5>
                  <ul>
                    <li>Reckless driving or speeding.</li>
                    <li>Driver or passenger misconduct.</li>
                    <li>Suspicious activity during a trip.</li>
                    <li>Accident or emergency during a ride.</li>
                  </ul>
                  <h5>c. Payment Issues</h5>
                  <ul>
                    <li>Failed or duplicate payments.</li>
                    <li>Incorrect deductions.</li>
                    <li>Refund or cancellation problem.</li>
                    <li>Unrecognized transactions.</li>
                  </ul>
                  <h5>d. App or Booking Problems</h5>
                  <ul>
                    <li>App not loading or crashing.</li>
                    <li>Booking errors or location inaccuracy.</li>
                    <li>Difficulty logging in or updating profile.</li>
                  </ul>
                  <h5>e. Lost and Found</h5>
                  <ul>
                    <li>Forgotten or lost items in a vehicle.</li>
                    <li>Delay in returning lost property.</li>
                  </ul>
                  
                  <h4>3. How to Report an Issue</h4>
                  <p>You can report any issue through the following channels:</p>
                  <h5>a. In-App Reporting (Preferred Method)</h5>
                  <ul>
                    <li>Open the XTASS App.</li>
                    <li>Go to Menu → Help → Report an Issue.</li>
                    <li>Choose the trip and select the issue type.</li>
                    <li>Describe the problem clearly and attach evidence (e.g., screenshot, receipt, or photo).</li>
                    <li>Submit your report.</li>
                  </ul>
                  
                  <h5>b. Online Form (Website)</h5>
                  <p>You can also fill out the issue form directly below:</p>
                  
                  <div className="not-prose mt-12 p-8 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-2xl font-bold font-display text-gray-800 mb-6 text-center">Report an Issue Form</h3>
                      <form onSubmit={handleReportSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                  <input type="text" name="fullName" id="fullName" value={reportIssueData.fullName} onChange={handleReportIssueChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                              </div>
                              <div>
                                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                  <input type="email" name="email" id="email" value={reportIssueData.email} onChange={handleReportIssueChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                              </div>
                              <div>
                                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                  <input type="tel" name="phone" id="phone" value={reportIssueData.phone} onChange={handleReportIssueChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                              </div>
                              <div>
                                  <label htmlFor="tripDate" className="block text-sm font-medium text-gray-700">Trip Date</label>
                                  <input type="date" name="tripDate" id="tripDate" value={reportIssueData.tripDate} onChange={handleReportIssueChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                              </div>
                              <div>
                                  <label htmlFor="tripType" className="block text-sm font-medium text-gray-700">Trip Type</label>
                                  <select name="tripType" id="tripType" value={reportIssueData.tripType} onChange={handleReportIssueChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required>
                                      <option value="">Select Trip Type</option>
                                      <option>Instant Ride</option>
                                      <option>Scheduled Ride</option>
                                      <option>Car Rental</option>
                                  </select>
                              </div>
                              <div>
                                  <label htmlFor="issueType" className="block text-sm font-medium text-gray-700">Issue Type</label>
                                  <select name="issueType" id="issueType" value={reportIssueData.issueType} onChange={handleReportIssueChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required>
                                      <option value="">Select Issue Type</option>
                                      <option>Ride Issue</option>
                                      <option>Payment</option>
                                      <option>Safety</option>
                                      <option>App</option>
                                      <option>Lost Item</option>
                                      <option>Other</option>
                                  </select>
                              </div>
                          </div>
                          <div>
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                              <textarea name="description" id="description" rows={5} value={reportIssueData.description} onChange={handleReportIssueChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="Please provide as much detail as possible..." required></textarea>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Attach File or Screenshot (optional)</label>
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                  <div className="space-y-1 text-center">
                                      <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                                      <div className="flex text-sm text-gray-600">
                                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                              <span>Upload a file</span>
                                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleReportFileChange} />
                                          </label>
                                          <p className="pl-1">or drag and drop</p>
                                      </div>
                                      <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                  </div>
                              </div>
                              {reportFile && <p className="mt-2 text-sm text-gray-500">Selected file: {reportFile.name}</p>}
                          </div>
                          <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-6 hover:bg-primary-hover transition-colors rounded-md shadow-sm">Send Report</button>
                      </form>
                  </div>

                  <h5>c. Contact Support (Alternative)</h5>
                  <p>If you prefer to speak with a representative, contact:<br/>
                  📧 support@xtass.com<br/>
                  📞 +233 XXX XXX XXX<br/>
                  📍 XTASS Head Office, Accra, Ghana</p>
                  <p>Support is available 24/7 for emergency or safety-related issues.</p>
                  
                  <h4>4. Response and Resolution Timeline</h4>
                  <p>After submitting your report:</p>
                  <ul>
                      <li>You’ll receive an acknowledgment email within 24 hours.</li>
                      <li>Our team will investigate and follow up within 3–5 business days.</li>
                      <li>Complex cases (like insurance or legal matters) may take longer, but you’ll be updated throughout the process.</li>
                  </ul>

                  <h4>5. Confidentiality and Data Protection</h4>
                  <p>All submitted reports are handled confidentially. Your information will only be used for resolving your issue in compliance with XTASS’s Privacy Policy and Data Protection Policy.</p>
                  
                  <h4>6. Urgent or Emergency Situations</h4>
                  <p>For emergencies (e.g., accidents, safety threats, or medical assistance):</p>
                  <ul>
                    <li>Immediately contact local emergency services (Dial 112).</li>
                    <li>Then, report the incident to XTASS through the app or by calling +233 XXX XXX XXX.</li>
                  </ul>
                  
                  <h4>7. Our Commitment</h4>
                  <p>XTASS is committed to building trust, safety, and accountability in every ride. Reporting issues helps us maintain high standards for all passengers and drivers. Every report is reviewed by our Quality Assurance & Safety Department to ensure continuous improvement.</p>
                  
                  <h4>8. Effective Date</h4>
                  <p>This “Report an Issue” policy is effective as of [Insert Date] and may be updated periodically. Please check this page for the latest version.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'lost-and-found' && (
        <main>
          {/* Hero for Lost & Found page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Lost & Found</h1>
              <p className="mt-4 text-lg text-white/90">Report a lost item to get help with recovery.</p>
            </div>
          </div>
          
          {/* Lost & Found Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h2 className="text-3xl font-display font-bold text-gray-800 text-center">XTASS — Lost & Found</h2>
                  
                  <h4>1. Introduction</h4>
                  <p>At XTASS, we understand that passengers may occasionally forget personal belongings in a vehicle after a ride. Our Lost & Found service is designed to help you recover your items quickly and securely.</p>
                  <p>If you’ve lost an item during a trip, please follow the steps outlined below to report it and track the recovery process.</p>

                  <h4>2. What You Can Report</h4>
                  <p>You can report any item that was left behind during a ride, including:</p>
                  <ul>
                    <li>Mobile phones, laptops, or tablets</li>
                    <li>Wallets, purses, or bags</li>
                    <li>Keys, jewelry, or watches</li>
                    <li>Documents or identification cards</li>
                    <li>Clothing or personal accessories</li>
                  </ul>
                  <p>If you’re unsure whether your item qualifies, please still submit a report — our team will assist you in determining next steps.</p>

                  <h4>3. How to Report a Lost Item</h4>
                  <h5>a. Using the XTASS App (Preferred Method)</h5>
                  <ul>
                    <li>Open the XTASS App.</li>
                    <li>Go to Menu → Help → Lost & Found.</li>
                    <li>Select the trip where you believe the item was lost.</li>
                    <li>Provide details of the lost item and upload any helpful photos (optional).</li>
                    <li>Submit the report and wait for confirmation.</li>
                  </ul>
                  
                  <h5>b. Through the Website</h5>
                  <p>Fill out the online Lost & Found Form below:</p>
                  
                  <div className="not-prose mt-12 p-8 bg-gray-50 rounded-lg border border-gray-200">
                      <h3 className="text-2xl font-bold font-display text-gray-800 mb-6 text-center">Lost & Found Form</h3>
                      <form onSubmit={handleLostAndFoundSubmit} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label htmlFor="lostFullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                  <input type="text" name="fullName" id="lostFullName" value={lostAndFoundData.fullName} onChange={handleLostAndFoundChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                              </div>
                              <div>
                                  <label htmlFor="lostEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                                  <input type="email" name="email" id="lostEmail" value={lostAndFoundData.email} onChange={handleLostAndFoundChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                              </div>
                              <div>
                                  <label htmlFor="lostPhone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                  <input type="tel" name="phone" id="lostPhone" value={lostAndFoundData.phone} onChange={handleLostAndFoundChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                              </div>
                              <div>
                                  <label htmlFor="lostTripDate" className="block text-sm font-medium text-gray-700">Trip Date</label>
                                  <input type="date" name="tripDate" id="lostTripDate" value={lostAndFoundData.tripDate} onChange={handleLostAndFoundChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                              </div>
                              <div>
                                  <label htmlFor="lostTripType" className="block text-sm font-medium text-gray-700">Trip Type</label>
                                  <select name="tripType" id="lostTripType" value={lostAndFoundData.tripType} onChange={handleLostAndFoundChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required>
                                      <option value="">Select Trip Type</option>
                                      <option>Instant Ride</option>
                                      <option>Scheduled Ride</option>
                                      <option>Car Rental</option>
                                  </select>
                              </div>
                          </div>
                          <div>
                              <label htmlFor="lostDescription" className="block text-sm font-medium text-gray-700">Description of Lost Item</label>
                              <textarea name="description" id="lostDescription" rows={5} value={lostAndFoundData.description} onChange={handleLostAndFoundChange} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="Please describe the item, including color, brand, or any unique features..." required></textarea>
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-gray-700">Attach File or Photo (optional)</label>
                              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                  <div className="space-y-1 text-center">
                                      <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                                      <div className="flex text-sm text-gray-600">
                                          <label htmlFor="lost-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                              <span>Upload a file</span>
                                              <input id="lost-file-upload" name="file-upload" type="file" className="sr-only" onChange={handleLostAndFoundFileChange} />
                                          </label>
                                          <p className="pl-1">or drag and drop</p>
                                      </div>
                                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                  </div>
                              </div>
                              {lostAndFoundFile && <p className="mt-2 text-sm text-gray-500">Selected file: {lostAndFoundFile.name}</p>}
                          </div>
                          <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-6 hover:bg-primary-hover transition-colors rounded-md shadow-sm">Report Lost Item</button>
                      </form>
                  </div>

                  <h4>4. What Happens After You Submit a Report</h4>
                  <p>Once your report is received:</p>
                  <ul>
                    <li>You’ll get an acknowledgment email confirming your submission.</li>
                    <li>Our support team will contact the driver who completed your ride.</li>
                    <li>If the item is found, we’ll coordinate a safe and convenient pickup or delivery.</li>
                    <li>If the item cannot be located within 7 working days, we’ll update you with a closure notification.</li>
                  </ul>

                  <h4>5. Found an Item?</h4>
                  <p>If you are a driver or passenger who has found an item, please:</p>
                  <ul>
                    <li>Report it immediately through the XTASS app → Help → Found Item.</li>
                    <li>Provide details and, if possible, attach a photo.</li>
                    <li>XTASS will contact the rightful owner and handle the return.</li>
                  </ul>
                  <p>Never hand over lost items directly to others without XTASS verification. This ensures safe and verified returns for all users.</p>

                  <h4>6. Fees (If Applicable)</h4>
                  <p>XTASS does not charge any fee for reporting or recovering lost items. However, if a delivery or courier is required to return an item, the cost will be communicated to the owner before shipment.</p>

                  <h4>7. Confidentiality and Data Protection</h4>
                  <p>Your personal data and item details are handled in accordance with XTASS’s Privacy Policy and Data Protection Policy. We will never share your information with third parties except as necessary to recover your lost property.</p>

                  <h4>8. Contact Our Support Team</h4>
                  <p>For urgent or follow-up inquiries:<br/>
                  📧 lostandfound@xtass.com<br/>
                  📞 +233 XXX XXX XXX<br/>
                  📍 XTASS Head Office, Accra, Ghana</p>
                  <p>Support Hours: Monday – Sunday (6:00 AM – 10:00 PM)</p>

                  <h4>9. Safety Reminder</h4>
                  <p>XTASS will never request payment or personal information beyond what is needed to verify ownership. Always confirm official communication is from @xtass.com before providing any details.</p>

                  <h4>10. Effective Date</h4>
                  <p>This Lost & Found Policy is effective as of [Insert Date] and will be updated periodically to improve service and security.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

      {view === 'start-reservation' && (
        <StartCarReservationPage setView={setView} onRoleSelect={onRoleSelect} commonFooter={commonFooter} />
      )}

      {view === 'manage-reservation' && (
        <ManageReservationPage setView={setView} onRoleSelect={onRoleSelect} commonFooter={commonFooter} />
      )}

      {view === 'deals-and-coupons' && (
        <DealsAndCouponsPage setView={setView} onRoleSelect={onRoleSelect} commonFooter={commonFooter} />
      )}



      {view === 'one-way-rental' && (
        <OneWayRentalPage setView={setView} commonFooter={commonFooter} onRoleSelect={onRoleSelect} />
      )}

      {view === 'long-term-rental' && (
        <LongTermRentalPage setView={setView} commonFooter={commonFooter} onRoleSelect={onRoleSelect} />
      )}

      {view === 'business-solutions' && (
        <BusinessSolutionsPage commonFooter={commonFooter} onRoleSelect={onRoleSelect} />
      )}

      {view === 'hospitality' && (
        <main className="min-h-screen bg-white">
          {/* Empty Hospitality Page */}
        </main>
      )}

      {view === 'careers' && (
        <CareersPage commonFooter={commonFooter} />
      )}

      {view === 'accessibility' && (
        <main>
          {/* Hero for Accessibility Services page */}
          <div className="relative bg-primary text-white">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{backgroundImage: "url('https://i.ibb.co/svMbtFfn/XTASS-Hero-Banner-2.jpg')"}}>
            </div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
              <h1 className="text-4xl md:text-5xl font-display font-bold">Accessibility Services</h1>
              <p className="mt-4 text-lg text-white/90">Our commitment to providing equal access for all passengers.</p>
            </div>
          </div>
          
          {/* Accessibility Services Content */}
          <section className="py-16 md:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="prose lg:prose-lg max-w-none text-gray-700 space-y-6">
                  <h2 className="text-3xl font-display font-bold text-gray-800 text-center">XTASS — Accessibility Services</h2>
                  
                  <h4>1. Introduction</h4>
                  <p>XTASS is committed to providing equal access and convenience for all passengers, regardless of ability or mobility level. Our goal is to make every aspect of our transportation service inclusive, comfortable, and safe for everyone. This Accessibility Services Policy outlines the measures we take to support passengers with disabilities or special needs.</p>

                  <h4>2. Our Accessibility Commitment</h4>
                  <p>XTASS ensures that all users can easily request, book, and enjoy rides through our platform. We continuously improve our app, website, and vehicles to meet accessibility standards and accommodate all passengers.</p>

                  <h4>3. Accessible Ride Options</h4>

                  <h5>a. Wheelchair-Accessible Vehicles (WAVs)</h5>
                  <ul>
                    <li>XTASS provides vehicles equipped with wheelchair ramps or lifts.</li>
                    <li>Passengers can request a WAV directly in the app by selecting the “Accessible Vehicle” option when booking a ride.</li>
                    <li>Our drivers are trained to assist passengers in entering and exiting vehicles safely.</li>
                  </ul>

                  <h5>b. Assistance for Passengers with Mobility Challenges</h5>
                  <ul>
                    <li>Drivers are instructed to offer reasonable assistance such as opening doors or helping with light luggage.</li>
                    <li>If you need extra support, please note it in the “Special Request” section of your booking form.</li>
                  </ul>
                  
                  <h5>c. Hearing and Speech Accessibility</h5>
                  <ul>
                    <li>XTASS supports communication through text chat within the app.</li>
                    <li>Real-time messaging ensures passengers who are deaf or hard of hearing can communicate with drivers effectively.</li>
                  </ul>

                  <h5>d. Visual Assistance</h5>
                  <ul>
                    <li>Drivers are trained to assist visually impaired passengers with boarding and identifying destinations.</li>
                    <li>Guide dogs and certified service animals are welcome on all XTASS rides.</li>
                  </ul>
                  
                  <h4>4. App and Website Accessibility</h4>
                  <p>XTASS digital platforms follow international accessibility guidelines (WCAG 2.1 standards) to ensure inclusivity:</p>
                  <ul>
                    <li>Screen reader support for blind and low-vision users.</li>
                    <li>High-contrast color themes for better visibility.</li>
                    <li>Resizable text to accommodate different viewing preferences.</li>
                    <li>Keyboard navigation for users who cannot use a mouse.</li>
                  </ul>
                  <p>If you encounter difficulties accessing any part of the XTASS website or app, you can contact our accessibility support team for immediate help.</p>

                  <h4>5. Assistance for Elderly Passengers</h4>
                  <p>XTASS prioritizes the comfort of elderly users:</p>
                  <ul>
                    <li>Drivers provide patient, courteous, and personalized support.</li>
                    <li>The app allows caregivers or family members to book rides on behalf of elderly passengers.</li>
                    <li>Riders can save preferred drivers for future trips for consistency and comfort.</li>
                  </ul>

                  <h4>6. Assistance Animals</h4>
                  <p>XTASS fully supports passengers traveling with service or guide animals.</p>
                  <ul>
                    <li>No extra fees apply.</li>
                    <li>Drivers are required by policy to accommodate service animals at all times.</li>
                    <li>Passengers are encouraged to inform the driver in advance for a smoother experience.</li>
                  </ul>

                  <h4>7. Requesting Accessibility Assistance</h4>
                  <p>Passengers who need accessibility accommodations can do so easily through the app:</p>
                  <ul>
                    <li>Select “Accessibility Options” during booking.</li>
                    <li>Choose your preferred accessibility type (e.g., wheelchair, hearing, visual).</li>
                    <li>Add special instructions for your driver, if necessary.</li>
                  </ul>
                  <p>Alternatively, you can contact our team directly at:<br/>
                  📧 Email: <a href="mailto:accessibility@xtass.com">accessibility@xtass.com</a><br/>
                  📞 Phone: +233 XXX XXX XXX</p>
                  <p>Our Accessibility Support Team is available 24/7 to provide immediate help or arrange special rides.</p>

                  <h4>8. Driver Training and Awareness</h4>
                  <p>All XTASS drivers receive specialized training on:</p>
                  <ul>
                    <li>Disability awareness and sensitivity.</li>
                    <li>Safe assistance techniques for passengers with special needs.</li>
                    <li>Proper handling of wheelchairs and other mobility devices.</li>
                  </ul>
                  <p>Drivers who fail to comply with accessibility standards may be subject to retraining or removal from the platform.</p>

                  <h4>9. Feedback and Improvements</h4>
                  <p>XTASS encourages all users to share feedback on accessibility experiences:<br/>
                  📧 Email: <a href="mailto:feedback@xtass.com">feedback@xtass.com</a></p>
                  <p>Your feedback helps us improve services, train drivers better, and expand accessibility options across more regions in Ghana and Africa.</p>

                  <h4>10. Commitment to Continuous Inclusion</h4>
                  <p>XTASS continually reviews and updates its Accessibility Services to ensure inclusivity, fairness, and comfort for all riders. We aim to be the most accessible transportation platform in Ghana and across Africa.</p>

                  <h4>11. Effective Date</h4>
                  <p>This Accessibility Services Policy is effective as of [Insert Date] and applies to all XTASS operations, including app, website, and in-vehicle services.</p>
              </div>
            </div>
          </section>

          {commonFooter}
        </main>
      )}

    </div>
  );
};


export default App;