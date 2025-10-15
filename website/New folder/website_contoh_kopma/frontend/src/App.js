import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TentangPage from "./pages/TentangPage";
import ProfilPage from "./pages/ProfilPage";
import StrukturPage from "./pages/StrukturPage";
import KeanggotaanPage from "./pages/KeanggotaanPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import InventarisPage from "./pages/InventarisPage";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tentang" element={<TentangPage />} />
          <Route path="/profil" element={<ProfilPage />} />
          <Route path="/struktur" element={<StrukturPage />} />
          <Route path="/keanggotaan" element={<KeanggotaanPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/inventaris" element={<InventarisPage />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
