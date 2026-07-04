import siteConfig from '@/data/siteConfig.json'

/**
 * Shared Currently panel — identical on every page that shows it.
 */
export default function CurrentlyPanel() {
  return (
    <section className="panel">
      <div className="ph">
        <span className="title">Currently</span>
      </div>
      <div className="pb nowbox">
        <div className="np">
          <span className="nk">Reading</span>
          <br />
          {siteConfig.currentlyReading}
        </div>
        <div className="np">
          <span className="nk">On the shelf</span>
          <br />
          {siteConfig.onTheShelf}
        </div>
        <div className="np">
          <span className="nk">Building</span>
          <br />
          {siteConfig.building}
        </div>
      </div>
    </section>
  )
}
