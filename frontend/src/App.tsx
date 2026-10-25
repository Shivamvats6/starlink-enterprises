import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { SettingsProvider } from '@/context/SettingsContext'
import { AdminProvider } from '@/admin/AdminContext'
import { PublicLayout } from '@/layouts/PublicLayout'

const Home = lazy(() => import('@/pages/Home'))
const About = lazy(() => import('@/pages/About'))
const Services = lazy(() => import('@/pages/Services'))
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'))
const Projects = lazy(() => import('@/pages/Projects'))
const ProjectDetail = lazy(() => import('@/pages/ProjectDetail'))
const Process = lazy(() => import('@/pages/Process'))
const WhyChoose = lazy(() => import('@/pages/WhyChoose'))
const Contact = lazy(() => import('@/pages/Contact'))
const Legal = lazy(() => import('@/pages/Legal'))
const NotFound = lazy(() => import('@/pages/NotFound'))

const AdminLayout = lazy(() => import('@/admin/AdminLayout'))
const Login = lazy(() => import('@/admin/Login'))
const Dashboard = lazy(() => import('@/admin/Dashboard'))
const ProjectsList = lazy(() => import('@/admin/ProjectsList'))
const ProjectForm = lazy(() => import('@/admin/ProjectForm'))
const Leads = lazy(() => import('@/admin/Leads'))
const MediaLibrary = lazy(() => import('@/admin/MediaLibrary'))
const SettingsPage = lazy(() => import('@/admin/SettingsPage'))
const SeoPage = lazy(() => import('@/admin/SeoPage'))
const M = {
  Services: lazy(() => import('@/admin/Modules').then((m) => ({ default: m.ServicesAdmin }))),
  Categories: lazy(() => import('@/admin/Modules').then((m) => ({ default: m.CategoriesAdmin }))),
  Testimonials: lazy(() => import('@/admin/Modules').then((m) => ({ default: m.TestimonialsAdmin }))),
  Team: lazy(() => import('@/admin/Modules').then((m) => ({ default: m.TeamAdmin }))),
  Pages: lazy(() => import('@/admin/Modules').then((m) => ({ default: m.PagesAdmin }))),
  Banners: lazy(() => import('@/admin/Modules').then((m) => ({ default: m.BannersAdmin }))),
}

const Fallback = <div className="grid min-h-[50vh] place-items-center text-sm text-muted" role="status">Loading…</div>

export default function App() {
  return (
    <Suspense fallback={Fallback}>
      <Routes>
        <Route path="/admin/login" element={<AdminProvider><Login /></AdminProvider>} />
        <Route path="/admin" element={<AdminProvider><AdminLayout /></AdminProvider>}>
          <Route index element={<Dashboard />} />
          <Route path="banners" element={<M.Banners />} />
          <Route path="projects" element={<ProjectsList />} />
          <Route path="projects/:id" element={<ProjectForm />} />
          <Route path="categories" element={<M.Categories />} />
          <Route path="services" element={<M.Services />} />
          <Route path="pages" element={<M.Pages />} />
          <Route path="leads" element={<Leads />} />
          <Route path="seo" element={<SeoPage />} />
          <Route path="media" element={<MediaLibrary />} />
          <Route path="testimonials" element={<M.Testimonials />} />
          <Route path="team" element={<M.Team />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route element={<SettingsProvider><PublicLayout /></SettingsProvider>}>
          <Route index element={<Home />} />
          <Route path="about-us" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path="our-process" element={<Process />} />
          <Route path="why-choose-us" element={<WhyChoose />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<Legal slug="privacy-policy" />} />
          <Route path="terms-and-conditions" element={<Legal slug="terms-and-conditions" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
