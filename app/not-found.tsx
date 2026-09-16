import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <section className="card">
        <div className="card-body">
          <p className="eyebrow">Hmm</p>
          <h1 className="rsvp-title">That link doesn&rsquo;t look right</h1>
          <p className="intro">
            Check the link in your message, or open the general invite and reply with your name.
          </p>
          <Link className="btn btn-primary" href="/">
            Open the invite
          </Link>
        </div>
      </section>
    </main>
  );
}
