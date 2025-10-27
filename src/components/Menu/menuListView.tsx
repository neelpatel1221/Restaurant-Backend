import { getMenu } from "@/features/menuSlice"
import { AppDispatch, RootState } from "@/store/store"
import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { Button } from "../ui/button"
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash, ChevronsUpDown, Check, X } from "lucide-react"
import { Badge } from "../ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "@/features/cartSlice"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { CartListView } from "../Cart/cartListView"

export function MenuListView() {
  const dispatch = useDispatch<AppDispatch>()
  const { menu } = useSelector((state: RootState) => state.menu)
  const { items: cart } = useSelector((state: RootState) => state.cart)
  const { id: tableId } = useParams();

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    dispatch(getMenu())
  }, [dispatch])

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
  }

  const findCartItem = (itemId: string) =>
    cart.find((c) => c.itemId === itemId)

  const filteredMenu = useMemo(() => {
    return menu
      .map((category) => {
        if (
          selectedCategories.length > 0 &&
          !selectedCategories.includes(category.categoryId)
        ) {
          return null
        }

        const filteredItems = category.items.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )

        return filteredItems.length > 0
          ? { ...category, items: filteredItems }
          : null
      })
      .filter(Boolean)
  }, [menu, searchTerm, selectedCategories])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* HEADER */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md border-b border-orange-100 sticky top-0 z-10 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="rounded-full hover:bg-orange-50 p-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-gray-900">Menu</h1>
              <p className="text-xs text-gray-600">Cozy Kitchen • Table {tableId}</p>
            </div>
          </div>
          <CartListView />

        </div>
      </header>

      <div className="bg-white/70 backdrop-blur-sm border-b border-orange-100 sticky top-[64px] z-9">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-orange-200 bg-white/80 px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full md:w-64 justify-between border-orange-200 bg-white/80 hover:bg-orange-50"
              >
                {selectedCategories.length > 0
                  ? `${selectedCategories.length} categor${selectedCategories.length > 1 ? "ies" : "y"} selected`
                  : "Filter by category"}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-0">
              <Command>
                <CommandInput placeholder="Search categories..." className="h-9" />
                <CommandList>
                  <CommandEmpty>No category found.</CommandEmpty>
                  <CommandGroup>
                    {menu.map((category) => {
                      const isSelected = selectedCategories.includes(category.categoryId)
                      return (
                        <CommandItem
                          key={category.categoryId}
                          onSelect={() => handleCategoryToggle(category.categoryId)}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleCategoryToggle(category.categoryId)}
                          />
                          <span
                            className={cn(
                              "text-sm",
                              isSelected ? "font-semibold text-orange-600" : "text-gray-700"
                            )}
                          >
                            {category.categoryName}
                          </span>
                          {isSelected && (
                            <Check className="ml-auto h-4 w-4 text-orange-600" />
                          )}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {(searchTerm || selectedCategories.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-orange-600 hover:bg-orange-100 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-8 max-w-5xl mx-auto">
        {filteredMenu.length === 0 ? (
          <p className="text-center text-gray-500 text-sm mt-10">
            No items found matching your filters.
          </p>
        ) : (
          filteredMenu.map((category: any) => (
            <div key={category.categoryId}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize border-l-4 border-orange-500 pl-3">
                {category.categoryName}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item: any) => {
                  const cartItem = findCartItem(item.itemId)
                  return (
                    <Card
                      key={item.itemId}
                      className="flex items-center gap-2 p-2 border border-orange-100 rounded-xl bg-white hover:shadow-md transition-all hover:scale-[1.01]"
                    >
                      {/* IMAGE */}
                      <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-orange-50">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>

                      {/* DETAILS */}
                      <div className="flex flex-col justify-center flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                          <p className="text-sm font-bold text-orange-600 ml-2 whitespace-nowrap">₹{item.price}</p>

                        </div>

                        <p className="text-[11px] text-gray-600 line-clamp-2">{item.itemDescription}</p>

                        {/* CART BUTTONS */}
                        <div className="flex items-center justify-end mt-1">
                          {!cartItem ? (
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                              onClick={() => dispatch(addToCart(item))}
                            >
                              Add
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1 bg-orange-50 rounded-md px-2 py-1 border border-orange-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dispatch(decrementQuantity(item.itemId))}
                                className="p-0 hover:bg-orange-100"
                              >
                                <Minus className="w-3 h-3 text-orange-600" />
                              </Button>
                              <span className="text-xs font-medium">{cartItem.quantity}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => dispatch(incrementQuantity(item.itemId))}
                                className="p-0 hover:bg-orange-100"
                              >
                                <Plus className="w-3 h-3 text-orange-600" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>

                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
