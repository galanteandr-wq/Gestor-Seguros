'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPolicy() {
  const router = useRouter()
  const [form, setForm] = useState<any>({ estado: 'Activa' })
  const [saving, setSaving] = useState(false)
  const onChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e: any) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    setSaving(false)
    if (res.ok) router.push('/policies')
    else alert('Error al guardar')
  }

  return (
    <div className="min-h-screen">
      <div className="container py-6">
        <h1 className="text-xl font-semibold">Nueva póliza</h1>
        <form onSubmit={submit} className="card p-4 mt-4 grid gap-4 md:grid-cols-2">
          <input className="input" name="nombre" placeholder="Nombre" onChange={onChange} required />
          <input className="input" name="apellido" placeholder="Apellido" onChange={onChange} required />
          <input className="input" name="dniCuit" placeholder="DNI/CUIT" onChange={onChange} required />
          <input className="input" name="patente" placeholder="Patente (AAA000 / AA000AA)" onChange={onChange} required />
          <input className="input" name="empresa" placeholder="Empresa" onChange={onChange} required />
          <input className="input" name="numeroPoliza" placeholder="Nº de póliza" onChange={onChange} required />
          <input className="input" name="fechaInicio" type="date" placeholder="Inicio" onChange={onChange} />
          <input className="input" name="fechaVencimiento" type="date" placeholder="Vencimiento" onChange={onChange} required />
          <input className="input" name="monto" type="number" step="0.01" placeholder="Monto / Prima" onChange={onChange} />
          <input className="input" name="cobertura" placeholder="Cobertura" onChange={onChange} />
          <input className="input" name="estado" placeholder="Estado" defaultValue="Activa" onChange={onChange} />
          <textarea className="input min-h-[100px]" name="observaciones" placeholder="Observaciones" onChange={onChange} />
          <div className="md:col-span-2 flex justify-end gap-2">
            <a href="/policies" className="btn">Cancelar</a>
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
