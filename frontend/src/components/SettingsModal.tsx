import { useState, useEffect } from 'react';
import { X, User, Settings, Users, Upload, Moon, Sun, AlertTriangle, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

type TabType = 'account' | 'settings' | 'teamspace';

// ==================== Types ====================

interface AccountSettings {
  id: string;
  email: string;
  name: string;
  preferredName: string;
  avatar: string;
}

interface UserPreferences {
  id: string;
  userId: string;
  theme: string;
  language: string;
  spellcheckerLanguages: string;
  timezone: string;
  use24HourFormat: boolean;
}

interface WorkspaceSettings {
  id: string;
  userId: string;
  workspaceName: string;
  workspaceIcon: string;
  customLandingPageJson: string;
  allowPublicAccess: boolean;
  enableNotifications: boolean;
  enableEmailNotifications: boolean;
}

interface Teamspace {
  id: string;
  name: string;
  description: string;
  owners: string;
  accessLevel: string;
  memberIds: string;
  updatedAt: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'zh', label: 'Chinese' },
];

const TIMEZONES = [
  'UTC',
  'EST',
  'CST',
  'MST',
  'PST',
  'GMT',
  'CET',
  'IST',
  'JST',
  'AEST',
];

const API_BASE = 'http://localhost:8080/api';

export function SettingsModal({ isOpen, onClose, userId }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [loading, setLoading] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Account state
  const [accountSettings, setAccountSettings] = useState<AccountSettings | null>(null);
  const [preferredName, setPreferredName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preferences state
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('en');
  const [spellcheckerLanguages, setSpellcheckerLanguages] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  // Workspace state
  const [workspaceSettings, setWorkspaceSettings] = useState<WorkspaceSettings | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceIcon, setWorkspaceIcon] = useState('📓');

  // Teamspace state
  const [teamspaces, setTeamspaces] = useState<Teamspace[]>([]);

  // ==================== API Calls ====================

  const fetchAccountSettings = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/settings/account/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setAccountSettings(data);
        setPreferredName(data.preferredName || '');
      }
    } catch (error) {
      toast.error('Failed to load account settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE}/settings/preferences/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
        setTheme(data.theme);
        setLanguage(data.language);
        setSpellcheckerLanguages(data.spellcheckerLanguages);
        setTimezone(data.timezone);
      }
    } catch (error) {
      toast.error('Failed to load preferences');
    }
  };

  const fetchWorkspaceSettings = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_BASE}/settings/workspace/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setWorkspaceSettings(data);
        setWorkspaceName(data.workspaceName);
        setWorkspaceIcon(data.workspaceIcon);
      }
    } catch (error) {
      toast.error('Failed to load workspace settings');
    }
  };

  const fetchTeamspaces = async () => {
    try {
      const response = await fetch(`${API_BASE}/settings/teamspaces`);
      if (response.ok) {
        const data = await response.json();
        setTeamspaces(data);
      }
    } catch (error) {
      toast.error('Failed to load teamspaces');
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (!isOpen) return;

    if (activeTab === 'account') {
      fetchAccountSettings();
    } else if (activeTab === 'settings') {
      fetchPreferences();
      fetchWorkspaceSettings();
    } else if (activeTab === 'teamspace') {
      fetchTeamspaces();
    }
  }, [activeTab, isOpen]);

  // ==================== Handlers ====================

  const handleSaveAccount = async () => {
    if (!userId || !accountSettings) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/settings/account/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferredName: preferredName || accountSettings.name,
          email: accountSettings.email,
          avatar: accountSettings.avatar,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setAccountSettings(updated);
        toast.success('Account settings saved');
      } else {
        toast.error('Failed to save account settings');
      }
    } catch (error) {
      toast.error('Error saving account settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!userId || !preferences) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/settings/preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme,
          language,
          spellcheckerLanguages,
          timezone,
          use24HourFormat: false,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setPreferences(updated);
        toast.success('Preferences saved');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      toast.error('Error saving preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkspace = async () => {
    if (!userId || !workspaceSettings) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/settings/workspace/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceName,
          workspaceIcon,
          customLandingPageJson: workspaceSettings.customLandingPageJson,
          allowPublicAccess: workspaceSettings.allowPublicAccess,
          enableNotifications: workspaceSettings.enableNotifications,
          enableEmailNotifications: workspaceSettings.enableEmailNotifications,
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setWorkspaceSettings(updated);
        toast.success('Workspace settings saved');
      } else {
        toast.error('Failed to save workspace settings');
      }
    } catch (error) {
      toast.error('Error saving workspace settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = () => {
    toast.info('Photo upload feature coming soon');
  };

  const tabs = [
    { id: 'account' as TabType, label: 'My Account', icon: User },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'teamspace' as TabType, label: 'Teamspace Settings', icon: Users },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-50 bg-white dark:bg-[#1F1F1F] rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-56 flex flex-col bg-[#F7F7F5] dark:bg-[#2B2B2B]">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-[#37352F] dark:text-white">
              Settings
            </h2>
          </div>
          <nav className="flex-1 p-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-[#37352F] dark:text-white ${
                    isActive ? 'bg-gray-300 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#1F1F1F]">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-semibold text-[#37352F] dark:text-white">
              {activeTab === 'account' && 'My Account'}
              {activeTab === 'settings' && 'Settings & Preferences'}
              {activeTab === 'teamspace' && 'Teamspace Settings'}
            </h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-[#37352F] dark:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {loading && (
              <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin" size={32} />
              </div>
            )}

            {/* My Account Tab */}
            {activeTab === 'account' && !loading && (
              <div className="space-y-8 max-w-2xl">
                {/* Account Settings Header */}
                <div>
                  <h2 className="text-lg font-semibold text-[#37352F] dark:text-white mb-4">
                    Account
                  </h2>

                  {/* Preferred Name */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-[#37352F] dark:text-white">
                      Preferred Name
                    </label>
                    <input
                      type="text"
                      value={preferredName}
                      onChange={(e) => setPreferredName(e.target.value)}
                      placeholder="Enter your preferred name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-[#2B2B2B] text-[#37352F] dark:text-white"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This is how your name will appear to other users
                    </p>
                  </div>

                  <button
                    onClick={handleSaveAccount}
                    disabled={loading}
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-sm rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>

                {/* Account Security */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-[#37352F] dark:text-white mb-4">
                    Account Security
                  </h2>

                  {/* Email */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-[#37352F] dark:text-white">
                      Email
                    </label>
                    <input
                      type="email"
                      value={accountSettings?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-gray-100 dark:bg-[#2B2B2B] text-[#37352F] dark:text-white opacity-75 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Your email address cannot be changed through settings. Contact support if needed.
                    </p>
                  </div>

                  {/* Password */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-[#37352F] dark:text-white">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-[#2B2B2B] text-[#37352F] dark:text-white"
                    />
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-[#37352F] dark:text-white">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-[#2B2B2B] text-[#37352F] dark:text-white"
                    />
                  </div>

                  <button
                    disabled={!password || password !== confirmPassword}
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-sm rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && !loading && (
              <div className="space-y-8 max-w-2xl">
                {/* Workspace Settings */}
                <div>
                  <h2 className="text-lg font-semibold text-[#37352F] dark:text-white mb-4">
                    Workspace Settings
                  </h2>

                  {/* Workspace Name */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-[#37352F] dark:text-white">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-[#2B2B2B] text-[#37352F] dark:text-white"
                    />
                  </div>

                  {/* Icon */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-[#37352F] dark:text-white">
                      Icon
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Upload an image or pick an emoji. It will show up in your sidebar and notifications.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-md border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-[#2B2B2B] text-2xl">
                        {workspaceIcon}
                      </div>
                      <button
                        onClick={handlePhotoUpload}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-[#37352F] dark:text-white"
                      >
                        <Upload size={14} className="inline mr-2" />
                        Upload or pick emoji
                      </button>
                    </div>
                  </div>

                  {/* Custom Landing Page */}
                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-[#37352F] dark:text-white">
                      Custom Landing Page
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      When a new workspace member joins, a copy of this page will automatically be installed in their Private section.
                    </p>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-[#37352F] dark:text-white">
                      Configure Landing Page
                    </button>
                  </div>

                  <button
                    onClick={handleSaveWorkspace}
                    disabled={loading}
                    className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-sm rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Save Changes
                  </button>
                </div>

                {/* Preferences */}
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-[#37352F] dark:text-white mb-4">
                    Preferences
                  </h2>

                  {/* Appearance */}
                  <div className="space-y-4 mb-6">
                    <label className="block text-sm font-medium text-[#37352F] dark:text-white">
                      Appearance
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Customize how Lifeflow looks on your device.
                    </p>
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                      <div className="flex items-center gap-3">
                        {isDark ? <Moon size={18} /> : <Sun size={18} />}
                        <span className="text-sm text-[#37352F] dark:text-white">
                          {isDark ? 'Dark Mode' : 'Light Mode'}
                        </span>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          isDark ? 'bg-gray-700' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform ${
                            isDark ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Language & Time */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-[#37352F] dark:text-white">
                      Language & Time
                    </h3>

                    {/* Language */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                        Language
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Change the language used in the user interface.
                      </p>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-[#2B2B2B] text-[#37352F] dark:text-white"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Timezone */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-[#2B2B2B] text-[#37352F] dark:text-white"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Spellchecker Languages */}
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
                        Spellchecker Languages
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Change the languages used by the spellchecker.
                      </p>
                      <select
                        value={spellcheckerLanguages}
                        onChange={(e) => setSpellcheckerLanguages(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-[#2B2B2B] text-[#37352F] dark:text-white"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={handleSavePreferences}
                      disabled={loading}
                      className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black text-sm rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Teamspace Settings Tab */}
            {activeTab === 'teamspace' && !loading && (
              <div className="space-y-6 max-w-4xl">
                <div>
                  <h2 className="text-lg font-semibold text-[#37352F] dark:text-white mb-2">
                    Manage Teamspaces
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Manage all teamspaces you have access to here
                  </p>
                </div>

                {/* Teamspaces Table */}
                {teamspaces.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="px-4 py-3 text-left font-medium text-[#37352F] dark:text-white">
                            Teamspace
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-[#37352F] dark:text-white">
                            Owners
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-[#37352F] dark:text-white">
                            Access
                          </th>
                          <th className="px-4 py-3 text-left font-medium text-[#37352F] dark:text-white">
                            Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamspaces.map((teamspace, index) => (
                          <tr
                            key={teamspace.id}
                            className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 ${
                              index === teamspaces.length - 1 ? 'border-b-0' : ''
                            }`}
                          >
                            <td className="px-4 py-4 text-[#37352F] dark:text-white font-medium">
                              {teamspace.name}
                            </td>
                            <td className="px-4 py-4 text-[#37352F] dark:text-white">
                              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {teamspace.owners}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`text-xs px-3 py-1 rounded-full ${
                                  teamspace.accessLevel === 'public'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {teamspace.accessLevel}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-gray-500 dark:text-gray-400 text-xs">
                              {new Date(teamspace.updatedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No teamspaces found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

