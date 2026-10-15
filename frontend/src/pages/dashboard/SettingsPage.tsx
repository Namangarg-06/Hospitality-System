import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building,
  Clock,
  Percent,
  Users,
  Shield,
  Save,
  CheckCircle2,
  RefreshCw,
  Plus,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Workspace, RestaurantSettings } from '../../types';

export const SettingsPage: React.FC = () => {
  const { workspace, refreshWorkspace, role } = useAuth();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxRate, setTaxRate] = useState(5.0);
  const [serviceCharge, setServiceCharge] = useState(0.0);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  // Staff Members State
  const [members, setMembers] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    full_name: '',
    role: 'STAFF',
    temporary_password: 'DineAI@2026',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setAddress(workspace.address || '');
      setCity(workspace.city || '');
      setPhone(workspace.phone || '');
      setEmail(workspace.email || '');
      if (workspace.settings) {
        setTaxRate(workspace.settings.tax_rate_percent ?? 5.0);
        setServiceCharge(workspace.settings.service_charge_percent ?? 0.0);
        setOrderingEnabled(workspace.settings.ordering_enabled ?? true);
        setDemoMode(workspace.settings.demo_mode ?? false);
      }
    }
  }, [workspace]);

  const loadMembers = async () => {
    try {
      const data = await api.getMembers();
      setMembers(data);
    } catch (e) {
      // not owner/manager or error
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateWorkspace({
        name,
        address,
        city,
        phone,
        email,
      });
      await api.updateSettings({
        tax_rate_percent: taxRate,
        service_charge_percent: serviceCharge,
        ordering_enabled: orderingEnabled,
        demo_mode: demoMode,
      });
      await refreshWorkspace();
      setSuccessMsg('Restaurant configuration updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.inviteMember(inviteForm);
      alert(`Staff member invited! Temporary password: ${inviteForm.temporary_password}`);
      setShowInviteModal(false);
      setInviteForm({ email: '', full_name: '', role: 'STAFF', temporary_password: 'DineAI@2026' });
      loadMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to invite member');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
          Workspace Settings & Operating Profile
        </h2>
        <p className="text-sm text-[#737B73] mt-0.5">
          Manage hospitality profile, dining tax rates, staff access hierarchies, and simulation environments.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* Section 1: Venue Information */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle space-y-4">
          <h3 className="font-serif text-base font-bold text-[#173D32] flex items-center">
            <Building className="w-4 h-4 mr-2 text-[#C6A66A]" />
            Restaurant Identity & Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                Venue Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Taxes & Ordering Settings */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle space-y-4">
          <h3 className="font-serif text-base font-bold text-[#173D32] flex items-center">
            <Percent className="w-4 h-4 mr-2 text-[#C6A66A]" />
            Ordering Parameters & Tax Calculations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                GST / Applicable Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                Service Charge (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={serviceCharge}
                onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <label className="flex items-center space-x-3 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={orderingEnabled}
                onChange={(e) => setOrderingEnabled(e.target.checked)}
                className="rounded text-[#173D32] focus:ring-[#173D32] w-4 h-4"
              />
              <span>Accept Live Orders from Customer QR Digital Menu</span>
            </label>

            <label className="flex items-center space-x-3 text-xs font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => setDemoMode(e.target.checked)}
                className="rounded text-[#173D32] focus:ring-[#173D32] w-4 h-4"
              />
              <span>Enable Synthetic Demo Mode (Label all records transparently)</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#173D32] hover:bg-[#102C25] text-white text-xs font-semibold flex items-center shadow-luxury transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving Configurations...' : 'Save Workspace Configurations'}
          </button>
        </div>
      </form>

      {/* Section 3: Staff Management & RBAC */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-[#173D32] flex items-center">
            <Users className="w-4 h-4 mr-2 text-[#C6A66A]" />
            Staff Roles & Access Permissions
          </h3>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FAF6ED] border border-[#DCB980] text-[#173D32] hover:bg-[#F4ECD8] flex items-center"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-[#C6A66A]" />
            Invite Staff
          </button>
        </div>

        <p className="text-xs text-[#737B73]">
          Staff roles (Owner, Manager, Staff) enforce strict backend access controls across menus, orders, reviews, and analytics.
        </p>

        <div className="overflow-x-auto border border-[#E7E4DC] rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F6F0] text-[#737B73] uppercase font-semibold">
              <tr>
                <th className="p-3">Staff Name</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E4DC]">
              {members.map((m) => (
                <tr key={m.membership_id}>
                  <td className="p-3 font-semibold text-[#173D32]">{m.full_name}</td>
                  <td className="p-3 text-[#737B73]">{m.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E4ECE7] text-[#173D32]">
                      {m.role}
                    </span>
                  </td>
                  <td className="p-3 text-[#737B73]">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INVITE STAFF */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-[#E7E4DC] shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#173D32]">Invite Restaurant Staff Member</h3>
            <form onSubmit={handleInviteStaff} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="staff@restaurant.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">Role Permission</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                >
                  <option value="STAFF">Floor / Kitchen Staff (Orders Only)</option>
                  <option value="MANAGER">Restaurant Manager (Full Operations)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={inviteForm.temporary_password}
                  onChange={(e) => setInviteForm({ ...inviteForm, temporary_password: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-[#E7E4DC]">
                <button type="button" onClick={() => setShowInviteModal(false)} className="px-3 py-1.5 text-xs rounded border">Cancel</button>
                <button type="submit" className="px-4 py-1.5 text-xs rounded bg-[#173D32] text-white font-semibold">Grant Workspace Access</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
