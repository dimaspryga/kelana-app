"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

// Import Hooks
import { useCart } from "@/hooks/useCart"
import { usePromo } from "@/hooks/usePromo"
import { usePaymentMethod } from "@/hooks/usePaymentMethod"
import { useCreateTransaction } from "@/hooks/useCreateTransaction"
import { useTransaction } from "@/hooks/useTransaction"
import { useAuth } from "@/context/AuthContext"

// Import UI Components
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { Loader2, ShoppingCart, Trash2, Frown, Plus, Minus, Tag, X, CreditCard, Shield, CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

// Optimized image utility functions
const PLACEHOLDER_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zNy41IDQ4SDM1TDQ3LjUgMzBMNTAuNSAzMEw0OCA0OEgzNy41WiIgZmlsbD0iI0QxRDVEQiIvPgo8Y2lyY2xlIGN4PSI0Ny41IiBjeT0iMzAiIHI9IjcuNSIgZmlsbD0iI0QxRDVEQiIvPgo8L3N2Zz4K"

const isExternalImage = (src) => {
  return src && (src.startsWith("http://") || src.startsWith("https://"))
}

const getImageProps = (src, alt, hasError = false) => {
  if (!src || hasError) {
    return {
      src: PLACEHOLDER_DATA_URL,
      alt: alt || "Activity placeholder",
      unoptimized: true,
    }
  }

  if (isExternalImage(src)) {
    return { src, alt, unoptimized: true }
  }

  return { src, alt }
}

const CartPageSkeleton = () => (
  <div className="min-h-screen py-8 bg-white">
    <div className="container px-4 mx-auto max-w-7xl">
      {/* Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="w-1/3 h-6 mb-2 rounded-lg" />
        <Skeleton className="w-1/2 h-4 rounded-lg" />
      </div>
      
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Cart Items Skeleton */}
        <div className="w-full space-y-4 lg:w-2/3">
          <div className="p-4 border border-gray-200 bg-white rounded-lg">
            <Skeleton className="w-1/2 h-5 mb-4 rounded" />
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3 p-3 mb-3 border border-gray-200 rounded">
                <Skeleton className="w-12 h-12 rounded" />
                <div className="flex-grow space-y-1.5">
                  <Skeleton className="w-3/4 h-3 rounded" />
                  <Skeleton className="w-1/2 h-2.5 rounded" />
                  <Skeleton className="w-1/3 h-2.5 rounded" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Skeleton className="w-10 h-4 rounded" />
                  <Skeleton className="w-12 h-6 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Summary Skeleton */}
        <div className="w-full lg:w-1/3">
          <div className="sticky p-4 border border-gray-200 bg-white rounded-lg top-24">
            <Skeleton className="w-1/2 h-5 mb-4 rounded" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="w-12 h-3 rounded" />
                <Skeleton className="w-16 h-3 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-10 h-3 rounded" />
                <Skeleton className="w-12 h-3 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="w-8 h-3 rounded" />
                <Skeleton className="w-10 h-3 rounded" />
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="flex justify-between">
                  <Skeleton className="w-16 h-4 rounded" />
                  <Skeleton className="w-20 h-4 rounded" />
                </div>
              </div>
              <Skeleton className="w-full h-10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

const CartPage = () => {
  const router = useRouter()

  // Hooks
  const { cartItems, isLoading: isCartLoading, error, removeFromCart, updateItemQuantity, refetchCart } = useCart()
  const { promo: allPromos } = usePromo()
  const { paymentMethod: allPaymentMethods } = usePaymentMethod()
  const { createTransaction, isLoading: isProcessing, error: transactionError } = useCreateTransaction()
  const { fetchTransactions } = useTransaction()
  const { user, loading: isAuthLoading } = useAuth()

  // Component local state
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [updatingItemId, setUpdatingItemId] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isSingleItemDeleteDialogOpen, setIsSingleItemDeleteDialogOpen] = useState(false)
  const [currentItemForDeletion, setCurrentItemForDeletion] = useState(null)
  const [promoCodeInput, setPromoCodeInput] = useState("")
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [imageErrors, setImageErrors] = useState(new Set())
  const [hasMounted, setHasMounted] = useState(false)

  const handleImageError = (itemId) => {
    setImageErrors((prev) => new Set([...prev, itemId]))
  }

  // Price calculation
  const totalPrice = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce((acc, item) => acc + (item.activity?.price || 0) * item.quantity, 0)
  }, [cartItems, selectedItems])
  const discount = appliedPromo ? appliedPromo.promo_discount_price : 0
  const grandTotal = Math.max(0, totalPrice - discount)

  // Handlers for UI interaction
  const handleSelectItem = (itemId) => {
    const newSelection = new Set(selectedItems)
    newSelection.has(itemId) ? newSelection.delete(itemId) : newSelection.add(itemId)
    setSelectedItems(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length && cartItems.length > 0) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)))
    }
  }

  const executeDeleteSelected = async () => {
    setIsDeleteDialogOpen(false)
    if (selectedItems.size === 0) return
    
    const itemsToDelete = Array.from(selectedItems)
    const promise = Promise.allSettled(itemsToDelete.map((id) => removeFromCart(id)))
    
    toast.promise(promise, {
      loading: "Removing items...",
      success: (results) => {
        const successful = results.filter(result => result.status === 'fulfilled').length
        const failed = results.filter(result => result.status === 'rejected').length
        
        setSelectedItems(new Set())
        
        if (failed > 0) {
          return `${successful} items removed, ${failed} failed.`
        }
        return `${successful} items successfully removed.`
      },
      error: "Failed to remove some items.",
    })
  }

  const initiateSingleItemDelete = (itemId, itemTitle) => {
    setCurrentItemForDeletion({ id: itemId, title: itemTitle })
    setIsSingleItemDeleteDialogOpen(true)
  }

  const executeSingleItemDelete = async () => {
    if (!currentItemForDeletion) return
    
    const { id, title } = currentItemForDeletion
    try {
      await removeFromCart(id)
      toast.success(`"${title}" has been removed successfully.`)
    } catch (error) {
      toast.error(`Failed to remove "${title}". Please try again.`)
    }
    
    setIsSingleItemDeleteDialogOpen(false)
    setCurrentItemForDeletion(null)
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return
    
    setUpdatingItemId(itemId)
    try {
      await updateItemQuantity(itemId, newQuantity)
    } catch (error) {
      // Error is already handled in the context
      console.error('Failed to update quantity:', error)
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleApplyPromo = () => {
    const foundPromo = allPromos.find((p) => p.promo_code.toLowerCase() === promoCodeInput.trim().toLowerCase())
    if (!foundPromo) {
      setPromoError("Invalid promo code.")
      setAppliedPromo(null)
      return
    }
    if (totalPrice < foundPromo.minimum_claim_price) {
      setPromoError(`Minimum purchase for this promo is Rp ${foundPromo.minimum_claim_price.toLocaleString("id-ID")}`)
      setAppliedPromo(null)
      return
    }
    setAppliedPromo(foundPromo)
    setPromoError("")
    toast.success("Promo applied successfully!")
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCodeInput("")
    setPromoError("")
    toast.info("Promo removed.")
  }

  const handleProcessPayment = async () => {
    if (selectedItems.size === 0 || !selectedPaymentMethod) {
      toast.error("Please select items and a payment method first.")
      return
    }

    const payload = {
      cartIds: Array.from(selectedItems),
      paymentMethodId: selectedPaymentMethod,
      promoId: appliedPromo ? appliedPromo.id : null,
    }

    try {
      const result = await createTransaction(payload)
      toast.success("Order created successfully! Refreshing data...")

      await refetchCart()
      await fetchTransactions()

      setTimeout(() => {
        const transactionId = result?.data?.id
        if (transactionId) {
          const queryParams = new URLSearchParams({
            finalAmount: grandTotal,
          })

          if (appliedPromo) {
            queryParams.append("subtotal", totalPrice)
            queryParams.append("discount", discount)
          }

          const finalUrl = `/transaction/${transactionId}?${queryParams.toString()}`
          router.push(finalUrl)
        } else {
          router.push("/transaction")
        }
      }, 1000)
    } catch (err) {
      console.error("--- FAILED TO CREATE TRANSACTION ---", err)
      toast.error(`An error occurred: ${err.response?.data?.message || err.message}`)
    }
  }

  useEffect(() => {
    if (!isCartLoading) {
      setSelectedItems(new Set(cartItems.map((item) => item.id)))
    }
    setHasMounted(true)
  }, [cartItems, isCartLoading])

  const isLoading = isCartLoading || isAuthLoading || !hasMounted

  if (isLoading) {
    return <CartPageSkeleton />
  }

  if (error)
    return (
      <div className="container py-8 mx-auto text-center">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Error Loading Cart</h1>
          <p className="text-gray-600">Failed to load cart items. Please try again later.</p>
        </div>
      </div>
    )

  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white">
        <div className="p-8 text-center">
          <div className="flex items-center justify-center w-32 h-32 mx-auto mb-6 bg-blue-100 rounded-full">
            <ShoppingCart className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Your Cart is Empty</h1>
          <p className="max-w-md mx-auto mb-8 text-gray-600">
            Looks like you haven't added any activities to your cart yet. Start exploring amazing experiences!
          </p>
          <Button
            size="lg"
            className="px-8 py-3 text-white transition-all duration-200 bg-blue-600 shadow-lg hover:bg-blue-700 rounded-2xl hover:shadow-xl"
            onClick={() => router.push("/activity")}
          >
            Discover Activities
          </Button>
        </div>
      </div>
    )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      {/* Delete Dialogs */}
      <Dialog open={isSingleItemDeleteDialogOpen} onOpenChange={setIsSingleItemDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Remove Item?</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to remove "{currentItemForDeletion?.title}" from your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="bg-white border-gray-200 rounded-2xl hover:bg-gray-50">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={executeSingleItemDelete}
              className="bg-red-600 hover:bg-red-700 rounded-2xl"
            >
              Yes, Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Remove Selected Items?</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to remove {selectedItems.size} selected items from your cart?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="bg-white border-gray-200 rounded-2xl hover:bg-gray-50">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={executeDeleteSelected}
              className="bg-red-600 hover:bg-red-700 rounded-2xl"
            >
              Yes, Remove All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="container px-4 py-8 mx-auto lg:py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl tracking-tight">Shopping Cart</h1>
          <p className="text-gray-600 text-sm md:text-base">Review your selected activities before checkout</p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Cart Items */}
          <div className="w-full lg:w-2/3">
            {/* Select All Header */}
            <div className="flex items-center justify-between p-6 mb-6 border border-blue-100 shadow-lg bg-white/90 backdrop-blur-sm rounded-3xl">
              <div className="flex items-center">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="w-5 h-5 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label htmlFor="select-all" className="ml-4 text-base font-medium text-gray-900">
                  Select All ({cartItems.length} items)
                </label>
              </div>
              <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 rounded-2xl"
                    disabled={selectedItems.size === 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Selected
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            {/* Cart Items List */}
            <motion.div className="space-y-4" layout>
              <AnimatePresence>
                {cartItems.map(
                  (item) =>
                    item.activity && (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                        className="p-6 transition-all duration-200 border border-blue-100 shadow-lg bg-white/90 backdrop-blur-sm rounded-3xl hover:shadow-xl"
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => handleSelectItem(item.id)}
                            className="mt-2 w-5 h-5 border-blue-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />

                          <div className="flex-shrink-0">
                            <img
                              {...getImageProps(
                                item.activity.imageUrls?.[0],
                                item.activity.title,
                                imageErrors.has(item.id),
                              )}
                              className="object-cover w-24 h-24 border border-blue-100 rounded-2xl"
                              onError={() => handleImageError(item.id)}
                            />
                          </div>

                          <div className="flex-grow min-w-0">
                            <h3 className="mb-1 text-base font-semibold text-gray-900 line-clamp-2 md:text-lg">
                              {item.activity.title}
                            </h3>
                            <div className="flex items-center mb-3 text-sm text-gray-500">
                              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                              Available for booking
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-2xl font-bold text-blue-600">
                                  Rp {item.activity.price?.toLocaleString("id-ID")}
                                </p>
                                <p className="text-sm text-gray-500">per person</p>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Quantity Controls */}
                                <div className="flex items-center overflow-hidden bg-white border border-blue-200 rounded-2xl">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1 || updatingItemId === item.id}
                                    className="w-10 h-10 rounded-none hover:bg-blue-50"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <div className="flex items-center justify-center w-12 h-10 font-semibold bg-blue-50">
                                    <AnimatePresence mode="wait" initial={false}>
                                      <motion.span
                                        key={updatingItemId === item.id ? "loader" : item.quantity}
                                        initial={{ y: -10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 10, opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                      >
                                        {updatingItemId === item.id ? (
                                          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                                        ) : (
                                          item.quantity
                                        )}
                                      </motion.span>
                                    </AnimatePresence>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                    disabled={updatingItemId === item.id}
                                    className="w-10 h-10 rounded-none hover:bg-blue-50"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>

                                {/* Delete Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl"
                                  onClick={() => initiateSingleItemDelete(item.id, item.activity.title)}
                                  disabled={updatingItemId === item.id}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ),
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-24">
              <div className="p-6 border border-blue-100 shadow-lg bg-white/90 backdrop-blur-sm rounded-3xl">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900 md:text-xl tracking-tight">Order Summary</h2>
                </div>

                {/* Promo Code Section */}
                <div className="pb-6 mb-6 border-b border-blue-100">
                  <label className="block mb-3 text-sm font-medium text-gray-700">Promo Code</label>
                  {!appliedPromo ? (
                    <>
                      <div className="flex gap-2 mb-2">
                        <Input
                          type="text"
                          placeholder="Enter promo code"
                          value={promoCodeInput}
                          onChange={(e) => setPromoCodeInput(e.target.value)}
                          className="border-blue-200 rounded-2xl focus:border-blue-500 focus:ring-blue-100"
                        />
                        <Button
                          onClick={handleApplyPromo}
                          disabled={!promoCodeInput}
                          className="px-6 bg-blue-600 hover:bg-blue-700 rounded-2xl"
                        >
                          Apply
                        </Button>
                      </div>
                      {promoError && <p className="text-sm text-red-600">{promoError}</p>}
                    </>
                  ) : (
                    <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Tag className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">{appliedPromo.promo_code}</p>
                          <p className="text-sm text-green-600">Promo applied</p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="p-1 text-green-600 rounded-full hover:bg-green-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({selectedItems.size} items)</span>
                    <span className="font-medium">Rp {totalPrice.toLocaleString("id-ID")}</span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-green-600">
                      <span>Promo Discount</span>
                      <span className="font-medium">- Rp {discount.toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-blue-100">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">Rp {grandTotal.toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="py-6 mb-6 border-t border-b border-blue-100">
                  <div className="flex items-center mb-4">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    <Label className="text-sm font-medium text-gray-700">Select Payment Method</Label>
                  </div>
                  <RadioGroup onValueChange={setSelectedPaymentMethod} className="space-y-3">
                    {allPaymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center">
                        <RadioGroupItem value={method.id} id={method.id} className="mr-3 text-blue-600 border-blue-300" />
                        <Label
                          htmlFor={method.id}
                          className="flex items-center justify-between flex-grow p-4 transition-colors duration-200 border border-blue-200 cursor-pointer rounded-2xl hover:bg-blue-50"
                        >
                          <span className="font-medium">{method.name}</span>
                          <img
                            src={method.imageUrl || "/placeholder.svg"}
                            alt={method.name}
                            className="object-contain w-12 h-8"
                          />
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleProcessPayment}
                  size="lg"
                  className="w-full text-lg font-semibold transition-all duration-200 bg-blue-600 shadow-lg h-14 hover:bg-blue-700 rounded-2xl hover:shadow-xl"
                  disabled={selectedItems.size === 0 || !selectedPaymentMethod || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                {transactionError && (
                  <p className="mt-3 text-sm text-center text-red-600">{transactionError.message}</p>
                )}

                {/* Security Notice */}
                <div className="flex items-center justify-center mt-4 text-xs text-gray-500">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default CartPage
