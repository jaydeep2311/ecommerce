import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthActions } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useLogin = () => {
  const { login } = useAuthActions();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      login(data.data, data.token);
      queryClient.setQueryData(['auth', 'me'], { success: true, data: data.data });
      toast.success('Login successful!');
      router.push('/');
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
    },
  });
};

export const useRegister = () => {
  const { login } = useAuthActions();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      login(data.data, data.token);
      queryClient.setQueryData(['auth', 'me'], { success: true, data: data.data });
      toast.success('Registration successful!');
      router.push('/');
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthActions();
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
      router.push('/');
    },
    onError: () => {
      logout();
      queryClient.clear();
      router.push('/');
    },
  });
};

export const useUpdateProfile = () => {
  const { updateUser } = useAuthActions();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.updateDetails,
    onSuccess: (data) => {
      updateUser(data.data);
      queryClient.setQueryData(['auth', 'me'], { success: true, data: data.data });
      toast.success('Profile updated successfully!');
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Update failed';
      toast.error(message);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: authApi.updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully!');
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Password update failed';
      toast.error(message);
    },
  });
};
