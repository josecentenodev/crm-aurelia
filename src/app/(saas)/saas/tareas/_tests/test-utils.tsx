import { ReactElement, ReactNode } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Create a test query client with disabled retries and caching
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

interface AllTheProvidersProps {
  children: ReactNode
}

/**
 * Mock ClientProvider for testing
 */
const MockClientProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

/**
 * Wrapper with all necessary providers for testing
 */
function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <MockClientProvider>
        {children}
      </MockClientProvider>
    </QueryClientProvider>
  )
}

/**
 * Custom render function that wraps components with necessary providers
 */
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render, createTestQueryClient }
