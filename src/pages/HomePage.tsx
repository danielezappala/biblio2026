import type { ReactNode } from 'react'
import { BookOpen, Download, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-4 py-10">
      <section className="rounded-2xl border bg-card p-6 shadow-sm sm:p-10">
        <div className="mb-8 space-y-3">
          <p className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            Biblio2026
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Biblioteca domestica condivisa</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Scaffold iniziale pronto con React, TypeScript, Tailwind e componenti UI. La base e pronta per
            implementare autenticazione, catalogo e gestione libri.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FeatureItem
            icon={<ShieldCheck className="h-4 w-4" />}
            title="Ruoli e permessi"
            description="Owner e Viewer con regole Firestore e visibilita azioni lato UI."
          />
          <FeatureItem
            icon={<Download className="h-4 w-4" />}
            title="Export CSV"
            description="Requisito MVP gia previsto nella base documentale e pronto da implementare."
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button>Inizia sviluppo</Button>
          <Button variant="outline">Apri task MVP</Button>
        </div>
      </section>
    </main>
  )
}

type FeatureItemProps = {
  title: string
  description: string
  icon: ReactNode
}

function FeatureItem({ title, description, icon }: FeatureItemProps) {
  return (
    <article className="rounded-xl border bg-background p-4">
      <p className="mb-2 inline-flex rounded-md bg-secondary p-2 text-secondary-foreground">{icon}</p>
      <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>
    </article>
  )
}
