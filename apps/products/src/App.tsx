import { useQuery } from '@tanstack/react-query'
import {
  useCartStore,
  fetchProducts,
  Button,
  Card,
  CardContent,
  Badge,
} from '@acme/packages'

export default function App() {
  const add = useCartStore((s) => s.add)
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  if (isLoading) return <p className="p-8 text-muted-foreground">Loading products…</p>
  if (error) return <p className="p-8 text-destructive">Error: {(error as Error).message}</p>

  return (
    <section className="mx-auto max-w-6xl p-8">
      <h2 className="mb-6 text-2xl font-bold">Products</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col p-4">
              <div className="mb-3 grid h-28 place-items-center rounded-lg bg-muted text-4xl">
                {p.image}
              </div>
              <h3 className="mb-1 font-semibold">{p.name}</h3>
              <p className="flex-1 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <Badge variant="secondary">${p.price.toFixed(2)}</Badge>
                <Button
                  size="sm"
                  onClick={() => add({ id: p.id, name: p.name, price: p.price, qty: 1 })}
                >
                  Add to cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
