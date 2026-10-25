import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import { Img } from './ui'
import { Icon } from '@/utils/icons'
import type { Project, Service } from '@/types'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.slug}`} className="group block overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="aspect-[16/10] overflow-hidden">
        <Img src={project.cover_image} alt={`${project.title} cover`} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          {project.category && <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">{project.category}</p>}
          <h3 className="truncate font-heading text-base font-bold">{project.title}</h3>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted"><MapPin size={12} aria-hidden="true" />{project.location}</p>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-navy transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-white" aria-hidden="true"><ArrowRight size={16} /></span>
      </div>
    </Link>
  )
}

export function ServiceImageCard({ service }: { service: Service }) {
  return (
    <Link to={`/services/${service.slug}`} className="group block overflow-hidden rounded-card border border-line bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Img src={service.cover_image} alt={`${service.title}`} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute -bottom-5 left-5 grid h-12 w-12 place-items-center rounded-full bg-white text-gold shadow-card"><Icon name={service.icon} /></span>
      </div>
      <div className="p-5 pt-8">
        <h3 className="font-heading text-lg font-bold">{service.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-body">{service.short_description}</p>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-navy transition-colors group-hover:text-gold">Know More <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
      </div>
    </Link>
  )
}

export function ServiceMiniCard({ service }: { service: Service }) {
  return (
    <Link to={`/services/${service.slug}`} className="group flex items-start gap-3 rounded-card border border-line bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-1">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/10 text-gold"><Icon name={service.icon} /></span>
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-sm font-bold">{service.title}</h3>
        <p className="mt-0.5 text-xs leading-snug text-muted">{service.short_description}</p>
      </div>
      <ArrowRight size={16} className="mt-1 shrink-0 text-gold transition-transform group-hover:translate-x-1" aria-hidden="true" />
    </Link>
  )
}
