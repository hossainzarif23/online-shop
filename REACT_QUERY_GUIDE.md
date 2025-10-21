# React Query Quick Reference Guide

This guide provides quick patterns and examples for working with React Query in this codebase.

---

## 🎯 When to Use What

### Use React Query When:

- ✅ Fetching data from an API
- ✅ Creating/updating/deleting server data
- ✅ Need automatic caching
- ✅ Want optimistic UI updates
- ✅ Need background synchronization

### Use Local State (Jotai/useState) When:

- ✅ UI state (modals, tabs, form inputs)
- ✅ Client-only data (cart before checkout)
- ✅ Temporary state
- ✅ No server synchronization needed

---

## 📦 Query Key Patterns

### Basic Structure

```typescript
export const resourceKeys = {
  all: ["resource"] as const,
  lists: () => [...resourceKeys.all, "list"] as const,
  list: (filters?: any) => [...resourceKeys.lists(), filters] as const,
  details: () => [...resourceKeys.all, "detail"] as const,
  detail: (id: string) => [...resourceKeys.details(), id] as const,
};
```

### Examples from Codebase

```typescript
// Orders
orderKeys.lists(); // ["orders", "list"]
orderKeys.detail("123"); // ["orders", "detail", "123"]

// Addresses
addressKeys.lists(); // ["addresses", "list"]
addressKeys.all; // ["addresses"]

// Payment Methods
paymentMethodKeys.lists(); // ["paymentMethods", "list"]
```

### Why This Structure?

- **Hierarchical invalidation:** Invalidate all orders or just one
- **Cache organization:** Easy to find data in DevTools
- **Type safety:** TypeScript knows the shape
- **Consistency:** Same pattern across the codebase

---

## 🔍 Fetching Data (useQuery)

### Basic Pattern

```typescript
export function useResource() {
  const query = useQuery({
    queryKey: resourceKeys.lists(),
    queryFn: () => service.getResources(),
    staleTime: 2 * 60 * 1000, // Fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  return {
    resources: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
```

### Fetch Single Item

```typescript
export function useOrder(orderId: string) {
  const query = useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => orderService.getOrderById(orderId),
    enabled: !!orderId, // Only fetch if ID exists
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return {
    order: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
```

### Dependent Queries

```typescript
export function useUserProfile(userId: string) {
  // First query
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userService.getUser(userId),
  });

  // Second query (depends on first)
  const ordersQuery = useQuery({
    queryKey: ["orders", userId],
    queryFn: () => orderService.getUserOrders(userId),
    enabled: !!userQuery.data, // Only fetch when user is loaded
  });

  return {
    user: userQuery.data,
    orders: ordersQuery.data,
    isLoading: userQuery.isLoading || ordersQuery.isLoading,
  };
}
```

---

## ✏️ Creating Data (useMutation)

### Basic Create

```typescript
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateResourceDto) => service.create(data),
    onSuccess: () => {
      // Invalidate and refetch list
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      toast.success("Created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create");
    },
  });
}

// Usage in component
const createMutation = useCreateResource();
createMutation.mutate(data); // Fire and forget
const result = await createMutation.mutateAsync(data); // Wait for result
```

### Optimistic Create

```typescript
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: service.create,
    onMutate: async (newData) => {
      // 1. Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: resourceKeys.lists() });

      // 2. Snapshot current data
      const previous = queryClient.getQueryData(resourceKeys.lists());

      // 3. Optimistically update cache
      queryClient.setQueryData(resourceKeys.lists(), (old: Resource[] = []) => [
        ...old,
        { ...newData, id: "temp-" + Date.now() } as Resource,
      ]);

      // 4. Return context for rollback
      return { previous };
    },
    onSuccess: () => {
      toast.success("Created successfully");
    },
    onError: (error: Error, _data, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(resourceKeys.lists(), context.previous);
      }
      toast.error(error.message);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}
```

---

## ✏️ Updating Data (useMutation)

### Basic Update

```typescript
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDto }) =>
      service.update(id, data),
    onSuccess: (_result, { id }) => {
      // Invalidate specific item and list
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      toast.success("Updated successfully");
    },
  });
}
```

### Optimistic Update

```typescript
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDto }) =>
      service.update(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: resourceKeys.lists() });

      const previous = queryClient.getQueryData(resourceKeys.lists());

      // Optimistically update in list
      queryClient.setQueryData(resourceKeys.lists(), (old: Resource[] = []) =>
        old.map((item) => (item.id === id ? { ...item, ...data } : item))
      );

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(resourceKeys.lists(), context.previous);
      }
      toast.error(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}
```

---

## 🗑️ Deleting Data (useMutation)

### Basic Delete

```typescript
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => service.delete(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
      toast.success("Deleted successfully");
    },
  });
}
```

### Optimistic Delete

```typescript
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => service.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: resourceKeys.lists() });

      const previous = queryClient.getQueryData(resourceKeys.lists());

      // Optimistically remove from UI
      queryClient.setQueryData(resourceKeys.lists(), (old: Resource[] = []) =>
        old.filter((item) => item.id !== id)
      );

      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(resourceKeys.lists(), context.previous);
      }
      toast.error(err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}
```

---

## 🎛️ Component Usage

### Basic Usage

```typescript
export default function MyComponent() {
  const { resources, isLoading, error } = useResources();

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {resources.map((item) => (
        <ResourceCard key={item.id} resource={item} />
      ))}
    </div>
  );
}
```

### With Mutations

```typescript
export default function MyComponent() {
  const { resources, isLoading, error } = useResources();
  const createMutation = useCreateResource();
  const deleteMutation = useDeleteResource();

  const handleCreate = (data: CreateDto) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <CreateForm onSubmit={handleCreate} isLoading={createMutation.isPending} />
      <ResourceList
        resources={resources}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
```

### With Async/Await

```typescript
export default function MyComponent() {
  const createMutation = useCreateResource();

  const handleSubmit = async (data: CreateDto) => {
    try {
      const result = await createMutation.mutateAsync(data);
      console.log("Created:", result);
      // Do something after success
      router.push(`/resource/${result.id}`);
    } catch (error) {
      console.error("Failed:", error);
      // Error already handled in mutation
    }
  };

  return <CreateForm onSubmit={handleSubmit} />;
}
```

---

## 🔄 Cache Manipulation

### Manually Update Cache

```typescript
const queryClient = useQueryClient();

// Set data
queryClient.setQueryData(resourceKeys.lists(), newData);

// Get data
const data = queryClient.getQueryData(resourceKeys.lists());

// Update existing data
queryClient.setQueryData(resourceKeys.lists(), (old: Resource[] = []) => [
  ...old,
  newResource,
]);
```

### Invalidate Cache

```typescript
const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });

// Invalidate all resource queries
queryClient.invalidateQueries({ queryKey: resourceKeys.all });

// Invalidate specific item
queryClient.invalidateQueries({ queryKey: resourceKeys.detail("123") });
```

### Prefetch Data

```typescript
const queryClient = useQueryClient();

// Prefetch on hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => service.getById(id),
  });
};
```

---

## 🎯 Common Patterns

### Pattern 1: Master-Detail

```typescript
// List page
export function ResourceListPage() {
  const { resources } = useResources();

  return (
    <div>
      {resources.map((item) => (
        <Link key={item.id} href={`/resource/${item.id}`}>
          {item.name}
        </Link>
      ))}
    </div>
  );
}

// Detail page
export function ResourceDetailPage({ params }: { params: { id: string } }) {
  const { resource, isLoading } = useResource(params.id);

  // Data might be in cache from list page!
  // No loading spinner needed if cached

  return <ResourceDetails resource={resource} />;
}
```

### Pattern 2: Optimistic Toggle

```typescript
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      service.toggleFavorite(id, isFavorite),
    onMutate: async ({ id, isFavorite }) => {
      await queryClient.cancelQueries({ queryKey: resourceKeys.lists() });

      const previous = queryClient.getQueryData(resourceKeys.lists());

      queryClient.setQueryData(resourceKeys.lists(), (old: Resource[] = []) =>
        old.map((item) => (item.id === id ? { ...item, isFavorite } : item))
      );

      return { previous };
    },
    // ... error handling
  });
}
```

### Pattern 3: Dependent Mutations

```typescript
export function useCheckout() {
  const processPayment = useProcessPayment();
  const createOrder = useCreateOrder();

  const checkout = async (data: CheckoutData) => {
    // Step 1: Process payment
    const payment = await processPayment.mutateAsync(data.payment);

    // Step 2: Create order with payment result
    const order = await createOrder.mutateAsync({
      ...data.order,
      transactionId: payment.transactionId,
    });

    return order;
  };

  return {
    checkout,
    isProcessing: processPayment.isPending || createOrder.isPending,
  };
}
```

---

## 🐛 Debugging Tips

### Enable DevTools

```typescript
// Already enabled in components/providers.tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Check Query Status

```typescript
const query = useQuery({
  queryKey: resourceKeys.lists(),
  queryFn: service.getResources,
});

console.log({
  isLoading: query.isLoading, // Initial load
  isFetching: query.isFetching, // Background refetch
  isError: query.isError, // Error occurred
  isSuccess: query.isSuccess, // Has data
  data: query.data, // The actual data
  error: query.error, // Error object
  dataUpdatedAt: query.dataUpdatedAt, // Last update timestamp
});
```

### Force Refetch

```typescript
const { refetch } = useResources();

// Manual refetch
refetch();

// Or with button
<button onClick={() => refetch()}>Refresh</button>
```

---

## ⚙️ Configuration Options

### Query Options

```typescript
useQuery({
  queryKey: ["resource"],
  queryFn: service.getResources,

  // Caching
  staleTime: 2 * 60 * 1000, // Data fresh for 2 min
  gcTime: 5 * 60 * 1000, // Cache for 5 min

  // Refetching
  refetchOnWindowFocus: false, // Don't refetch on tab focus
  refetchOnReconnect: true, // Refetch on internet reconnect
  refetchInterval: false, // Auto-refetch interval

  // Retrying
  retry: 3, // Retry failed requests 3 times
  retryDelay: 1000, // Wait 1s between retries

  // Conditional
  enabled: true, // Whether to run query
});
```

### Mutation Options

```typescript
useMutation({
  mutationFn: service.create,

  // Callbacks
  onMutate: async (data) => {
    // Before mutation
    return { context };
  },
  onSuccess: (result, variables, context) => {
    // After successful mutation
  },
  onError: (error, variables, context) => {
    // After failed mutation
  },
  onSettled: (data, error, variables, context) => {
    // After mutation (success or error)
  },

  // Retrying
  retry: 0, // Don't retry mutations by default
});
```

---

## 📋 Checklist for New Hooks

When creating a new React Query hook:

1. [ ] Define query keys structure
2. [ ] Create query hook with `useQuery`
3. [ ] Add proper types for data/errors
4. [ ] Configure `staleTime` and `gcTime`
5. [ ] Create mutation hooks with `useMutation`
6. [ ] Add optimistic updates in `onMutate`
7. [ ] Add rollback in `onError`
8. [ ] Invalidate cache in `onSettled`
9. [ ] Add toast notifications
10. [ ] Test with React Query DevTools

---

## 🚨 Common Mistakes

### ❌ Don't: Use query in event handler

```typescript
// BAD - query runs on component mount
const handleClick = () => {
  const { data } = useQuery({ queryKey: ["data"], queryFn: fetchData });
  console.log(data);
};
```

### ✅ Do: Use mutation for event-triggered actions

```typescript
// GOOD - mutation runs on demand
const mutation = useMutation({ mutationFn: fetchData });
const handleClick = () => {
  mutation.mutate();
};
```

### ❌ Don't: Forget to invalidate cache

```typescript
// BAD - cache not updated
const createMutation = useMutation({
  mutationFn: service.create,
  // Missing: invalidateQueries
});
```

### ✅ Do: Always invalidate affected queries

```typescript
// GOOD - cache stays in sync
const createMutation = useMutation({
  mutationFn: service.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
  },
});
```

### ❌ Don't: Use same query key for different data

```typescript
// BAD - will cause cache collisions
useQuery({ queryKey: ["data"], queryFn: () => fetchUsers() });
useQuery({ queryKey: ["data"], queryFn: () => fetchProducts() });
```

### ✅ Do: Use unique, descriptive query keys

```typescript
// GOOD - separate cache entries
useQuery({ queryKey: ["users"], queryFn: () => fetchUsers() });
useQuery({ queryKey: ["products"], queryFn: () => fetchProducts() });
```

---

## 📚 Additional Resources

- **React Query Docs:** https://tanstack.com/query/latest
- **DevTools Guide:** https://tanstack.com/query/latest/docs/devtools
- **Migration Guide:** See `REACT_QUERY_MIGRATION.md`
- **Examples:** Check existing hooks in `hooks/` directory

---

**Version:** React Query v5  
**Last Updated:** 2024  
**Status:** Production Ready ✅
