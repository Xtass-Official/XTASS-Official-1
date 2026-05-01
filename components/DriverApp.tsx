
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Screen, NavigationProps } from '../types';
import { Button, Input, Header, ScreenContainer } from './shared/UI';
import { PhoneIcon, LockIcon, CarIcon, UploadCloudIcon, FileTextIcon, DollarSignIcon, CheckCircleIcon, ChevronLeftIcon, XCircleIcon } from './Icons';

interface DriverAppProps extends NavigationProps {
  screen: Screen;
}

export const DriverApp: React.FC<DriverAppProps> = ({ screen, navigate, logout }) => {
  const renderScreen = () => {
    switch (screen) {
      case 'DriverLogin':
        return <DriverAuthScreen navigate={navigate} isLogin logout={logout} />;
      case 'DriverPasswordRecovery':
          return <DriverForgotPasswordScreen navigate={navigate} />;
      case 'DriverRegistration':
        return <DriverRegistrationScreen navigate={navigate} />;
      case 'DocumentUpload':
        return <DocumentUploadScreen navigate={navigate} />;
      case 'ApplicationStatus':
        return <ApplicationStatusScreen navigate={navigate} />;
      case 'DriverDashboard':
        return <DriverDashboardScreen navigate={navigate} logout={logout} />;
      case 'TripRequest':
        return <TripRequestScreen navigate={navigate} />;
      case 'TripManagement':
        return <TripManagementScreen navigate={navigate} />;
      case 'DriverTripCompletion':
        return <DriverTripCompletionScreen navigate={navigate} />;
      case 'EarningsDashboard':
        return <EarningsDashboardScreen navigate={navigate} />;
      default:
        return <DriverAuthScreen navigate={navigate} isLogin logout={logout} />;
    }
  };
  return <div className="relative">{renderScreen()}</div>;
};

// --- Screen Components ---

const DriverAuthScreen: React.FC<{ navigate: (s: Screen) => void, isLogin: boolean, logout?: () => void }> = ({ navigate, isLogin, logout }) => {
    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            {logout && (
                <button onClick={logout} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-200 z-10" aria-label="Go back">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
            )}
            <div className="w-full max-w-sm text-center mb-8">
                 <h1 className="text-4xl font-display font-bold text-primary">XTASS Driver</h1>
            </div>
            <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold font-display text-gray-900 text-center">{isLogin ? "Driver Login" : "Driver Registration"}</h2>
                <form className="space-y-4 mt-6" onSubmit={(e) => { e.preventDefault(); navigate(isLogin ? 'DriverDashboard' : 'DocumentUpload'); }}>
                    <Input id="phone" label="Phone Number" type="tel" placeholder="024 123 4567" icon={<PhoneIcon className="w-5 h-5 text-gray-400" />} defaultValue="055 987 6543" />
                    <Input id="password" label="Password" type="password" placeholder="••••••••" icon={<LockIcon className="w-5 h-5 text-gray-400" />} defaultValue="driverpass" />
                    <div className="pt-2">
                        <Button type="submit">{isLogin ? "Login" : "Continue"}</Button>
                    </div>
                </form>
                <div className="text-sm text-center mt-4">
                    {isLogin ? (
                        <>
                        <a href="#" onClick={(e) => {e.preventDefault(); navigate('DriverPasswordRecovery')}} className="font-medium text-primary hover:text-primary-hover">Forgot password?</a>
                        <p className="mt-2 text-gray-600">Not a driver yet? <a href="#" onClick={(e) => {e.preventDefault(); navigate('DriverRegistration')}} className="font-medium text-primary hover:text-primary-hover">Apply now</a></p>
                        </>
                    ) : (
                        <p className="text-gray-600">Already a driver? <a href="#" onClick={(e) => {e.preventDefault(); navigate('DriverLogin')}} className="font-medium text-primary hover:text-primary-hover">Log in</a></p>
                    )}
                </div>
            </div>
        </div>
    );
};

const DriverForgotPasswordScreen: React.FC<NavigationProps> = ({ navigate }) => (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <button onClick={() => navigate('DriverLogin')} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-200 z-10" aria-label="Back to Login">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold font-display text-gray-900">Reset Password</h2>
            <p className="text-gray-500 mt-2 mb-6">Enter your phone number to receive a reset code.</p>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('DriverLogin'); }}>
                <Input id="phone-reset" label="Phone Number" type="tel" placeholder="024 123 4567" icon={<PhoneIcon className="w-5 h-5 text-gray-400" />} defaultValue="055 987 6543" />
                <div className="pt-2"> <Button type="submit">Send Code</Button> </div>
            </form>
        </div>
    </div>
);


const DriverRegistrationScreen: React.FC<NavigationProps> = ({ navigate }) => (
     <ScreenContainer>
        <Header title="Driver Registration" onBack={() => navigate('DriverLogin')} />
        <div className="p-4 space-y-4">
            <h3 className="font-semibold text-lg">Personal Details</h3>
            <Input id="fullName" label="Full Name" type="text" placeholder="Kofi Mensah" defaultValue="Kofi Mensah" />
            <Input id="phone" label="Phone Number" type="tel" placeholder="024 123 4567" defaultValue="055 987 6543" />
            <h3 className="font-semibold text-lg mt-4">Vehicle Details</h3>
            <Input id="vehicleModel" label="Vehicle Model" type="text" placeholder="Toyota Hiace" defaultValue="Toyota Hiace" />
            <Input id="licensePlate" label="License Plate" type="text" placeholder="GT-1234-20" defaultValue="GT-1234-20" />
            <div className="pt-4">
                <Button onClick={() => navigate('DocumentUpload')}>Next: Upload Documents</Button>
            </div>
        </div>
     </ScreenContainer>
);

const DocumentUploadScreen: React.FC<NavigationProps> = ({ navigate }) => (
    <ScreenContainer>
        <Header title="Upload Documents" onBack={() => navigate('DriverRegistration')} />
        <div className="p-4 space-y-4">
            <DocumentUploadItem title="Ghana Card" />
            <DocumentUploadItem title="Driver's License" />
            <DocumentUploadItem title="Vehicle Insurance" />
             <div className="pt-4">
                <Button onClick={() => navigate('ApplicationStatus')}>Submit Application</Button>
            </div>
        </div>
    </ScreenContainer>
);

const DocumentUploadItem: React.FC<{title: string}> = ({ title }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h4 className="mt-2 text-sm font-semibold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
        <label htmlFor={`file-upload-${title}`} className="cursor-pointer mt-4 inline-block bg-white py-1.5 px-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            <span>Upload file</span>
            <input id={`file-upload-${title}`} name="file-upload" type="file" className="sr-only"/>
        </label>
    </div>
);

const ApplicationStatusScreen: React.FC<NavigationProps> = ({ navigate }) => (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
        <button onClick={() => navigate('DocumentUpload')} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-200 z-10" aria-label="Go back">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 mx-auto border-4 border-t-accent border-gray-200 rounded-full animate-spin"></div>
            <h2 className="text-2xl font-bold font-display text-gray-900 mt-6">Application Submitted</h2>
            <p className="text-gray-600 mt-2">Your application is currently <span className="font-bold text-yellow-600">In Review</span>. We will notify you once it's approved.</p>
            <div className="mt-8">
                <Button onClick={() => navigate('DriverDashboard')}>Go to Dashboard (Simulate Approval)</Button>
            </div>
        </div>
    </div>
);

const DriverDashboardScreen: React.FC<NavigationProps> = ({ navigate, logout }) => (
    <ScreenContainer>
        <Header title="Dashboard" onBack={logout} />
        <div className="p-4">
            <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center">
                <p className="font-semibold">Your status is: <span className="font-bold">Online</span></p>
                <p className="text-sm">Your status is managed by your administrator.</p>
            </div>

            <div className="mt-4 bg-primary text-white p-4 rounded-lg text-center">
                 <p className="text-sm">Today's Earnings</p>
                 <p className="text-4xl font-bold">$30.00</p>
            </div>
             <div className="mt-4">
                <h3 className="font-bold text-lg mb-2">Awaiting Trip Request...</h3>
                <div className="text-center text-gray-500 p-8 border-2 border-dashed rounded-lg">
                    <p>You are online and will be notified of new trip requests.</p>
                </div>
                <Button className="mt-4" onClick={() => navigate('TripRequest')}>Simulate Trip Request</Button>
            </div>
             <div className="mt-6">
                <Button variant="secondary" onClick={() => navigate('EarningsDashboard')}>View Earnings</Button>
                <Button variant="secondary" onClick={logout} className="mt-2">Logout</Button>
             </div>
        </div>
    </ScreenContainer>
);

const TripRequestScreen: React.FC<NavigationProps> = ({ navigate }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm text-center animate-fade-in relative">
            <button onClick={() => navigate('DriverDashboard')} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" aria-label="Close">
                <XCircleIcon className="w-8 h-8" />
            </button>
             <div className="w-24 h-24 mx-auto rounded-full border-8 border-primary animate-pulse flex items-center justify-center text-3xl font-bold text-primary">
                45
            </div>
            <h2 className="text-2xl font-bold mt-4">New Trip Request</h2>
            <div className="my-4 text-left space-y-1">
                <p><strong>Pickup:</strong> Kotoka Int'l Airport</p>
                <p><strong>Destination:</strong> Accra Mall</p>
                <p><strong>Fare:</strong> <span className="font-bold text-green-600">$10.00 (PREPAID)</span></p>
            </div>
            <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => navigate('DriverDashboard')}>Decline</Button>
                <Button onClick={() => navigate('TripManagement')}>Accept</Button>
            </div>
        </div>
    </div>
);


const TripManagementScreen: React.FC<NavigationProps> = ({ navigate }) => (
    <ScreenContainer>
        <Header title="Trip to Accra Mall" onBack={() => navigate('DriverDashboard')} />
         <div className="relative h-[calc(100vh-120px)]">
             <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
                <p className="text-gray-500 font-semibold">Navigation Map Placeholder</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-4">
                        <img src="https://picsum.photos/seed/user/64/64" alt="customer" className="w-16 h-16 rounded-full" />
                        <div>
                            <p className="font-bold">Ama Serwaa</p>
                            <p className="text-gray-600">Pickup in 5 mins</p>
                        </div>
                        <div className="flex-grow text-right">
                           <a href="tel:0241234567" className="bg-primary text-white p-3 rounded-full shadow-md"><PhoneIcon /></a>
                        </div>
                    </div>
                     <Button onClick={() => navigate('DriverTripCompletion')} className="mt-4">End Trip</Button>
                </div>
            </div>
        </div>
    </ScreenContainer>
);

const DriverTripCompletionScreen: React.FC<NavigationProps> = ({ navigate }) => (
    <ScreenContainer>
        <Header title="Complete Trip" onBack={() => navigate('DriverDashboard')}/>
        <div className="p-4 text-center">
            <CheckCircleIcon className="w-24 h-24 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold font-display">Trip Completed!</h2>
            <div className="bg-gray-50 p-4 rounded-lg my-6 text-left">
                <h3 className="font-bold text-lg mb-2">Earnings Summary</h3>
                <div className="flex justify-between"><span>Trip Fare</span><span>$10.00</span></div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t"><span>Total Earned</span><span>$10.00</span></div>
            </div>
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm font-semibold">Upload Drop-off Photo (Optional)</p>
             </div>
            <Button onClick={() => navigate('DriverDashboard')} className="mt-6">Back to Dashboard</Button>
        </div>
    </ScreenContainer>
);

const EarningsDashboardScreen: React.FC<NavigationProps> = ({ navigate }) => {
    const data = [
      { name: 'Mon', earnings: 120 }, { name: 'Tue', earnings: 180 },
      { name: 'Wed', earnings: 90 }, { name: 'Thu', earnings: 210 },
      { name: 'Fri', earnings: 150 }, { name: 'Sat', earnings: 250 },
      { name: 'Sun', earnings: 190 },
    ];

    return (
        <ScreenContainer>
            <Header title="Earnings" onBack={() => navigate('DriverDashboard')} />
            <div className="p-4">
                <div className="bg-primary text-white p-4 rounded-lg text-center mb-4">
                     <p className="text-sm">This Week's Total</p>
                     <p className="text-4xl font-bold">$238.00</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="font-bold text-lg mb-4">Weekly Performance</h3>
                     <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <BarChart data={data}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="earnings" fill="#800020" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                 <div className="mt-6">
                    <Button variant="accent">Withdraw Earnings</Button>
                 </div>
            </div>
        </ScreenContainer>
    );
};
