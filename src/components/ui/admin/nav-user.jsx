"use client";

import React from 'react';
import { LogOut } from 'lucide-react';

export function NavUser({ user }) {
    // Diasumsikan `user` adalah prop yang berisi { name, email, avatar }
    if (!user) return null;

    return (
        <div className="flex items-center justify-between p-2.5 bg-gray-100 rounded-lg dark:bg-gray-800">
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                <img className="object-cover w-8 h-8 rounded-full" src={user.avatar} alt="User Avatar" />
                <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
            </div>
            <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <LogOut className="w-5 h-5 text-gray-500 dark:text-gray-400"/>
            </button>
        </div>
    );
};
