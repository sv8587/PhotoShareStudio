import React, { useState, useEffect } from 'react';
import { X, UserPlus, UserCheck, Trash2, Shield, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { EventItem, User } from '../types';

interface TeamManagementModalProps {
  event: EventItem;
  currentUser: User;
  onClose: () => void;
  onEventUpdated: (updated: EventItem) => void;
}

export const TeamManagementModal: React.FC<TeamManagementModalProps> = ({
  event,
  currentUser,
  onClose,
  onEventUpdated,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users/team-members', {
        headers: { Authorization: `Bearer ${currentUser.id}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAllUsers(data.teamMembers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    setAssigning(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign team member.');

      onEventUpdated(data.event);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    setAssigning(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${event.id}/team/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${currentUser.id}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove team member.');

      onEventUpdated(data.event);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const assignedMembers = allUsers.filter(u => event.assignedTeamMemberIds.includes(u.id));
  const availableMembers = allUsers.filter(u => !event.assignedTeamMemberIds.includes(u.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h3 className="font-bold text-neutral-900 text-base">Assign Team Photographers</h3>
            <p className="text-xs text-neutral-500">Requirement 2.1 — Event Collaboration Team</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Currently Assigned */}
          <div>
            <label className="font-bold text-neutral-800 uppercase tracking-wider text-[11px] block mb-2">
              Currently Assigned Photographers ({assignedMembers.length})
            </label>

            {assignedMembers.length === 0 ? (
              <p className="text-neutral-400 italic py-2">No photographers assigned to this event yet.</p>
            ) : (
              <div className="space-y-2">
                {assignedMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{member.name}</p>
                        <p className="text-[11px] text-neutral-500">{member.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={assigning}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition"
                      title="Remove from event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available to Assign */}
          <div className="pt-2 border-t border-neutral-200">
            <label className="font-bold text-neutral-800 uppercase tracking-wider text-[11px] block mb-2">
              Available Team Members
            </label>

            {availableMembers.length === 0 ? (
              <p className="text-neutral-400 italic py-2">All team members are already assigned.</p>
            ) : (
              <div className="space-y-2">
                {availableMembers.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{member.name}</p>
                        <p className="text-[11px] text-neutral-500">{member.role === 'admin' ? 'Lead Admin' : 'Photographer'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(member.id)}
                      disabled={assigning}
                      className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-semibold text-[11px] transition shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-xl font-bold text-xs hover:bg-neutral-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
