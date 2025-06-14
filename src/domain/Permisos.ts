export interface Rol {
    id: string;
    nombre: string;
    descripcion?: string;
    permisos: Permiso[];
    fechaCreacion: Date;
    fechaActualizacion?: Date;
    activo: boolean;
}

export interface Permiso {
    id: string;
    recurso: string;
    acciones: string[];
    descripcion?: string;   
}