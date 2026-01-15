import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, name?: string) => Promise<boolean>;
  signup: (name: string, phone: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  savedCustomerDetails: CustomerDetails | null;
  saveCustomerDetails: (details: CustomerDetails) => void;
  clearSavedDetails: () => void;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "homemade_delights_user";
const CUSTOMER_DETAILS_KEY = "homemade_delights_customer_details";
const USERS_STORAGE_KEY = "homemade_delights_users";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedCustomerDetails, setSavedCustomerDetails] = useState<CustomerDetails | null>(null);

  // Load user and saved details from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    const savedDetails = localStorage.getItem(CUSTOMER_DETAILS_KEY);
    if (savedDetails) {
      setSavedCustomerDetails(JSON.parse(savedDetails));
    }
    
    setIsLoading(false);
  }, []);

  // Persist user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  // Get all users from local storage (simulating database)
  const getUsers = (): User[] => {
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);
    return usersData ? JSON.parse(usersData) : [];
  };

  // Save users to local storage
  const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const signup = useCallback(async (name: string, phone: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const users = getUsers();
      
      // Check if phone already exists
      const existingUser = users.find(u => u.phone === phone);
      if (existingUser) {
        toast.error("Phone number already registered. Please login instead.");
        setIsLoading(false);
        return false;
      }

      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        name,
        phone,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);
      setUser(newUser);

      // Save to MongoDB via edge function
      try {
        await supabase.functions.invoke('mongodb', {
          body: {
            action: 'insertOne',
            collection: 'customers',
            data: newUser
          }
        });
      } catch (error) {
        console.log('MongoDB sync pending:', error);
      }

      toast.success("Account created successfully! / கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!");
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      toast.error("Failed to create account");
      setIsLoading(false);
      return false;
    }
  }, []);

  const login = useCallback(async (phone: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const users = getUsers();
      const existingUser = users.find(u => u.phone === phone);

      if (existingUser) {
        setUser(existingUser);
        toast.success(`Welcome back, ${existingUser.name}! / மீண்டும் வருக!`);
        setIsLoading(false);
        return true;
      } else if (name) {
        // Auto-register if name is provided
        return signup(name, phone);
      } else {
        toast.error("Account not found. Please sign up first.");
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed");
      setIsLoading(false);
      return false;
    }
  }, [signup]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast.info("Logged out successfully / வெற்றிகரமாக வெளியேறினீர்கள்");
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updatedUser: User = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Update in local users list
      const users = getUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        saveUsers(users);
      }

      setUser(updatedUser);

      // Sync to MongoDB
      try {
        await supabase.functions.invoke('mongodb', {
          body: {
            action: 'updateOne',
            collection: 'customers',
            filter: { id: user.id },
            data: updates
          }
        });
      } catch (error) {
        console.log('MongoDB sync pending:', error);
      }

      toast.success("Profile updated successfully! / சுயவிவரம் புதுப்பிக்கப்பட்டது!");
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error("Failed to update profile");
      return false;
    }
  }, [user]);

  const saveCustomerDetails = useCallback((details: CustomerDetails) => {
    setSavedCustomerDetails(details);
    localStorage.setItem(CUSTOMER_DETAILS_KEY, JSON.stringify(details));
    
    // Also update user profile if logged in
    if (user) {
      updateProfile({
        name: details.name,
        phone: details.phone,
        email: details.email,
        address: details.address
      });
    }
  }, [user, updateProfile]);

  const clearSavedDetails = useCallback(() => {
    setSavedCustomerDetails(null);
    localStorage.removeItem(CUSTOMER_DETAILS_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        savedCustomerDetails,
        saveCustomerDetails,
        clearSavedDetails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
