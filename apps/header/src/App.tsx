import { useCartCount } from '@acme/packages'

export default function App() {
  const count = useCartCount()

  return (
    <header className="flex h-14 items-center justify-between bg-gray-900 px-6 text-white">
      <a href="/" className="text-lg font-extrabold">
        🛒 Acme Store
      </a>
      <nav className="flex items-center gap-5">
        <a href="/" className="font-medium text-gray-300 hover:text-white">
          Home
        </a>
        <a href="/products" className="font-medium text-gray-300 hover:text-white">
          Products
        </a>
        <a href="/cart" className="font-medium text-gray-300 hover:text-white">
          Cart{' '}
          <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
            {count}
          </span>
        </a>
      </nav>
    </header>
  )
}
