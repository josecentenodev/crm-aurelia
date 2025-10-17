import { Input, Label, Checkbox, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from "@/components/ui"
import { type AgentField, type FieldType } from "@/domain/Agentes"
import { memo } from "react"

export interface DynamicFieldProps {
  field: AgentField
  value: string | number | boolean | string[] | undefined
  setValue: (v: string | number | boolean | string[]) => void
}

export const DynamicField = memo(function DynamicField({ field, value, setValue }: DynamicFieldProps) {
  // Verificar que el field sea válido
  if (!field?.type) {
    return <Input placeholder="Campo no configurado" disabled />
  }

  // Función helper para manejar valores de manera segura con mejor tipado
  const getSafeValue = (val: string | number | boolean | string[] | undefined): string => {
    if (val === null || val === undefined) return ""
    if (Array.isArray(val)) return val.join(", ")
    return String(val)
  }

  switch (field.type) {
    case "TEXT":
      return (
        <Input 
          value={getSafeValue(value)} 
          onChange={e => setValue(e.target.value)} 
          placeholder={field.label}
          className="w-full"
        />
      )
    
    case "NUMBER":
      return (
        <Input 
          type="number" 
          value={getSafeValue(value)} 
          onChange={e => setValue(Number(e.target.value))} 
          placeholder={field.label}
          className="w-full"
        />
      )
    
    case "TEXTAREA":
      return (
        <Textarea 
          value={getSafeValue(value)} 
          onChange={e => setValue(e.target.value)} 
          placeholder={field.label}
          className="w-full min-h-[80px] resize-none"
        />
      )
    
    case "SELECT":
      return (
        <Select value={getSafeValue(value)} onValueChange={setValue}>
          <SelectTrigger className="w-full">
            <SelectValue className="text-gray-500" placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map(opt => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    
    case "CHECKBOX":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={field.id}
            checked={!!value} 
            onCheckedChange={setValue}
          />
          <Label htmlFor={field.id} className="text-sm font-normal">
            {field.label}
          </Label>
        </div>
      )
    
    case "RADIO":
      return (
        <div className="space-y-2">
          {field.options?.map(opt => (
            <div key={opt} className="flex items-center space-x-2">
              <input 
                type="radio" 
                id={`${field.id}-${opt}`}
                name={field.id} 
                value={opt} 
                checked={value === opt} 
                onChange={() => setValue(opt)}
                className="w-4 h-4 text-violet-600 bg-gray-100 border-gray-300 focus:ring-violet-500 focus:ring-2"
              />
              <Label htmlFor={`${field.id}-${opt}`} className="text-sm font-normal">
                {opt}
              </Label>
            </div>
          ))}
        </div>
      )
    
    default:
      return <Input placeholder="Tipo de campo no soportado" disabled />
  }
}) 