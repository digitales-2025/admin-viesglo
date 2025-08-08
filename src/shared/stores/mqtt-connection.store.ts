/**
 * MQTT Connection Store using Zustand
 * Manages global MQTT connection state with proper state transitions and error handling
 */

import type { MqttClient } from "mqtt";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { ConnectionStatus, MqttStore } from "../types/mqtt.types";
import { formatMqttError, isValidStateTransition } from "./mqtt-connection.utils";

// import { getMqttErrorHandler } from '../utils/mqtt-error-handler';

/**
 * Zustand store for MQTT connection state management
 * Provides global access to connection status, client instance, and error state
 * Includes proper state transitions and error handling as per requirements 1.4, 1.5, 2.1
 */
export const useMqttConnectionStore = create<MqttStore>()(
  devtools(
    (set, get) => ({
      // State
      status: "disconnected",
      client: null,
      error: null,
      lastConnected: null,
      reconnectAttempts: 0,
      lastReconnectAttempt: null,
      nextReconnectDelay: 1000,
      isNetworkOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      tokenExpired: false,

      // Actions
      setStatus: (status: ConnectionStatus) => {
        const currentState = get();

        console.log(`📊 MQTT Store - setStatus called:`, {
          currentStatus: currentState.status,
          targetStatus: status,
          timestamp: new Date().toISOString(),
        });

        // Validate state transition
        if (!isValidStateTransition(currentState.status, status)) {
          console.warn(
            formatMqttError("State Transition", `Invalid transition from ${currentState.status} to ${status}`, {
              currentStatus: currentState.status,
              targetStatus: status,
            })
          );
          return;
        }

        // Log state transitions for debugging
        console.log(`🔄 MQTT Store - State Transition: ${currentState.status} -> ${status}`);

        set(
          (state) => ({
            ...state,
            status,
            lastConnected: status === "connected" ? new Date() : state.lastConnected,
            // Clear error when successfully connected
            error: status === "connected" ? null : state.error,
            // Reset reconnect attempts and related state on successful connection
            reconnectAttempts: status === "connected" ? 0 : state.reconnectAttempts,
            lastReconnectAttempt: status === "connected" ? null : state.lastReconnectAttempt,
            nextReconnectDelay: status === "connected" ? 1000 : state.nextReconnectDelay,
            tokenExpired: status === "connected" ? false : state.tokenExpired,
          }),
          false,
          "setStatus"
        );

        console.log(`✅ MQTT Store - Status updated to: ${status}`);
      },

      setClient: (client: MqttClient | null) =>
        set(
          (state) => ({
            ...state,
            client,
            // Update status based on client state
            status: client ? (state.status === "disconnected" ? "connecting" : state.status) : "disconnected",
          }),
          false,
          "setClient"
        ),

      setError: (error: string | null) => {
        // Log error state changes for monitoring
        if (error) {
          console.error("MQTT Connection Store Error:", {
            error,
            timestamp: new Date().toISOString(),
            currentStatus: get().status,
          });
        }

        set(
          (state) => ({
            ...state,
            error,
            // Set status to error if error is provided and not already in error state
            status: error && state.status !== "error" ? "error" : state.status,
          }),
          false,
          "setError"
        );
      },

      incrementReconnectAttempts: () =>
        set(
          (state) => ({
            ...state,
            reconnectAttempts: state.reconnectAttempts + 1,
            lastReconnectAttempt: new Date(),
            status: "reconnecting",
          }),
          false,
          "incrementReconnectAttempts"
        ),

      resetReconnectAttempts: () =>
        set(
          (state) => ({
            ...state,
            reconnectAttempts: 0,
            lastReconnectAttempt: null,
            nextReconnectDelay: 1000,
          }),
          false,
          "resetReconnectAttempts"
        ),

      setLastReconnectAttempt: (date: Date | null) =>
        set(
          (state) => ({
            ...state,
            lastReconnectAttempt: date,
          }),
          false,
          "setLastReconnectAttempt"
        ),

      setNextReconnectDelay: (delay: number) =>
        set(
          (state) => ({
            ...state,
            nextReconnectDelay: delay,
          }),
          false,
          "setNextReconnectDelay"
        ),

      setNetworkOnline: (online: boolean) =>
        set(
          (state) => ({
            ...state,
            isNetworkOnline: online,
          }),
          false,
          "setNetworkOnline"
        ),

      setTokenExpired: (expired: boolean) =>
        set(
          (state) => ({
            ...state,
            tokenExpired: expired,
          }),
          false,
          "setTokenExpired"
        ),
    }),
    {
      name: "mqtt-connection-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

/**
 * Selector hooks for specific state slices to optimize re-renders
 */
export const useMqttConnectionStatus = () => useMqttConnectionStore((state) => state.status);

export const useMqttClient = () => useMqttConnectionStore((state) => state.client);

export const useMqttConnectionError = () => useMqttConnectionStore((state) => state.error);

export const useMqttReconnectAttempts = () => useMqttConnectionStore((state) => state.reconnectAttempts);

export const useMqttLastConnected = () => useMqttConnectionStore((state) => state.lastConnected);

/**
 * Computed selectors for derived state
 */
export const useIsMqttConnected = () => useMqttConnectionStore((state) => state.status === "connected");

export const useIsMqttConnecting = () =>
  useMqttConnectionStore((state) => state.status === "connecting" || state.status === "reconnecting");

export const useMqttHasError = () =>
  useMqttConnectionStore((state) => state.status === "error" || state.error !== null);

export const useMqttLastReconnectAttempt = () => useMqttConnectionStore((state) => state.lastReconnectAttempt);

export const useMqttNextReconnectDelay = () => useMqttConnectionStore((state) => state.nextReconnectDelay);

export const useMqttNetworkOnline = () => useMqttConnectionStore((state) => state.isNetworkOnline);

export const useMqttTokenExpired = () => useMqttConnectionStore((state) => state.tokenExpired);
