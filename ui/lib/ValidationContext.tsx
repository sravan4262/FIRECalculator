"use client";
import { createContext, useContext } from "react";

export const ValidationContext = createContext<Record<string, string>>({});
export const useValidationErrors = () => useContext(ValidationContext);
