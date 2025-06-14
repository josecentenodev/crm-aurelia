export interface Contacto {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    fechaCreacion: Date;
    fechaActualizacion?: Date;
    activo: boolean;
    clienteId: string;
    tags: string[];
    notas?: string;
}