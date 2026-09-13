export default function Footer() {
  return (
    <footer className="border-t border-border py-14 sm:py-16 md:py-20" id="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid gap-8 sm:gap-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">FlowLens</h2>
            <p className="mt-5 text-text-muted leading-7">
              Automation observability made easy.
            </p>
          </div>

          <a href="/login">
                <button
                
                
                className="w-full sm:w-auto rounded-xl bg-brand-orange px-8 py-3 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                Get Started
              </button>
              </a>
              {/* <span>hahskdhkasd</span> */}
        </div>

        <div className="mt-12 sm:mt-16 md:mt-20 border-t border-border pt-8 flex flex-col md:flex-row gap-3 justify-between items-center text-center md:text-left">
          <p className="text-gray-500">
            © {new Date().getFullYear()} FlowLens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}