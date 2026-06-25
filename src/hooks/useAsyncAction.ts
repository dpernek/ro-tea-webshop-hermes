"use client";
import { useState, useCallback } from "react";

interface AsyncState {
  loading: boolean;
  error: string;
  success: string;
}

export function useAsyncAction() {
  const [state, setState] = useState<AsyncState>({ loading: false, error: "", success: "" });

  const run = useCallback(async (fn: () => Promise<any>, opts?: { successMsg?: string; errorMsg?: string }) => {
    setState({ loading: true, error: "", success: "" });
    try {
      await fn();
      setState({ loading: false, error: "", success: opts?.successMsg || "Uspješno." });
    } catch (e: any) {
      setState({ loading: false, error: opts?.errorMsg || e.message || "Došlo je do greške.", success: "" });
      throw e; // rethrow so caller can handle
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: "", success: "" });
  }, []);

  return { ...state, run, reset, setError: (msg: string) => setState(s => ({ ...s, error: msg, success: "" })) };
}
