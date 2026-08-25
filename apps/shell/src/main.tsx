import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryProvider } from '@acme/packages'
import './index.css'

const Header = lazy(() => import('header/App'))
const Products = lazy(() => import('products/App'))
const Cart = lazy(() => import('cart/App'))

function Loader() {
  return <div className="p-12 text-center text-gray-500">Loading remote module…</div>
}

function Home() {
  return (
    <div className="px-6 py-16 text-center">
      <h1 className="text-4xl font-extrabold">Welcome to Acme Store</h1>
      <p className="mx-auto mt-4 max-w-xl text-gray-600">
        A micro-frontend demo: the header, products, and cart are separate remotes loaded via
        Module Federation. Try adding items to the cart — the shared Zustand store keeps them in
        sync across apps.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
      >
        Browse products →
      </Link>
    </div>
  )
}

function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Header />
        </Suspense>
        <main className="min-h-[calc(100vh-56px)] bg-gray-50">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </Suspense>
        </main>
      </BrowserRouter>
    </QueryProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
