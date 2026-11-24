import { useLayoutEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Home, ModelPage } from "./pages";
import { PriceList } from "./pricelist";
import { ORDER_FORM, SITE_TITLE } from "./config";

/** Go back to the top when the page (not just the ?color= or ?variant= query) changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const printView = useLocation().pathname === "/pricelist";
  return (
    <>
      <ScrollToTop />
      {!printView && (
      <header className="site-header">
        <Link to="/">{SITE_TITLE}</Link>
        <a className="btn" href={ORDER_FORM.url} target="_blank" rel="noopener noreferrer">
          Order
        </a>
      </header>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricelist" element={<PriceList />} />
        <Route path="/model/:id" element={<ModelPage />} />
        <Route path="*" element={<main className="container"><p>Page not found.</p></main>} />
      </Routes>
      {!printView && (
        <footer className="site-footer">Questions or special requests? Contact Jonas Windmolders on Teams.</footer>
      )}
    </>
  );
}
