
import React from 'react';
import { User } from '../types';
import { UserIcon } from './icons';

interface UserSwitcherProps {
  users: User[];
  currentUser: User;
  onUserChange: (userId: string) => void;
}

export const UserSwitcher: React.FC<UserSwitcherProps> = ({ users, currentUser, onUserChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow">
      <UserIcon className="h-5 w-5 text-slate-500" />
      <select
        value={currentUser.id}
        onChange={(e) => onUserChange(e.target.value)}
        className="bg-transparent font-medium focus:outline-none"
      >
        {users.map(user => (
          <option key={user.id} value={user.id}>{user.name}</option>
        ))}
      </select>
    </div>
  );
};
