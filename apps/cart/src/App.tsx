import { useMutation } from '@tanstack/react-query'
import {
  checkout,
  queryClient,
  useCartStore,
  useCartItems,
  useCartTotal,
  useCartCount,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@acme/packages'

export default function App() {
  const items = useCartItems()
  const total = useCartTotal()
  const count = useCartCount()
  const clear = useCartStore((s) => s.clear)
  const remove = useCartStore((s) => s.remove)

  const doCheckout = useMutation({
    mutationFn: () => checkout(items),
    onSuccess: (res) => {
      alert(res.message)
      clear()
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  return (
    <section className="mx-auto max-w-3xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Your Cart ({count} items)</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-muted-foreground">Your cart is empty.</p>
          ) : (
            <ul className="divide-y">
              {items.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-3">
                  <span>
                    {i.name} × {i.qty}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-medium">${(i.price * i.qty).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-muted-foreground"
                      onClick={() => remove(i.id)}
                      aria-label={`Remove ${i.name}`}
                    >
                      ✕
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
        {items.length > 0 && (
          <CardFooter className="flex items-center justify-between">
            <span className="text-lg font-bold">Total: ${total.toFixed(2)}</span>
            <Button onClick={() => doCheckout.mutate()} disabled={doCheckout.isPending}>
              {doCheckout.isPending ? 'Processing…' : 'Checkout'}
            </Button>
          </CardFooter>
        )}
      </Card>
    </section>
  )
}
