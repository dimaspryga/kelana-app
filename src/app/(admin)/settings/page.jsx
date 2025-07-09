"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Save,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Mail,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: true,
    },
    appearance: {
      theme: 'light',
      compact: false,
    },
    privacy: {
      profileVisibility: 'public',
      activityStatus: true,
    },
    system: {
      autoSave: true,
      analytics: true,
    }
  });

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="w-full px-6 py-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Settings</h2>
            <p className="text-slate-600 mt-1">Manage your account preferences and system settings</p>
          </div>
          <Button 
            onClick={handleSave}
            className="bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-sm"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications */}
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-blue-600" />
                Notifications
              </CardTitle>
              <CardDescription className="text-slate-600">
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Email Notifications</Label>
                      <p className="text-xs text-slate-500">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={() => handleToggle('notifications', 'email')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Push Notifications</Label>
                      <p className="text-xs text-slate-500">Receive browser notifications</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={() => handleToggle('notifications', 'push')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm font-medium text-slate-700">SMS Notifications</Label>
                      <p className="text-xs text-slate-500">Receive updates via SMS</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={() => handleToggle('notifications', 'sms')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900 flex items-center">
                <Palette className="w-5 h-5 mr-2 text-blue-600" />
                Appearance
              </CardTitle>
              <CardDescription className="text-slate-600">
                Customize the look and feel of your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {settings.appearance.theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-slate-400" />
                    ) : (
                      <Sun className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Dark Mode</Label>
                      <p className="text-xs text-slate-500">Switch between light and dark themes</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.appearance.theme === 'dark'}
                    onCheckedChange={() => setSettings(prev => ({
                      ...prev,
                      appearance: {
                        ...prev.appearance,
                        theme: prev.appearance.theme === 'dark' ? 'light' : 'dark'
                      }
                    }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Compact Layout</Label>
                      <p className="text-xs text-slate-500">Use a more compact interface</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.appearance.compact}
                    onCheckedChange={() => handleToggle('appearance', 'compact')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                Privacy & Security
              </CardTitle>
              <CardDescription className="text-slate-600">
                Control your privacy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">Profile Visibility</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={`rounded-full px-3 py-1 text-xs font-medium ${
                      settings.privacy.profileVisibility === 'public' 
                        ? "bg-green-100 text-green-900 border border-green-200" 
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}>
                      {settings.privacy.profileVisibility === 'public' ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Activity Status</Label>
                      <p className="text-xs text-slate-500">Show when you're online</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.privacy.activityStatus}
                    onCheckedChange={() => handleToggle('privacy', 'activityStatus')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System */}
          <Card className="border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-white border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-blue-900 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                System Settings
              </CardTitle>
              <CardDescription className="text-slate-600">
                Manage system preferences and data
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Save className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Auto Save</Label>
                      <p className="text-xs text-slate-500">Automatically save your changes</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.system.autoSave}
                    onCheckedChange={() => handleToggle('system', 'autoSave')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Database className="w-4 h-4 text-slate-400" />
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Analytics</Label>
                      <p className="text-xs text-slate-500">Help improve the platform</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.system.analytics}
                    onCheckedChange={() => handleToggle('system', 'analytics')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 