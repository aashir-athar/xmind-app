import { useState, useEffect } from "react";
import { useSearch } from "./useSearch";

export const useExistingUsernames = () => {
  const { allUsernames } = useSearch();
  const [existingUsernames, setExistingUsernames] = useState<string[]>([]);

  // Update existing usernames whenever allUsernames changes
  useEffect(() => {
    if (allUsernames && allUsernames.length > 0) {
      setExistingUsernames(allUsernames);
    }
  }, [allUsernames]);

  // Add a single username to the list
  const addUsername = (username: string) => {
    const normalizedUsername = username.toLowerCase();
    if (!existingUsernames.includes(normalizedUsername)) {
      setExistingUsernames(prev => [...prev, normalizedUsername]);
    }
  };

  // Remove a username from the list
  const removeUsername = (username: string) => {
    const normalizedUsername = username.toLowerCase();
    setExistingUsernames(prev => 
      prev.filter(u => u !== normalizedUsername)
    );
  };

  // Check if a username exists
  const isUsernameTaken = (username: string): boolean => {
    const normalizedUsername = username.toLowerCase();
    return existingUsernames.includes(normalizedUsername);
  };

  // Get all existing usernames
  const getAllUsernames = (): string[] => {
    return [...existingUsernames];
  };

  // Clear all usernames
  const clearUsernames = () => {
    setExistingUsernames([]);
  };

  return {
    existingUsernames,
    addUsername,
    removeUsername,
    isUsernameTaken,
    getAllUsernames,
    clearUsernames,
    isLoading: false, // Since this comes from posts data
  };
};
