/**
 * Utilidad para crear una función debounced
 * Retrasa la ejecución de una función hasta que haya pasado un tiempo desde la última llamada
 * 
 * @param func - Función a ejecutar con debounce
 * @param wait - Tiempo de espera en milisegundos
 * @returns Función debounced
 */
export function debounce<T extends (...args: never[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

