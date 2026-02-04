import { useState, useEffect } from 'react';
import {
  ref,
  set,
  update,
  onValue,
  off,
  get
} from 'firebase/database';
import { database } from '../firebase';
import { User } from '../types';

export function useFirebaseTeamMembers(isAdmin?: boolean) {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load team members from Firebase
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const membersRef = ref(database, 'teamMembers');

      // Listen to real-time changes
      const unsubscribe = onValue(
        membersRef,
        (snapshot) => {
          try {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const membersArray: User[] = Object.entries(data).map(
                ([id, memberData]: [string, any]) => ({
                  id: memberData.id || id,
                  ...memberData
                })
              );
              setTeamMembers(membersArray);
            } else {
              setTeamMembers([]);
            }
            setError(null);
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error processing members';
            setError(errorMessage);
            console.error('Error processing members:', err);
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          const errorMessage = error.message || 'Failed to load team members';
          setError(errorMessage);
          console.error('Firebase error:', error);
          setIsLoading(false);
        }
      );

      return () => {
        unsubscribe();
        if (membersRef) {
          off(membersRef);
        }
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error setting up members listener';
      setError(errorMessage);
      console.error('Setup error:', err);
      setIsLoading(false);
    }
  }, []);

  // Add a new team member (admin only)
  const addTeamMember = async (member: User) => {
    if (!isAdmin) {
      setError('Only admins can add team members');
      return;
    }

    try {
      setError(null);
      const memberRef = ref(database, `teamMembers/${member.id}`);
      
      const memberData = {
        ...member,
        createdAt: new Date().toISOString()
      };

      await set(memberRef, memberData);
      return member;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add team member';
      setError(errorMessage);
      console.error('Add member error:', err);
      throw err;
    }
  };

  // Update team member (admin only)
  const updateTeamMember = async (memberId: string, updates: Partial<User>) => {
    if (!isAdmin) {
      setError('Only admins can update team members');
      return;
    }

    try {
      setError(null);
      const memberRef = ref(database, `teamMembers/${memberId}`);
      
      await update(memberRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update team member';
      setError(errorMessage);
      console.error('Update member error:', err);
      throw err;
    }
  };

  // Get a single team member
  const getTeamMember = async (memberId: string): Promise<User | null> => {
    try {
      setError(null);
      const memberRef = ref(database, `teamMembers/${memberId}`);
      const snapshot = await get(memberRef);

      if (snapshot.exists()) {
        return snapshot.val() as User;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get team member';
      setError(errorMessage);
      console.error('Get member error:', err);
      return null;
    }
  };

  // Delete team member (admin only)
  const deleteTeamMember = async (memberId: string) => {
    if (!isAdmin) {
      setError('Only admins can delete team members');
      return;
    }

    try {
      setError(null);
      const memberRef = ref(database, `teamMembers/${memberId}`);
      await set(memberRef, null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete team member';
      setError(errorMessage);
      console.error('Delete member error:', err);
      throw err;
    }
  };

  // Update user profile
  const updateUserProfile = async (userId: string, updates: Partial<User>) => {
    try {
      setError(null);
      const userRef = ref(database, `users/${userId}/profile`);
      
      await update(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      console.error('Update profile error:', err);
      throw err;
    }
  };

  return {
    teamMembers,
    isLoading,
    error,
    addTeamMember,
    updateTeamMember,
    getTeamMember,
    deleteTeamMember,
    updateUserProfile
  };
}
