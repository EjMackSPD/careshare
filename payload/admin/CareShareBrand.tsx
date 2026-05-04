import Image from "next/image";

const logoSrc = "/careshare-logo.png";

export function CareShareAdminLogo() {
  return (
    <div className="careshare-admin-logo" aria-label="CareShare">
      <Image alt="CareShare" height={465} priority src={logoSrc} width={1147} />
      <span className="careshare-admin-logo__label">CMS</span>
    </div>
  );
}

export function CareShareAdminIcon() {
  return (
    <Image
      alt="CareShare"
      className="careshare-admin-icon"
      height={32}
      src="/android-chrome-192x192.png"
      width={32}
    />
  );
}

export function CareShareAdminNavBrand() {
  return (
    <div className="careshare-nav-brand" aria-label="CareShare CMS">
      <div className="careshare-nav-brand__logo">
        <Image alt="CareShare" height={465} priority src={logoSrc} width={1147} />
      </div>
      <p className="careshare-nav-brand__eyebrow">Content + support admin</p>
    </div>
  );
}

export function CareShareAdminDashboardIntro() {
  return (
    <section className="careshare-admin-intro">
      <div className="careshare-admin-intro__inner">
        <div>
          <p className="careshare-admin-intro__eyebrow">CareShare CMS</p>
          <h1>Manage content and support operations.</h1>
          <p>
            Edit public pages, publish stories, review contact submissions, and support
            family operations from one protected workspace.
          </p>
        </div>
        <div className="careshare-admin-intro__mark" aria-hidden="true">
          <Image alt="" height={32} src="/favicon-32x32.png" width={32} />
        </div>
      </div>
    </section>
  );
}

export function CareShareLoginBranding() {
  return (
    <>
      <aside className="careshare-login-panel">
        <div>
          <div className="careshare-login-panel__logo">
            <Image alt="CareShare" height={465} priority src={logoSrc} width={1147} />
          </div>
          <h1>Care coordination starts here.</h1>
          <p>
            Manage CareShare pages, stories, submissions, and support operations from one
            calm workspace.
          </p>
        </div>
        <div className="careshare-login-panel__meta">
          <span>Content + support admin</span>
          <div className="careshare-login-panel__rail" aria-hidden="true">
            <div />
            <div />
            <div />
          </div>
        </div>
      </aside>
    </>
  );
}

export function CareShareLoginFooter() {
  return (
    <p className="careshare-login-footer">
      Protected CareShare workspace. Use your assigned Payload account to continue.
    </p>
  );
}
