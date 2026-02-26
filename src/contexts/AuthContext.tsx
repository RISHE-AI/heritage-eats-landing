import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { signupCustomer, loginCustomer, googleLoginCustomer, getProfile, updateProfile as apiUpdateProfile } from "@/services/api";

export interface User {
  id: string;
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  signup: (name: string, phone: string, password: string, email?: string) => Promise<boolean>;
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

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "homemade_delights_user";
const CUSTOMER_DETAILS_KEY = "homemade_delights_customer_details";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedCustomerDetails, setSavedCustomerDetails] = useState<CustomerDetails | null>(null);

  // Load user from localStorage on mount and validate token
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem(AUTH_USER_KEY);

      if (token && savedUser) {
        try {
          const result = await getProfile();
          if (result.success && result.data) {
            const userData: User = {
              id: result.data._id,
              _id: result.data._id,
              name: result.data.name,
              phone: result.data.phone,
              email: result.data.email,
              address: result.data.address,
              totalOrders: result.data.totalOrders,
              totalSpent: result.data.totalSpent,
              createdAt: result.data.createdAt,
              updatedAt: result.data.updatedAt
            };
            setUser(userData);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
          } else {
            // Token invalid, clear
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
          }
        } catch {
          // Token expired or invalid, use cached data
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      }

      const savedDetails = localStorage.getItem(CUSTOMER_DETAILS_KEY);
      if (savedDetails) {
        setSavedCustomerDetails(JSON.parse(savedDetails));
      }

      setIsLoading(false);
    };

    init();
  }, []);

  const signup = useCallback(async (name: string, phone: string, password: string, email?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signupCustomer(name, phone, password, email);

      if (result.success) {
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        const userData: User = {
          id: result.data._id,
          _id: result.data._id,
          name: result.data.name,
          phone: result.data.phone,
          email: result.data.email || '',
          address: result.data.address || '',
          totalOrders: result.data.totalOrders || 0,
          totalSpent: result.data.totalSpent || 0,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt
        };
        setUser(userData);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        toast.success("Account created successfully! / கணக்கு வெற்றிகரமாக உருவாக்கப்பட்டது!");
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      setIsLoading(false);
      return false;
    }
  }, []);

  const login = useCallback(async (phone: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await loginCustomer(phone, password);

      if (result.success) {
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        const userData: User = {
          id: result.data._id,
          _id: result.data._id,
          name: result.data.name,
          phone: result.data.phone,
          email: result.data.email || '',
          address: result.data.address || '',
          totalOrders: result.data.totalOrders || 0,
          totalSpent: result.data.totalSpent || 0,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt
        };
        setUser(userData);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        toast.success(`Welcome back, ${userData.name}! / மீண்டும் வருக!`);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      setIsLoading(false);
      return false;
    }
  }, []);

  const googleLogin = useCallback(async (credential: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await googleLoginCustomer(credential);

      if (result.success) {
        localStorage.setItem(AUTH_TOKEN_KEY, result.token);
        const userData: User = {
          id: result.data._id,
          _id: result.data._id,
          name: result.data.name,
          phone: result.data.phone || '',
          email: result.data.email || '',
          address: result.data.address || '',
          totalOrders: result.data.totalOrders || 0,
          totalSpent: result.data.totalSpent || 0,
          createdAt: result.data.createdAt,
          updatedAt: result.data.updatedAt
        };
        setUser(userData);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        toast.success(`Welcome, ${userData.name}! / வருக!`);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error: any) {
      toast.error(error.message || "Google sign-in failed");
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    toast.info("Logged out successfully / வெற்றிகரமாக வெளியேறினீர்கள்");
  }, []);

  const updateUserProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      const result = await apiUpdateProfile(updates);

      if (result.success) {
        const updatedUser: User = {
          ...user,
          ...result.data,
          id: result.data._id,
          _id: result.data._id
        };
        setUser(updatedUser);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser));
        toast.success("Profile updated successfully! / சுயவிவரம் புதுப்பிக்கப்பட்டது!");
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
      return false;
    }
  }, [user]);

  const saveCustomerDetails = useCallback((details: CustomerDetails) => {
    setSavedCustomerDetails(details);
    localStorage.setItem(CUSTOMER_DETAILS_KEY, JSON.stringify(details));

    if (user) {
      updateUserProfile({
        name: details.name,
        phone: details.phone,
        email: details.email,
        address: details.address
      });
    }
  }, [user, updateUserProfile]);

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
        googleLogin,
        signup,
        logout,
        updateProfile: updateUserProfile,
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
