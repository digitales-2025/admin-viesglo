"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePrefetchQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { backend } from "@/lib/api/types/backend";
import { useAuthLoading } from "@/shared/hooks/use-auth-loading";
import { loginSchema, LoginSchemaDto } from "../_schemas/login.schema";
import { Credentials } from "../_types/login.types";

export const useLogin = () => {
  const router = useRouter();
  const { showLogin, hide } = useAuthLoading();
  const queryClient = useQueryClient();
  const form = useForm<LoginSchemaDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = backend.useMutation("post", "/v1/auth/signin", {
    onSuccess: () => {
      showLogin();
      // Prefetch/invalidar perfil para que el estado de autenticación se actualice inmediatamente
      const profileOpts = backend.queryOptions("get", "/v1/auth/me");
      // Invalidar errores anteriores y prefetch con cookies ya actualizadas
      try {
        queryClient.invalidateQueries({ queryKey: profileOpts.queryKey, exact: true });
        queryClient.prefetchQuery(profileOpts);
        // Intentar disparar reconexión MQTT inmediatamente si el provider ya está montado
        if (typeof window !== "undefined" && (window as any).__mqttReconnectAfterTokenRefresh) {
          (window as any).__mqttReconnectAfterTokenRefresh();
        }
      } catch {}
      router.replace("/");
    },
    onError: (error) => {
      hide();
      if (error && typeof error === "object" && "error" in error) {
        toast.error(error.error.userMessage);
      } else {
        toast.error("Ocurrió un error inesperado, por favor intenta de nuevo");
      }
    },
  });

  const onLogin: SubmitHandler<Credentials> = (credentials) => {
    mutation.mutate({
      body: credentials,
    });
  };

  return {
    form,
    onLogin,
    mutation,
  };
};

export const useLogout = () => {
  const router = useRouter();
  const { showLogout } = useAuthLoading();
  const mutation = backend.useMutation("post", "/v1/auth/signout", {
    onSuccess: () => {
      showLogout();
      router.replace("/auth/sign-in");
      toast.success("Sesión cerrada correctamente");
    },
  });

  const onLogout = () => {
    mutation.mutate({});
  };

  return {
    onLogout,
    mutation,
  };
};

export const useProfile = () => {
  const query = backend.useQuery("get", "/v1/auth/me", {
    enabled: false,
  });

  const isSuperAdmin = query.data?.role?.name === "GERENCIA" || false;
  return {
    ...query,
    isSuperAdmin,
  };
};

export const usePrefetchProfile = () => {
  usePrefetchQuery(backend.queryOptions("get", "/v1/auth/me"));
};
