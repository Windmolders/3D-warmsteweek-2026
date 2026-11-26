import { useLayoutEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Home, ModelPage } from "./pages";
import { PriceList } from "./pricelist";
import { CartPage, useCart } from "./cart";
import { SITE_TITLE } from "./config";

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
  const { count } = useCart();
  return (
    <>
      <ScrollToTop />
      {!printView && (
      <header className="site-header">
        <Link to="/">{SITE_TITLE}</Link>
        <Link to="/cart" className="btn">Cart{count > 0 && ` (${count})`}</Link>
      </header>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<CartPage />} />
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
