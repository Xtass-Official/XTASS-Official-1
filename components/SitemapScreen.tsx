import React from 'react';
import type { Screen, NavigationProps } from '../types';
import { motion } from 'motion/react';
import { 
  HomeIcon, SearchIcon, ShieldIcon, PhoneIcon, FileTextIcon, 
  UserIcon, BarChart2Icon, CarIcon, CalendarIcon, 
  CreditCardIcon, MapPinIcon, MessageSquareIcon,
  ChevronRightIcon, GlobeIcon, BriefcaseIcon, LockIcon, SettingsIcon
} from './Icons';

interface SitemapSectionProps {
  title: string;
  icon: React.FC<any>;
  links: { label: string; screen: Screen; view?: string; description?: string }[];
  onNavigate: (screen: Screen, view?: string) => void;
}

const SitemapSection: React.FC<SitemapSectionProps> = ({ title, icon: Icon, links, onNavigate }) => (
  <div className="bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-primary/5 rounded-none flex items-center justify-center text-primary">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-display font-bold text-gray-900">{title}</h3>
    </div>
    <ul className="space-y-4">
      {links.map((link, idx) => (
        <li key={idx} className="group">
          <button 
            onClick={() => onNavigate(link.screen, link.view)}
            className="flex items-start gap-3 w-full text-left transition-colors hover:text-primary"
          >
            <span className="text-sm font-mono font-bold mt-px text-primary/40 shrink-0 w-6 group-hover:text-accent transition-colors">
              {idx + 1}.
            </span>
            <div>
              <span className="font-bold text-sm block group-hover:translate-x-1 transition-transform">{link.label}</span>
              {link.description && <span className="text-xs text-gray-500 font-light block mt-0.5 group-hover:translate-x-1 transition-transform">{link.description}</span>}
            </div>
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export const SitemapScreen: React.FC<NavigationProps & { onBack?: () => void }> = ({ navigate, onBack }) => {
  const sections = [
    {
      title: "Main Platform",
      icon: HomeIcon,
      links: [
        { label: "Home / Welcome", screen: "Welcome", view: "home", description: "The XTASS landing page" },
        { label: "Login Portal", screen: "Login", description: "Customer account access" },
        { label: "Registration", screen: "Register", description: "Create a new customer account" },
        { label: "Forgot Password", screen: "ForgotPassword", description: "Recover your account" },
        { label: "Service Selection", screen: "ServiceSelection", description: "Choose your ride type" },
      ]
    },
    {
      title: "Booking & Requests",
      icon: CarIcon,
      links: [
        { label: "Instant Pickup", screen: "TripDetailsInput", description: "Request a ride immediately" },
        { label: "Schedule a Ride", screen: "ScheduleRide", description: "Book for a future date & time" },
        { label: "Car Rental", screen: "CarRental", description: "Rent a vehicle with a driver" },
        { label: "Available Shuttles", screen: "AvailableShuttles", description: "Select from our fleet" },
        { label: "Start Reservation", screen: "Welcome", view: "start-reservation", description: "Begin a new car reservation" },
        { label: "Manage Reservation", screen: "Welcome", view: "manage-reservation", description: "Lookup or modify booking" },
      ]
    },
    {
      title: "Special Services",
      icon: GlobeIcon,
      links: [
        { label: "One Way Rental", screen: "Welcome", view: "one-way-rental", description: "Travel between cities" },
        { label: "Long Term Rental", screen: "Welcome", view: "long-term-rental", description: "Monthly hire solutions" },
        { label: "Business Solutions", screen: "Welcome", view: "business-solutions", description: "Enterprise transport" },
        { label: "Corporate Services", screen: "Welcome", view: "corporate-services", description: "Managed executive travel" },
        { label: "Hospitality Services", screen: "Welcome", view: "hospitality", description: "Hotel & restaurant partners" },
        { label: "Deals & Coupons", screen: "Welcome", view: "deals-and-coupons", description: "Latest offers" },
      ]
    },
    {
      title: "Account & Profile",
      icon: UserIcon,
      links: [
        { label: "Account Overview", screen: "AccountProfile", description: "Manage personal information" },
        { label: "Saved Passengers", screen: "SavedPassengers", description: "Add friends and family" },
        { label: "Emergency Contacts", screen: "EmergencyContacts", description: "Safety & ICE details" },
        { label: "Booking History", screen: "TripHistory", description: "Complete past ride logs" },
      ]
    },
    {
      title: "Support & Learning",
      icon: MessageSquareIcon,
      links: [
        { label: "Accessibility", screen: "Welcome", view: "accessibility", description: "Service for all abilities" },
        { label: "Careers", screen: "Welcome", view: "careers", description: "Join the XTASS team" },
        { label: "Report an Issue", screen: "Welcome", view: "report-issue", description: "Tell us what went wrong" },
        { label: "Lost & Found", screen: "Welcome", view: "lost-and-found", description: "Find missing belongings" },
        { label: "Community Guidelines", screen: "Welcome", view: "community", description: "Our conduct standards" },
      ]
    },
    {
      title: "Legal & Policies",
      icon: ShieldIcon,
      links: [
        { label: "Terms & Conditions", screen: "Welcome", view: "terms", description: "Our legal agreement" },
        { label: "Privacy Policy", screen: "Welcome", view: "privacy", description: "Data protection policy" },
        { label: "Refund Policy", screen: "Welcome", view: "refund", description: "Cancellation terms" },
        { label: "Cookie Policy", screen: "Welcome", view: "cookie", description: "Tracking & analytics" },
        { label: "Compliance & Safety", screen: "Welcome", view: "compliance", description: "Regulatory standards" },
        { label: "Licensing Info", screen: "Welcome", view: "licensing", description: "Operating permits" },
      ]
    }
  ];

  const adminSections = [
    {
      title: "Driver Network",
      icon: BriefcaseIcon,
      links: [
        { label: "Driver Login", screen: "DriverLogin", description: "Professional portal access" },
        { label: "Driver Signup", screen: "DriverRegistration", description: "Registration & onboarding" },
        { label: "Driver Dashboard", screen: "DriverDashboard", description: "Management interface" },
        { label: "Earnings Tracking", screen: "EarningsDashboard", description: "Payment & performance" },
        { label: "Application Status", screen: "ApplicationStatus", description: "Track your signup" },
      ]
    },
    {
      title: "Admin Control",
      icon: SettingsIcon,
      links: [
        { label: "Admin Login", screen: "AdminLogin", description: "Authorized access only" },
        { label: "Master Dashboard", screen: "AdminDashboard", description: "Global operations overview" },
        { label: "Live Operations", screen: "LiveOperations", description: "Real-time dispatch board" },
        { label: "Driver management", screen: "DriverManagement", description: "Fleet lifecycle control" },
        { label: "System Configuration", screen: "SystemConfig", description: "Platform wide parameters" },
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <header className="bg-primary text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(128,0,32,1)_0%,rgba(77,0,17,1)_100%)]"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-left">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-accent font-bold mb-6 hover:opacity-80 transition-opacity">
              <ChevronRightIcon className="w-5 h-5 rotate-180" />
              Back
            </button>
          )}
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight uppercase tracking-tighter">
            Platform <span className="text-accent underline decoration-4 underline-offset-8">Sitemap</span>
          </h1>
          <p className="mt-6 text-white/70 max-w-2xl text-lg font-light leading-relaxed">
            A comprehensive index of all routes and sections within the XTASS ecosystem. 
            Navigate directly to your destination.
          </p>
        </div>
      </header>

      <main className="flex-1 py-16 md:py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 mb-10 border-b border-gray-200 pb-4">Customer & Information Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {sections.map((section, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <SitemapSection 
                    title={section.title}
                    icon={section.icon}
                    links={section.links}
                    onNavigate={(s, v) => navigate(s, v)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary/40 mb-10 border-b border-gray-200 pb-4">Partner & Administrative Portal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {adminSections.map((section, idx) => (
                <motion.div
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 + (idx * 0.05) }}
                >
                  <SitemapSection 
                    title={section.title}
                    icon={section.icon}
                    links={section.links}
                    onNavigate={(s, v) => navigate(s, v)}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-24 p-12 bg-primary text-white text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-none -mr-32 -mt-32 transform rotate-12 group-hover:rotate-45 transition-transform duration-1000"></div>
            <div className="relative z-10 max-w-3xl">
              <h2 className="text-3xl font-display font-bold mb-6">Need Assistance?</h2>
              <p className="text-white/70 text-lg leading-relaxed mb-10 font-light">
                If you cannot find the page you are looking for or encountered an issue with our navigation, please contact our 24/7 support team immediately.
              </p>
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={() => navigate('ForgotPassword')}
                  className="bg-accent text-primary font-bold px-8 py-4 rounded-none hover:bg-white transition-all shadow-lg shadow-accent/10"
                >
                  Contact Support
                </button>
                <button 
                  onClick={() => navigate('ForgotPassword')}
                  className="border-2 border-white/20 text-white font-bold px-8 py-4 rounded-none hover:bg-white/10 transition-all uppercase tracking-widest text-sm"
                >
                  Help Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black py-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm font-light">© 2025 XTASS. All navigation links verified for direct access. Made with in Ghana.</p>
        </div>
      </footer>
    </div>
  );
};
