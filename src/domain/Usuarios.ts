export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono?: string;
    rol: string;
    fechaCreacion: Date;
    fechaActualizacion?: Date;
    activo: boolean;
    clienteId: string;
}