import { db } from '@/server/db'
import { type Contact, type ContactStatus } from './types'
import { logger } from '@/lib/utils/server-logger'

export class ContactManager {
  /**
   * Normaliza un número de teléfono para búsqueda consistente
   * Maneja diferentes formatos de WhatsApp (@lid, @s.whatsapp.net, etc.)
   */
  private normalizePhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return ''
    
    // Remover sufijos de WhatsApp
    let normalized = phoneNumber
      .replace('@s.whatsapp.net', '')
      .replace('@g.us', '')
      .replace('@lid', '')
    
    // Remover caracteres no numéricos excepto +
    normalized = normalized.replace(/[^\d+]/g, '')
    
    // Si empieza con +, mantenerlo; si no, agregarlo si es internacional
    if (normalized.startsWith('+')) {
      return normalized
    }
    
    // Si es un número largo sin +, probablemente es internacional
    if (normalized.length >= 10) {
      return '+' + normalized
    }
    
    return normalized
  }

  /**
   * Busca contactos usando múltiples estrategias de normalización
   * para detectar contactos duplicados con diferentes formatos
   */
  private async findContactWithNormalization(
    phoneNumber: string,
    remoteJid: string,
    clientId: string
  ): Promise<Contact | null> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
    
    logger.contact(`Buscando contacto con normalización: ${phoneNumber} → ${normalizedPhone} (remoteJid: ${remoteJid})`)
    
    // Estrategia 1: Búsqueda exacta por remoteJid
    let contact = await db.contact.findFirst({
      where: { 
        channelId: remoteJid,
        clientId: clientId
      }
    })
    
    if (contact) {
      logger.contact(`Contacto encontrado por remoteJid exacto: ${contact.id}`)
      return contact
    }
    
    // Estrategia 2: Búsqueda por número normalizado
    contact = await db.contact.findFirst({
      where: { 
        phone: normalizedPhone,
        clientId: clientId
      }
    })
    
    if (contact) {
      logger.contact(`Contacto encontrado por número normalizado: ${contact.id}`)
      return contact
    }
    
    // Estrategia 3: Búsqueda por número original (fallback)
    contact = await db.contact.findFirst({
      where: { 
        phone: phoneNumber,
        clientId: clientId
      }
    })
    
    if (contact) {
      logger.contact(`Contacto encontrado por número original: ${contact.id}`)
      return contact
    }
    
    // Estrategia 4: Búsqueda flexible por números similares
    // Buscar contactos que puedan ser el mismo pero con formato diferente
    const contacts = await db.contact.findMany({
      where: { 
        clientId: clientId,
        phone: {
          contains: normalizedPhone.replace('+', '') // Buscar sin el +
        }
      }
    })
    
    // Filtrar contactos que realmente coincidan
    for (const candidate of contacts) {
      const candidateNormalized = this.normalizePhoneNumber(candidate.phone)
      if (candidateNormalized === normalizedPhone) {
        logger.contact(`Contacto encontrado por búsqueda flexible: ${candidate.id}`)
        return candidate
      }
    }
    
    logger.contact(`No se encontró contacto con ninguna estrategia`)
    return null
  }

  async upsertContact(
    phoneNumber: string, 
    pushName: string, 
    clientId: string,
    remoteJid: string,        // CORREGIDO: usar remoteJid completo del payload
    source: string            // CORREGIDO: usar source del payload
  ): Promise<Contact> {
    logger.contact(`Buscando contacto existente: ${phoneNumber} (remoteJid: ${remoteJid})`)
    
    // Usar búsqueda inteligente con normalización
    let contact = await this.findContactWithNormalization(phoneNumber, remoteJid, clientId)
    
    if (!contact) {
      // Crear nuevo contacto
      logger.contact(`Creando nuevo contacto: ${phoneNumber} - ${pushName} (remoteJid: ${remoteJid})`)
      contact = await db.contact.create({
        data: {
          phone: phoneNumber,
          name: pushName || 'Sin nombre',
          clientId: clientId,
          status: 'NUEVO',
          channel: 'WHATSAPP',
          channelId: remoteJid,            // CORREGIDO: usar remoteJid completo
          lastChannel: source,             // CORREGIDO: usar source del payload
          source: source                   // CORREGIDO: usar source del payload
        }
      })
      logger.contact(`Contacto creado: ${contact.id}`)
    } else {
      // Contacto existente - actualizar información del canal
      logger.contact(`Contacto existente encontrado: ${contact.id} - ${contact.name}`)
      
      const updateData: Partial<Contact> = {
        lastChannel: source,
        updatedAt: new Date()
      }
      
      // SOLUCIÓN: Actualizar nombre con lógica inteligente
      const shouldUpdateName = this.shouldUpdateContactName(contact, pushName, source)
      
      if (shouldUpdateName) {
        updateData.name = pushName
        logger.contact(`Actualizando nombre del contacto: ${contact.name} → ${pushName}`)
      } else {
        logger.contact(`Manteniendo nombre existente: ${contact.name} (pushName recibido: ${pushName})`)
      }
      
      // NUEVA LÓGICA: Actualizar channelId para mantener consistencia
      if (!contact.channelId || contact.channelId !== remoteJid) {
        updateData.channelId = remoteJid
        logger.contact(`Actualizando channelId: ${contact.channelId} → ${remoteJid}`)
      }
      
      // NUEVA LÓGICA: Actualizar número de teléfono si es más completo
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      const currentNormalizedPhone = this.normalizePhoneNumber(contact.phone)
      
      if (normalizedPhone !== currentNormalizedPhone && normalizedPhone.length > currentNormalizedPhone.length) {
        updateData.phone = normalizedPhone
        logger.contact(`Actualizando número de teléfono: ${contact.phone} → ${normalizedPhone}`)
      }
      
      contact = await db.contact.update({
        where: { id: contact.id },
        data: updateData
      })
      
      logger.contact(`Contacto actualizado: ${contact.name}`)
    }
    
    return contact
  }

  async getContactByPhone(phoneNumber: string, clientId: string): Promise<Contact | null> {
    return await db.contact.findFirst({
      where: { 
        phone: phoneNumber,
        clientId: clientId
      }
    })
  }

  async getContactByChannelId(channelId: string, clientId: string): Promise<Contact | null> {
    return await db.contact.findFirst({
      where: { 
        channelId: channelId,
        clientId: clientId
      }
    })
  }

  async getContactByRemoteJid(remoteJid: string, clientId: string): Promise<Contact | null> {
    return await db.contact.findFirst({
      where: { 
        channelId: remoteJid,
        clientId: clientId
      }
    })
  }

  async updateContactStatus(contactId: string, status: ContactStatus): Promise<Contact> {
    logger.contact(`Actualizando estado del contacto ${contactId} a: ${status}`)
    
    return await db.contact.update({
      where: { id: contactId },
      data: { 
        status: status,
        updatedAt: new Date()
      }
    })
  }

  async updateContactName(contactId: string, name: string): Promise<Contact> {
    logger.contact(`Actualizando nombre del contacto ${contactId} a: ${name}`)
    
    return await db.contact.update({
      where: { id: contactId },
      data: { 
        name: name,
        updatedAt: new Date()
      }
    })
  }

  async updateContactPhone(contactId: string, phone: string): Promise<Contact> {
    logger.contact(`Actualizando teléfono del contacto ${contactId} a: ${phone}`)
    
    return await db.contact.update({
      where: { id: contactId },
      data: { 
        phone: phone,
        updatedAt: new Date()
      }
    })
  }

  async getContactsByClient(clientId: string, limit = 50): Promise<Contact[]> {
    return await db.contact.findMany({
      where: { clientId: clientId },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })
  }

  async deleteContact(contactId: string): Promise<void> {
    logger.contact(`Eliminando contacto: ${contactId}`)
    
    await db.contact.delete({
      where: { id: contactId }
    })
    
    logger.contact(`Contacto eliminado: ${contactId}`)
  }

  /**
   * Busca o crea un contacto SIN actualizar su información
   * Se usa para mensajes salientes donde no queremos modificar datos del contacto
   */
  async getOrCreateContactWithoutUpdate(
    phoneNumber: string,
    clientId: string,
    remoteJid: string,
    source: string
  ): Promise<Contact> {
    logger.contact(`Buscando contacto SIN actualizar: ${phoneNumber} (remoteJid: ${remoteJid})`)
    
    // Usar búsqueda inteligente con normalización
    let contact = await this.findContactWithNormalization(phoneNumber, remoteJid, clientId)
    
    if (!contact) {
      // Solo crear si no existe, usando datos mínimos
      logger.contact(`Creando contacto básico: ${phoneNumber} (SIN pushName)`)
      contact = await db.contact.create({
        data: {
          phone: phoneNumber,
          name: 'Sin nombre',  // No usar pushName de mensajes salientes
          clientId: clientId,
          status: 'NUEVO',
          channel: 'WHATSAPP',
          channelId: remoteJid,
          lastChannel: source,
          source: source
        }
      })
      logger.contact(`Contacto básico creado: ${contact.id}`)
    } else {
      // Contacto existe - SOLO actualizar metadatos, NO el nombre
      logger.contact(`Contacto existente encontrado: ${contact.id} - PRESERVANDO nombre: ${contact.name}`)
      
      const updateData: Partial<Contact> = {
        lastChannel: source,
        updatedAt: new Date()
      }
      
      // NUEVA LÓGICA: Actualizar channelId para mantener consistencia (incluso si ya tenía uno)
      if (!contact.channelId || contact.channelId !== remoteJid) {
        updateData.channelId = remoteJid
        logger.contact(`Actualizando channelId: ${contact.channelId} → ${remoteJid}`)
      }
      
      // NUEVA LÓGICA: Actualizar número de teléfono si es más completo
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      const currentNormalizedPhone = this.normalizePhoneNumber(contact.phone)
      
      if (normalizedPhone !== currentNormalizedPhone && normalizedPhone.length > currentNormalizedPhone.length) {
        updateData.phone = normalizedPhone
        logger.contact(`Actualizando número de teléfono: ${contact.phone} → ${normalizedPhone}`)
      }
      
      contact = await db.contact.update({
        where: { id: contact.id },
        data: updateData
      })
      
      logger.contact(`Metadatos actualizados - nombre preservado: ${contact.name}`)
    }
    
    return contact
  }

  /**
   * Determina si se debe actualizar el nombre del contacto
   * Implementa lógica inteligente para evitar cambios innecesarios
   */
  private shouldUpdateContactName(
    existingContact: Contact, 
    newPushName: string, 
    source: string
  ): boolean {
    // 1. Validaciones básicas
    if (!newPushName?.trim()) {
      logger.contact(`PushName vacío o inválido`)
      return false
    }
    
    if (newPushName === existingContact.name) {
      logger.contact(`Nombres idénticos, no se requiere actualización`)
      return false
    }

    // 2. Casos donde SIEMPRE actualizar (nombres actuales inválidos)
    const alwaysUpdateCases = [
      !existingContact.name,
      existingContact.name === 'Sin nombre',
      existingContact.name === 'Unknown',
      existingContact.name.trim() === '',
      /^\d+$/.test(existingContact.name), // Solo números
      existingContact.name.length <= 2      // Muy corto
    ]
    
    if (alwaysUpdateCases.some(condition => condition)) {
      logger.contact(`Actualizando: nombre actual inválido/genérico (${existingContact.name})`)
      return true
    }

    // 3. Casos donde NUNCA actualizar (pushName inválido)
    const neverUpdateCases = [
      newPushName === 'Sin nombre',
      newPushName === 'Unknown',
      newPushName.length <= 2,
      /^\d+$/.test(newPushName),           // pushName es solo números
      newPushName.toLowerCase().includes('whatsapp'),
      newPushName.toLowerCase().includes('evolution'),
      newPushName.toLowerCase().includes('system'),
      source === 'system' || source === 'bot' // Mensajes del sistema
    ]

    if (neverUpdateCases.some(condition => condition)) {
      logger.contact(`Bloqueando actualización: pushName inválido (${newPushName})`)
      return false
    }

    // 4. Lógica de mejora vs regresión
    const currentQuality = this.calculateNameQuality(existingContact.name)
    const newQuality = this.calculateNameQuality(newPushName)
    
    logger.contact(`Calidad de nombres: actual=${currentQuality}, nuevo=${newQuality}`)
    
    // Solo actualizar si es una mejora significativa
    const qualityImprovement = newQuality - currentQuality
    
    if (qualityImprovement >= 2) {
      logger.contact(`Actualizando: mejora significativa (+${qualityImprovement})`)
      return true
    }
    
    if (qualityImprovement < 0) {
      logger.contact(`Manteniendo: evitando regresión (${qualityImprovement})`)
      return false
    }

    // 5. Análisis de similitud para cambios menores
    const similarity = this.calculateNameSimilarity(existingContact.name, newPushName)
    
    logger.contact(`Similitud entre nombres: ${similarity.toFixed(2)}`)
    
    if (similarity > 0.8) {
      logger.contact(`Manteniendo: nombres muy similares`)
      return false
    }

    // 6. Si llegamos aquí, permitir la actualización
    logger.contact(`Actualizando: cambio válido detectado`)
    return true
  }

  /**
   * Calcula la calidad de un nombre basado en diferentes criterios
   * Mayor puntaje = mejor calidad
   */
  private calculateNameQuality(name: string): number {
    if (!name?.trim()) return 0
    
    let quality = 0
    
    // Puntos por longitud razonable
    if (name.length >= 3) quality += 1
    if (name.length >= 5) quality += 1
    
    // Puntos por contener espacios (nombre + apellido)
    if (name.includes(' ')) quality += 2
    
    // Puntos por contener solo letras y espacios
    if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) quality += 2
    
    // Puntos por capitalización apropiada
    if (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]/.test(name)) quality += 1
    
    // Penalización por números
    if (/\d/.test(name)) quality -= 2
    
    // Penalización por caracteres especiales excesivos
    if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/.test(name)) quality -= 1
    
    return Math.max(0, quality)
  }

  /**
   * Calcula la similitud entre dos nombres usando algoritmo de Levenshtein
   * Retorna valor entre 0 (completamente diferentes) y 1 (idénticos)
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const normalize = (str: string) => str.toLowerCase().trim()
    const a = normalize(name1)
    const b = normalize(name2)
    
    if (a === b) return 1
    
    const matrix: number[][] = Array(b.length + 1).fill(0).map(() => Array(a.length + 1).fill(0))
    
    for (let i = 0; i <= a.length; i++) matrix[0]![i] = i
    for (let j = 0; j <= b.length; j++) matrix[j]![0] = j
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[j]![i] = Math.min(
          matrix[j]![i - 1]! + 1,         // deletion
          matrix[j - 1]![i]! + 1,         // insertion
          matrix[j - 1]![i - 1]! + cost   // substitution
        )
      }
    }
    
    const maxLength = Math.max(a.length, b.length)
    return (maxLength - matrix[b.length]![a.length]!) / maxLength
  }
}
