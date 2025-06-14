// TODO: REDEFINIR EN PRISMA

export interface Mensaje {
    id: string;
    contenido: string;
    remitenteId: string;
    fechaEnvio: Date;
}

export interface Conversaciones {
    id: string;
    participantes: string[];
    mensajes: Mensaje[];
    creadaEn: Date;
}