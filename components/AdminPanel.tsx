import React from 'react';
import type { Screen, NavigationProps } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button, Input } from './shared/UI';
import { UserIcon, LockIcon, MenuIcon, CarIcon, DollarSignIcon, UsersIcon, ShieldIcon, BarChart2Icon, MapPinIcon, SettingsIcon, LogOutIcon, ChevronLeftIcon, SearchIcon, BusIcon, FileTextIcon } from './Icons';

interface AdminPanelProps extends NavigationProps {
  screen: Screen;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ screen, navigate, logout }) => {
  const renderScreen = () => {
    switch (screen) {
      case 'AdminLogin':
        return <AdminLoginScreen navigate={navigate} logout={logout} />;
      case 'AdminPasswordRecovery':
        return <AdminPasswordRecoveryScreen navigate={navigate} />;
      case 'AdminDashboard':
        return <AdminDashboardScreen />;
      case 'DriverManagement':
        return <DriverManagementScreen />;
      case 'AdminBookings':
        return <AdminBookingsScreen />;
      case 'LiveOperations':
        return <LiveOperationsScreen />;
      case 'SystemConfig':
        return <SystemConfigScreen />;
      default:
        return <AdminLoginScreen navigate={navigate} logout={logout} />;
    }
  };
  
  const showLayout = screen !== 'AdminLogin' && screen !== 'AdminPasswordRecovery';

  return (
    <div className="min-h-screen bg-gray-100">
      {showLayout ? (
        <AdminLayout screen={screen} navigate={navigate} logout={logout}>
          {renderScreen()}
        </AdminLayout>
      ) : (
        renderScreen()
      )}
    </div>
  );
};


// --- Admin Layout ---
interface AdminLayoutProps extends NavigationProps {
    children: React.ReactNode;
    screen: Screen;
}
const AdminLayout: React.FC<AdminLayoutProps> = ({ children, screen, navigate, logout }) => (
    <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-primary text-white flex flex-col">
            <div className="p-4 text-center border-b border-primary-active">
                <h1 className="text-2xl font-display font-bold text-accent">XTASS Admin</h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <NavItem screenName="AdminDashboard" currentScreen={screen} navigate={navigate} icon={<BarChart2Icon />}>Dashboard</NavItem>
                <NavItem screenName="DriverManagement" currentScreen={screen} navigate={navigate} icon={<UsersIcon />}>Drivers</NavItem>
                <NavItem screenName="AdminBookings" currentScreen={screen} navigate={navigate} icon={<FileTextIcon />}>Bookings</NavItem>
                <NavItem screenName="LiveOperations" currentScreen={screen} navigate={navigate} icon={<MapPinIcon />}>Live Map</NavItem>
                <NavItem screenName="SystemConfig" currentScreen={screen} navigate={navigate} icon={<SettingsIcon />}>Configuration</NavItem>
            </nav>
            <div className="p-4 border-t border-primary-active">
                <button onClick={logout} className="w-full flex items-center space-x-2 p-2 rounded hover:bg-primary-hover">
                    <LogOutIcon />
                    <span>Logout</span>
                </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-md p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <button
                        onClick={() => screen === 'AdminDashboard' ? (logout && logout()) : navigate('AdminDashboard')}
                        title={screen === 'AdminDashboard' ? "Logout" : "Back to Dashboard"}
                        className="text-primary p-1 rounded-full hover:bg-gray-100 mr-3">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">{screen === 'LiveOperations' ? 'Live Operations' : screen.replace('Admin', '')}</h2>
                </div>
                <div>
                    <UserIcon className="w-8 h-8 text-gray-600"/>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6">
                {children}
            </div>
        </main>
    </div>
);

const NavItem: React.FC<{ screenName: Screen, currentScreen: Screen, navigate: (s: Screen) => void, icon: React.ReactElement<{ className?: string }>, children: React.ReactNode }> = ({ screenName, currentScreen, navigate, icon, children }) => (
    <button
        onClick={() => navigate(screenName)}
        className={`w-full flex items-center space-x-3 p-2 rounded text-left ${currentScreen === screenName ? 'bg-primary-active' : 'hover:bg-primary-hover'}`}
    >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
        <span>{children}</span>
    </button>
);


// --- Screen Components ---

const AdminLoginScreen: React.FC<NavigationProps> = ({ navigate, logout }) => (
  <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4 sm:p-6 md:p-8 lg:p-12 overflow-x-hidden text-gray-800">
    {logout && (
        <button onClick={logout} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-200 z-10 transition-colors duration-200" aria-label="Go back">
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
    )}
    <div className="w-full max-w-[100%] sm:max-w-[450px] md:max-w-[500px] lg:max-w-[480px] bg-white p-8 sm:p-10 rounded-2xl shadow-xl transition-all duration-500 my-auto">
      <h2 className="text-3xl font-bold font-display text-primary text-center tracking-tight mb-2">Admin Panel</h2>
      <p className="text-center text-gray-500 mb-8 font-medium">XTASS Enterprise Portal</p>
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('AdminDashboard'); }}>
        <Input id="email" label="Email" type="email" placeholder="admin@xtass.com" icon={<UserIcon className="w-5 h-5 text-gray-400" />} defaultValue="admin@xtass.com" />
        <Input id="password" label="Password" type="password" placeholder="••••••••" icon={<LockIcon className="w-5 h-5 text-gray-400" />} defaultValue="adminpass123" />
        <div>
          <Button type="submit">Sign In</Button>
        </div>
      </form>
    </div>
  </div>
);

const AdminPasswordRecoveryScreen: React.FC<NavigationProps> = ({ navigate }) => (
  <div className="relative flex flex-col items-center justify-start md:justify-center min-h-screen bg-gray-200 p-4 md:p-8 overflow-x-hidden">
    <button onClick={() => navigate('AdminLogin')} className="absolute top-4 left-4 text-primary p-2 rounded-full hover:bg-gray-200 z-10" aria-label="Back to Login">
        <ChevronLeftIcon className="w-6 h-6" />
    </button>
    <div className="w-full max-w-[98%] sm:max-w-[90%] md:max-w-md lg:max-w-sm bg-white p-6 sm:p-8 md:p-10 lg:p-8 rounded-lg shadow-lg mt-12 md:mt-0 mb-8 md:mb-0 transition-all duration-500">
      <h2 className="text-3xl font-bold font-display text-primary text-center">Password Recovery</h2>
      <p className="text-gray-600 mt-4 mb-8 text-center">Enter your email to receive reset instructions.</p>
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('AdminLogin'); }}>
        <Input id="email-recovery" label="Email" type="email" placeholder="admin@xtass.com" icon={<UserIcon className="w-5 h-5 text-gray-400" />} defaultValue="admin@xtass.com" />
        <div>
          <Button type="submit">Send Instructions</Button>
        </div>
      </form>
    </div>
  </div>
);

const AdminDashboardScreen: React.FC = () => {
    const revenueData = [
        { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 5000 },
        { name: 'Apr', revenue: 4500 }, { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 5500 },
    ];
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Revenue" value="$5,600" icon={<DollarSignIcon />} />
                <StatCard title="Active Trips" value="12" icon={<CarIcon />} />
                <StatCard title="Online Drivers" value="45" icon={<UsersIcon />} />
                <StatCard title="System Health" value="Operational" icon={<ShieldIcon />} status="ok" />
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-xl mb-4">Revenue Overview</h3>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={revenueData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#800020" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{title: string, value: string, icon: React.ReactElement<{ className?: string }>, status?: string}> = ({ title, value, icon, status }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className={`text-2xl font-bold ${status === 'ok' ? 'text-green-600' : 'text-gray-800'}`}>{value}</p>
        </div>
        <div className="bg-primary-active text-white p-3 rounded-full">
            {React.cloneElement(icon, { className: 'w-6 h-6' })}
        </div>
    </div>
);


const DriverManagementScreen: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h3 className="font-bold text-xl mb-4">Driver Management</h3>
    <table className="w-full text-left">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3">Name</th>
          <th className="p-3">Station</th>
          <th className="p-3">Status</th>
          <th className="p-3">Online Status</th>
          <th className="p-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        <DriverRow name="Kofi Mensah" station="Airport T3" status="Approved" isOnline={true} />
        <DriverRow name="Esi Koomson" station="Airport T3" status="Pending" isOnline={false} />
        <DriverRow name="Kwame Appiah" station="Airport T2" status="Suspended" isOnline={false} />
      </tbody>
    </table>
  </div>
);

const DriverRow: React.FC<{name: string, station: string, status: 'Approved' | 'Pending' | 'Suspended', isOnline: boolean}> = ({ name, station, status, isOnline }) => {
    const [online, setOnline] = React.useState(isOnline);
    
    const statusColor = {
        Approved: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Suspended: 'bg-red-100 text-red-800',
    };
    return (
        <tr className="border-b">
            <td className="p-3">{name}</td>
            <td className="p-3">{station}</td>
            <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor[status]}`}>{status}</span></td>
            <td className="p-3">
                 <label className="inline-flex relative items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={online} 
                        onChange={() => setOnline(!online)} 
                        className="sr-only peer"
                        disabled={status !== 'Approved'}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
            </td>
            <td className="p-3 space-x-2">
                {status === 'Pending' && <Button variant="primary" className="py-1 px-3 text-sm">Approve</Button>}
                {status === 'Approved' && <Button variant="secondary" className="py-1 px-3 text-sm">Suspend</Button>}
            </td>
        </tr>
    );
};


const LiveOperationsScreen: React.FC = () => {
  const activeDrivers = [
    { name: 'John Doe', status: 'On Trip', location: 'Spintex Road', destination: 'Accra Mall' },
    { name: 'Jane Smith', status: 'Idle', location: 'East Legon', destination: '' },
    { name: 'Kwesi Mensah', status: 'On Trip', location: 'Dzorwulu', destination: 'Airport' },
    { name: 'Adwoa Williams', status: 'Idle', location: 'Cantonments', destination: '' },
    { name: 'Yaw Boateng', status: 'On Trip', location: 'Labadi', destination: 'Osu' },
    { name: 'Akua Mansa', status: 'Idle', location: 'Airport Hills', destination: '' },
    { name: 'Kojo Antwi', status: 'Idle', location: 'Roman Ridge', destination: '' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex overflow-hidden -m-6">
      {/* Map Section */}
      <div className="w-2/3 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500 font-semibold text-2xl">Live Map Placeholder</p>
      </div>

      {/* Driver List Sidebar */}
      <div className="w-1/3 border-l border-gray-200 flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-lg">Active Drivers ({activeDrivers.length})</h3>
          <div className="relative mt-2">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-hover"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeDrivers.map((driver, index) => (
            <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-800">{driver.name}</h4>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${driver.status === 'On Trip' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {driver.status}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <MapPinIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                  <span>{driver.location}</span>
                </div>
                {driver.status === 'On Trip' && (
                  <div className="flex items-center">
                    <BusIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                    <span>To: {driver.destination}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const SystemConfigScreen: React.FC = () => (
  <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-xl mb-4">Pricing Rules</h3>
          <div className="space-y-4">
              <Input label="Base Fare ($)" id="baseFare" type="number" defaultValue="3" />
              <Input label="Per Kilometer Rate ($)" id="kmRate" type="number" step="0.1" defaultValue="0.5" />
          </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-xl mb-4">Vehicle Matching Logic</h3>
          <div className="space-y-2">
              <p>1 Passenger, 1 Luggage: <strong>Saloon Car</strong></p>
              <p>1-4 Passengers, 1-4 Luggage: <strong>SUV</strong></p>
              <p>5+ Passengers or 5+ Luggage: <strong>Shuttle Bus</strong></p>
          </div>
      </div>
       <div className="mt-6">
            <Button>Save Configuration</Button>
        </div>
  </div>
);

const AdminBookingsScreen: React.FC = () => {
    const [filter, setFilter] = React.useState('All');
    const bookings = [
        { id: 'XT-12345', customer: 'John Doe', type: 'Instant Ride', status: 'Upcoming', date: '2025-05-15', amount: '$15.00' },
        { id: 'XT-RC001', customer: 'Ama Serwaa', type: 'Car Rental', status: 'Active', date: '2025-05-10', amount: '$750.00' },
        { id: 'XT-99001', customer: 'Kwame Appiah', type: 'Scheduled Ride', status: 'Upcoming', date: '2025-05-20', amount: '$45.00' },
        { id: 'XT-12347', customer: 'Esi Koomson', type: 'Instant Ride', status: 'Completed', date: '2025-05-01', amount: '$12.50' },
    ];

    const filtered = filter === 'All' ? bookings : bookings.filter(b => b.type.includes(filter));

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Booking Management</h3>
                    <div className="flex gap-2">
                        {['All', 'Instant', 'Scheduled', 'Rental'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-none border transition-all ${filter === f ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200 hover:border-primary hover:text-primary'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(booking => (
                                <tr key={booking.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-4 font-mono text-xs">{booking.id}</td>
                                    <td className="p-4 font-bold text-gray-800">{booking.customer}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-none border ${
                                            booking.type.includes('Instant') ? 'border-primary text-primary' :
                                            booking.type.includes('Scheduled') ? 'border-blue-500 text-blue-500' :
                                            'border-accent text-accent'
                                        }`}>
                                            {booking.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-xs font-bold">{booking.status}</td>
                                    <td className="p-4 text-xs text-gray-500">{booking.date}</td>
                                    <td className="p-4 font-bold text-gray-900">{booking.amount}</td>
                                    <td className="p-4 space-x-2">
                                        <button className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">View</button>
                                        <button className="text-[10px] font-black text-red-600 hover:underline uppercase tracking-widest">Cancel</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

