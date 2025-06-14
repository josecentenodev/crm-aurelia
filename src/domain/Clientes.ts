import { type Usuario } from './Usuarios';

export interface Cliente {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    pais: string;
    fechaCreacion: Date;
    fechaActualizacion?: Date;
    activo: boolean;
    usuarios?: Usuario[];
}