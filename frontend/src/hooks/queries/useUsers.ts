import { useQuery } from '@tanstack/react-query';
import { usersApi, UsersQuery } from '@/api/users';

export const useUsers = (query: UsersQuery = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', query],
    queryFn: () => usersApi.getUsers(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
