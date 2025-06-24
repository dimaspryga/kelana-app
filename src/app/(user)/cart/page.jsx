"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Import Hooks
import { useCart } from "@/hooks/useCart";
import { usePromo } from "@/hooks/usePromo";
import { usePaymentMethod } from "@/hooks/usePaymentMethod";
import { useCreateTransaction } from "@/hooks/useCreateTransaction";
import { useTransaction } from "@/hooks/useTransaction";
import { useAuth } from "@/context/AuthContext";

// Import UI Components
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Loader2,
  ShoppingCart,
  Trash2,
  Frown,
  Plus,
  Minus,
  Tag,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

const CartPage = () => {
  const router = useRouter();

  // Hooks
  const {
    cartItems,
    isLoading: isCartLoading,
    error,
    removeFromCart,
    updateItemQuantity,
    refetchCart,
  } = useCart();
  const { promo: allPromos } = usePromo();
  const { paymentMethod: allPaymentMethods } = usePaymentMethod();
  const {
    createTransaction,
    isLoading: isProcessing,
    error: transactionError,
  } = useCreateTransaction();
  const { fetchTransactions } = useTransaction();
  const { user, loading: isAuthLoading } = useAuth(); // Get auth state

  // Component local state
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSingleItemDeleteDialogOpen, setIsSingleItemDeleteDialogOpen] =
    useState(false);
  const [currentItemForDeletion, setCurrentItemForDeletion] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Price calculation
  const totalPrice = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.has(item.id))
      .reduce(
        (acc, item) => acc + (item.activity?.price || 0) * item.quantity,
        0
      );
  }, [cartItems, selectedItems]);
  const discount = appliedPromo ? appliedPromo.promo_discount_price : 0;
  const grandTotal = Math.max(0, totalPrice - discount);

  // Handlers for UI interaction
  const handleSelectItem = (itemId) => {
    const newSelection = new Set(selectedItems);
    newSelection.has(itemId)
      ? newSelection.delete(itemId)
      : newSelection.add(itemId);
    setSelectedItems(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === cartItems.length && cartItems.length > 0) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  };

  const executeDeleteSelected = async () => {
    setIsDeleteDialogOpen(false);
    if (selectedItems.size === 0) return;
    const itemsToDelete = Array.from(selectedItems);
    const promise = Promise.all(itemsToDelete.map((id) => removeFromCart(id)));
    toast.promise(promise, {
      loading: "Removing items...",
      success: () => {
        setSelectedItems(new Set());
        return `${itemsToDelete.length} items successfully removed.`;
      },
      error: "Failed to remove some items.",
    });
  };

  const initiateSingleItemDelete = (itemId, itemTitle) => {
    setCurrentItemForDeletion({ id: itemId, title: itemTitle });
    setIsSingleItemDeleteDialogOpen(true);
  };

  const executeSingleItemDelete = () => {
    if (!currentItemForDeletion) return;
    const { id, title } = currentItemForDeletion;
    removeFromCart(id);
    toast.success(`"${title}" has been removed successfully.`);
    setIsSingleItemDeleteDialogOpen(false);
    setCurrentItemForDeletion(null);
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(itemId);
    await updateItemQuantity(itemId, newQuantity);
    setUpdatingItemId(null);
  };

  const handleApplyPromo = () => {
    const foundPromo = allPromos.find(
      (p) => p.promo_code.toLowerCase() === promoCodeInput.trim().toLowerCase()
    );
    if (!foundPromo) {
      setPromoError("Invalid promo code.");
      setAppliedPromo(null);
      return;
    }
    if (totalPrice < foundPromo.minimum_claim_price) {
      setPromoError(
        `Minimum purchase for this promo is Rp ${foundPromo.minimum_claim_price.toLocaleString(
          "id-ID"
        )}`
      );
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(foundPromo);
    setPromoError("");
    toast.success("Promo applied successfully!");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoError("");
    toast.info("Promo removed.");
  };

  const handleProcessPayment = async () => {
    if (selectedItems.size === 0 || !selectedPaymentMethod) {
      toast.error("Please select items and a payment method first.");
      return;
    }

    const payload = {
      cartIds: Array.from(selectedItems),
      paymentMethodId: selectedPaymentMethod,
      promoId: appliedPromo ? appliedPromo.id : null,
    };

    try {
      const result = await createTransaction(payload);
      toast.success("Order created successfully! Refreshing data...");

      await refetchCart();
      await fetchTransactions();

      setTimeout(() => {
        const transactionId = result?.data?.id;
        if (transactionId) {
          const queryParams = new URLSearchParams({
            finalAmount: grandTotal,
          });

          if (appliedPromo) {
            queryParams.append("subtotal", totalPrice);
            queryParams.append("discount", discount);
          }

          const finalUrl = `/transaction/${transactionId}?${queryParams.toString()}`;
          router.push(finalUrl);
        } else {
          router.push("/transaction");
        }
      }, 1000);
    } catch (err) {
      console.error("--- FAILED TO CREATE TRANSACTION ---", err);
      toast.error(
        `An error occurred: ${err.response?.data?.message || err.message}`
      );
    }
  };

  useEffect(() => {
    if (!isCartLoading) {
      setSelectedItems(new Set(cartItems.map((item) => item.id)));
    }
  }, [cartItems, isCartLoading]);

  const isLoading = isCartLoading || isAuthLoading;

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto lg:py-12">
        <Skeleton className="w-1/3 h-10 mb-8" />
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="w-full space-y-4 lg:w-2/3">
            <Skeleton className="w-full h-16 rounded-lg" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-full rounded-lg h-28" />
            ))}
          </div>
          <div className="w-full lg:w-1/3">
            <Skeleton className="w-full rounded-lg h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Frown className="w-16 h-16 text-red-500" />
        <h2 className="mt-4 text-xl">Failed to load cart.</h2>
        <p>{error.message}</p>
      </div>
    );
  if (cartItems.length === 0)
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <ShoppingCart className="w-24 h-24 text-gray-300" />
        <h1 className="mt-6 text-3xl font-bold">Your Cart is Empty</h1>
        <Button className="mt-4" onClick={() => router.push("/activities")}>
          Find Activities
        </Button>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.75 }}
      className="container px-4 py-8 mx-auto lg:py-12"
    >
      <Dialog
        open={isSingleItemDeleteDialogOpen}
        onOpenChange={setIsSingleItemDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Item?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentItemForDeletion?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={executeSingleItemDelete}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="w-full lg:w-2/3">
          <div className="flex items-center justify-between p-4 mb-4 bg-white border rounded-lg">
            <div className="flex items-center">
              <Checkbox
                id="select-all"
                checked={
                  selectedItems.size === cartItems.length &&
                  cartItems.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <label htmlFor="select-all" className="ml-3 text-sm font-medium">
                Select All ({cartItems.length} items)
              </label>
            </div>
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-sm text-red-600 hover:bg-red-50"
                  disabled={selectedItems.size === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Confirm</DialogTitle>
                  <DialogDescription>
                    Delete {selectedItems.size} selected items?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button variant="destructive" onClick={executeDeleteSelected}>
                    Yes, Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                      className="p-4 bg-white border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start flex-grow gap-4">
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => handleSelectItem(item.id)}
                            className="mt-1"
                          />
                          <img
                            src={item.activity.imageUrls?.[0]}
                            alt={item.activity.title}
                            className="object-cover w-20 h-20 rounded-md"
                          />
                          <div>
                            <p className="font-medium">{item.activity.title}</p>
                            <p className="text-lg font-bold">
                              Rp {item.activity.price?.toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center flex-shrink-0 gap-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-600"
                            onClick={() =>
                              initiateSingleItemDelete(
                                item.id,
                                item.activity.title
                              )
                            }
                            disabled={updatingItemId === item.id}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity - 1)
                              }
                              disabled={
                                item.quantity <= 1 || updatingItemId === item.id
                              }
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center justify-center w-10 font-medium">
                              <AnimatePresence mode="wait" initial={false}>
                                <motion.span
                                  key={
                                    updatingItemId === item.id
                                      ? "loader"
                                      : item.quantity
                                  }
                                  initial={{ y: -10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: 10, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  {updatingItemId === item.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    item.quantity
                                  )}
                                </motion.span>
                              </AnimatePresence>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleUpdateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={updatingItemId === item.id}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        <div className="w-full lg:w-1/3">
          <div className="sticky p-6 bg-white border rounded-lg shadow-sm top-24">
            <h2 className="pb-4 mb-4 text-xl font-semibold border-b">
              Order Summary
            </h2>
            <div className="pb-4 mb-4 border-b">
              <label className="block mb-2 text-sm font-medium">
                Promo Code
              </label>
              {!appliedPromo ? (
                <>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter promo code"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                    />
                    <Button
                      onClick={handleApplyPromo}
                      disabled={!promoCodeInput}
                    >
                      Apply
                    </Button>
                  </div>
                  {promoError && (
                    <p className="mt-2 text-sm text-red-600">{promoError}</p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between p-2 text-sm text-green-700 bg-green-100 rounded-md">
                  <div className="flex items-center gap-2 font-semibold">
                    <Tag className="w-4 h-4" />
                    <span>{appliedPromo.promo_code}</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="p-1 rounded-full hover:bg-green-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
              {appliedPromo && (
                <div className="flex justify-between text-green-600">
                  <span>Promo Discount</span>
                  <span className="font-medium">
                    - Rp {discount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 mt-2 text-lg font-bold border-t">
                <span>Total</span>
                <span className="text-blue-600">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              For {selectedItems.size} selected items
            </p>
            <div className="py-4 my-4 border-t border-b">
              <Label className="text-sm font-medium">
                Select Payment Method
              </Label>
              <RadioGroup
                onValueChange={setSelectedPaymentMethod}
                className="mt-4 space-y-3"
              >
                {allPaymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label
                      htmlFor={method.id}
                      className="flex items-center justify-between flex-grow p-3 ml-4 border rounded-md cursor-pointer hover:bg-accent"
                    >
                      <span>{method.name}</span>
                      <img
                        src={method.imageUrl}
                        alt={method.name}
                        className="w-12"
                      />
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button
              onClick={handleProcessPayment}
              size="lg"
              className="w-full mt-6 text-lg bg-blue-600 hover:bg-blue-700"
              disabled={
                selectedItems.size === 0 ||
                !selectedPaymentMethod ||
                isProcessing
              }
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />{" "}
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>
            {transactionError && (
              <p className="mt-2 text-sm text-center text-red-600">
                {transactionError.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartPage;
