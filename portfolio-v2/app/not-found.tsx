import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import LostCards from '@/components/lost/LostCards'
import LostPath from '@/components/lost/LostPath'
import { getBuildSha } from '@/lib/build'

export const metadata = { title: 'Not Found' }

export default function NotFound() {
  return (
    <div className="shell">
      <SiteHeader
        ghost={['NOT', 'FOUND']}
        readoutTop="error :: 404"
        ticker={['404 · not found', 'try /writing']}
        build={getBuildSha()}
      />

      <main className="lost">
        <section className="panel">
          <div className="ph">
            <span className="title big">Lost &amp; Found</span>
            <span className="arch mono">ERR 404</span>
          </div>
          <div className="lost-hero">
            <div className="lost-big" aria-hidden="true">404</div>
            <div className="copy">
              <h1>This page wandered off.</h1>
              <p>
                Nothing lives at <LostPath />. It may have moved, or the link was mistyped.
                Here&apos;s where the good stuff is:
              </p>
            </div>
            <div className="lost-tape" aria-hidden="true" />
          </div>
        </section>

        <LostCards />
      </main>

      <SiteFooter page="404" />
    </div>
  )
}
