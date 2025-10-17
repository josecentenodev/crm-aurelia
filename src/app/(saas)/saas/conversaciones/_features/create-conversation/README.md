# ➕ Create Conversation - Crear Nueva Conversación

Formulario completo para iniciar conversaciones con contactos existentes, con validación Zod y UI optimizada.

## 🎯 Responsabilidades

1. **Selección de contacto** - Dropdown con búsqueda integrada
2. **Configuración de canal** - WhatsApp, Telegram, Instagram, Facebook
3. **Asignación de instancia** - Solo para WhatsApp (Evolution API)
4. **Mensaje inicial** - Opcional para enviar al crear
5. **Toggle IA** - Activar respuesta automática desde el inicio
6. **Validación completa** - Zod schema con feedback en tiempo real

## 🧩 Estructura del Componente

```
create-conversation/
├── create-conversation-form.tsx       # 📝 Formulario completo
└── index.ts                          # Export
```

## 📊 Flujo de Datos

### **Carga inicial**
```
Página monta
    ↓
api.contactos.list.useQuery({ clientId })
    ↓
api.conversaciones.getClientInstances.useQuery({ clientId })
    ↓
Renderiza formulario con selects poblados
```

### **Selección de contacto**
```
Usuario abre dropdown
    ↓
setIsSelectOpen(true)
    ↓
useEffect → setTimeout → searchInputRef.current.focus()
    ↓
Usuario escribe
    ↓
setSearchTerm(value)
    ↓
useMemo filtra contactos
    ↓
Muestra contactos filtrados
```

### **Submit del formulario**
```
form.handleSubmit(onSubmit)
    ↓
Validación Zod (CreateConversationFormSchema)
    ↓
Construcción de payload
    ↓
createConversationMutation.mutateAsync(payload)
    ↓
onSuccess:
  - Invalidar conversaciones.list
  - Invalidar conversaciones.byId
  - Toast de éxito
  - router.push('/saas/conversaciones')
    ↓
onError:
  - Parse error message
  - Toast de error
```

## 🔑 Campos del Formulario

### **1. Contacto (requerido)**
```typescript
<Controller
  name="contactId"
  control={form.control}
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      {/* Búsqueda integrada */}
      <div className="p-2 border-b">
        <Input
          ref={searchInputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === 'Enter') e.preventDefault()
          }}
        />
      </div>
      
      {/* Lista filtrada */}
      {filteredContacts.map(contact => (
        <SelectItem value={contact.id}>
          <Avatar>{contact.name[0]}</Avatar>
          <div>
            <div>{contact.name}</div>
            <div className="text-xs">
              {contact.email} • {contact.phone}
            </div>
          </div>
        </SelectItem>
      ))}
    </Select>
  )}
/>
```

**Búsqueda:**
```typescript
const filteredContacts = useMemo(() => {
  if (!searchTerm.trim()) return contacts
  const term = searchTerm.toLowerCase()
  return contacts.filter(contact => {
    const name = contact.name?.toLowerCase() ?? ""
    const email = contact.email?.toLowerCase() ?? ""
    const phone = contact.phone?.toLowerCase() ?? ""
    return name.includes(term) || email.includes(term) || phone.includes(term)
  })
}, [contacts, searchTerm])
```

**Preview:**
```typescript
{selectedContact && (
  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
    <div className="flex items-center gap-3">
      <Avatar>{selectedContact.name[0]}</Avatar>
      <div>
        <p>{selectedContact.name}</p>
        {selectedContact.email && <p>📧 {selectedContact.email}</p>}
        {selectedContact.phone && <p>📱 {selectedContact.phone}</p>}
      </div>
    </div>
  </div>
)}
```

---

### **2. Canal (requerido)**
```typescript
<Select 
  value={field.value} 
  onValueChange={(value) => field.onChange(value as ContactChannel)}
>
  {CONTACT_CHANNELS.map((channel) => (
    <SelectItem value={channel.value}>
      {channel.label}
    </SelectItem>
  ))}
</Select>
```

**Opciones:**
- `WHATSAPP` - WhatsApp
- `TELEGRAM` - Telegram  
- `INSTAGRAM` - Instagram
- `FACEBOOK` - Facebook

---

### **3. Instancia de WhatsApp (opcional)**
```typescript
<Select 
  value={field.value ?? "none"} 
  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
  disabled={form.watch("channel") !== ContactChannel.WHATSAPP}
>
  <SelectItem value="none">Sin instancia específica</SelectItem>
  {instances.map((instance) => (
    <SelectItem value={instance.id}>
      {instance.instanceName}
      {instance.phoneNumber && ` (${instance.phoneNumber})`}
    </SelectItem>
  ))}
</Select>
```

**Comportamiento:**
- Solo habilitado si `channel === WHATSAPP`
- Muestra número de teléfono si disponible
- "none" permite que backend elija automáticamente

---

### **4. Título (opcional)**
```typescript
<Input
  placeholder="Ej: Consulta sobre producto X"
  value={field.value ?? ""}
  onChange={(e) => field.onChange(e.target.value || null)}
/>
```

**Comportamiento:**
- Si vacío → usa nombre del contacto
- Si provisto → sobreescribe título por defecto

---

### **5. Mensaje inicial (opcional)**
```typescript
<Textarea
  placeholder="Mensaje de bienvenida o contexto inicial..."
  value={field.value ?? ""}
  onChange={(e) => field.onChange(e.target.value || undefined)}
  className="min-h-[100px]"
/>
```

**Comportamiento:**
- Se envía automáticamente después de crear conversación
- Útil para plantillas de bienvenida

---

### **6. Activar IA (checkbox)**
```typescript
<Checkbox
  checked={field.value}
  onCheckedChange={field.onChange}
/>
```

**Comportamiento:**
- `true` → IA responde automáticamente desde el inicio
- `false` → Conversación manual

## 📋 Validación con Zod

### **Schema**
```typescript
const CreateConversationFormSchema = z.object({
  contactId: z.string().min(1, "Debes seleccionar un contacto"),
  type: z.enum(['SUPPORT', 'SALES', 'GENERAL']).default('GENERAL'),
  status: z.enum(['ACTIVA', 'PAUSADA', 'FINALIZADA', 'ARCHIVADA']).default('ACTIVA'),
  channel: z.enum(['WHATSAPP', 'TELEGRAM', 'INSTAGRAM', 'FACEBOOK']),
  title: z.string().optional().nullable(),
  isAiActive: z.boolean().default(false),
  evolutionInstanceId: z.string().optional().nullable(),
  initialMessage: z.string().optional()
})
```

### **Defaults**
```typescript
const CREATE_CONVERSATION_FORM_DEFAULTS = {
  contactId: '',
  type: 'GENERAL' as ConversationType,
  status: 'ACTIVA' as ConversationStatus,
  channel: ContactChannel.WHATSAPP,
  title: null,
  isAiActive: false,
  evolutionInstanceId: null,
  initialMessage: undefined
}
```

### **Modo de validación**
```typescript
const form = useForm<CreateConversationFormInput>({
  resolver: zodResolver(CreateConversationFormSchema),
  defaultValues: CREATE_CONVERSATION_FORM_DEFAULTS,
  mode: "onChange"  // ← Validación en tiempo real
})
```

## ⚡ Optimizaciones Aplicadas

### **1. Focus automático en búsqueda**
```typescript
useEffect(() => {
  if (isSelectOpen && searchInputRef.current) {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)  // Delay para asegurar DOM listo
    return () => clearTimeout(timer)
  }
}, [isSelectOpen])
```

**Por qué:** UX mejorada, usuario puede buscar inmediatamente.

### **2. Memoización de contactos filtrados**
```typescript
const filteredContacts = useMemo(() => {
  // Filtrado pesado
}, [contacts, searchTerm])
```

**Beneficio:** No re-computa en cada render.

### **3. Memoización de contacto seleccionado**
```typescript
const selectedContact = useMemo(() => {
  return contactId ? contacts.find(c => c.id === contactId) : null
}, [contacts, contactId])
```

**Beneficio:** Preview actualizado solo cuando cambia contactId.

### **4. Event propagation en búsqueda**
```typescript
<Input
  onKeyDown={(e) => {
    e.stopPropagation()
    if (e.key === 'Enter') e.preventDefault()
  }}
  onMouseDown={(e) => e.stopPropagation()}
  onFocus={(e) => e.stopPropagation()}
/>
```

**Por qué:** Evita que Select se cierre al interactuar con búsqueda.

### **5. Cache de queries**
```typescript
const { data: contacts } = api.contactos.list.useQuery(
  { clientId },
  { staleTime: 5 * 60 * 1000 }  // 5 min cache
)
```

## 🎨 Manejo de Errores

### **Errores de validación**
```typescript
{form.formState.errors.contactId?.message && (
  <p className="text-sm text-red-500">
    {form.formState.errors.contactId.message}
  </p>
)}
```

### **Errores de mutación**
```typescript
onError: (error: TRPCClientErrorLike<AppRouter>) => {
  let errorTitle = "Error al crear conversación"
  let errorMessage = "Ha ocurrido un error inesperado"
  
  const errMsg = error.message
  
  if (errMsg.includes("ya existe una conversación")) {
    errorTitle = "Conversación duplicada"
    errorMessage = "Ya existe una conversación activa con este contacto en el mismo canal."
  } else if (errMsg.includes("contacto no encontrado")) {
    errorTitle = "Contacto no encontrado"
    errorMessage = "El contacto seleccionado no existe."
  } else if (errMsg.includes("instancia no encontrada")) {
    errorTitle = "Instancia no encontrada"
    errorMessage = "La instancia de WhatsApp seleccionada no está disponible."
  } else {
    errorMessage = errMsg
  }
  
  toast({
    title: errorTitle,
    description: errorMessage,
    variant: "destructive"
  })
}
```

## 🔄 Invalidación de Caché

```typescript
onSuccess: async (data) => {
  await Promise.all([
    utils.conversaciones.list.invalidate({ 
      clientId: clientId!, 
      filters: {} 
    }),
    utils.conversaciones.byId.invalidate({ 
      id: data.id 
    })
  ])
  
  toast({
    title: "¡Conversación creada!",
    description: `La conversación con ${data.contact?.name} se ha creado.`
  })
  
  router.push('/saas/conversaciones')
}
```

**Por qué Promise.all:**
- Invalida ambas queries en paralelo
- Await asegura que termine antes de navegar

## 🚀 Posibles Mejoras

### **1. Templates de mensajes iniciales**
```typescript
// Mejora: Mensajes predefinidos
const templates = [
  { 
    id: 'welcome', 
    label: 'Bienvenida', 
    content: '¡Hola {{name}}! Gracias por contactarnos. ¿En qué podemos ayudarte?' 
  },
  { 
    id: 'followup', 
    label: 'Seguimiento', 
    content: 'Hola {{name}}, te contacto para dar seguimiento a tu consulta.' 
  }
]

<Select 
  onValueChange={(templateId) => {
    const template = templates.find(t => t.id === templateId)
    const content = template.content.replace('{{name}}', selectedContact.name)
    form.setValue('initialMessage', content)
  }}
>
  {templates.map(t => (
    <SelectItem value={t.id}>{t.label}</SelectItem>
  ))}
</Select>
```

### **2. Validación de duplicados en tiempo real**
```typescript
// Mejora: Avisar si ya existe conversación
const { data: existingConversation } = api.conversaciones.findExisting.useQuery(
  {
    contactId: form.watch('contactId'),
    channel: form.watch('channel')
  },
  { enabled: !!form.watch('contactId') && !!form.watch('channel') }
)

{existingConversation && (
  <Alert variant="warning">
    Ya existe una conversación {existingConversation.status} con este contacto en {existingConversation.channel}.
    <Button onClick={() => router.push(`/saas/conversaciones?id=${existingConversation.id}`)}>
      Ir a conversación
    </Button>
  </Alert>
)}
```

### **3. Quick create desde contactos**
```typescript
// Mejora: Preseleccionar contacto desde URL
const searchParams = useSearchParams()
const contactIdParam = searchParams.get('contactId')

useEffect(() => {
  if (contactIdParam) {
    form.setValue('contactId', contactIdParam)
  }
}, [contactIdParam])

// Desde módulo de contactos:
// <Button onClick={() => router.push(`/saas/conversaciones/nueva?contactId=${contact.id}`)}>
//   Iniciar conversación
// </Button>
```

### **4. Autocompletado inteligente de canal**
```typescript
// Mejora: Sugerir canal basado en contacto
const suggestedChannel = useMemo(() => {
  if (!selectedContact) return null
  
  // Si tiene WhatsApp, sugerir WhatsApp
  if (selectedContact.phone) return ContactChannel.WHATSAPP
  
  // Si tiene Instagram handle, sugerir Instagram
  if (selectedContact.instagramHandle) return ContactChannel.INSTAGRAM
  
  return null
}, [selectedContact])

useEffect(() => {
  if (suggestedChannel && !form.watch('channel')) {
    form.setValue('channel', suggestedChannel)
    toast({
      title: `Canal sugerido: ${suggestedChannel}`,
      description: 'Basado en la información del contacto'
    })
  }
}, [suggestedChannel])
```

### **5. Asignación automática**
```typescript
// Mejora: Asignar conversación al crear
<div className="space-y-2">
  <Label>Asignar a (opcional)</Label>
  <Select 
    value={form.watch('assignedUserId')}
    onValueChange={(value) => form.setValue('assignedUserId', value)}
  >
    <SelectItem value="me">Asignarme a mí</SelectItem>
    {users.map(user => (
      <SelectItem value={user.id}>{user.name}</SelectItem>
    ))}
  </Select>
</div>
```

### **6. Vista previa del mensaje**
```typescript
// Mejora: Preview con variables reemplazadas
{initialMessage && selectedContact && (
  <div className="p-3 bg-gray-50 border rounded-xl">
    <h4 className="text-sm font-medium mb-2">Vista previa:</h4>
    <div className="bg-white p-3 rounded-lg">
      {initialMessage
        .replace('{{name}}', selectedContact.name)
        .replace('{{email}}', selectedContact.email || '')
      }
    </div>
  </div>
)}
```

### **7. Múltiples contactos a la vez**
```typescript
// Mejora: Crear varias conversaciones
<Controller
  name="contactIds"
  render={({ field }) => (
    <MultiSelect
      options={contacts}
      value={field.value}
      onChange={field.onChange}
    />
  )}
/>

// En submit:
for (const contactId of formData.contactIds) {
  await createConversationMutation.mutateAsync({
    ...formData,
    contactId
  })
}
```

### **8. Etiquetas iniciales**
```typescript
// Mejora: Agregar tags al crear
<div className="space-y-2">
  <Label>Etiquetas (opcional)</Label>
  <MultiSelect
    options={availableTags}
    value={selectedTags}
    onChange={setSelectedTags}
  />
</div>

// En payload:
{
  ...conversationData,
  tags: selectedTags
}
```

## ⚠️ Consideraciones

### **Instancia solo para WhatsApp**
```typescript
// Si canal !== WHATSAPP, ignorar evolutionInstanceId
if (formData.channel !== ContactChannel.WHATSAPP) {
  formData.evolutionInstanceId = null
}
```

### **Conversaciones duplicadas**
```typescript
// Backend debe validar:
// - Un contacto no puede tener 2 conversaciones ACTIVAS en mismo canal
// - Permitir múltiples conversaciones si están FINALIZADAS
```

### **Mensaje inicial con IA activa**
```typescript
// Si isAiActive === true y hay initialMessage:
// ¿Quién envía el mensaje inicial?
// 
// Opción A: Sistema lo envía, luego IA toma control
// Opción B: IA analiza y responde según contexto
// 
// Actual: Sistema envía, IA responde después
```

---

**Última actualización:** Análisis detallado - Octubre 2025

