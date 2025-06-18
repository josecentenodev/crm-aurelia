"use client"
import { useState } from "react"
import React from "react"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../_components/ui/card"
import { Button } from "../../../_components/ui/button"
import { Input } from "../../../_components/ui/input"
import { Label } from "../../../_components/ui/label"
import { Textarea } from "../../../_components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../_components/ui/select"
import { Checkbox } from "../../../_components/ui/checkbox"
import { Progress } from "../../../_components/ui/progress"
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Store,
  Package,
  CreditCard,
  Sparkles,
  HeadphonesIcon,
  Zap,
  Settings,
  Plus,
  Trash2,
} from "lucide-react"
import Link from "next/link"

const steps = [
  { id: 1, title: "Tienda", icon: Store, description: "Información básica" },
  { id: 2, title: "Catálogo", icon: Package, description: "Productos y categorías" },
  { id: 3, title: "Carrito", icon: ShoppingCart, description: "Configuración del carrito" },
  { id: 4, title: "Checkout", icon: CreditCard, description: "Proceso de pago" },
  { id: 5, title: "Recomendaciones", icon: Sparkles, description: "Motor de sugerencias" },
  { id: 6, title: "Soporte", icon: HeadphonesIcon, description: "Post-venta y ayuda" },
  { id: 7, title: "Automatizaciones", icon: Zap, description: "Triggers y acciones" },
  { id: 8, title: "Configuración", icon: Settings, description: "Finalizar setup" },
]

export default function NuevoAsistenteEcommercePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Paso 1: Información de la tienda
    storeName: "",
    storeType: "",
    industry: "",
    targetAudience: "",
    averageOrderValue: "",
    monthlyOrders: "",

    // Paso 2: Catálogo
    productCategories: [""],
    hasVariants: false,
    hasInventory: false,
    productCount: "",
    priceRange: "",

    // Paso 3: Carrito
    cartFeatures: [],
    abandonedCartEnabled: false,
    cartReminders: "",
    minimumOrder: "",

    // Paso 4: Checkout
    paymentMethods: [],
    shippingOptions: [],
    guestCheckout: false,
    checkoutSteps: "",

    // Paso 5: Recomendaciones
    recommendationType: "",
    recommendationTriggers: [],
    crossSelling: false,
    upSelling: false,

    // Paso 6: Soporte
    supportChannels: [],
    returnPolicy: "",
    warrantyInfo: "",
    faqTopics: [""],

    // Paso 7: Automatizaciones
    automations: [],
    emailTemplates: [],

    // Paso 8: Configuración final
    assistantName: "",
    conversationStyle: "",
    description: "",
  })

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addArrayItem = (field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), ""],
    }))
  }

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index),
    }))
  }

  const updateArrayItem = (field: string, index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => (i === index ? value : item)),
    }))
  }

  const nextStep = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    console.log("Configuración del asistente de eCommerce:", formData)
    router.push("/asistentes")
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Información de tu Tienda Online</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storeName">Nombre de la tienda</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => updateFormData("storeName", e.target.value)}
                    placeholder="Mi Tienda Online"
                  />
                </div>
                <div>
                  <Label htmlFor="storeType">Tipo de tienda</Label>
                  <Select value={formData.storeType} onValueChange={(value) => updateFormData("storeType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2c">B2C (Consumidor final)</SelectItem>
                      <SelectItem value="b2b">B2B (Empresas)</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="dropshipping">Dropshipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="industry">Industria</Label>
                  <Select value={formData.industry} onValueChange={(value) => updateFormData("industry", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la industria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fashion">Moda y Accesorios</SelectItem>
                      <SelectItem value="electronics">Electrónicos</SelectItem>
                      <SelectItem value="home">Hogar y Jardín</SelectItem>
                      <SelectItem value="beauty">Belleza y Cuidado</SelectItem>
                      <SelectItem value="sports">Deportes y Fitness</SelectItem>
                      <SelectItem value="books">Libros y Medios</SelectItem>
                      <SelectItem value="food">Alimentos y Bebidas</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetAudience">Audiencia objetivo</Label>
                  <Input
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => updateFormData("targetAudience", e.target.value)}
                    placeholder="Ej: Mujeres 25-45 años"
                  />
                </div>
                <div>
                  <Label htmlFor="averageOrderValue">Ticket promedio (USD)</Label>
                  <Input
                    id="averageOrderValue"
                    value={formData.averageOrderValue}
                    onChange={(e) => updateFormData("averageOrderValue", e.target.value)}
                    placeholder="50"
                    type="number"
                  />
                </div>
                <div>
                  <Label htmlFor="monthlyOrders">Pedidos mensuales</Label>
                  <Input
                    id="monthlyOrders"
                    value={formData.monthlyOrders}
                    onChange={(e) => updateFormData("monthlyOrders", e.target.value)}
                    placeholder="100"
                    type="number"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Catálogo de Productos</h3>
              <div className="space-y-4">
                <div>
                  <Label>Categorías de productos</Label>
                  {formData.productCategories.map((category, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={category}
                        onChange={(e) => updateArrayItem("productCategories", index, e.target.value)}
                        placeholder="Ej: Camisetas, Pantalones, Zapatos"
                      />
                      {formData.productCategories.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("productCategories", index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("productCategories")}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar categoría
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="productCount">Cantidad de productos</Label>
                    <Select
                      value={formData.productCount}
                      onValueChange={(value) => updateFormData("productCount", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el rango" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-50">1-50 productos</SelectItem>
                        <SelectItem value="51-200">51-200 productos</SelectItem>
                        <SelectItem value="201-1000">201-1000 productos</SelectItem>
                        <SelectItem value="1000+">Más de 1000 productos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priceRange">Rango de precios (USD)</Label>
                    <Select value={formData.priceRange} onValueChange={(value) => updateFormData("priceRange", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el rango" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-25">$1 - $25</SelectItem>
                        <SelectItem value="26-100">$26 - $100</SelectItem>
                        <SelectItem value="101-500">$101 - $500</SelectItem>
                        <SelectItem value="500+">Más de $500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasVariants"
                      checked={formData.hasVariants}
                      onCheckedChange={(checked) => updateFormData("hasVariants", checked)}
                    />
                    <Label htmlFor="hasVariants">Los productos tienen variantes (tallas, colores, etc.)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasInventory"
                      checked={formData.hasInventory}
                      onCheckedChange={(checked) => updateFormData("hasInventory", checked)}
                    />
                    <Label htmlFor="hasInventory">Manejo control de inventario</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configuración del Carrito</h3>
              <div className="space-y-4">
                <div>
                  <Label>Funcionalidades del carrito</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      "Guardar para después",
                      "Lista de deseos",
                      "Carrito persistente",
                      "Descuentos por cantidad",
                      "Envío gratis por monto",
                      "Productos relacionados",
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={formData.cartFeatures.includes(feature)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("cartFeatures", [...formData.cartFeatures, feature])
                            } else {
                              updateFormData(
                                "cartFeatures",
                                formData.cartFeatures.filter((f) => f !== feature),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={feature} className="text-sm">
                          {feature}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minimumOrder">Pedido mínimo (USD)</Label>
                    <Input
                      id="minimumOrder"
                      value={formData.minimumOrder}
                      onChange={(e) => updateFormData("minimumOrder", e.target.value)}
                      placeholder="25"
                      type="number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cartReminders">Recordatorios de carrito abandonado</Label>
                    <Select
                      value={formData.cartReminders}
                      onValueChange={(value) => updateFormData("cartReminders", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1hour">1 hora después</SelectItem>
                        <SelectItem value="24hours">24 horas después</SelectItem>
                        <SelectItem value="3days">3 días después</SelectItem>
                        <SelectItem value="weekly">Semanalmente</SelectItem>
                        <SelectItem value="disabled">Deshabilitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="abandonedCartEnabled"
                    checked={formData.abandonedCartEnabled}
                    onCheckedChange={(checked) => updateFormData("abandonedCartEnabled", checked)}
                  />
                  <Label htmlFor="abandonedCartEnabled">Habilitar recuperación de carrito abandonado</Label>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Proceso de Checkout</h3>
              <div className="space-y-4">
                <div>
                  <Label>Métodos de pago aceptados</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      "Tarjeta de crédito/débito",
                      "PayPal",
                      "Apple Pay",
                      "Google Pay",
                      "Transferencia bancaria",
                      "Pago contra entrega",
                    ].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={method}
                          checked={formData.paymentMethods.includes(method)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("paymentMethods", [...formData.paymentMethods, method])
                            } else {
                              updateFormData(
                                "paymentMethods",
                                formData.paymentMethods.filter((m) => m !== method),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={method} className="text-sm">
                          {method}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Opciones de envío</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      "Envío estándar",
                      "Envío express",
                      "Envío gratis",
                      "Retiro en tienda",
                      "Envío internacional",
                      "Envío programado",
                    ].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={formData.shippingOptions.includes(option)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("shippingOptions", [...formData.shippingOptions, option])
                            } else {
                              updateFormData(
                                "shippingOptions",
                                formData.shippingOptions.filter((o) => o !== option),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={option} className="text-sm">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="checkoutSteps">Pasos del checkout</Label>
                    <Select
                      value={formData.checkoutSteps}
                      onValueChange={(value) => updateFormData("checkoutSteps", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el flujo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Una sola página</SelectItem>
                        <SelectItem value="multi">Múltiples pasos</SelectItem>
                        <SelectItem value="accordion">Acordeón expandible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                      id="guestCheckout"
                      checked={formData.guestCheckout}
                      onCheckedChange={(checked) => updateFormData("guestCheckout", checked)}
                    />
                    <Label htmlFor="guestCheckout">Permitir checkout como invitado</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Motor de Recomendaciones</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recommendationType">Tipo de recomendaciones</Label>
                  <Select
                    value={formData.recommendationType}
                    onValueChange={(value) => updateFormData("recommendationType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collaborative">Filtrado colaborativo</SelectItem>
                      <SelectItem value="content">Basado en contenido</SelectItem>
                      <SelectItem value="hybrid">Híbrido</SelectItem>
                      <SelectItem value="trending">Productos populares</SelectItem>
                      <SelectItem value="manual">Recomendaciones manuales</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Triggers para recomendaciones</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {[
                      "Página de producto",
                      "Carrito de compras",
                      "Después de compra",
                      "Email marketing",
                      "Página de inicio",
                      "Búsqueda sin resultados",
                    ].map((trigger) => (
                      <div key={trigger} className="flex items-center space-x-2">
                        <Checkbox
                          id={trigger}
                          checked={formData.recommendationTriggers.includes(trigger)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("recommendationTriggers", [...formData.recommendationTriggers, trigger])
                            } else {
                              updateFormData(
                                "recommendationTriggers",
                                formData.recommendationTriggers.filter((t) => t !== trigger),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={trigger} className="text-sm">
                          {trigger}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="crossSelling"
                      checked={formData.crossSelling}
                      onCheckedChange={(checked) => updateFormData("crossSelling", checked)}
                    />
                    <Label htmlFor="crossSelling">Habilitar cross-selling (productos complementarios)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="upSelling"
                      checked={formData.upSelling}
                      onCheckedChange={(checked) => updateFormData("upSelling", checked)}
                    />
                    <Label htmlFor="upSelling">Habilitar up-selling (productos premium)</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte y Post-Venta</h3>
              <div className="space-y-4">
                <div>
                  <Label>Canales de soporte</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {["Chat en vivo", "Email", "WhatsApp", "Teléfono", "FAQ automático", "Video llamadas"].map(
                      (channel) => (
                        <div key={channel} className="flex items-center space-x-2">
                          <Checkbox
                            id={channel}
                            checked={formData.supportChannels.includes(channel)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFormData("supportChannels", [...formData.supportChannels, channel])
                              } else {
                                updateFormData(
                                  "supportChannels",
                                  formData.supportChannels.filter((c) => c !== channel),
                                )
                              }
                            }}
                          />
                          <Label htmlFor={channel} className="text-sm">
                            {channel}
                          </Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div>
                  <Label>Temas frecuentes del FAQ</Label>
                  {formData.faqTopics.map((topic, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input
                        value={topic}
                        onChange={(e) => updateArrayItem("faqTopics", index, e.target.value)}
                        placeholder="Ej: Política de devoluciones, Tiempos de envío"
                      />
                      {formData.faqTopics.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeArrayItem("faqTopics", index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("faqTopics")}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar tema
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="returnPolicy">Política de devoluciones</Label>
                    <Textarea
                      id="returnPolicy"
                      value={formData.returnPolicy}
                      onChange={(e) => updateFormData("returnPolicy", e.target.value)}
                      placeholder="Describe tu política de devoluciones..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warrantyInfo">Información de garantía</Label>
                    <Textarea
                      id="warrantyInfo"
                      value={formData.warrantyInfo}
                      onChange={(e) => updateFormData("warrantyInfo", e.target.value)}
                      placeholder="Describe las garantías que ofreces..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Automatizaciones</h3>
              <div className="space-y-4">
                <div>
                  <Label>Automatizaciones disponibles</Label>
                  <div className="space-y-3 mt-2">
                    {[
                      { id: "welcome", name: "Email de bienvenida", desc: "Enviar cuando se registra un usuario" },
                      { id: "abandoned", name: "Carrito abandonado", desc: "Recordar productos no comprados" },
                      { id: "order-confirm", name: "Confirmación de pedido", desc: "Confirmar compra realizada" },
                      { id: "shipping", name: "Notificación de envío", desc: "Informar cuando se envía el pedido" },
                      { id: "review", name: "Solicitud de reseña", desc: "Pedir opinión después de la entrega" },
                      { id: "restock", name: "Notificación de stock", desc: "Avisar cuando hay productos disponibles" },
                    ].map((automation) => (
                      <div key={automation.id} className="flex items-start space-x-2 p-3 border rounded-lg">
                        <Checkbox
                          id={automation.id}
                          checked={formData.automations.includes(automation.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("automations", [...formData.automations, automation.id])
                            } else {
                              updateFormData(
                                "automations",
                                formData.automations.filter((a) => a !== automation.id),
                              )
                            }
                          }}
                        />
                        <div>
                          <Label htmlFor={automation.id} className="font-medium">
                            {automation.name}
                          </Label>
                          <p className="text-sm text-gray-600">{automation.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Templates de email personalizados</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {["Bienvenida", "Confirmación", "Envío", "Entrega", "Reseña", "Promociones"].map((template) => (
                      <div key={template} className="flex items-center space-x-2">
                        <Checkbox
                          id={template}
                          checked={formData.emailTemplates.includes(template)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              updateFormData("emailTemplates", [...formData.emailTemplates, template])
                            } else {
                              updateFormData(
                                "emailTemplates",
                                formData.emailTemplates.filter((t) => t !== template),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={template} className="text-sm">
                          {template}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Configuración Final</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="assistantName">Nombre del asistente</Label>
                  <Input
                    id="assistantName"
                    value={formData.assistantName}
                    onChange={(e) => updateFormData("assistantName", e.target.value)}
                    placeholder="Ej: Asistente de Compras, ShopBot"
                  />
                </div>

                <div>
                  <Label htmlFor="conversationStyle">Estilo de conversación</Label>
                  <Select
                    value={formData.conversationStyle}
                    onValueChange={(value) => updateFormData("conversationStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el estilo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Amigable y cercano</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="casual">Casual y relajado</SelectItem>
                      <SelectItem value="enthusiastic">Entusiasta</SelectItem>
                      <SelectItem value="helpful">Servicial y detallado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descripción del asistente</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Describe qué hace tu asistente de eCommerce y cómo ayuda a los clientes..."
                    rows={4}
                  />
                </div>

                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-800 mb-2">Resumen de configuración</h4>
                  <div className="text-sm text-pink-700 space-y-1">
                    <p>• Tienda: {formData.storeName || "Sin nombre"}</p>
                    <p>• Tipo: {formData.storeType || "No especificado"}</p>
                    <p>• Categorías: {formData.productCategories.filter((c) => c).length} configuradas</p>
                    <p>• Funcionalidades del carrito: {formData.cartFeatures.length} habilitadas</p>
                    <p>• Métodos de pago: {formData.paymentMethods.length} configurados</p>
                    <p>• Automatizaciones: {formData.automations.length} activas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getSidebarContent = () => {
    const previews = {
      1: {
        title: "Vista previa de la tienda",
        content: `Hola! Soy el asistente de ${formData.storeName || "tu tienda"}. Te ayudo con todo lo relacionado a compras online.`,
      },
      2: {
        title: "Catálogo configurado",
        content: `Tenemos productos en ${formData.productCategories.filter((c) => c).length} categorías diferentes. ¿Qué estás buscando?`,
      },
      3: {
        title: "Asistencia con carrito",
        content: `Veo que tienes productos en tu carrito. ¿Te ayudo a completar tu compra o necesitas más información?`,
      },
      4: {
        title: "Proceso de checkout",
        content: `Perfecto! Te guío paso a paso en el proceso de compra. Tenemos ${formData.paymentMethods.length} métodos de pago disponibles.`,
      },
      5: {
        title: "Recomendaciones personalizadas",
        content: `Basándome en tus preferencias, te recomiendo estos productos que podrían interesarte...`,
      },
      6: {
        title: "Soporte post-venta",
        content: `¿Tienes alguna pregunta sobre tu pedido? Estoy aquí para ayudarte con devoluciones, garantías y más.`,
      },
      7: {
        title: "Automatizaciones activas",
        content: `Sistema configurado con ${formData.automations.length} automatizaciones para mejorar tu experiencia de compra.`,
      },
      8: {
        title: "Asistente listo",
        content: `${formData.assistantName || "Tu asistente"} está configurado y listo para ayudar a tus clientes con sus compras.`,
      },
    }

    const tips = {
      1: [
        "Define claramente tu nicho de mercado",
        "El ticket promedio ayuda a personalizar recomendaciones",
        "La audiencia objetivo mejora las sugerencias",
      ],
      2: [
        "Organiza productos en categorías claras",
        "Las variantes mejoran la experiencia de compra",
        "El control de inventario evita sobreventa",
      ],
      3: [
        "El carrito persistente reduce abandono",
        "Los recordatorios recuperan ventas perdidas",
        "El pedido mínimo optimiza logística",
      ],
      4: [
        "Múltiples métodos de pago aumentan conversión",
        "El checkout como invitado reduce fricción",
        "Opciones de envío flexibles mejoran satisfacción",
      ],
      5: [
        "Las recomendaciones aumentan el ticket promedio",
        "El cross-selling sugiere productos complementarios",
        "El up-selling ofrece opciones premium",
      ],
      6: [
        "El soporte proactivo mejora la experiencia",
        "Las FAQ reducen consultas repetitivas",
        "Las políticas claras generan confianza",
      ],
      7: [
        "Las automatizaciones ahorran tiempo",
        "Los emails personalizados mejoran engagement",
        "Los recordatorios recuperan carritos abandonados",
      ],
      8: [
        "Un nombre memorable facilita la adopción",
        "El estilo debe reflejar tu marca",
        "La descripción ayuda a los usuarios a entender el propósito",
      ],
    }

    return {
      preview: previews[currentStep as keyof typeof previews],
      tips: tips[currentStep as keyof typeof tips],
    }
  }

  const sidebarContent = getSidebarContent()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/asistentes/nuevo">
          <Button variant="ghost" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Asistente de eCommerce</h1>
          <p className="text-gray-600 mt-1">Configura un asistente especializado en ventas online</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Progreso de configuración</h2>
          <span className="text-sm text-gray-500">{currentStep}/8</span>
        </div>
        <Progress value={(currentStep / 8) * 100} className="mb-4" />

        {/* Steps Grid */}
        <div className="grid grid-cols-8 gap-2">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-pink-100 border-2 border-pink-300"
                    : isCompleted
                      ? "bg-pink-50 border border-pink-200"
                      : "bg-gray-50 border border-gray-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mb-2 ${
                    isActive ? "text-pink-600" : isCompleted ? "text-pink-500" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-xs font-medium text-center ${
                    isActive ? "text-pink-700" : isCompleted ? "text-pink-600" : "text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
                <span
                  className={`text-xs text-center mt-1 ${
                    isActive ? "text-pink-600" : isCompleted ? "text-pink-500" : "text-gray-400"
                  }`}
                >
                  {step.description}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl shadow-sm border-0 bg-white">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5 text-pink-600" })}
                <span>
                  Paso {currentStep}: {steps[currentStep - 1].title}
                </span>
              </CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                {currentStep === 8 ? (
                  <Button onClick={handleSubmit} className="rounded-xl bg-pink-600 hover:bg-pink-700">
                    Crear Asistente
                    <ShoppingCart className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={nextStep} className="rounded-xl bg-pink-600 hover:bg-pink-700">
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="rounded-2xl shadow-sm border-0 bg-gradient-to-br from-pink-50 to-pink-100">
            <CardHeader>
              <CardTitle className="text-pink-800">{sidebarContent.preview.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{sidebarContent.preview.content}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="rounded-2xl shadow-sm border-0">
            <CardHeader>
              <CardTitle className="text-gray-800">💡 Tips para este paso</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {sidebarContent.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <span className="text-pink-500 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
