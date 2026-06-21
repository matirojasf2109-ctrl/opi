import { useState, useCallback, useRef } from 'react';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useAIAgent } from '@/hooks/useAIAgent';
import { products } from '@/data/products';
import type { Product, ProductFormat } from '@/types';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import Carousel from '@/components/Carousel';
import ProductGrid from '@/components/ProductGrid';
import CartSidebar from '@/components/CartSidebar';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import ProfilePanel from '@/components/ProfilePanel';
import AIChat from '@/components/AIChat';
import CheckoutModal from '@/components/CheckoutModal';

export default function App() {
  const cart = useCart();
  const auth = useAuth();
  const ai = useAIAgent();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const catalogRef = useRef<HTMLDivElement>(null);
  const accessoriesRef = useRef<HTMLDivElement>(null);
  const teaRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const coffeeProducts = products.filter(p => p.category === 'coffee');
  const accessoryProducts = products.filter(p => p.category === 'accessory');
  const teaProducts = products.filter(p => p.category === 'tea');

  const handleAddToCart = useCallback((product: Product, format: ProductFormat) => {
    cart.addItem(product, format);
    cart.setIsOpen(true);
  }, [cart]);

  const handleScrollTo = useCallback((id: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      inicio: { current: document.getElementById('inicio') as HTMLDivElement | null },
      catalogo: catalogRef,
      accesorios: accessoriesRef,
      te: teaRef,
      productos: productsRef,
    };
    const el = id === 'inicio' ? document.getElementById('inicio') : refs[id]?.current;
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCheckout = () => {
    cart.setIsOpen(false);
    setCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    cart.clearCart();
  };

  const handleSendAIMessage = (msg: string) => {
    ai.sendMessage(msg, cart.items, auth.user?.name);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f0ece4] font-sans" style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Navbar
        cartCount={cart.count}
        onCartClick={() => cart.setIsOpen(true)}
        onLoginClick={() => auth.setShowLogin(true)}
        onProfileClick={() => auth.setShowLogin(true)}
        onAIChatClick={() => ai.setIsOpen(true)}
        isLoggedIn={auth.isLoggedIn}
        userName={auth.user?.name}
        onScrollTo={handleScrollTo}
      />

      <HeroSection onScrollToCatalog={() => handleScrollTo('catalogo')} />

      <div ref={catalogRef}>
        <Carousel
          title="Café de Especialidad"
          eyebrow="Carrusel 01"
          description="Cinco cafés integrados al carrusel: Arábica, Colombia Huila, Robusta, Blend y Blend Latinoamericano."
          products={coffeeProducts}
          onAddToCart={handleAddToCart}
        />
      </div>

      <div ref={accessoriesRef}>
        <Carousel
          title="Accesorios de Preparación"
          eyebrow="Carrusel 02"
          description="Cold drip, molinos manuales y moka pot para elevar tu ritual de café en casa."
          products={accessoryProducts}
          onAddToCart={handleAddToCart}
        />
      </div>

      <div ref={teaRef}>
        <Carousel
          title="Selección de Té"
          eyebrow="Carrusel 03"
          description="Tés premium de Ceilán en latas decorativas, para complementar la experiencia Lambert."
          products={teaProducts}
          onAddToCart={handleAddToCart}
        />
      </div>

      <div ref={productsRef}>
        <ProductGrid products={coffeeProducts} onAddToCart={handleAddToCart} />
      </div>

      {/* Footer */}
      <footer className="border-t border-[rgba(201,168,76,0.1)] py-10 px-8 text-center">
        <strong className="text-[#c9a84c] text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Lambert Coffee</strong>
        <span className="block text-xs text-[#9a9490] mt-2">Dark mode · Amarillo/Dorado · Café de especialidad</span>
      </footer>

      {/* AI Chat Floating Button */}
      <button
        onClick={() => ai.setIsOpen(!ai.isOpen)}
        className="fixed bottom-6 right-6 z-[180] w-14 h-14 rounded-full bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.25)] text-[#c9a84c] flex items-center justify-center shadow-lg shadow-black/40 hover:bg-[rgba(201,168,76,0.25)] transition-all group"
      >
        {ai.isOpen ? (
          <ShoppingCart className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
        <span className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[rgba(201,168,76,0.15)] text-xs text-[#c9a84c] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Asistente IA
        </span>
      </button>

      {/* Modals */}
      <CartSidebar
        isOpen={cart.isOpen}
        onClose={() => cart.setIsOpen(false)}
        items={cart.items}
        total={cart.total}
        onUpdateQuantity={cart.updateQuantity}
        onRemove={cart.removeItem}
        onCheckout={handleCheckout}
      />

      <LoginModal
        isOpen={auth.showLogin}
        onClose={() => auth.setShowLogin(false)}
        onLogin={auth.login}
        onSwitchToRegister={() => { auth.setShowLogin(false); auth.setShowRegister(true); }}
      />

      <RegisterModal
        isOpen={auth.showRegister}
        onClose={() => auth.setShowRegister(false)}
        onRegister={auth.register}
        onSwitchToLogin={() => { auth.setShowRegister(false); auth.setShowLogin(true); }}
      />

      {auth.user && (
        <ProfilePanel
          isOpen={auth.showLogin && auth.isLoggedIn}
          onClose={() => auth.setShowLogin(false)}
          user={auth.user}
          onLogout={() => { auth.logout(); auth.setShowLogin(false); }}
          onUpdate={auth.updateProfile}
        />
      )}

      <AIChat
        isOpen={ai.isOpen}
        onClose={() => ai.setIsOpen(false)}
        messages={ai.messages}
        isTyping={ai.isTyping}
        onSend={handleSendAIMessage}
        onClear={ai.clearChat}
        cartItems={cart.items}
        userName={auth.user?.name}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cart.items}
        total={cart.total}
        user={auth.user}
        onComplete={handleCheckoutComplete}
      />
    </div>
  );
}
