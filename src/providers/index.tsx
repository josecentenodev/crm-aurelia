import type { PropsWithChildren } from "react";
import { TRPCReactProvider } from "@/trpc/react"
import { auth } from "@/server/auth";
import { SessionProvider } from "./SessionProvider";
import { ClientProvider } from "./ClientProvider";
import { ClientProviderErrorBoundary } from "./ClientProviderErrorBoundary";
import { UsuariosProvider } from "./UsuariosProvider";

export const Providers: React.FC<PropsWithChildren> = async ({children}) => {
    const session = await auth()

    return (
        <SessionProvider session={session}>
            <TRPCReactProvider>
                <ClientProviderErrorBoundary>
                    <ClientProvider>
                        <UsuariosProvider>
                            {children}
                        </UsuariosProvider>
                    </ClientProvider>
                </ClientProviderErrorBoundary>
            </TRPCReactProvider>
        </SessionProvider>
    )
}

export { ClientProvider, useClientContext } from './ClientProvider'
export { useAgentesProvider } from './AgentesProvider'
export { useContactosProvider } from './ContactosProvider'
export { useDashboardProvider } from './DashboardProvider'
export { UsuariosProvider, useUsuariosContext } from './UsuariosProvider' 